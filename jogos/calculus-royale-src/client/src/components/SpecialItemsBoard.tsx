import { ArrowUpRight, Flame, Shield, Sparkles, Zap } from "lucide-react";
import { getCardImage } from "@/data/cardArt";

type FeaturedCard = { id: string; name: string; formula: string };

const specialItems = [
  {
    id: "limit",
    name: "Pulso do Limite",
    formula: "lim x→a",
    effect: "+2 de energia",
    description: "Converge energia para a mão e antecipa a próxima invocação.",
    cardId: "limit",
    cardName: "Guardião do Limite",
    color: "#ff8c74",
    icon: ArrowUpRight,
  },
  {
    id: "root",
    name: "Núcleo da Raiz",
    formula: "√x",
    effect: "+8 HP na torre",
    description: "Reconstrói a base da defesa com uma onda cristalina.",
    cardId: "root",
    cardName: "Mestre das Raízes",
    color: "#62e5e6",
    icon: Shield,
  },
  {
    id: "zoom",
    name: "Surto de Taxa",
    formula: "dx/dt",
    effect: "aceleração por 3 s",
    description: "Aumenta a taxa de avanço das tropas sem atravessar o rival.",
    cardId: "rate",
    cardName: "Engenheiro das Taxas",
    color: "#ffd06f",
    icon: Flame,
  },
] as const;

export default function SpecialItemsBoard({worldArt,worldTitle,featuredCards}: {worldArt:string;worldTitle:string;featuredCards:FeaturedCard[]}) {
  const fighters = featuredCards.slice(0, 2);
  return <section className="special-board" aria-labelledby="special-board-title">
    <header className="special-board-heading">
      <div>
        <span>ARSENAL MATEMÁGICO · 3 ITENS</span>
        <h3 id="special-board-title">Itens ligados à arena</h3>
        <p>Cada item ativa um efeito real no combate depois de um desafio matemático.</p>
      </div>
      <div className="special-board-status"><Sparkles size={16}/><span><b>3/3</b><small>equipados</small></span></div>
    </header>

    <div className="special-arena-preview">
      <img className="special-arena-map" src={worldArt} alt={`Arena ${worldTitle}`} />
      <div className="special-arena-shade" />
      <span className="special-north">NORTE · RIVAL</span>
      <span className="special-south">SUL · JOGADOR</span>
      <div className="special-route" aria-hidden="true"><i/><i/><i/></div>
      {fighters.map((card,index)=><figure key={card.id} className={`special-fighter fighter-${index+1}`}>
        <div><img src={getCardImage(card.id)} alt=""/><span>{index===0?<Zap size={13}/>:<Shield size={13}/>}</span></div>
        <figcaption><strong>{card.name}</strong><small>{card.formula}</small></figcaption>
      </figure>)}
      <div className="special-preview-copy"><span>FORMAÇÃO ATUAL</span><strong>{worldTitle}</strong><small>câmera fixa · avanço sul → norte</small></div>
    </div>

    <div className="special-item-grid">
      {specialItems.map(item=>{const Icon=item.icon;return <article key={item.id} className={`special-item special-item-${item.id}`} style={{"--item-color":item.color} as React.CSSProperties}>
        <div className="special-item-art">
          <img src={getCardImage(item.cardId)} alt={item.cardName}/>
          <span><Icon size={22}/></span>
          <b>{item.formula}</b>
        </div>
        <div className="special-item-copy">
          <small>ITEM TÁTICO · DESAFIO</small>
          <strong>{item.name}</strong>
          <p>{item.description}</p>
          <div><span>{item.effect}</span><em>responda para ativar</em></div>
        </div>
      </article>})}
    </div>
  </section>;
}
