"""Content integrity and recurring-pattern checks, no third-party dependency."""
import json, re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
text=(root/'professor/listas/data.js').read_text()
bank=json.loads(text.split('window.EXERCISE_BANK = ')[1].rstrip(';\n'))
expected={}
for area in ['algebra','geometria']:
 raw=(root/area/'index.html').read_text().split('const DATA=')[1]
 source=json.JSONDecoder().raw_decode(raw)[0]
 for year,skills in source.items():
  for skill in skills:expected[skill['code']]=(area,int(year),skill['description'])
assert len(bank)==len(expected)==38
assert sum(s['area']=='algebra' for s in bank)==16
assert sum(s['area']=='geometria' for s in bank)==22
ids=set()
for skill in bank:
 assert (skill['area'],skill['year'],skill['description'])==expected[skill['code']]
 assert len(skill['lists'])==5
 signatures=set()
 for number,item in enumerate(skill['lists'],1):
  assert item['number']==number and len(item['questions'])==5
  for question in item['questions']:
   assert question['id'] not in ids
   ids.add(question['id'])
   assert question['prompt'].strip() and question['answer'].strip()
   assert question['space'] in ['lines','drawing','grid','largegrid']
   signature=(question['prompt'],json.dumps(question.get('visual'),sort_keys=True))
   assert signature not in signatures,(skill['code'],signature)
   signatures.add(signature)
   visual=question.get('visual',{})
   if visual.get('type')=='grid':
    for label,x,y in visual['points']:assert 0<=x<=visual['size'] and 0<=y<=visual['size']
   if visual.get('type')=='sequence' and '___' in visual['items'] and not visual['items'][0].isdigit():
    xs=visual['items']
    # Infer the shortest repeating unit from all visible positions, then check
    # that missing tokens appear in the answer in the same order.
    for period in range(1,len(xs)):
     units=[];valid=True
     for col in range(period):
      choices={xs[j] for j in range(col,len(xs),period) if xs[j]!='___'}
      if len(choices)!=1:valid=False;break
      units.append(choices.pop())
     if valid and all(x=='___' or x==units[i%period] for i,x in enumerate(xs)):
      missing=[units[i%period] for i,x in enumerate(xs) if x=='___']
      cursor=0
      for answer in missing:
       found=question['answer'].find(answer,cursor)
       assert found>=0,(question['id'],missing,question['answer'])
       cursor=found+len(answer)
      break
 assert len(signatures)==25
assert len(ids)==950
print('OK: 38 habilidades iguais às fontes, 190 listas, 950 IDs; 25 questões distintas por habilidade; malhas e padrões verificados.')
