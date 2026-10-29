#!/usr/bin/env python3
"""Uygulama ikonu, açılış ekranı ve mağaza görselleri üretir (Pillow gerekir)."""
import os, math, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'assets'); S = os.path.join(ROOT, 'store')
os.makedirs(A, exist_ok=True); os.makedirs(S, exist_ok=True)

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def vgrad(w, h, top, bot):
    im = Image.new('RGB', (w, h)); d = ImageDraw.Draw(im)
    for y in range(h): d.line([(0, y), (w, y)], fill=lerp(top, bot, y / max(1, h - 1)))
    return im

def glow_bg(size, ss=1):
    w, h = size
    im = vgrad(w, h, (26, 38, 54), (14, 20, 30)).convert('RGBA')
    g = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
    cx, cy, r = w * .5, h * .78, min(w, h) * .55
    for i in range(24, 0, -1):
        t = i / 24
        a = int(120 * (1 - t) ** 1.6)
        d.ellipse([cx - r * t, cy - r * t, cx + r * t, cy + r * t], fill=(255, 130, 40, a))
    return Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(min(w, h) * .02)))

def anvil(size, scale=1.0, cx=.5, cy=.52):
    """Örs + kıvılcımlar, saydam zemin üzerinde."""
    scale = scale * size / 1024.0   # çizim 1024 birimlik tuvale göre yapıldı
    SS = 2; W = size * SS
    im = Image.new('RGBA', (W, W), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    def P(pts):
        out = []
        for x, y in pts:
            out.append(((x - 512) * scale * SS + cx * W, (y - 512) * scale * SS + cy * W))
        return out
    OUT = (14, 18, 26, 255)
    # gövde
    body = [(150, 440), (330, 372), (840, 372), (840, 452), (704, 474), (646, 560), (708, 640), (772, 700), (772, 772), (252, 772), (252, 700), (316, 640), (384, 560), (374, 494), (292, 476)]
    mask = Image.new('L', (W, W), 0); ImageDraw.Draw(mask).polygon(P(body), fill=255)
    fill = Image.new('RGBA', (W, W))
    fd = ImageDraw.Draw(fill)
    y0 = int((372 - 512) * scale * SS + cy * W); y1 = int((772 - 512) * scale * SS + cy * W)
    for y in range(max(0, y0), min(W, y1)):
        t = (y - y0) / max(1, y1 - y0)
        c = lerp((198, 210, 224), (58, 68, 84), t ** .8)
        fd.line([(0, y), (W, y)], fill=c + (255,))
    im.paste(fill, (0, 0), mask)
    d = ImageDraw.Draw(im)
    d.line(P(body + [body[0]]), fill=OUT, width=int(14 * scale * SS), joint='curve')
    # üst plaka parlaması
    d.line(P([(340, 392), (820, 392)]), fill=(255, 255, 255, 190), width=int(9 * scale * SS))
    d.line(P([(190, 436), (320, 388)]), fill=(255, 255, 255, 140), width=int(6 * scale * SS))
    # ahşap kütük
    log = [(300, 772), (724, 772), (744, 860), (280, 860)]
    lm = Image.new('L', (W, W), 0); ImageDraw.Draw(lm).polygon(P(log), fill=255)
    lf = Image.new('RGBA', (W, W)); ld = ImageDraw.Draw(lf)
    ly0 = int((772 - 512) * scale * SS + cy * W); ly1 = int((860 - 512) * scale * SS + cy * W)
    for y in range(max(0, ly0), min(W, ly1)):
        t = (y - ly0) / max(1, ly1 - ly0)
        ld.line([(0, y), (W, y)], fill=lerp((170, 118, 66), (96, 60, 30), t) + (255,))
    im.paste(lf, (0, 0), lm); d = ImageDraw.Draw(im)
    d.line(P(log + [log[0]]), fill=OUT, width=int(12 * scale * SS), joint='curve')
    # kıvılcımlar
    random.seed(7)
    for (x, y, r, col) in [(560, 300, 15, (255, 214, 102)), (640, 250, 10, (255, 140, 50)), (500, 230, 9, (255, 190, 80)), (700, 330, 8, (255, 214, 102)), (430, 290, 7, (255, 140, 50)), (600, 190, 7, (255, 214, 102)), (740, 240, 6, (255, 170, 70)), (540, 150, 6, (255, 140, 50))]:
        px, py = P([(x, y)])[0]; rr = r * scale * SS
        for k in range(4, 0, -1):
            a = int(60 * (5 - k) / 4)
            d.ellipse([px - rr * k, py - rr * k, px + rr * k, py + rr * k], fill=col + (a,))
        d.ellipse([px - rr, py - rr, px + rr, py + rr], fill=col + (255,))
    return im.resize((size, size), Image.LANCZOS)

def paste_center(base, layer, dx=0, dy=0):
    base.alpha_composite(layer, (int((base.width - layer.width) / 2 + dx), int((base.height - layer.height) / 2 + dy)))

# --- ikon dosyaları (@capacitor/assets adlandırması)
bg1024 = glow_bg((1024, 1024))
icon_only = bg1024.copy(); icon_only.alpha_composite(anvil(1024, 1.0)); icon_only.convert('RGB').save(os.path.join(A, 'icon-only.png'))
bg1024.convert('RGB').save(os.path.join(A, 'icon-background.png'))
anvil(1024, 0.70).save(os.path.join(A, 'icon-foreground.png'))   # uyarlanabilir ikon güvenli alanı
# --- açılış ekranı
for name, dark in (('splash.png', False), ('splash-dark.png', True)):
    sp = glow_bg((2732, 2732)) if dark else vgrad(2732, 2732, (34, 48, 66), (18, 26, 38)).convert('RGBA')
    sp.alpha_composite(anvil(1100, 1.0, cy=.5), (int((2732 - 1100) / 2), int((2732 - 1100) / 2)))
    sp.convert('RGB').save(os.path.join(A, name))
# --- mağaza görselleri
icon_only.resize((512, 512), Image.LANCZOS).convert('RGB').save(os.path.join(S, 'icon-512.png'))
fw, fh = 1024, 500
fg = glow_bg((fw, fh)); fg.alpha_composite(anvil(480, 1.0), (40, 10))
d = ImageDraw.Draw(fg)
def font(sz, bold=True):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSerif-Bold.ttf'):
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
def sans(sz):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf'):
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
d.text((540, 190), 'Örs Dükkanı', font=font(64), fill=(246, 217, 138, 255), stroke_width=3, stroke_fill=(20, 12, 6, 255))
d.text((544, 290), 'Silah döv, çalışan tut,', font=sans(32), fill=(232, 237, 243, 255))
d.text((544, 334), 'dükkanını büyüt.', font=sans(32), fill=(232, 237, 243, 255))
fg.convert('RGB').save(os.path.join(S, 'feature-graphic-1024x500.png'))
print('tamam:', sorted(os.listdir(A)), sorted(os.listdir(S)))
