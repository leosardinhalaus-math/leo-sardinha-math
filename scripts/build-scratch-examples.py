"""Build original Scratch 3 projects used in the guided mathematics studio."""
from pathlib import Path
import json,hashlib,zipfile,math
ROOT=Path(__file__).resolve().parents[1]/'laboratorio-scratch-geogebra'/'exemplos'
class Ref:
 def __init__(self,id):self.id=id
class Project:
 def __init__(self,title,variables,backdrop,pen=False):
  self.title=title;self.blocks={};self.variables={v:[v,0] for v in variables};self.assets={};self.pen=pen
  self.stage={'isStage':True,'name':'Stage','variables':{},'lists':{},'broadcasts':{'redraw':'desenhar'},'blocks':{},'comments':{},'currentCostume':0,'costumes':[self.asset('Malha',backdrop,240,180)],'sounds':[],'volume':100,'layerOrder':0,'tempo':60,'videoTransparency':50,'videoState':'on','textToSpeechLanguage':None}
  costume='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="9" fill="#e36b0a" stroke="#082f49" stroke-width="2"/></svg>'
  self.sprite={'isStage':False,'name':'Alvo' if not pen else 'Caneta','variables':self.variables,'lists':{},'broadcasts':{},'blocks':self.blocks,'comments':{},'currentCostume':0,'costumes':[self.asset('Marcador',costume,12,12)],'sounds':[],'volume':100,'layerOrder':1,'visible':not pen,'x':0,'y':0,'size':100,'direction':90,'draggable':False,'rotationStyle':"don't rotate"}
 def asset(self,name,svg,cx,cy):
  data=svg.encode();md5=hashlib.md5(data).hexdigest();self.assets[md5+'.svg']=data
  return {'assetId':md5,'name':name,'bitmapResolution':1,'md5ext':md5+'.svg','dataFormat':'svg','rotationCenterX':cx,'rotationCenterY':cy}
 def b(self,opcode,inputs=None,fields=None):
  id='b'+str(len(self.blocks)+1);entry={'opcode':opcode,'next':None,'parent':None,'inputs':{},'fields':fields or {},'shadow':False,'topLevel':False};self.blocks[id]=entry
  for k,v in (inputs or {}).items():
   if isinstance(v,Ref):entry['inputs'][k]=[2,v.id];self.blocks[v.id]['parent']=id
   elif isinstance(v,list):entry['inputs'][k]=v
   else:entry['inputs'][k]=[1,[4 if isinstance(v,(float,int)) else 10,str(v)]]
  return Ref(id)
 def chain(self,*blocks):
  blocks=[b for b in blocks if b]
  for a,b in zip(blocks,blocks[1:]):self.blocks[a.id]['next']=b.id;self.blocks[b.id]['parent']=a.id
  return blocks[0]
 def event(self,event,body,fields=None):
  hat=self.b(event,fields=fields);self.blocks[hat.id].update(topLevel=True,x=40,y=50+sum(b.get('topLevel',False) for b in self.blocks.values())*240);self.chain(hat,body)
 def var(self,name):return self.b('data_variable',fields={'VARIABLE':[name,name]})
 def set(self,name,value):return self.b('data_setvariableto',{'VALUE':value},{'VARIABLE':[name,name]})
 def change(self,name,value):return self.b('data_changevariableby',{'VALUE':value},{'VARIABLE':[name,name]})
 def op(self,op,a,b):return self.b('operator_'+op,{'OPERAND1' if op in ['equals','gt','lt','and','or'] else 'NUM1':a,'OPERAND2' if op in ['equals','gt','lt','and','or'] else 'NUM2':b})
 def add(self,a,b):return self.op('add',a,b)
 def sub(self,a,b):return self.op('subtract',a,b)
 def mul(self,a,b):return self.op('multiply',a,b)
 def div(self,a,b):return self.op('divide',a,b)
 def join(self,a,b):return self.b('operator_join',{'STRING1':a,'STRING2':b})
 def say(self,text,seconds=2):return self.b('looks_sayforsecs',{'MESSAGE':text,'SECS':seconds})
 def goto(self,x,y):return self.b('motion_gotoxy',{'X':x,'Y':y})
 def repeat(self,n,body):return self.b('control_repeat',{'TIMES':n,'SUBSTACK':body})
 def ifelse(self,c,a,b):return self.b('control_if_else',{'CONDITION':c,'SUBSTACK':a,'SUBSTACK2':b})
 def ask(self,q,var):return self.chain(self.b('sensing_askandwait',{'QUESTION':q}),self.set(var,self.b('sensing_answer')))
 def penop(self,op):return self.b('pen_'+op)
 def size(self,n):return self.b('pen_setPenSizeTo',{'SIZE':n})
 def color(self,c):return self.b('pen_setPenColorToColor',{'COLOR':[1,[9,c]]})
 def line(self,x1,y1,x2,y2):return self.chain(self.penop('penUp'),self.goto(x1,y1),self.penop('penDown'),self.goto(x2,y2),self.penop('penUp'))
 def chainparts(self,*parts):
  # Each part can be a prelinked chain: link its tail, not just its first block.
  first=parts[0];last=first
  for part in parts[1:]:
   while self.blocks[last.id]['next']:last=Ref(self.blocks[last.id]['next'])
   self.blocks[last.id]['next']=part.id;self.blocks[part.id]['parent']=last.id;last=part
  return first
 def save(self,id):
  project={'targets':[self.stage,self.sprite],'monitors':[],'extensions':['pen'] if self.pen else [],'meta':{'semver':'3.0.0','vm':'11.0.0','agent':'Leo Sardinha.Math — original educational examples'}}
  ROOT.mkdir(parents=True,exist_ok=True)
  with zipfile.ZipFile(ROOT/(id+'.sb3'),'w',zipfile.ZIP_DEFLATED) as z:
   z.writestr('project.json',json.dumps(project,ensure_ascii=False));
   for name,data in self.assets.items():z.writestr(name,data)

def canvas(body):return '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" fill="#f1f8fc"/>'+body+'</svg>'
def text(t,x,y,size=15):return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Arial" font-size="{size}" fill="#123047">{t}</text>'
grid=text('Qual é o par (x, y) do alvo?',240,30,20)
for x in range(7):grid+=f'<path d="M{60+x*30} 120V300" stroke="#b9d8e8"/>'+text(x,60+x*30,320)
for y in range(5):grid+=f'<path d="M60 {300-y*30}H270" stroke="#b9d8e8"/>'+text(y,40,305-y*30)
grid+=text('x →',300,305)+text('y ↑',60,95)
p=Project('Coordenadas',['alvoX','alvoY','respostaX','respostaY','pontos'],canvas(grid))
correct=p.chain(p.change('pontos',1),p.say('Par correto!'))
wrong=p.say(p.join('Confira o par: x = ',p.join(p.var('alvoX'),p.join(' e y = ',p.var('alvoY')))),3)
round=p.chainparts(p.set('alvoX',p.b('operator_random',{'FROM':0,'TO':6})),p.set('alvoY',p.b('operator_random',{'FROM':0,'TO':4})),p.goto(p.sub(p.mul(p.var('alvoX'),30),180),p.sub(p.mul(p.var('alvoY'),30),120)),p.ask('Qual é a coordenada x do alvo?', 'respostaX'),p.ask('Qual é a coordenada y do alvo?','respostaY'),p.ifelse(p.op('and',p.op('equals',p.var('respostaX'),p.var('alvoX')),p.op('equals',p.var('respostaY'),p.var('alvoY'))),correct,wrong))
p.event('event_whenflagclicked',p.chainparts(p.set('pontos',0),p.repeat(5,round),p.say(p.join('Rodadas concluídas. Pares corretos: ',p.var('pontos')),4)))
p.save('coordenadas')
# Fractions, with original pen rendering and validated integer input.
p=Project('Frações',['n','d','k','i'],canvas(text('Frações equivalentes',240,28,23)+text('Primeira barra: n/d',240,105)+text('Segunda barra: (n × k)/(d × k)',240,230)),True)
def valid(var,lo,hi):return p.op('and',p.op('and',p.op('gt',p.var(var),lo-1),p.op('lt',p.var(var),hi+1 if isinstance(hi,int) else hi)),p.op('equals',p.var(var),p.b('operator_round',{'NUM':p.var(var)})))
def guard(condition):return p.b('control_if',{'CONDITION':p.b('operator_not',{'OPERAND':condition}),'SUBSTACK':p.chainparts(p.say('Use os inteiros indicados. Clique na bandeira para tentar novamente.',3),p.b('control_stop',fields={'STOP_OPTION':['all',None]}))})
parts=[p.penop('clear'),p.ask('Denominador inteiro d (2 a 10)?','d'),guard(valid('d',2,10)),p.ask('Numerador inteiro n (1 até d)?','n'),guard(p.op('and',p.op('and',p.op('gt',p.var('n'),0),p.b('operator_not',{'OPERAND':p.op('gt',p.var('n'),p.var('d'))})),p.op('equals',p.var('n'),p.b('operator_round',{'NUM':p.var('n')})))),p.ask('Fator inteiro k (1 a 4)?','k'),guard(valid('k',1,4))]
for y,denominator in [(40,lambda:p.var('d')),(-85,lambda:p.mul(p.var('d'),p.var('k')))]:
 parts.extend([p.color('#dae7ee'),p.size(24),p.line(-120,y,120,y),p.color('#0c83a5'),p.line(-120,y,p.add(-120,p.mul(240,p.div(p.var('n'),p.var('d')))),y),p.color('#123047'),p.size(2),p.set('i',0)])
 x=lambda:p.add(-120,p.div(p.mul(p.var('i'),240),denominator()))
 marks=p.chainparts(p.line(x(),y-15,x(),y+15),p.change('i',1))
 parts.append(p.repeat(p.add(denominator(),1),marks))
parts.append(p.say(p.join(p.var('n'),p.join('/',p.join(p.var('d'),p.join(' = ',p.join(p.mul(p.var('n'),p.var('k')),p.join('/',p.mul(p.var('d'),p.var('k')))))))),6))
p.event('event_whenflagclicked',p.chainparts(*parts));p.save('fracoes')
# Circle of fifths: pitch-class transposition, original ring artwork.
notes=['C','G','D','A','E','B','F♯','C♯','A♭','E♭','B♭','F'];ring='<circle cx="240" cy="180" r="120" fill="white" stroke="#85afc3"/>'
for i,n in enumerate(notes):
 a=math.pi/2-i*math.pi/6;ring+=text(n,240+146*math.cos(a),185-146*math.sin(a),17)
p=Project('Música',['t','i','p','angulo'],canvas(ring),True);p.sprite['lists']={'intervals':['intervalos',[0,7,4,11,0]]}
def broadcast():return p.b('event_broadcast',{'BROADCAST_INPUT':[1,[11,'desenhar','redraw']]})
p.event('event_whenflagclicked',p.chainparts(p.set('t',0),broadcast()))
p.event('event_whenkeypressed',p.chainparts(p.set('t',p.op('mod',p.add(p.var('t'),1),12)),broadcast()),{'KEY_OPTION':['space',None]})
interval=p.b('data_itemoflist',{'INDEX':p.var('i')},{'LIST':['intervalos','intervals']})
body=p.chainparts(p.set('p',p.op('mod',p.add(p.var('t'),interval),12)),p.set('angulo',p.sub(90,p.mul(30,p.op('mod',p.mul(7,p.var('p')),12)))),p.goto(p.mul(120,p.b('operator_mathop',{'NUM':p.var('angulo')},{'OPERATOR':['cos',None]})),p.mul(120,p.b('operator_mathop',{'NUM':p.var('angulo')},{'OPERATOR':['sin',None]}))),p.penop('penDown'),p.change('i',1))
p.event('event_whenbroadcastreceived',p.chainparts(p.penop('clear'),p.penop('penUp'),p.color('#0c83a5'),p.size(3),p.set('i',1),p.repeat(5,body),p.penop('penUp')),{'BROADCAST_OPTION':['desenhar','redraw']})
p.save('musica')
print('Três projetos .sb3 gerados.')
