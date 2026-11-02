/* Interpretações visuais ficcionais dos recontos, em estilo anime. */
(function(root){
'use strict';
const groups={
road:{image:'assets/anime/viagem.webp',title:'Os viajantes',names:'Beremiz, seu companheiro e os irmãos',caption:'Beremiz e seu companheiro encontram os irmãos junto à caravana.',alt:'Ilustração em estilo anime: Beremiz de manto verde explica uma ideia ao companheiro de roupa terracota; ao fundo, três irmãos conversam perto de camelos.',stories:['camelos','paes'],description:'Uma viagem, um encontro e uma pergunta que muda o rumo da conversa.'},
market:{image:'assets/anime/mercado.webp',title:'As pessoas do mercado',names:'Beremiz, o mercador e os participantes da partilha',caption:'No mercado, Beremiz e os participantes investigam novas possibilidades.',alt:'Ilustração em estilo anime: Beremiz e seu companheiro conversam com um mercador e participantes de uma partilha, entre vasos e bancas de um mercado.',stories:['quatros','vasos'],description:'Entre cartões e vasos, diferentes ideias passam pela mesma mesa.'},
hall:{image:'assets/anime/salao.webp',title:'Os encontros no salão',names:'Beremiz, o rei e o escriba',caption:'No salão, Beremiz, o rei e o escriba acompanham uma descoberta.',alt:'Ilustração em estilo anime: Beremiz conversa com um rei e um escriba num salão acolhedor, diante de um tabuleiro e papéis sem inscrições.',stories:['xadrez','magico'],description:'Um tabuleiro e uma malha abrem espaço para descobertas inesperadas.'},
garden:{image:'assets/anime/jardim.webp',title:'Uma roda de curiosidade',names:'Beremiz, seu companheiro e jovens investigadores',caption:'Uma roda de conversa transforma a curiosidade em investigação.',alt:'Ilustração em estilo anime: Beremiz e seu companheiro escutam jovens investigadores em um jardim, com cartões e fichas sobre uma mesa.',stories:['amigos','perfeitos'],description:'Quem pergunta, compara e explica também faz parte da aventura.'}
};
function forStory(id){return Object.values(groups).find(group=>group.stories.includes(id));}
const api={groups,forStory};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TahanCharacters=api;
})(typeof globalThis!=='undefined'?globalThis:this);
