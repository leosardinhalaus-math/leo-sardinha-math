from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import json, math, hashlib, random

ROOT = Path(__file__).resolve().parents[1]
BACKLOG = ROOT / "client" / "src" / "data" / "character-art-backlog.json"
OUT = ROOT / "client" / "public" / "assets" / "cards" / "characters"
SIZE = 1024

ARCHETYPE = {
    "power":"mage","sine":"dancer","euler":"orb","ln":"rogue","cauchy":"guardian",
    "opt":"compass","cavalieri":"architect","fractal":"seed","sub":"alchemist",
    "parts":"duelist","trap":"engineer","improper":"sentinel","continuity":"sentinel",
    "quotient":"rogue","secant":"knight","bernoulli":"alchemist","inverse":"witch",
    "expchain":"orb","root":"warrior","mirror":"mirror","mean":"judge","growth":"scout",
    "taylor2":"scribe","miner":"miner","average":"monk","volume":"weaver",
    "surface":"navigator","gabriel":"herald","cavalieri-advanced":"architect",
    "surface-flux":"weaver","parts2":"duelist","simpson":"engineer",
    "compare":"oracle","simpson-advanced":"oracle","comparison":"guardian"
}

SYMBOL = {
    "power":"n","sine":"∿","euler":"e","ln":"ln","cauchy":"≈","opt":"•",
    "cavalieri":"▥","fractal":"✦","sub":"u","parts":"∫","trap":"⌒",
    "improper":"∞","continuity":"~","quotient":"÷","secant":"↗",
    "bernoulli":"e","inverse":"↔","expchain":"aˣ","root":"√","mirror":"∂",
    "mean":"Δ","growth":"↑","taylor2":"Σ","miner":"∩","average":"f̄",
    "volume":"V","surface":"S","gabriel":"∞","cavalieri-advanced":"▥",
    "surface-flux":"∯","parts2":"∫","simpson":"⌒","compare":"≤",
    "simpson-advanced":"≈","comparison":"≤"
}

PALETTES = [
    ("#13233f","#25d4e7","#f4c96b"),("#2a173f","#9b6cff","#55d6e8"),
    ("#163528","#41d69a","#e5c969"),("#3b1a24","#ff816d","#f0c46a"),
    ("#172c4a","#6bdff0","#ffffff"),("#332610","#e9bb55","#63d9df")
]

def rgb(h): h=h.lstrip("#"); return tuple(int(h[i:i+2],16) for i in (0,2,4))
def lerp(a,b,t): return tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))

def font(size, bold=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"
    ]
    for p in paths:
        if Path(p).exists(): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def gradient(bg1,bg2):
    im=Image.new("RGB",(SIZE,SIZE),bg1); d=ImageDraw.Draw(im)
    a,b=rgb(bg1),rgb(bg2)
    for y in range(SIZE):
        t=y/(SIZE-1); d.line((0,y,SIZE,y),fill=lerp(a,b,t))
    return im.convert("RGBA")

def glow_circle(layer,xy,r,color,alpha=150):
    d=ImageDraw.Draw(layer)
    for k in range(6,0,-1):
        rr=r+k*18; a=max(8,alpha//(k+1))
        d.ellipse((xy[0]-rr,xy[1]-rr,xy[0]+rr,xy[1]+rr),fill=(*rgb(color),a))

def limb(d,p1,p2,w,fill):
    d.line((*p1,*p2),fill=fill,width=w,joint="curve")
    r=w//2
    for x,y in (p1,p2): d.ellipse((x-r,y-r,x+r,y+r),fill=fill)

def human(layer, archetype, main, accent, seed):
    rnd=random.Random(seed); d=ImageDraw.Draw(layer)
    cx,cy=520,540
    skin=(238,196,158,255)
    dark=(20,30,48,255)
    # cape / aura silhouette
    if archetype in {"mage","witch","oracle","scribe","monk","herald","alchemist"}:
        d.polygon([(cx-145,cy-20),(cx+145,cy-20),(cx+215,cy+320),(cx-215,cy+320)],fill=(*rgb(main),210))
    # legs
    limb(d,(cx-62,cy+145),(cx-95,cy+330),38,dark)
    limb(d,(cx+62,cy+145),(cx+105,cy+330),38,dark)
    # torso
    d.rounded_rectangle((cx-115,cy-90,cx+115,cy+175),45,fill=(*rgb(main),255),outline=(*rgb(accent),255),width=9)
    # head + hair/helmet
    d.ellipse((cx-73,cy-220,cx+73,cy-75),fill=skin)
    if archetype in {"knight","guardian","warrior","sentinel","judge"}:
        d.pieslice((cx-88,cy-238,cx+88,cy-60),180,360,fill=(*rgb(accent),255))
        d.rectangle((cx-78,cy-145,cx+78,cy-112),fill=(*rgb(main),255))
    else:
        d.pieslice((cx-82,cy-235,cx+82,cy-65),180,355,fill=(32,26,42,255))
    # arms
    pose = rnd.choice([0,1,2])
    if pose==0:
        limb(d,(cx-100,cy-30),(cx-220,cy+35),34,skin); limb(d,(cx+100,cy-30),(cx+220,cy-120),34,skin)
    elif pose==1:
        limb(d,(cx-100,cy-20),(cx-210,cy-125),34,skin); limb(d,(cx+100,cy-20),(cx+220,cy+35),34,skin)
    else:
        limb(d,(cx-100,cy-10),(cx-235,cy-15),34,skin); limb(d,(cx+100,cy-10),(cx+235,cy-15),34,skin)
    # emblem
    d.ellipse((cx-44,cy-15,cx+44,cy+73),fill=(*rgb(accent),240),outline=(255,255,255,180),width=4)
    return (cx,cy)

def prop(layer, archetype, main, accent):
    d=ImageDraw.Draw(layer); cx,cy=520,540; ac=(*rgb(accent),255); mn=(*rgb(main),255)
    if archetype in {"mage","alchemist","scribe","oracle","herald","witch"}:
        limb(d,(cx+210,cy-130),(cx+280,cy+200),18,ac); d.ellipse((cx+235,cy-190,cx+325,cy-100),fill=ac)
    elif archetype in {"rogue","duelist"}:
        limb(d,(cx-225,cy-30),(cx-320,cy+110),20,ac); limb(d,(cx+225,cy-30),(cx+320,cy+110),20,ac)
    elif archetype in {"guardian","judge"}:
        d.rounded_rectangle((cx-310,cy-110,cx-175,cy+150),35,fill=mn,outline=ac,width=12)
        d.rounded_rectangle((cx+175,cy-110,cx+310,cy+150),35,fill=mn,outline=ac,width=12)
    elif archetype=="knight":
        limb(d,(cx+210,cy-120),(cx+350,cy-260),18,ac)
    elif archetype=="engineer":
        for ox,oy,r in [(-230,90,65),(230,80,55),(270,-60,40)]:
            d.ellipse((cx+ox-r,cy+oy-r,cx+ox+r,cy+oy+r),outline=ac,width=14)
            for a in range(0,360,45):
                x=cx+ox+math.cos(math.radians(a))*r; y=cy+oy+math.sin(math.radians(a))*r
                d.line((cx+ox,cy+oy,x,y),fill=ac,width=6)
    elif archetype=="architect":
        for ox in (-230,230):
            d.polygon([(cx+ox-70,cy+120),(cx+ox,cy-150),(cx+ox+70,cy+120)],outline=ac,fill=(*rgb(main),150))
            for yy in range(cy-80,cy+110,45): d.line((cx+ox-55,yy,cx+ox+55,yy),fill=(255,255,255,150),width=5)
    elif archetype in {"weaver","navigator"}:
        for a in range(0,360,30):
            r=170; x=cx+math.cos(math.radians(a))*r; y=cy+math.sin(math.radians(a))*r*0.55
            d.ellipse((x-9,y-9,x+9,y+9),fill=ac)
    elif archetype=="scout":
        d.arc((cx-300,cy-250,cx+300,cy+250),210,330,fill=ac,width=18)
    elif archetype=="miner":
        limb(d,(cx+200,cy-80),(cx+310,cy-220),22,ac); limb(d,(cx+265,cy-210),(cx+355,cy-145),16,ac)
    elif archetype=="dancer":
        d.arc((cx-330,cy-260,cx+330,cy+280),200,340,fill=ac,width=20)
        d.arc((cx-300,cy-180,cx+300,cy+360),20,170,fill=(255,255,255,180),width=11)
    elif archetype=="monk":
        d.line((cx-280,cy+40,cx+280,cy+40),fill=ac,width=16); d.ellipse((cx-14,cy+26,cx+14,cy+54),fill=(255,255,255,255))

def special_nonhuman(layer, archetype, main, accent, seed):
    d=ImageDraw.Draw(layer); cx,cy=520,520; ac=(*rgb(accent),255); mn=(*rgb(main),255)
    if archetype=="orb":
        for r,a in [(220,70),(170,100),(115,150)]:
            d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(*rgb(accent),a),outline=(255,255,255,120),width=6)
        d.ellipse((cx-90,cy-90,cx+90,cy+90),fill=(255,220,105,255))
        return
    if archetype=="compass":
        d.ellipse((cx-220,cy-220,cx+220,cy+220),fill=(*rgb(main),220),outline=ac,width=18)
        d.polygon([(cx,cy-180),(cx+45,cy+60),(cx,cy+20),(cx-45,cy+60)],fill=ac)
        return
    if archetype=="seed":
        d.ellipse((cx-75,cy-135,cx+75,cy+135),fill=mn,outline=ac,width=12)
        for r in (120,190,265):
            for a in range(0,360,60):
                x=cx+math.cos(math.radians(a))*r; y=cy+math.sin(math.radians(a))*r
                d.ellipse((x-28,y-28,x+28,y+28),fill=(*rgb(accent),170))
        return
    if archetype=="mirror":
        d.rounded_rectangle((cx-220,cy-300,cx+220,cy+300),80,fill=(160,220,240,120),outline=ac,width=20)
        d.line((cx,cy-260,cx,cy+260),fill=(255,255,255,180),width=8)
        return

def formula_motif(layer, card_id, symbol, accent):
    d=ImageDraw.Draw(layer)
    # magic circle / graph
    for r,a in [(330,45),(270,70)]:
        d.ellipse((512-r,512-r,512+r,512+r),outline=(*rgb(accent),a),width=5)
    for x in range(140,900,95): d.line((x,130,x,880),fill=(255,255,255,18),width=2)
    for y in range(150,900,95): d.line((120,y,900,y),fill=(255,255,255,18),width=2)
    # symbol
    f=font(110,True)
    box=d.textbbox((0,0),symbol,font=f); w=box[2]-box[0]
    d.text((512-w/2,92),symbol,font=f,fill=(*rgb(accent),230))
    # curve motif
    pts=[]
    phase=(int(hashlib.md5(card_id.encode()).hexdigest()[:4],16)%360)*math.pi/180
    for x in range(120,905,8):
        y=790-80*math.sin((x-120)/100+phase)
        pts.append((x,y))
    d.line(pts,fill=(*rgb(accent),120),width=7)

def render(item):
    seed=int(hashlib.sha256(item["id"].encode()).hexdigest()[:8],16)
    random.seed(seed)
    p=PALETTES[seed%len(PALETTES)]
    bg=gradient(p[0], "#07101f")
    glow=Image.new("RGBA",(SIZE,SIZE),(0,0,0,0)); glow_circle(glow,(520,470),290,p[1],180); glow=glow.filter(ImageFilter.GaussianBlur(28)); bg=Image.alpha_composite(bg,glow)
    motif=Image.new("RGBA",(SIZE,SIZE),(0,0,0,0)); formula_motif(motif,item["id"],SYMBOL.get(item["id"],"∂"),p[2]); bg=Image.alpha_composite(bg,motif)
    char=Image.new("RGBA",(SIZE,SIZE),(0,0,0,0))
    arch=ARCHETYPE.get(item["id"],"mage")
    if arch in {"orb","compass","seed","mirror"}: special_nonhuman(char,arch,p[1],p[2],seed)
    else:
        human(char,arch,p[1],p[2],seed); prop(char,arch,p[1],p[2])
    # subtle outline/glow
    alpha=char.getchannel("A"); blurred=alpha.filter(ImageFilter.GaussianBlur(18))
    halo=Image.new("RGBA",(SIZE,SIZE),(*rgb(p[2]),0)); halo.putalpha(blurred.point(lambda v:min(140,v)))
    bg=Image.alpha_composite(bg,halo); bg=Image.alpha_composite(bg,char)
    # vignette
    vig=Image.new("RGBA",(SIZE,SIZE),(0,0,0,0)); vd=ImageDraw.Draw(vig)
    vd.rectangle((0,0,SIZE,SIZE),outline=(0,0,0,90),width=35)
    out=Image.alpha_composite(bg,vig).convert("RGB")
    OUT.mkdir(parents=True,exist_ok=True)
    out.save(OUT/f'{item["id"]}.webp',"WEBP",quality=88,method=6)

def main():
    data=json.loads(BACKLOG.read_text(encoding="utf-8"))
    generated=[]
    for item in data["remaining"]:
        target=OUT/f'{item["id"]}.webp'
        if target.exists() and target.stat().st_size>1000:
            continue
        render(item); generated.append(item["id"])
    print(f"Generated {len(generated)} new 2D character assets.")
    if generated: print("Generated:", ", ".join(generated))

if __name__=="__main__":
    main()
