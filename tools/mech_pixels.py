#!/usr/bin/env python3
"""Mechanics pictures (548): one 64x64 pixel drawing per part card and per car, written to data/mechanics/pixels.json.

Each picture is 64 strings of 64 palette letters ('.' is transparent). Shapes are drawn from a few primitives, then
outlined in 'k' so every picture shares one look. Re-run after changing a drawing: python3 tools/mech_pixels.py
"""
import json, math, os

PALETTE = {
    '.': None, 'k': '#1b1b1f', 'd': '#4b4d55', 'g': '#8a8d96', 'l': '#c6c8ce', 'w': '#f3f3f0',
    's': '#d9cba6', 'S': '#a8977a', 'r': '#c8382c', 'R': '#7c2119', 'o': '#e8862a', 'y': '#f2c94c',
    'b': '#3a78c2', 'B': '#1f4472', 'n': '#8b5a2b', 'c': '#c87a3a', 'G': '#3f9d52',
}
N = 64


class C:
    def __init__(self):
        self.p = [['.'] * N for _ in range(N)]

    def px(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < N and 0 <= y < N:
            self.p[y][x] = c

    def rect(self, x0, y0, x1, y1, c):
        x0, y0, x1, y1 = (int(round(v)) for v in (x0, y0, x1, y1))
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.px(x, y, c)

    def disc(self, cx, cy, r, c, r0=-1, ry=None):
        ry = ry or r
        for y in range(N):
            for x in range(N):
                d = ((x - cx) / r) ** 2 + ((y - cy) / ry) ** 2
                if d <= 1 and (r0 < 0 or ((x - cx) / (r0 * r)) ** 2 + ((y - cy) / (r0 * ry)) ** 2 > 1):
                    self.p[y][x] = c

    def line(self, x0, y0, x1, y1, c, w=1):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
        for i in range(n + 1):
            t = i / n
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            for dx in range(-(w // 2), w - w // 2):
                for dy in range(-(w // 2), w - w // 2):
                    self.px(x + dx, y + dy, c)

    def poly(self, pts, c):
        for y in range(N):
            xs = []
            for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
                if (y0 <= y < y1) or (y1 <= y < y0):
                    xs.append(x0 + (y - y0) * (x1 - x0) / (y1 - y0))
            xs.sort()
            for a, b in zip(xs[::2], xs[1::2]):
                for x in range(int(math.ceil(a)), int(math.floor(b)) + 1):
                    self.px(x, y, c)

    def done(self):
        q = [r[:] for r in self.p]
        for y in range(N):
            for x in range(N):
                if self.p[y][x] == '.':
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        xx, yy = x + dx, y + dy
                        if 0 <= xx < N and 0 <= yy < N and self.p[yy][xx] not in '.k':
                            q[y][x] = 'k'
                            break
        return [''.join(r) for r in q]


# ---------- archetypes ----------
def wheel_disc(c, cx=32, cy=32, r=24, face='l', hub='g', holes=5):
    c.disc(cx, cy, r, face); c.disc(cx, cy, r * 0.42, hub); c.disc(cx, cy, r * 0.18, 'd')
    for i in range(holes):
        a = i * 2 * math.pi / holes
        c.disc(cx + math.cos(a) * r * 0.3, cy + math.sin(a) * r * 0.3, 1.6, 'k')


def belt(c, col='d', teeth=True):
    c.disc(18, 40, 12, col); c.disc(18, 40, 9, '.'); c.disc(46, 20, 12, col); c.disc(46, 20, 9, '.')
    c.line(9, 33, 37, 13, col, 3); c.line(27, 47, 55, 27, col, 3)
    c.disc(18, 40, 7, 'l'); c.disc(46, 20, 7, 'l'); c.disc(18, 40, 2, 'd'); c.disc(46, 20, 2, 'd')
    if teeth:
        for i in range(0, 360, 30):
            a = math.radians(i)
            c.px(46 + math.cos(a) * 12, 20 + math.sin(a) * 12, 'g')


def chain(c):
    for i in range(10):
        x, y = 8 + i * 5, 50 - i * 4
        c.disc(x, y, 3, 'g'); c.disc(x, y, 1, 'd')
    c.disc(14, 46, 9, 'l', 0.5); c.disc(48, 16, 9, 'l', 0.5)


def pulleys(c):
    c.disc(22, 24, 13, 'l'); c.disc(22, 24, 5, 'd'); c.disc(44, 44, 11, 'g'); c.disc(44, 44, 4, 'd')
    c.rect(36, 10, 52, 16, 'd'); c.line(44, 16, 44, 33, 'd', 3)


def gasket(c, col='c', holes=4):
    c.rect(4, 18, 59, 45, col)
    for i in range(holes):
        c.disc(12 + i * 13.3, 31, 5.5, '.')
    for x, y in ((7, 21), (56, 21), (7, 42), (56, 42), (25, 21), (38, 42)):
        c.disc(x, y, 1.2, '.')


def mount(c):
    c.rect(10, 10, 54, 18, 'g'); c.rect(18, 19, 46, 40, 'd'); c.rect(10, 41, 54, 49, 'g')
    c.disc(15, 14, 2, 'k'); c.disc(49, 14, 2, 'k'); c.disc(15, 45, 2, 'k'); c.disc(49, 45, 2, 'k')
    c.line(32, 19, 32, 40, 'k')


def rocker(c):
    c.poly([(6, 44), (10, 18), (54, 18), (58, 44)], 'd'); c.rect(4, 44, 59, 48, 'k')
    for x in (16, 26, 36, 46):
        c.rect(x, 22, x + 4, 40, 'g')
    c.disc(32, 30, 4, 'y')


def turbo(c):
    c.disc(24, 34, 18, 'g'); c.disc(24, 34, 11, 'l'); c.disc(24, 34, 4, 'd')
    for i in range(8):
        a = i * math.pi / 4
        c.line(24, 34, 24 + math.cos(a) * 10, 34 + math.sin(a) * 10, 'd')
    c.rect(38, 26, 58, 42, 'c'); c.disc(58, 34, 6, 'c'); c.rect(22, 8, 30, 18, 'g')


def panel_filter(c, frame='o', media='w', pleat='l'):
    c.rect(6, 14, 57, 49, frame); c.rect(10, 18, 53, 45, media)
    for x in range(12, 53, 4):
        c.rect(x, 18, x + 1, 45, pleat)


def can_filter(c, body='b', band='w'):
    c.rect(16, 14, 47, 52, body); c.disc(31.5, 14, 16, 'g', ry=5); c.disc(31.5, 14, 6, 'd', ry=2)
    c.rect(16, 28, 47, 38, band); c.disc(31.5, 52, 16, body, ry=4)


def valve_box(c, body='g', top='d', pipe='c'):
    c.rect(18, 20, 46, 46, body); c.rect(22, 10, 42, 20, top); c.rect(4, 36, 18, 42, pipe); c.rect(46, 36, 60, 42, pipe)
    c.rect(26, 26, 38, 34, 'l'); c.rect(28, 4, 36, 10, 'k')


def inline_filter(c):
    c.rect(14, 20, 50, 44, 'l'); c.disc(14, 32, 6, 'l', ry=12); c.disc(50, 32, 6, 'l', ry=12)
    c.rect(2, 29, 10, 35, 'g'); c.rect(54, 29, 62, 35, 'g'); c.line(30, 24, 36, 32, 'o', 2); c.line(36, 32, 30, 40, 'o', 2)


def pump(c, body='g', cap='d'):
    c.disc(32, 36, 18, body); c.disc(32, 36, 8, cap); c.rect(26, 6, 38, 20, body); c.rect(48, 32, 62, 40, 'c')
    for i in range(6):
        a = i * math.pi / 3
        c.line(32, 36, 32 + math.cos(a) * 7, 36 + math.sin(a) * 7, 'l')


def injector(c):
    c.rect(28, 4, 36, 14, 'd'); c.rect(25, 14, 39, 34, 'g'); c.rect(29, 34, 35, 52, 'l'); c.rect(31, 52, 33, 58, 'd')
    c.rect(38, 8, 50, 14, 'k'); c.rect(25, 22, 39, 24, 'G')


def throttle(c):
    c.rect(12, 14, 52, 50, 'g'); c.disc(32, 32, 15, 'd'); c.line(20, 42, 44, 22, 'l', 3); c.rect(52, 26, 60, 38, 'k')


def plug(c, glow=False):
    c.rect(28, 4, 36, 10, 'g'); c.rect(26, 10, 38, 28, 'w')
    for y in range(13, 27, 3):
        c.rect(25, y, 39, y, 'l')
    c.poly([(22, 28), (42, 28), (44, 36), (20, 36)], 'g'); c.rect(27, 36, 37, 50, 'l')
    for y in range(38, 50, 2):
        c.rect(27, y, 37, y, 'g')
    if glow:
        c.rect(30, 50, 34, 60, 'o'); c.rect(30, 57, 34, 60, 'r')
    else:
        c.rect(31, 50, 33, 55, 'd'); c.rect(31, 57, 36, 58, 'd')


def coil(c):
    for i, x in enumerate((8, 22, 36, 50)):
        c.rect(x, 26, x + 8, 56, 'd'); c.rect(x + 2, 52, x + 6, 60, 'k')
    c.rect(4, 10, 60, 28, 'k'); c.rect(8, 14, 56, 24, 'r'); c.rect(26, 16, 38, 22, 'd')


def leads(c):
    for i, (col, y) in enumerate((('r', 18), ('r', 28), ('r', 38), ('r', 48))):
        c.line(10, y, 50, 10 + i * 12, col, 3); c.rect(4, y - 3, 12, y + 3, 'd'); c.rect(50, 7 + i * 12, 58, 13 + i * 12, 'd')


def dizzy(c):
    c.disc(32, 26, 20, 'n', ry=12); c.rect(12, 26, 52, 40, 'n'); c.disc(32, 40, 20, 'n', ry=6)
    for i in range(5):
        a = math.pi + i * math.pi / 4
        c.rect(30 + math.cos(a) * 14, 20 + math.sin(a) * 6, 34 + math.cos(a) * 14, 28 + math.sin(a) * 6, 'l')
    c.rect(28, 46, 36, 60, 'g')


def sensor(c, body='d', tip='g', lead=True):
    c.rect(26, 4, 38, 22, body); c.rect(22, 22, 42, 28, 'g'); c.rect(28, 28, 36, 54, tip)
    for y in range(30, 54, 3):
        c.rect(28, y, 36, y, 'd')
    if lead:
        c.line(38, 10, 58, 6, 'k', 2)


def radiator(c):
    c.rect(4, 8, 59, 14, 'd'); c.rect(4, 50, 59, 56, 'd'); c.rect(6, 14, 57, 50, 'g')
    for x in range(8, 57, 3):
        c.rect(x, 14, x, 50, 'l')
    c.rect(56, 16, 62, 22, 'd')


def thermostat(c):
    c.disc(32, 20, 22, 'l', ry=5); c.rect(26, 20, 38, 46, 'c')
    for y in range(24, 44, 4):
        c.rect(24, y, 40, y + 1, 'S')
    c.line(22, 20, 22, 6, 'g', 2); c.line(42, 20, 42, 6, 'g', 2); c.rect(22, 4, 42, 7, 'g'); c.rect(30, 46, 34, 56, 'g')


def hose(c, col='d'):
    pts = [(6 + t * 0.52, 50 - 34 * math.sin(t / 100 * math.pi)) for t in range(0, 101)]
    for x, y in pts:
        c.disc(x, y, 5, col)
    for x0 in (6, 58):
        c.rect(x0 - 3, 44, x0 + 3, 56, 'l')


def tank(c):
    c.rect(12, 16, 52, 54, 'w'); c.rect(26, 6, 38, 16, 'b'); c.rect(14, 30, 50, 52, 'y')
    c.rect(16, 24, 22, 25, 'd'); c.rect(16, 44, 22, 45, 'd')


def fan(c):
    c.disc(32, 32, 26, 'd'); c.disc(32, 32, 23, '.')
    for i in range(7):
        a = i * 2 * math.pi / 7
        c.poly([(32, 32), (32 + math.cos(a) * 21, 32 + math.sin(a) * 21), (32 + math.cos(a + .6) * 21, 32 + math.sin(a + .6) * 21)], 'g')
    c.disc(32, 32, 5, 'k')


def bottle(c, body='G', label='w', cap='d', col2=None):
    c.poly([(16, 20), (36, 20), (48, 28), (48, 58), (16, 58)], body); c.rect(20, 8, 30, 20, cap)
    c.rect(18, 32, 46, 50, label)
    if col2:
        c.rect(22, 36, 42, 46, col2)
    c.rect(38, 12, 46, 16, body)


def sump(c):
    c.poly([(4, 14), (60, 14), (54, 34), (40, 34), (38, 50), (10, 50), (8, 34)], 'g'); c.rect(4, 12, 60, 16, 'd')
    c.rect(20, 50, 28, 56, 'd'); c.rect(18, 56, 30, 58, 'l')


def switch(c):
    c.rect(26, 4, 38, 12, 'k'); c.poly([(20, 14), (44, 14), (48, 28), (16, 28)], 'l'); c.rect(26, 28, 38, 46, 'g')
    for y in range(30, 46, 3):
        c.rect(26, y, 38, y, 'd')


def exhaust_can(c, body='l', dot='d'):
    c.rect(2, 28, 12, 36, 'g'); c.rect(52, 28, 62, 36, 'g'); c.rect(12, 16, 52, 48, body)
    c.disc(12, 32, 4, body, ry=16); c.disc(52, 32, 4, body, ry=16)
    for x in range(18, 48, 6):
        for y in range(22, 44, 6):
            c.px(x, y, dot)


def silencer(c):
    c.line(2, 40, 22, 40, 'g', 4); c.rect(22, 30, 50, 50, 'l'); c.disc(50, 40, 4, 'l', ry=10); c.line(54, 36, 62, 30, 'g', 4)


def rubber(c):
    c.disc(32, 32, 20, 'd', ry=14); c.disc(20, 32, 4, '.'); c.disc(44, 32, 4, '.'); c.rect(14, 30, 26, 34, 'g'); c.rect(38, 30, 50, 34, 'g')


def clutch(c):
    c.disc(32, 32, 26, 'g'); c.disc(32, 32, 22, 'n'); c.disc(32, 32, 13, 'l'); c.disc(32, 32, 5, 'd')
    for i in range(6):
        a = i * math.pi / 3
        c.disc(32 + math.cos(a) * 9, 32 + math.sin(a) * 9, 2, 'd')


def cable(c):
    for t in range(0, 101):
        x = 6 + t * 0.5; y = 32 + 16 * math.sin(t / 100 * 2 * math.pi)
        c.disc(x, y, 2, 'd')
    c.rect(2, 12, 10, 20, 'g'); c.rect(52, 44, 62, 52, 'g')


def flywheel(c):
    c.disc(32, 32, 28, 'd'); c.disc(32, 32, 25, 'g'); c.disc(32, 32, 18, 'l'); c.disc(32, 32, 7, 'd')
    for i in range(0, 360, 12):
        a = math.radians(i)
        c.px(32 + math.cos(a) * 27, 32 + math.sin(a) * 27, 'l')
    for i in range(4):
        a = i * math.pi / 2 + .4
        c.rect(30 + math.cos(a) * 12, 30 + math.sin(a) * 12, 34 + math.cos(a) * 12, 34 + math.sin(a) * 12, 'r')


def cv(c):
    c.rect(2, 29, 62, 35, 'g'); c.disc(12, 32, 8, 'd'); c.disc(52, 32, 8, 'd')
    for x in (16, 22, 28):
        c.disc(x, 32, 5, 'k')
    for x in (36, 42, 48):
        c.disc(x, 32, 5, 'k')


def propshaft(c):
    c.line(4, 40, 60, 24, 'g', 5); c.disc(32, 32, 7, 'd'); c.disc(32, 32, 3, 'l'); c.rect(2, 36, 8, 46, 'l'); c.rect(56, 18, 62, 28, 'l')


def pad(c):
    c.poly([(8, 22), (56, 22), (52, 44), (12, 44)], 'g'); c.poly([(10, 28), (54, 28), (50, 44), (14, 44)], 'd')
    c.rect(31, 28, 33, 44, 'g'); c.rect(10, 18, 54, 22, 'l')


def caliper(c):
    c.disc(32, 44, 28, 'l', 0.8); c.poly([(10, 24), (54, 24), (58, 40), (6, 40)], 'r'); c.rect(18, 26, 46, 30, 'R')
    c.disc(14, 32, 2, 'k'); c.disc(50, 32, 2, 'k')


def drum(c):
    c.disc(32, 32, 26, 'd'); c.disc(32, 32, 21, 'g'); c.disc(32, 32, 7, 'd')
    c.disc(32, 32, 20, 'n', 0.8); c.rect(10, 30, 54, 34, 'g')


def stick_ends(c, col='g', end='d'):
    c.line(10, 50, 54, 14, col, 4); c.disc(10, 50, 6, end); c.disc(54, 14, 6, end); c.disc(10, 50, 2, 'l'); c.disc(54, 14, 2, 'l')


def shock(c):
    c.rect(26, 4, 38, 10, 'd'); c.rect(30, 10, 34, 28, 'l'); c.rect(24, 28, 40, 54, 'y'); c.disc(32, 58, 5, 'd'); c.disc(32, 58, 2, '.')


def spring(c):
    for t in range(0, 241):
        y = 6 + t * 0.22; x = 32 + 16 * math.sin(t / 30 * math.pi)
        c.disc(x, y, 2, 'r' if math.cos(t / 30 * math.pi) > 0 else 'R')


def arb(c):
    c.line(6, 48, 6, 30, 'd', 3); c.line(6, 30, 58, 30, 'd', 3); c.line(58, 30, 58, 48, 'd', 3)
    c.line(6, 30, 6, 14, 'l', 3); c.line(58, 30, 58, 14, 'l', 3); c.disc(6, 14, 3, 'g'); c.disc(58, 14, 3, 'g')


def wishbone(c):
    c.poly([(6, 16), (16, 12), (56, 30), (16, 52), (6, 48), (14, 32)], 'd'); c.poly([(18, 24), (40, 31), (18, 40)], '.')
    c.disc(9, 14, 5, 'k'); c.disc(9, 50, 5, 'k'); c.disc(9, 14, 2, 'g'); c.disc(9, 50, 2, 'g'); c.disc(54, 30, 5, 'l')


def balljoint(c):
    c.disc(32, 22, 12, 'l'); c.rect(20, 26, 44, 40, 'd'); c.rect(28, 40, 36, 58, 'g')
    for y in range(44, 58, 3):
        c.rect(28, y, 36, y, 'd')


def topmount(c):
    c.disc(32, 34, 26, 'g', ry=10); c.disc(32, 30, 14, 'd', ry=6); c.disc(32, 28, 4, 'l')
    for x in (12, 52):
        c.rect(x - 1, 20, x + 1, 32, 'l')


def bearing(c):
    c.disc(32, 32, 26, 'l'); c.disc(32, 32, 20, 'd'); c.disc(32, 32, 12, 'l'); c.disc(32, 32, 9, '.')
    for i in range(10):
        a = i * math.pi / 5
        c.disc(32 + math.cos(a) * 16, 32 + math.sin(a) * 16, 3, 'w')


def rack(c):
    c.rect(4, 28, 60, 36, 'g'); c.rect(14, 24, 30, 40, 'd'); c.rect(20, 10, 26, 24, 'l')
    for x in (38, 48):
        for k in range(0, 8, 2):
            c.rect(x + k, 26, x + k, 38, 'd')
    c.disc(4, 32, 4, 'd'); c.disc(60, 32, 4, 'd')


def motor(c, body='d', end='g', lug='c'):
    c.rect(10, 18, 46, 46, body); c.disc(46, 32, 6, end, ry=14); c.rect(50, 28, 60, 36, 'l')
    for x in range(14, 44, 5):
        c.rect(x, 18, x + 1, 46, 'g')
    c.rect(4, 26, 10, 38, lug)


def battery(c):
    c.rect(6, 20, 57, 56, 'd'); c.rect(6, 16, 57, 22, 'k'); c.rect(12, 8, 20, 16, 'r'); c.rect(43, 8, 51, 16, 'k')
    c.rect(14, 10, 18, 10, 'w'); c.rect(45, 11, 49, 12, 'w'); c.rect(16, 30, 47, 44, 'y'); c.rect(22, 36, 41, 38, 'k')


def alternator(c):
    c.disc(30, 34, 22, 'l'); c.disc(30, 34, 16, 'g')
    for i in range(12):
        a = i * math.pi / 6
        c.line(30 + math.cos(a) * 8, 34 + math.sin(a) * 8, 30 + math.cos(a) * 16, 34 + math.sin(a) * 16, 'd')
    c.disc(30, 34, 6, 'd'); c.disc(30, 34, 4, 'k'); c.rect(48, 8, 58, 18, 'g'); c.rect(4, 50, 14, 58, 'g')


def fuses(c):
    for i, col in enumerate('rbyG'):
        x = 6 + i * 14
        c.rect(x, 12, x + 10, 34, col); c.rect(x + 1, 34, x + 3, 44, 'l'); c.rect(x + 7, 34, x + 9, 44, 'l')
    c.rect(10, 46, 54, 60, 'k'); c.rect(14, 48, 50, 58, 'd')


def ecu(c):
    c.rect(6, 14, 57, 50, 'l'); c.rect(10, 18, 53, 46, 'g'); c.rect(40, 28, 60, 40, 'k')
    for x in range(14, 36, 6):
        c.rect(x, 22, x + 3, 42, 'd')


def bulb(c, glass='w', glow='y', base='l'):
    c.disc(32, 24, 16, glass); c.disc(32, 26, 5, glow); c.rect(24, 38, 40, 52, base)
    for y in range(40, 52, 3):
        c.rect(24, y, 40, y, 'g')
    c.rect(28, 52, 36, 58, 'd')


def small_bulbs(c):
    c.rect(8, 22, 18, 46, 'w'); c.rect(46, 22, 56, 46, 'w'); c.disc(13, 22, 5, 'w', ry=4); c.disc(51, 22, 5, 'w', ry=4)
    c.rect(4, 26, 8, 42, 'l'); c.rect(56, 26, 60, 42, 'l'); c.rect(24, 24, 40, 40, 'y'); c.rect(28, 40, 36, 52, 'l')


def wiper(c):
    c.line(6, 52, 58, 14, 'k', 3); c.line(10, 54, 60, 18, 'd', 2); c.line(32, 34, 46, 54, 'd', 3); c.disc(46, 54, 4, 'g')


def lock(c):
    c.rect(14, 28, 50, 58, 'y'); c.disc(32, 28, 14, 'g', 0.6); c.rect(18, 28, 46, 30, 'y'); c.disc(32, 40, 4, 'k'); c.rect(31, 40, 33, 50, 'k')


def regulator(c):
    c.line(10, 54, 54, 10, 'g', 3); c.line(10, 10, 54, 54, 'g', 3); c.disc(32, 32, 5, 'd'); c.rect(6, 4, 58, 10, 'l'); c.disc(54, 54, 6, 'd')


def sill(c):
    c.poly([(4, 20), (60, 20), (60, 44), (4, 44)], 's'); c.disc(32, 50, 20, '.', ry=18)
    for x, y in ((12, 40), (16, 42), (50, 38), (46, 42), (54, 41)):
        c.disc(x, y, 2.5, 'n')


def tyre(c):
    c.disc(32, 32, 28, 'k'); c.disc(32, 32, 27, 'd'); c.disc(32, 32, 17, 'l'); c.disc(32, 32, 6, 'g')
    for i in range(0, 360, 15):
        a = math.radians(i)
        c.line(32 + math.cos(a) * 21, 32 + math.sin(a) * 21, 32 + math.cos(a) * 27, 32 + math.sin(a) * 27, 'k')
    for i in range(5):
        a = i * 2 * math.pi / 5
        c.line(32, 32, 32 + math.cos(a) * 15, 32 + math.sin(a) * 15, 'g', 3)


def alignment(c):
    c.rect(8, 10, 18, 54, 'd'); c.rect(46, 10, 56, 54, 'd')
    c.line(13, 6, 13, 58, 'G'); c.line(51, 6, 51, 58, 'G'); c.line(4, 32, 60, 32, 'r')


def nut(c):
    c.poly([(32, 8), (53, 20), (53, 44), (32, 56), (11, 44), (11, 20)], 'l'); c.disc(32, 32, 10, 'g'); c.disc(32, 32, 5, 'd')


def kit(c):
    c.rect(6, 22, 42, 54, 'd'); c.rect(10, 26, 38, 50, 'k'); c.disc(24, 38, 9, 'g'); c.rect(44, 14, 56, 54, 'w'); c.rect(46, 8, 54, 14, 'r')


def heater_matrix(c):
    c.rect(8, 14, 48, 50, 'c')
    for y in range(16, 50, 3):
        c.rect(8, y, 48, y, 'n')
    c.rect(48, 18, 60, 24, 'g'); c.rect(48, 40, 60, 46, 'g')


def compressor(c):
    c.rect(12, 18, 48, 50, 'l'); c.disc(14, 34, 10, 'd'); c.disc(14, 34, 4, 'g'); c.rect(30, 8, 38, 18, 'g'); c.rect(48, 26, 58, 34, 'b')


def drop(c, col='r'):
    c.disc(32, 40, 16, col); c.poly([(18, 34), (32, 6), (46, 34)], col); c.disc(26, 40, 4, 'w')


PARTS = {
    1: lambda c: belt(c, 'd'), 2: chain, 3: lambda c: belt(c, 'k', False), 4: pulleys, 5: lambda c: gasket(c, 'l'),
    6: mount, 7: rocker, 8: turbo, 9: panel_filter, 10: lambda c: valve_box(c, 'l', 'k', 'g'), 11: inline_filter,
    12: lambda c: pump(c, 'l', 'b'), 13: injector, 14: throttle, 15: lambda c: plug(c, True), 16: plug, 17: coil, 18: leads,
    19: dizzy, 20: sensor, 21: radiator, 22: lambda c: pump(c, 'g', 'd'), 23: thermostat, 24: hose, 25: tank, 26: fan,
    27: lambda c: bottle(c, 'b', 'w', 'd', 'G'), 28: lambda c: bottle(c, 'k', 'y', 'y', 'o'), 29: lambda c: can_filter(c, 'b'),
    30: sump, 31: switch, 32: exhaust_can, 33: lambda c: exhaust_can(c, 'g', 'k'), 34: lambda c: sensor(c, 'g', 'l'),
    35: silencer, 36: rubber, 37: clutch, 38: cable, 39: flywheel, 40: lambda c: bottle(c, 'r', 'w', 'd', 'R'), 41: cv,
    42: propshaft, 43: pad, 44: lambda c: wheel_disc(c), 45: caliper, 46: lambda c: drop(c, 'y'), 47: drum, 48: cable,
    49: lambda c: hose(c, 'k'), 50: shock, 51: spring, 52: lambda c: stick_ends(c, 'g', 'd'), 53: wishbone, 54: balljoint,
    55: topmount, 56: bearing, 57: lambda c: stick_ends(c, 'l', 'k'), 58: rack, 59: lambda c: pump(c, 'l', 'r'),
    60: lambda c: motor(c, 'k', 'd', 'b'), 61: battery, 62: alternator, 63: lambda c: motor(c, 'd', 'g', 'c'), 64: fuses,
    65: ecu, 66: bulb, 67: lambda c: bulb(c, 'o', 'r'), 68: small_bulbs, 69: wiper, 70: lock, 71: regulator, 72: sill,
    73: tyre, 74: alignment, 75: nut, 76: kit, 77: lambda c: panel_filter(c, 'd', 'w', 'G'), 78: fan, 79: heater_matrix,
    80: compressor,
}


def car(c, body, shade, e30):
    """A side view: wheels, body, glass. The E30 is a boxy three-box saloon; the Clio III a rounded five-door hatch."""
    if e30:
        c.poly([(3, 40), (4, 32), (14, 30), (22, 20), (42, 20), (49, 30), (61, 31), (61, 42), (3, 42)], body)
        c.poly([(19, 29), (24, 22), (31, 22), (31, 29)], 'b'); c.poly([(33, 29), (33, 22), (41, 22), (46, 29)], 'b')
        c.rect(3, 38, 61, 42, shade); c.rect(3, 33, 5, 35, 'w'); c.rect(59, 33, 61, 35, 'r'); c.line(32, 22, 32, 41, shade)
        fw, rw = 14, 50
    else:
        c.poly([(3, 42), (3, 34), (8, 30), (20, 27), (30, 16), (50, 16), (57, 22), (61, 34), (61, 42)], body)
        c.poly([(23, 27), (32, 18), (39, 18), (39, 27)], 'b'); c.poly([(41, 27), (41, 18), (49, 18), (54, 26)], 'b')
        c.rect(3, 39, 61, 42, shade); c.rect(3, 32, 7, 34, 'w'); c.rect(59, 26, 61, 31, 'r'); c.line(40, 18, 40, 41, shade)
        fw, rw = 14, 50
    for x in (fw, rw):
        c.disc(x, 43, 8, '.'); c.disc(x, 43, 7, 'k'); c.disc(x, 43, 4, 'l'); c.disc(x, 43, 1.5, 'd')


def main():
    root = os.path.join(os.path.dirname(__file__), '..', 'data', 'mechanics')
    parts = json.load(open(os.path.join(root, 'parts.json')))['parts']
    images = {}
    for p in parts:
        n = int(p['id'].split('-')[1])
        c = C(); PARTS[n](c); images[p['id']] = c.done()
    for key, body, shade, e30 in (('car:Clio III', 'g', 'd', False), ('car:3 Series (E30)', 's', 'S', True)):
        c = C(); car(c, body, shade, e30); images[key] = c.done()
    out = {'note': 'Written by tools/mech_pixels.py — re-run it, never hand-edit. 64 rows of 64 palette letters; "." is transparent.',
           'palette': {k: v for k, v in PALETTE.items() if v}, 'images': images}
    with open(os.path.join(root, 'pixels.json'), 'w') as f:
        json.dump(out, f, separators=(',', ':'))
    print('mech_pixels: %d pictures' % len(images))


if __name__ == '__main__':
    main()
