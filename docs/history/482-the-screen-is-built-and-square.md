# 482 — The screen is built, stays awake for Sync, and the widget is its real 200x200

The owner's screen, from a photo: Waveshare ESP32-S3-ePaper-1.54 V2 (ESP32-S3-PICO-1 N8R8, 200x200 1-bit, buttons
☀ BOOT and ⏻ PWR, the S3's own USB). The owner, 26 Oct: "it connects but then doesn't respond… the steps and
instructions seem vague and should use the symbols of the buttons too in case the user doesn't know… the device also
has some long name and everything feels like what is going on."

## Why it vanished

`verse.cpp` drew and went straight into deep sleep; deep sleep turns the S3's native USB off, so Chrome saw the screen
for a moment and lost it. And the published `epaper-verse.bin` predated 470, so it never listened at all.

## What changed

- **Built here.** `tools/epaper-verse/platformio.ini` + `build.sh` (PlatformIO from the registry; github.com is
  blocked for this container, so arduino-esp32 is the registry's 3.3.12, not README's old 3.0.7). The script merges
  bootloader 0x0, partitions 0x8000, boot_app0 0xe000, app 0x10000 into the one `epaper-verse.bin` install writes at 0.
  Versions and sha256 in the folder's README. Re-run it after `pictures.h` changes. Not tried on a board.
- **Awake for USB.** After a plug-in, RESET or ⏻: draw, then listen 60 s and for as long as a computer has the USB
  mounted (`tud_mounted()`); every `SHOW` redraws and restarts the minute. Sleep only on a charger or battery. The
  daily timer wake still moves on one and sleeps (3 s listen). A screen left on a computer moves on every 24 h itself.
- **Its own name.** TinyUSB (`ARDUINO_USB_MODE=0`) so Chrome lists "@family. screen". In ☀ mode the chip's ROM
  answers instead and Chrome says "USB JTAG/serial debug unit"; the install step says so.
- **Plain steps with the button symbols** in the widget, one numbered line each, only when they apply; a status line
  (choose the screen / Connected — sending… / Done — the screen is updating). A screen in Chrome's list that stays
  silent 8 s is the old program: "This screen has old software — tap Install", with the ☀ steps. Not in the list:
  "press ⏻ (PWR) once, then tap Sync again".
- **The widget is the panel.** 800x600 is gone. `einkPage_` (js/records.js) is `drawVerse`/`drawPicture` line for line
  on a 200x200 canvas with the firmware's own Adafruit GFX fonts (`data/eink-fonts.json`, `gfx-fonts.js`), scaled
  with `image-rendering: pixelated`. Icons are their svg thresholded to 1-bit at 120x160, as `pictures.h` is.
  `check-eink` fails if verse.cpp's layout numbers and the widget's part, or if the `.bin` is not the 482 program.
