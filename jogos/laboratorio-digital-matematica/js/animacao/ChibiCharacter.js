import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const PI=Math.PI;
const suave=(atual,alvo,velocidade,dt)=>THREE.MathUtils.lerp(atual,alvo,1-Math.exp(-velocidade*dt));

// Um mesmo esqueleto hierárquico serve aos personagens procedurais e a modelos GLB.
export class ChibiCharacter {
  constructor(config={}){
    this.config=config;
    this.root=new THREE.Group();
    this.clock=0;this.passos=0;this.acao='idle';this.tempoAcao=0;
    this.expressao='feliz';this.piscada=2+Math.random()*3;this.tempoPiscar=0;
    this.texto='';this.textoVisivel=0;this.falando=0;this.silencio=0;
    this.alvoOlhar=new THREE.Vector2();this.modelo=null;this.mixer=null;this.clipes=new Map();
    this.criarCorpo();
  }

  criarCorpo(){
    const c=this.config;
    const material=(cor)=>new THREE.MeshToonMaterial({color:cor});
    const pele=material(c.pele||'#f6c5a0'),roupa=material(c.roupa||'#7954ba');
    const secundaria=material(c.secundaria||'#f3c350'),escura=material('#352544');
    const branca=material('#fffaf4'),iris=material(c.olhos||'#33253e');
    const cabelo=material(c.cabelo||'#553d39');
    const bola=new THREE.SphereGeometry(1,14,10);
    const contorno=new THREE.MeshBasicMaterial({color:'#392b45',side:THREE.BackSide});
    const oval=(pai,mat,x,y,z,sx,sy,sz,comContorno=false)=>{
      const m=new THREE.Mesh(bola,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);pai.add(m);
      if(comContorno){const borda=new THREE.Mesh(bola,contorno);borda.scale.setScalar(1.045);m.add(borda)}
      return m;
    };
    this.corpo=new THREE.Group();this.root.add(this.corpo);
    this.tronco=oval(this.corpo,roupa,0,1.12,0,.59,.7,.42,true);
    oval(this.corpo,secundaria,0,1.35,.4,.31,.08,.05);
    this.capa=new THREE.Group();this.capa.position.set(0,1.63,-.37);this.corpo.add(this.capa);
    if(c.capa||c.tipo==='mago'||c.tipo==='heroi'){
      const pano=new THREE.Mesh(new THREE.ConeGeometry(.74,1.35,16,1,true),material(c.capa||c.secundaria||'#533891'));
      pano.rotation.x=PI; pano.position.y=-.64;this.capa.add(pano);
    }
    this.cabecaPivo=new THREE.Group();this.cabecaPivo.position.set(0,1.67,.08);this.corpo.add(this.cabecaPivo);
    this.cabeca=new THREE.Group();this.cabecaPivo.add(this.cabeca);
    oval(this.cabeca,pele,0,.55,.07,.79,.77,.68,true);
    // Mechas, olhos, pupilas e boca são objetos independentes do rosto.
    oval(this.cabeca,cabelo,0,1.17,-.02,.77,.24,.63);
    for(const lado of [-1,1]){
      oval(this.cabeca,cabelo,lado*.70,.49,.02,.17,.38,.38);
    }
    this.olhos=[];this.pupilas=[];this.sobrancelhas=[];
    for(const lado of [-1,1]){
      const olho=oval(this.cabeca,branca,lado*.29,.67,.638,.205,.255,.095);
      const pupila=oval(this.cabeca,iris,lado*.29,.66,.735,.115,.16,.045);
      oval(pupila,branca,-.30,.33,.7,.25,.22,.18);
      const sobrancelha=oval(this.cabeca,cabelo,lado*.29,1.02,.59,.22,.046,.055);
      this.olhos.push(olho);this.pupilas.push(pupila);this.sobrancelhas.push(sobrancelha);
    }
    oval(this.cabeca,pele,0,.43,.72,.12,.10,.10);
    this.boca=oval(this.cabeca,material('#813b57'),0,.19,.703,.16,.065,.045);
    if(c.tipo==='mago'){
      oval(this.cabeca,branca,0,-.05,.50,.47,.36,.34);
      for(const lado of [-1,1]) oval(this.cabeca,branca,lado*.21,.20,.68,.23,.10,.10);
      const aba=new THREE.Mesh(new THREE.CylinderGeometry(.94,.99,.09,20),roupa);
      aba.position.y=1.30;this.cabeca.add(aba);
      const chapeu=new THREE.Mesh(new THREE.ConeGeometry(.61,.94,20),roupa);
      chapeu.position.y=1.78;chapeu.rotation.z=-.16;this.cabeca.add(chapeu);
      oval(this.cabeca,secundaria,.07,1.44,.54,.13,.11,.055);
    }else if(c.tipo==='detetive'){
      const boina=new THREE.Mesh(new THREE.CylinderGeometry(.62,.76,.28,16),roupa);
      boina.position.y=1.27;this.cabeca.add(boina);
      oval(this.cabeca,roupa,0,1.14,.54,.70,.08,.32);
    }else if(c.tipo==='dragao'){
      for(const lado of [-1,1]){
        const chifre=new THREE.Mesh(new THREE.ConeGeometry(.17,.54,10),secundaria);
        chifre.position.set(lado*.49,1.32,-.02);chifre.rotation.z=-lado*.34;this.cabeca.add(chifre);
      }
      oval(this.cabeca,roupa,0,.34,.57,.44,.25,.35);
    }else{
      // Acessórios simples preservam a silhueta de cada tema do laboratório.
      if(['fracsoma','abelha','kente'].includes(c.tipo))for(const lado of [-1,1]){
        oval(this.cabeca,cabelo,lado*.79,.38,-.04,.24,.33,.27);
        oval(this.cabeca,secundaria,lado*.72,.65,.13,.12,.10,.12);
      }
      if(c.tipo==='abelha')for(const lado of [-1,1]){
        const antena=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.38,7),escura);
        antena.position.set(lado*.38,1.42,.02);antena.rotation.z=-lado*.35;this.cabeca.add(antena);
        oval(this.cabeca,secundaria,lado*.44,1.59,.02,.10,.10,.10);
      }
      if(['poligonos','cpf','estacao'].includes(c.tipo)){
        const oculos=new THREE.TorusGeometry(.23,.035,6,18);
        for(const lado of [-1,1]){
          const aro=new THREE.Mesh(oculos,escura);aro.position.set(lado*.29,.67,.76);this.cabeca.add(aro);
        }
      }
    }
    this.bracos=[];this.pernas=[];
    for(const lado of [-1,1]){
      const braco=new THREE.Group();braco.position.set(lado*.54,1.48,0);this.corpo.add(braco);
      oval(braco,roupa,lado*.16,-.26,0,.21,.38,.25);
      oval(braco,pele,lado*.25,-.59,.04,.17,.17,.17);
      this.bracos.push(braco);
      const perna=new THREE.Group();perna.position.set(lado*.27,.67,0);this.corpo.add(perna);
      oval(perna,roupa,0,-.25,0,.21,.36,.22);
      oval(perna,escura,0,-.53,.16,.28,.17,.38);
      this.pernas.push(perna);
    }
    if(c.tipo==='mago'){
      this.cajado=new THREE.Group();this.cajado.position.set(.28,-.58,.03);this.bracos[1].add(this.cajado);
      const haste=new THREE.Mesh(new THREE.CylinderGeometry(.055,.07,1.68,8),material('#8e623b'));
      haste.position.y=.42;this.cajado.add(haste);
      oval(this.cajado,secundaria,0,1.33,0,.20,.22,.20);
    }
    if(c.tipo==='detetive'){
      const lente=new THREE.Mesh(new THREE.TorusGeometry(.23,.045,8,18),escura);
      lente.position.set(.27,-.48,.14);this.bracos[1].add(lente);
    }
    if(c.tipo==='fracsoma'){
      const peca=new THREE.Mesh(new THREE.BoxGeometry(.37,.44,.07),secundaria);
      peca.position.set(-.29,-.60,.15);peca.rotation.z=.22;this.bracos[0].add(peca);
      const risco=new THREE.Mesh(new THREE.BoxGeometry(.24,.025,.02),escura);
      risco.position.z=.05;peca.add(risco);
    }
    if(c.tipo==='adivinhacao')oval(this.bracos[0],secundaria,-.27,-.63,.18,.24,.24,.24);
    if(c.tipo==='estacao'){
      const frasco=new THREE.Mesh(new THREE.ConeGeometry(.22,.39,10),secundaria);
      frasco.position.set(.28,-.58,.11);this.bracos[1].add(frasco);
    }
    if(c.tipo==='kente'){
      for(const dx of [-.28,0,.28])oval(this.corpo,secundaria,dx,1.08,.402,.055,.37,.025);
    }
    if(c.tipo==='abelha'||c.tipo==='dragao'){
      this.asas=[];
      for(const lado of [-1,1]){
        const asa=oval(this.corpo,material(c.tipo==='abelha'?'#cceffe':'#ad8bda'),lado*.65,1.43,-.37,.37,.48,.12);
        asa.rotation.z=-lado*.35;this.asas.push(asa);
      }
    }
    if(c.tipo==='heroi'){
      const espada=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1.02,8),secundaria);
      espada.position.set(.26,-.14,.10);espada.rotation.z=-.45;this.bracos[1].add(espada);
    }
    // Sombra projetada em uma peça leve, sem shadow maps custosos no celular.
    const sombra=new THREE.Mesh(new THREE.CircleGeometry(.78,20),new THREE.MeshBasicMaterial({color:'#29203c',transparent:true,opacity:.13,depthWrite:false}));
    sombra.rotation.x=-PI/2;sombra.position.y=.01;this.root.add(sombra);
  }

  // Um GLB futuro pode substituir o desenho procedural; os clips usam AnimationMixer.
  async carregarModelo(url){
    const gltf=await new GLTFLoader().loadAsync(url);
    this.corpo.visible=false;this.modelo=gltf.scene;this.root.add(this.modelo);
    if(gltf.animations.length){
      this.mixer=new THREE.AnimationMixer(this.modelo);
      for(const clip of gltf.animations)this.clipes.set(clip.name.toLowerCase(),this.mixer.clipAction(clip));
    }
    return gltf;
  }

  estado(nome,duracao=1){this.acao=nome;this.duracaoAcao=Math.max(.2,duracao);this.tempoAcao=this.duracaoAcao;this.silencio=0;
    if(this.mixer){
      const acao=this.clipes.get(nome)||this.clipes.get('idle');
      if(acao&&acao!==this.acaoModelo){acao.reset().fadeIn(.18).play();this.acaoModelo?.fadeOut(.18);this.acaoModelo=acao}
    }
  }
  olhar(x=0,y=0){this.alvoOlhar.set(THREE.MathUtils.clamp(x,-1,1),THREE.MathUtils.clamp(y,-1,1))}
  falar(texto,elemento){
    if(!texto||!elemento)return;
    this.texto=texto;this.textoVisivel=0;this.falando=0;this.elementoFala=elemento;
    elemento.textContent='';elemento.hidden=false;
    if(this.acao==='idle')this.estado('falar',Math.max(2.2,texto.length*.065+1));
    else this.tempoAcao=Math.max(this.tempoAcao,1.2);
  }
  atualizar(delta){
    const dt=Math.min(.05,Math.max(0,delta));this.clock+=dt;this.passos+=dt;this.silencio+=dt;
    if(this.mixer)this.mixer.update(dt);
    this.tempoAcao=Math.max(0,this.tempoAcao-dt);
    if(this.tempoAcao===0&&this.acao!=='idle')this.acao='idle';
    if(this.elementoFala){
      this.falando+=dt;
      const letras=Math.min(this.texto.length,Math.floor(this.falando*26));
      if(letras!==this.textoVisivel){this.textoVisivel=letras;this.elementoFala.textContent=this.texto.slice(0,letras)}
      if(this.falando>Math.max(3,this.texto.length/26+2)){
        this.elementoFala.hidden=true;this.elementoFala=null;this.texto='';
      }
    }
    if(this.modelo)return;
    this.piscada-=dt;
    if(this.piscada<0){this.tempoPiscar=.14;this.piscada=2.3+Math.random()*3.6}
    this.tempoPiscar=Math.max(0,this.tempoPiscar-dt);
    const andando=['andar','correr'].includes(this.acao),vel=this.acao==='correr'?14:9;
    const marcha=andando?Math.sin(this.clock*vel):0;
    const fase=1-THREE.MathUtils.clamp(this.tempoAcao/(this.duracaoAcao||1),0,1);
    const impulso=['pular','cair','atacar','magia'].includes(this.acao)?Math.sin(Math.min(1,fase)*PI):0;
    const comemorando=this.acao==='comemorar',errando=['errar','dano','derrota'].includes(this.acao);
    const falar=!!this.elementoFala;
    const respirar=Math.sin(this.clock*2.2);
    this.corpo.position.y=suave(this.corpo.position.y,(andando?.055*Math.abs(marcha):.025*respirar)+impulso*.29+(comemorando?.14*Math.abs(Math.sin(this.clock*11)):0),10,dt);
    this.tronco.scale.y=suave(this.tronco.scale.y,.7+(andando?-.025:.018*respirar)+impulso*-.07,9,dt);
    this.corpo.rotation.z=suave(this.corpo.rotation.z,(andando?.045*marcha:0)+(errando?.07*Math.sin(this.clock*9):0),7,dt);
    this.corpo.rotation.x=suave(this.corpo.rotation.x,this.acao==='correr'?.15:0,7,dt);
    this.cabecaPivo.rotation.z=suave(this.cabecaPivo.rotation.z,(andando?-.07*marcha:0)+(falar?.055*Math.sin(this.clock*9):0)+(errando?-.13:0),6,dt);
    this.cabeca.rotation.y=suave(this.cabeca.rotation.y,this.alvoOlhar.x*.24,5,dt);
    this.cabeca.rotation.x=suave(this.cabeca.rotation.x,-this.alvoOlhar.y*.13+(falar?.025*Math.sin(this.clock*8):0),5,dt);
    const bracos=andando?[.48*marcha,-.48*marcha]:comemorando?[-1.65,1.65]:this.acao==='magia'||this.acao==='atacar'?[.3,-1.45]:falar?[.14+.25*Math.sin(this.clock*8),-.15+.25*Math.sin(this.clock*8)]:errando?[.55,-.55]:[.05*Math.sin(this.clock*2),-.05*Math.sin(this.clock*2)];
    this.bracos.forEach((braco,i)=>{braco.rotation.x=suave(braco.rotation.x,bracos[i],10,dt);braco.rotation.z=suave(braco.rotation.z,comemorando?(i?-.50:.50):0,7,dt)});
    this.pernas.forEach((perna,i)=>{perna.rotation.x=suave(perna.rotation.x,andando?(i?.47:-.47)*marcha:impulso*(i?.36:-.36),10,dt)});
    this.capa.rotation.x=suave(this.capa.rotation.x,andando?.13+.09*Math.sin(this.clock*vel-1):.04*Math.sin(this.clock*2),4,dt);
    if(this.cajado)this.cajado.rotation.z=suave(this.cajado.rotation.z,andando?.08*Math.sin(this.clock*vel-1):this.acao==='magia'?.18:0,5,dt);
    if(this.asas)this.asas.forEach((asa,i)=>asa.rotation.y=suave(asa.rotation.y,(i?1:-1)*(.18+.14*Math.sin(this.clock*12)),9,dt));
    let emocao=this.expressao;
    if(comemorando)emocao='feliz';else if(errando)emocao='triste';else if(this.acao==='magia')emocao='surpreso';
    const olhoY=this.tempoPiscar>0?.025:emocao==='feliz'?.20:emocao==='bravo'?.18:.255;
    this.olhos.forEach((olho,i)=>{
      olho.scale.y=suave(olho.scale.y,olhoY,22,dt);
      this.pupilas[i].scale.y=suave(this.pupilas[i].scale.y,this.tempoPiscar>0?.01:emocao==='surpreso'?.21:.16,20,dt);
      this.pupilas[i].position.x=suave(this.pupilas[i].position.x,(i?1:-1)*.29+this.alvoOlhar.x*.052,8,dt);
      this.sobrancelhas[i].rotation.z=suave(this.sobrancelhas[i].rotation.z,emocao==='bravo'?(i?-.30:.30):emocao==='triste'?(i?.25:-.25):0,9,dt);
    });
    this.boca.scale.y=suave(this.boca.scale.y,falar?.08+.12*Math.abs(Math.sin(this.clock*15)):emocao==='surpreso'?.18:emocao==='triste'?.035:.065,17,dt);
    this.boca.scale.x=suave(this.boca.scale.x,emocao==='surpreso'?.08:emocao==='feliz'?.18:.13,12,dt);
  }
  descartar(){this.mixer?.stopAllAction();this.root.traverse(obj=>{if(obj.isMesh){obj.geometry?.dispose();if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose());else obj.material?.dispose()}})}
}
