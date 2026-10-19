# A Bible verse a day on the e-paper screen

For the **Waveshare ESP32-S3-ePaper-1.54** (200x200 black-and-white e-paper). Every morning at about 6am
(UK time) it wakes, joins your Wi-Fi, fetches today's verse from the site's Apps Script backend, draws it,
and goes back to sleep. If the Wi-Fi or the internet is down it tries again in 30 minutes and leaves the
last verse on the screen (e-paper keeps its picture with no power at all).

No computer program to install: a Chromebook (or any computer with Chrome) and a phone are enough.

## Putting it on the board

1. In **Chrome**, open **https://atfamily.co.uk/tools/epaper-verse/install.html**.
2. Plug the board into the Chromebook with a USB-C cable.
3. Press **Install**, pick the board in the list ("USB JTAG/serial debug unit" or similar), **Connect**,
   then **Install**. About a minute.
   - Not in the list, or "failed to connect": unplug it, **hold BOOT**, plug it back in, let go of BOOT,
     try again. When it has finished, press **RESET** once. (Usually BOOT is not needed.)
4. The screen says **Wi-Fi setup**. On your phone, join the Wi-Fi network **Verse-Setup**. A page opens
   by itself (if not, open `192.168.4.1` in the phone's browser). Tap **Configure WiFi**, choose your home
   Wi-Fi (it must be a 2.4 GHz one; most home routers have one), type its password, leave the **verse
   address** as it is, **Save**.
5. Today's verse appears a few seconds later. Unplug the board from the Chromebook and plug it into any
   USB-C phone charger where you want it.

The Wi-Fi password is kept on the board only; it is never in this repository.

**Changing Wi-Fi later:** press **RESET**, then within two seconds press and hold **BOOT** until the
setup screen shows, and do step 4 again. If the saved Wi-Fi stops working, the setup page also opens by
itself for three minutes, then the old verse comes back and it retries every half hour.

**Power:** the board has no battery, so it lives on a USB charger. Asleep it uses almost nothing.

## The verses

`backend/verse.gs`: 79 short, well-known King James verses (all ≤ 220 characters, cut from `data/bible`).
A Ledger tab named **`verses`** with columns `text` and `ref` is used instead whenever it has rows. Each
verse is shown once before any repeats, and never the same two days running. Try it in a browser:
`https://script.google.com/macros/s/…/exec?verse=today` (the address is `API` in `js/data.js`; the board
has it built in). It answers `{"text": …, "ref": …, "date": …}`.

## For whoever rebuilds it

`verse.cpp` is the program (the `.ino` is only a name for the Arduino tools). Libraries: GxEPD2,
WiFiManager, ArduinoJson (Adafruit GFX and BusIO come with GxEPD2). Board settings: ESP32S3 Dev Module,
USB CDC On Boot enabled, Flash QIO 80MHz 4MB, Partition Huge APP, PSRAM disabled (not needed, so one build
fits both board versions). Then merge for the web installer:

```
esptool --chip esp32s3 merge-bin -o epaper-verse.bin --flash-mode keep --flash-freq keep --flash-size keep \
  0x0 epaper-verse.ino.bootloader.bin 0x8000 epaper-verse.ino.partitions.bin \
  0xe000 <core>/tools/partitions/boot_app0.bin 0x10000 epaper-verse.ino.bin
```

Pins, from Waveshare's demo repository `github.com/waveshareteam/ESP32-S3-ePaper-1.54`
(`02_Example/Arduino/11_RTC_Sleep_Test/user_config.h`): DC 10, CS 11, SCK 12, MOSI 13, RST 9, BUSY 8, panel
power on GPIO 6 (low = on, `board_power_bsp.cpp`). Its driver sends SSD1681 commands: GxEPD2's
`GxEPD2_154_D67`. Board settings from that repository's `Tools Configuration.png`.

Licence: GPL-3.0 (`COPYING`), because GxEPD2 is; the other libraries' notices are in `NOTICE.txt`.
