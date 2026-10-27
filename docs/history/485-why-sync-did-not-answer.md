# 485 — Why Sync did not answer: the installer never restarted the screen

The owner, 27 Oct, on a Chromebook with the Waveshare ESP32-S3-ePaper-1.54 V2: "still isn't working. I'm following all
the instructions. when it comes time to sync it just doesn't work". The widget said "This screen has old software — tap
Install." after the ☀ install steps — so Sync opened a port and heard nothing for 8 s. No board here: every cause below was
reasoned from the source of what runs (esptool-js 0.6.1 bundle, arduino-esp32 3.3.12 cores, Waveshare's demo and schematic).

## The causes, one by one

1. **The install never got to run (verified, the cause).** esptool-js 0.6.1's `after('hard_reset')` builds its
   `HardReset`, whose `reset()` for a non-OTG port is `sleep(100); setRTS(false)` — it never raises RTS first. After
   `main()`'s reset sequence RTS is already low, so nothing happens: the S3 stays in the flasher stub. Then the old
   instruction, "press ⏻ (PWR) once": Waveshare's `07_BATT_PWR_Test` reads ⏻ as `PWR_BUTTON_PIN` GPIO18, and the
   schematic wires the key (BAT_KEY) to GPIO18 and the battery latch, not to EN. On USB power ⏻ restarts nothing. So Sync
   opened "USB JTAG/serial debug unit" — the stub, which ignores text — and heard nothing. Fix: both installers reset
   themselves (DTR low, RTS high 120 ms, RTS low: the USB-Serial/JTAG's chip reset), and the words say **unplug and plug
   back in**, which restarts it whatever the reset did. The flash itself was fine (stub, compressed, 'keep' header, 8 MB
   detected), but nothing checked it: now `calculateMD5Hash` hands esptool-js `epaper-verse.md5` (build.sh writes it), so
   it reads the flash back and throws on a mismatch, and "Installed" is said only after that.
2. **Opening the port reboots it (ruled out, guarded).** USBCDC's `_onLineState` reboots to the bootloader only on
   (DTR,RTS) = (0,1) → (1,1) → (1,0) → (0,0), or a 1200-baud line coding. Opening sets (1,1) from (0,0) in one request;
   closing goes back to (0,0). Sync now sets DTR on, RTS off after `open()` — (1,1) → (1,0) from idle is not a step of
   the dance, and DTR is what `tud_cdc_n_connected` needs before the firmware's writes go anywhere. Reboot stays enabled so
   an Install without ☀ can still work.
3. **Port identity (ruled out).** Both the ROM's USB-Serial/JTAG and TinyUSB on the esp32-s3-devkitc-1 variant are
   303a:1001 (`USB_PID 0x1001`, pins_arduino.h), so the filter matches either; that same id is why a stub could pass for
   the program. Sync already asked Chrome for a port each time; the journey now holds it.
4. **The firmware's listening (ruled out).** `hear()` takes `\n` or `\r\n`; baud is ignored on CDC; bytes sent while the
   first picture draws wait in the RX queue; the loop runs while `tud_mounted()`, so a computer keeps it awake past the
   60 s. Found on the way: the firmware never drove GPIO17 (VBAT_PWR) high, so on battery alone the board would switch off
   once ⏻ was let go and no daily wake could come; now it latches and holds it through deep sleep.
5. **Saying what happened.** Sync sends `HELLO` until `READY`, then `SHOW` until `OK`, for 10 s. A Details line under
   the sentence gives the USB id and the last 60 characters heard ("heard nothing" when silent). Silence says "The screen
   didn't answer — unplug it, plug it back in without touching ☀, then tap Sync again"; "old software" only when it
   answered something that was not `READY`; ROM text ("waiting for download") says it is still in install mode.

## The owner's steps now

Unplug; hold ☀; plug in; let go; Install → "USB JTAG/serial debug unit"; wait for "Installed and checked"; unplug and plug
back in (no ☀); the verse draws; Sync → "@family. screen". ⏻ only wakes a screen asleep on its battery.
