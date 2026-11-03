"""Gera cópias de revisão; nunca configura nem ativa a hospedagem."""
from pathlib import Path
import re,html
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,KeepTogether
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT=Path(__file__).resolve().parents[1];DEST=ROOT/'docs';files=[('privacidade','Política de privacidade','POLITICA_PRIVACIDADE_RASCUNHO.md'),('termos','Termos de uso','TERMOS_USO_RASCUNHO.md'),('pendencias','Pendências de adoção','PENDENCIAS_PRIVACIDADE.md'),('inventario','Inventário do piloto','INVENTARIO_PILOTO_REVISAO.md')]
pdfmetrics.registerFont(TTFont('Review','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'));pdfmetrics.registerFont(TTFont('ReviewBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'));pdfmetrics.registerFontFamily('Review',normal='Review',bold='ReviewBold',italic='Review',boldItalic='ReviewBold')
styles=getSampleStyleSheet()
for st in styles.byName.values():st.fontName='Review'
styles.add(ParagraphStyle(name='Text',fontName='Review',fontSize=9,leading=13,spaceAfter=8))
styles.add(ParagraphStyle(name='Cell',fontName='Review',fontSize=8,leading=11))
def inline(s):return re.sub(r'\*\*(.*?)\*\*',r'<b>\1</b>',html.escape(s)).replace('`','')
def blocks(text):
 lines=text.splitlines();i=0
 while i<len(lines):
  line=lines[i].strip();i+=1
  if not line:continue
  if line.startswith('|'):
   rows=[]
   while True:
    if not re.fullmatch(r'[| :\-]+',line):rows.append([c.strip()for c in line.strip('|').split('|')])
    if i>=len(lines)or not lines[i].strip().startswith('|'):break
    line=lines[i].strip();i+=1
   yield 'table',rows;continue
  m=re.match(r'^(#{1,3}) (.*)',line)
  if m:yield 'h'+str(len(m[1])),m[2]
  elif line.startswith('- '):yield 'li',line[2:]
  else:yield 'p',line

def footer(c,d):
 c.setFont('ReviewBold',8);c.setFillColor(colors.HexColor('#9c410d'));c.drawString(40,25,'RASCUNHO — NÃO VIGENTE · Leo Sardinha.Math');c.drawRightString(555,25,str(d.page))
sections=[]
for key,title,file in files:
 content=(DEST/file).read_text();flow=[];parts=[]
 for tag,value in blocks(content):
  if tag=='table':
   rows=[[Paragraph(inline(c),styles['Cell'])for c in row]for row in value];t=Table(rows,colWidths=[515/len(rows[0])]*len(rows[0]),repeatRows=1);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#eaf4fa')),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#9bb8c8')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),7)]));flow.extend([t,Spacer(1,12)]);parts.append('<div class="table"><table>'+''.join('<tr>'+''.join(f'<{"th" if j==0 else "td"}>{inline(c)}</{"th" if j==0 else "td"}>'for c in row)+'</tr>'for j,row in enumerate(value))+'</table></div>')
  else:
   text=('• 'if tag=='li'else'')+inline(value);style={'h1':'Title','h2':'Heading2','h3':'Heading3'}.get(tag,'Text');flow.append(Paragraph(text,styles[style]));ht=tag if tag.startswith('h')else'p';parts.append(f'<{ht}>{text}</{ht}>')
 SimpleDocTemplate(str(DEST/(key+'-rascunho.pdf')),leftMargin=40,rightMargin=40,topMargin=40,bottomMargin=45,title=title+' — rascunho não vigente',author='Leo Sardinha.Math').build(flow,onFirstPage=footer,onLaterPages=footer)
 sections.append(f'<section id="{key}" {"hidden" if key!="privacidade" else ""}><div class="actions"><a href="{key}-rascunho.pdf" download>Baixar PDF para revisão</a><a href="{file}">Ler o Markdown</a></div>'+''.join(parts)+'</section>')
page='''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Revisão de documentos · Leo Sardinha.Math</title><style>body{overflow-wrap:anywhere;font:17px/1.65 system-ui;color:#123047;background:#edf6fb;margin:0}main{max-width:1050px;margin:auto;padding:25px}header,section{background:white;border:1px solid #c6dce7;border-radius:16px;padding:25px;margin:20px 0}.notice{padding:16px;border-left:5px solid #b95a0c;background:#fff3d6}nav,.actions{display:flex;gap:10px;flex-wrap:wrap}button,.actions a{font:inherit;padding:10px 15px;border:1px solid #075985;border-radius:8px;background:#075985;color:white;cursor:pointer;text-decoration:none}button[aria-pressed=true]{background:#ffd85c;color:#123047}button:focus-visible,a:focus-visible{outline:3px solid #d26c14;outline-offset:3px}.table{overflow:auto}table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{border:1px solid #b3cbd9;padding:12px;text-align:left;vertical-align:top}th{background:#eaf4fa}h1{font-size:1.8rem;line-height:1.25}h2{font-size:1.35rem;margin-top:30px}section[hidden]{display:none}.actions{margin-bottom:20px}footer{font-size:.85rem}@media(max-width:600px){main{padding:12px}header,section{padding:17px}.table{font-size:.8rem}}@media print{body{background:white;font-size:10pt}header,nav,.actions,footer{display:none}main,section{padding:0;margin:0;border:0}.table{overflow:visible}h2{break-after:avoid}}</style><main><header><h1>Documentos para revisão</h1><p class="notice"><strong>Rascunhos — não vigentes.</strong> Não alteram a configuração do Render, não ativam login e não substituem as informações e decisões pendentes do responsável. Não há cadastro infantil ou coleta de consentimento parental implementados.</p><p>Leia os textos, confira as pendências e baixe as cópias para revisão. Os campos [PREENCHER] e [PENDENTE] não são dados reais.</p><details><summary>Versão simples para conversar com as famílias</summary><p>O plano inicial é que um adulto autorizado entre e acompanhe a criança. A criança não terá conta própria no piloto. Não é necessário escrever nome, endereço, contato ou outras informações que a identifiquem para jogar.</p><p>Google e hospedagem podem tratar dados técnicos de conexão. Isso será explicado no aviso final. Ainda precisamos definir o responsável, o contato e as condições do tratamento antes de ativar o acesso.</p><p>Este resumo também é um rascunho e não funciona como autorização parental.</p></details><nav aria-label="Documento em revisão"><button data-doc="privacidade" aria-pressed="true">Privacidade</button><button data-doc="termos" aria-pressed="false">Termos de uso</button><button data-doc="pendencias" aria-pressed="false">Pendências</button><button data-doc="inventario" aria-pressed="false">Inventário técnico</button><button id="print">Imprimir documento aberto</button></nav></header>'''+''.join(sections)+'''<footer>Textos de trabalho · Sem adoção como política vigente · Nenhum dado de conta ou segredo é solicitado nesta página.</footer></main><script>for(const b of document.querySelectorAll('[data-doc]'))b.onclick=()=>{for(const s of document.querySelectorAll('main>section'))s.hidden=s.id!==b.dataset.doc;for(const a of document.querySelectorAll('[data-doc]'))a.setAttribute('aria-pressed',String(a===b))};document.getElementById('print').onclick=()=>window.print();</script></html>'''
(DEST/'revisao-privacidade.html').write_text(page);print('Página de revisão e quatro PDFs gerados a partir dos rascunhos.')
