"""Gera os PDFs a partir do mesmo conteúdo das aplicações."""
from pathlib import Path
import json,subprocess,html
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,KeepTogether
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
ROOT=Path(__file__).resolve().parents[1];dest=ROOT/'assets/musica-atividades';dest.mkdir(exist_ok=True)
data=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./assets/music-education-data.js')))"],cwd=ROOT))
pdfmetrics.registerFont(TTFont('DejaVu','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
styles=getSampleStyleSheet()
for st in styles.byName.values():st.fontName='DejaVu'
styles.add(ParagraphStyle(name='Body',fontName='DejaVu',fontSize=10,leading=15,spaceAfter=9))
def p(text,style='Body'):return Paragraph(html.escape(text),styles[style])
def footer(canvas,doc):
 canvas.setFont('DejaVu',8);canvas.setFillColor(colors.HexColor('#456577'));canvas.drawString(36,24,'Leo Sardinha.Math · Música e Matemática · CC BY-SA 4.0');canvas.drawRightString(559,24,str(doc.page))
for kind in ['exercicios','gabarito','bncc']:
 content=[]
 for i,t in enumerate(data['tracks']):
  if i:content.append(PageBreak())
  content.extend([p({'exercicios':'Exercícios','gabarito':'Gabarito comentado','bncc':'Justificativa pedagógica e BNCC'}[kind],'Title'),p(t['title'],'Heading1'),p(t['years']),p('Habilidades relacionadas: '+', '.join(t['codes']))])
  if kind=='exercicios':
   content.extend([p('Registro opcional da atividade: __________ (sem nome ou identificação pessoal)'),p('Exemplo resolvido: '+t['example']),p('Convenções: C=0, C♯=1, D=2, E♭=3, E=4, F=5, F♯=6, G=7, A♭=8, A=9, B♭=10, B=11. Nas questões sobre classes de notas, usamos temperamento igual. Registre seu raciocínio; áudio não é necessário.')])
   for j,q in enumerate(t['questions']):content.append(KeepTogether([p(str(j+1)+'. '+q['question']),Spacer(1,52),p('________________________________________________________________________')]))
  elif kind=='gabarito':
   for j,q in enumerate(t['questions']):content.extend([p(str(j+1)+'. '+q['question'],'Heading3'),p(q['answer'])])
   content.append(p('Avaliação: considere o raciocínio, a representação, o teste no simulador e a justificativa, além da resposta numérica.'))
  else:content.extend([p('Conteúdo e justificativa','Heading2'),p(t['why']),p('O que observar','Heading2'),p(t['evidence']),p('Exemplo para mediar a discussão','Heading2'),p(t['example']),p(data['note']),p('Apoio ao professor: alterne os papéis de construir e conferir na dupla. Peça uma previsão antes de manipular o simulador. A formalização em grupos não é condição para usar o círculo musical nos anos finais.')])
 if kind=='bncc':content.extend([p('Documentos oficiais','Heading2'),p('MEC — BNCC Educação Infantil e Ensino Fundamental: https://basenacionalcomum.mec.gov.br/images/BNCC_EI_EF_110518_versaofinal_site.pdf'),p('MEC — versão com Ensino Médio: https://basenacionalcomum.mec.gov.br/images/BNCC_20dez_site.pdf')])
 SimpleDocTemplate(str(dest/(kind+'.pdf')),leftMargin=40,rightMargin=40,topMargin=40,bottomMargin=42,title='Música e Matemática — '+kind,author='Leo Sardinha.Math').build(content,onFirstPage=footer,onLaterPages=footer)
print('Gerados exercícios, gabarito e justificativa BNCC.')
