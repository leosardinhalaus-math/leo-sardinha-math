"""Regenerate the committed multi-size .ico with Pillow (asset authoring only)."""
from pathlib import Path
from PIL import Image, ImageDraw
SIZE = 1024
im = Image.new('RGBA', (SIZE, SIZE))
d = ImageDraw.Draw(im)
# A leather case, warm metal body, a teal enamel band and glass lens.
d.rounded_rectangle((20, 20, 1004, 1004), radius=228, fill='#141D1C')
d.rounded_rectangle((45, 45, 979, 979), radius=205, outline='#38504A', width=12)
d.rounded_rectangle((145, 400, 893, 852), radius=85, fill='#0A1211')
d.rounded_rectangle((370, 228, 654, 406), radius=43, fill='#DACCAE')
d.rounded_rectangle((417, 258, 607, 343), radius=17, fill='#233632')
d.rounded_rectangle((191, 282, 319, 354), radius=20, fill='#DBAA68')
d.rounded_rectangle((125, 346, 899, 811), radius=84, fill='#E9DDC3')
d.rounded_rectangle((125, 452, 899, 811), radius=78, fill='#385D52')
d.rectangle((125, 452, 899, 530), fill='#385D52')
d.line((157, 452, 867, 452), fill='#D2BD94', width=8)
d.rounded_rectangle((180, 384, 323, 426), radius=13, fill='#A48B61')
d.rounded_rectangle((752, 380, 849, 427), radius=14, fill='#283B36')
d.ellipse((750, 702, 790, 742), fill='#DFAD69')
d.ellipse((290, 376, 734, 820), fill='#10211D')
d.ellipse((312, 398, 712, 798), fill='#DBAB69')
d.ellipse((335, 421, 689, 775), fill='#203C34')
d.ellipse((360, 446, 664, 750), fill='#5E8C7C')
d.ellipse((380, 466, 644, 730), fill='#172D29')
d.ellipse((405, 491, 619, 705), fill='#2D5149')
d.ellipse((415, 496, 493, 574), fill='#B8D4C8')
d.ellipse((551, 637, 589, 675), fill='#60877D')
p = Path(__file__).parent
im.save(p/'VintageCam.ico', format='ICO', sizes=[(n,n) for n in (16,24,32,48,64,128,256)])
im.resize((256,256), Image.Resampling.LANCZOS).save(p/'icon-preview.png')
print('Generated icon: 16, 24, 32, 48, 64, 128 and 256 px.')
