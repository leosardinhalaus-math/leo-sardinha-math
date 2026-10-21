#!/usr/bin/env python3
"""Rebuild a 5×9 card grid from the existing 45 portraits, then slice it.

The older sprite is only 5×2; it is never misidentified as a 45-card source.
All output cards preserve the illustration and display the original game data.
"""
from pathlib import Path
import argparse
import hashlib
import json
import re
import shutil
import textwrap
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'jogos/calculus-royale'
WIDTH, HEIGHT, COLUMNS, ROWS = 240, 336, 5, 9

def font(size):
    for path in ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf']:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size=size)

def metadata():
    source = (ROOT / 'jogos/calculus-royale-src/client/src/components/GameCanvas.tsx').read_text()
    pattern = r'\{ id: "([^"]+)", name: "([^"]+)", icon: "([^"]+)", kind: "([^"]+)", cost: (\d+), rarity: "([^"]+)", formula: "([^"]+)", effect: "([^"]+)", power: (\d+) \}'
    matches = re.findall(pattern, source)
    if len(matches) != 45 or len({row[0] for row in matches}) != 45:
        raise ValueError('A fonte deve conter exatamente 45 cartas distintas.')
    profiles = (ROOT / 'jogos/calculus-royale-src/client/src/game/cardProfiles.ts').read_text()
    profile_pattern = r"(?:'([^']+)'|\b([a-z][a-z0-9]*)):p\('([^']+)','([^']+)','([^']+)','([^']+)','([^']+)'"
    styles = {(match[0] or match[1]): match[2:] for match in re.findall(profile_pattern, profiles)}
    result = []
    for number, row in enumerate(matches, 1):
        key, name, icon, kind, cost, rarity, formula, effect, power = row
        archetype, color, glow, ability, ability_kind = styles[key]
        result.append(dict(id=number, key=key, name=name, icon=icon, kind=kind, cost=int(cost), rarity=rarity,
            formula=formula, effect=effect, power=int(power), color=color, glow=glow,
            ability=ability, ability_kind=ability_kind, archetype=archetype,
            hp=90+int(power)*4, damage=8+int(power)*0.6,
            speed=1.15 if kind=='estrutura' else 1.7,
            range=2.7 if archetype in ['archer','mage','priest','engineer','angel'] else 0.95,
            interval=1.05, image=f'res://assets/cards/card_{number:02}.webp',
            model=f'res://assets/models_3d/{key}.glb'))
    return result

def make_grid(cards):
    grid = Image.new('RGB', (WIDTH*COLUMNS, HEIGHT*ROWS), '#0a1a2b')
    for index, card in enumerate(cards):
        face = Image.new('RGB', (WIDTH, HEIGHT), '#0b1c2d')
        draw = ImageDraw.Draw(face)
        rarity_color = {'comum':'#73d8d0','rara':'#a9a6f4','épica':'#ed99db','lendária':'#f1cc77'}[card['rarity']]
        draw.rounded_rectangle((3,3,WIDTH-4,HEIGHT-4), radius=17, outline=rarity_color, width=4)
        portrait = Image.open(SOURCE / 'assets/cards/characters' / (card['key']+'.webp')).convert('RGB')
        portrait = ImageOps.fit(portrait, (WIDTH-20,224), method=Image.Resampling.LANCZOS)
        face.paste(portrait, (10,10))
        draw = ImageDraw.Draw(face)
        draw.rounded_rectangle((12,12,53,48), radius=11, fill='#172f48', outline=rarity_color, width=2)
        draw.text((32,29),str(card['cost']),font=font(23),fill='white',anchor='mm')
        lines = textwrap.wrap(card['name'], width=21)
        y=242
        for line in lines[:3]:
            draw.text((WIDTH/2,y),line,font=font(16),fill='#fff2cb',anchor='mt');y+=21
        draw.text((WIDTH/2,312),card['rarity'].upper()+'  ·  %02d'%card['id'],font=font(11),fill=rarity_color,anchor='mt')
        grid.paste(face,((index%COLUMNS)*WIDTH,(index//COLUMNS)*HEIGHT))
    target=ROOT/'assets/source/cards_grid.webp'
    grid.save(target,'WEBP',lossless=True,method=6)
    return target

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--grid',type=Path,help='Optional existing 5×9 full-card grid; the metadata order remains authoritative.')
    args=parser.parse_args()
    for path in ['assets/cards','assets/source','assets/islands','assets/models_3d','data']:
        (ROOT/path).mkdir(parents=True,exist_ok=True)
    cards=metadata()
    grid_path=args.grid or make_grid(cards)
    with Image.open(grid_path) as original:
        image=original.convert('RGB');width,height=image.size
        if width%COLUMNS or height%ROWS:
            raise ValueError('A grade deve ter cinco colunas e nove linhas, sem margens externas.')
        cw,ch=width//COLUMNS,height//ROWS
        for index,card in enumerate(cards):
            col,row=index%COLUMNS,index//COLUMNS
            image.crop((col*cw,row*ch,(col+1)*cw,(row+1)*ch)).save(ROOT/f'assets/cards/card_{index+1:02}.webp','WEBP',quality=92,method=6)
            shutil.copyfile(SOURCE/f'assets/models/generated/{card["key"]}.glb',ROOT/f'assets/models_3d/{card["key"]}.glb')
    worlds=[
        ('Portões da Derivada','Taxas de mudança, limites e derivadas elementares.',1,['Reta tangente','O limite abre a porta','Potências em movimento','Continuidade','Quociente e seno','Guardião dos Portões']),
        ('Cânion da Cadeia','Composição, inversas e diferenciação implícita.',2,['Elo exterior','Elo interior','A ponte da inversa','Taxas relacionadas','Equação implícita','Guardião da Cadeia']),
        ('Observatório do Valor Médio','Crescimento, aproximações e otimização.',4,['O vale do máximo','A raiz de Newton','Crescimento','A torre de Taylor','Análise do gráfico','Guardião do Observatório']),
        ('Delta da Integral','Área, acumulação e teorema fundamental.',3,['A margem da área','Soma das parcelas','O teorema fundamental','A cidade das primitivas','Camadas de volume','Guardião do Delta']),
        ('Forja da Antiderivada','Substituição, técnicas e convergência.',5,['Transformação de u','As duas partes','A oficina dos trapézios','O caminho infinito','Séries e comparação','Guardião da Forja'])
    ]
    islands=[]
    for index,(title,focus,source,chapters) in enumerate(worlds,1):
        with Image.open(SOURCE/f'assets/maps/world-{source}.webp') as im:
            im.convert('RGB').save(ROOT/f'assets/islands/island_{index:02}.webp','WEBP',quality=95,method=6)
        islands.append(dict(id=index,title=title,focus=focus,chapters=chapters,image=f'res://assets/islands/island_{index:02}.webp'))
    (ROOT/'data/cards.json').write_text(json.dumps(cards,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'data/islands.json').write_text(json.dumps(islands,ensure_ascii=False,indent=2)+'\n')
    provenance={'source':'existing React/Three.js Calculus Royale assets in this repository','old_sprite_grid':'5×2, ten portraits only',
        'generated_grid':str(grid_path.relative_to(ROOT)) if grid_path.is_relative_to(ROOT) else str(grid_path),
        'layout':'5 columns × 9 rows, row-major order matching data/cards.json',
        'cards':45,'islands':5,'models':45,
        'sha256':{str(path.relative_to(ROOT)):hashlib.sha256(path.read_bytes()).hexdigest() for folder in ['assets/cards','assets/islands','assets/models_3d'] for path in sorted((ROOT/folder).glob('*')) if path.suffix in {'.webp', '.glb'}}}
    (ROOT/'data/asset-provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')
    print('45 cartas recortadas, cinco mapas WebP e 45 modelos GLB preparados.')

if __name__=='__main__':
    main()
