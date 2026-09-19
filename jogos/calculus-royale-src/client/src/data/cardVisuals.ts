export type CardVisualClass = "limite" | "derivada" | "integral" | "serie" | "suporte";
export type CardVisualRarity = "comum" | "rara" | "épica" | "lendária";

export interface CardVisual {
  id: string;
  name: string;
  world: number;
  class: CardVisualClass;
  kind: string;
  rarity: CardVisualRarity;
  formula: string;
  palette: string[];
  symbol: string;
  silhouette: string;
  visualBrief: string;
  art: string;
  thumb: string;
  battle: string;
  fallback: string;
  prompt: string;
}

export const CARD_VISUALS: CardVisual[] = [
  {
    "id": "slope",
    "name": "Cavaleiro da Tangente",
    "world": 1,
    "class": "derivada",
    "kind": "tropa",
    "rarity": "comum",
    "formula": "f'(a) = lim [f(a+h)−f(a)] / h",
    "palette": [
      "#FF7C67",
      "#F3C86A",
      "#102A4D"
    ],
    "symbol": "f′",
    "silhouette": "cavaleiro inclinado para frente com lança em forma de reta tangente",
    "visualBrief": "Ataque veloz. A reta tangente deve atravessar a composição em diagonal.",
    "art": "/assets/cards/art/slope.webp",
    "thumb": "/assets/cards/thumbs/slope.webp",
    "battle": "/assets/cards/battle/slope.webp",
    "fallback": "/assets/art/world-1.svg",
    "prompt": "personagem de card game fantasy cartoon 2D polido, cavaleiro da tangente, armadura coral e dourada, lança luminosa formando uma reta tangente sobre uma curva azul, pose dinâmica 3/4, silhueta forte, fundo matemágico azul profundo simples, símbolo f prima discreto em runa, iluminação cinematográfica limpa, sem texto, sem moldura, composição para carta vertical"
  },
  {
    "id": "chain",
    "name": "Arqueira da Cadeia",
    "world": 2,
    "class": "derivada",
    "kind": "tropa",
    "rarity": "rara",
    "formula": "(f∘g)' = f'(g) · g'",
    "palette": [
      "#8D63FF",
      "#F3C86A",
      "#102A4D"
    ],
    "symbol": "∘",
    "silhouette": "arqueira diagonal com dois anéis encadeados atrás do arco",
    "visualBrief": "Cada flecha atravessa dois círculos de composição antes de atingir o alvo.",
    "art": "/assets/cards/art/chain.webp",
    "thumb": "/assets/cards/thumbs/chain.webp",
    "battle": "/assets/cards/battle/chain.webp",
    "fallback": "/assets/art/world-2.svg",
    "prompt": "personagem de card game fantasy cartoon 2D polido, arqueira da regra da cadeia, roupa violeta e dourada, arco energético, flecha atravessando dois círculos luminosos encadeados representando composição de funções, pose diagonal clara, fundo matemágico simples, sem texto, sem moldura, alta legibilidade em miniatura"
  },
  {
    "id": "implicit",
    "name": "Golem Implícito",
    "world": 2,
    "class": "derivada",
    "kind": "estrutura",
    "rarity": "épica",
    "formula": "F(x,y)=0 → y' = −Fₓ/Fᵧ",
    "palette": [
      "#6F7D91",
      "#2ED6E8",
      "#8D63FF"
    ],
    "symbol": "∂",
    "silhouette": "golem maciço com ombros largos e núcleo parcial brilhante",
    "visualBrief": "Runas ∂ e dy/dx aparecem nas rachaduras do corpo, nunca como texto solto.",
    "art": "/assets/cards/art/implicit.webp",
    "thumb": "/assets/cards/thumbs/implicit.webp",
    "battle": "/assets/cards/battle/implicit.webp",
    "fallback": "/assets/art/world-2.svg",
    "prompt": "personagem de card game fantasy cartoon 2D polido, golem implícito de pedra escura, corpo maciço, rachaduras ciano e violeta com runas de derivadas parciais, escudo de equação circular, pose defensiva frontal, fundo limpo azul escuro, sem texto, sem moldura"
  },
  {
    "id": "rate",
    "name": "Relógio de Taxas",
    "world": 2,
    "class": "suporte",
    "kind": "feitiço",
    "rarity": "rara",
    "formula": "dx/dt · dy/dx = dy/dt",
    "palette": [
      "#F3C86A",
      "#2ED6E8",
      "#B56A3B"
    ],
    "symbol": "dt",
    "silhouette": "relógio arcano com ponteiros longos e engrenagens",
    "visualBrief": "O movimento dos ponteiros conecta dx/dt e dy/dt como fluxos.",
    "art": "/assets/cards/art/rate.webp",
    "thumb": "/assets/cards/thumbs/rate.webp",
    "battle": "/assets/cards/battle/rate.webp",
    "fallback": "/assets/art/world-2.svg",
    "prompt": "objeto-personagem de card game fantasy cartoon 2D polido, relógio arcano de taxas relacionadas, engrenagens de cobre, energia ciano e dourada, ponteiros em movimento conectados por linhas matemáticas, leitura clara, fundo simples, sem texto, sem moldura"
  },
  {
    "id": "cauchy",
    "name": "Guardião de Cauchy",
    "world": 3,
    "class": "limite",
    "kind": "estrutura",
    "rarity": "rara",
    "formula": "f'/g' = [f(b)−f(a)]/[g(b)−g(a)]",
    "palette": [
      "#3DDA9A",
      "#2ED6E8",
      "#102A4D"
    ],
    "symbol": "≈",
    "silhouette": "guardião com escudo duplo equilibrado",
    "visualBrief": "Dois lados do escudo representam equilíbrio e comparação entre funções.",
    "art": "/assets/cards/art/cauchy.webp",
    "thumb": "/assets/cards/thumbs/cauchy.webp",
    "battle": "/assets/cards/battle/cauchy.webp",
    "fallback": "/assets/art/world-3.svg",
    "prompt": "personagem de card game fantasy cartoon 2D polido, guardião de Cauchy, armadura verde esmeralda e ciano, dois escudos simétricos equilibrando duas curvas matemáticas, pose defensiva, símbolo aproximado como runa, fundo de observatório simples, sem texto, sem moldura"
  },
  {
    "id": "taylor",
    "name": "Bardo de Taylor",
    "world": 3,
    "class": "serie",
    "kind": "tropa",
    "rarity": "épica",
    "formula": "f(x) ≈ Σ f⁽ⁿ⁾(a)(x−a)ⁿ/n!",
    "palette": [
      "#8D63FF",
      "#F3C86A",
      "#102A4D"
    ],
    "symbol": "Σ",
    "silhouette": "bardo com pergaminhos em arco e instrumento mágico",
    "visualBrief": "Termos da série surgem como ecos luminosos que se aproximam de uma curva.",
    "art": "/assets/cards/art/taylor.webp",
    "thumb": "/assets/cards/thumbs/taylor.webp",
    "battle": "/assets/cards/battle/taylor.webp",
    "fallback": "/assets/art/world-3.svg",
    "prompt": "personagem de card game fantasy cartoon 2D polido, bardo de Taylor, roupa roxa e dourada, instrumento mágico e pergaminhos orbitando, ecos de termos polinomiais convergindo para uma curva luminosa, símbolo sigma discreto, fundo simples, sem texto, sem moldura"
  },
  {
    "id": "newton",
    "name": "Cavaleiro Newton",
    "world": 3,
    "class": "suporte",
    "kind": "tropa",
    "rarity": "lendária",
    "formula": "xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ)",
    "palette": [
      "#F3C86A",
      "#2ED6E8",
      "#102A4D"
    ],
    "symbol": "N",
    "silhouette": "guerreiro-sábio com espada reta e passos luminosos sucessivos",
    "visualBrief": "A trajetória em degraus converge visualmente para uma raiz.",
    "art": "/assets/cards/art/newton.webp",
    "thumb": "/assets/cards/thumbs/newton.webp",
    "battle": "/assets/cards/battle/newton.webp",
    "fallback": "/assets/art/world-3.svg",
    "prompt": "personagem lendário de card game fantasy cartoon 2D polido, cavaleiro Newton guerreiro sábio, armadura dourada e azul, espada geométrica luminosa, passos de aproximação sucessiva convergindo para uma raiz em um gráfico, pose heroica, fundo simples, sem texto, sem moldura"
  },
  {
    "id": "area",
    "name": "Arquiteta da Área",
    "world": 4,
    "class": "integral",
    "kind": "tropa",
    "rarity": "comum",
    "formula": "∫ₐᵇ f(x)dx = área líquida",
    "palette": [
      "#3DDA9A",
      "#2ED6E8",
      "#102A4D"
    ],
    "symbol": "∫",
    "silhouette": "arquiteta com compasso e faixa de energia sob uma curva",
    "visualBrief": "A região sob a curva se materializa como blocos de luz.",
    "art": "/assets/cards/art/area.webp",
    "thumb": "/assets/cards/thumbs/area.webp",
    "battle": "/assets/cards/battle/area.webp",
    "fallback": "/assets/art/world-4.svg",
    "prompt": "personagem de card game fantasy cartoon 2D polido, arquiteta da área, roupa verde e ciano, compasso mágico, região sob uma curva preenchida por blocos luminosos, símbolo integral como detalhe de acessório, pose clara, fundo simples, sem texto, sem moldura"
  },
  {
    "id": "ftc",
    "name": "Oráculo Fundamental",
    "world": 4,
    "class": "integral",
    "kind": "feitiço",
    "rarity": "épica",
    "formula": "d/dx ∫ₐˣ f(t)dt = f(x)",
    "palette": [
      "#8D63FF",
      "#3DDA9A",
      "#F3C86A"
    ],
    "symbol": "∫→f",
    "silhouette": "oráculo com bastão que transforma espiral em raio",
    "visualBrief": "Uma corrente integral se comprime e vira um pulso instantâneo.",
    "art": "/assets/cards/art/ftc.webp",
    "thumb": "/assets/cards/thumbs/ftc.webp",
    "battle": "/assets/cards/battle/ftc.webp",
    "fallback": "/assets/art/world-4.svg",
    "prompt": "personagem de card game fantasy cartoon 2D polido, oráculo do teorema fundamental do cálculo, manto violeta e verde, bastão transformando um fluxo integral contínuo em raio instantâneo, composição limpa, iluminação dramática, sem texto, sem moldura"
  },
  {
    "id": "cavalieri",
    "name": "Mestre Cavalieri",
    "world": 4,
    "class": "integral",
    "kind": "estrutura",
    "rarity": "lendária",
    "formula": "mesmas seções → mesmo volume",
    "palette": [
      "#F3C86A",
      "#3DDA9A",
      "#102A4D"
    ],
    "symbol": "▥",
    "silhouette": "mestre com duas formas sólidas e lâminas horizontais equivalentes",
    "visualBrief": "Duas estruturas diferentes exibem seções de mesma área.",
    "art": "/assets/cards/art/cavalieri.webp",
    "thumb": "/assets/cards/thumbs/cavalieri.webp",
    "battle": "/assets/cards/battle/cavalieri.webp",
    "fallback": "/assets/art/world-4.svg",
    "prompt": "personagem lendário de card game fantasy cartoon 2D polido, mestre Cavalieri, arquiteto mágico dourado e verde, duas formas tridimensionais diferentes cortadas por planos horizontais luminosos equivalentes, pose de mestre, fundo simples, sem texto, sem moldura"
  }
] as CardVisual[];

export const CARD_VISUAL_BY_ID = new Map(CARD_VISUALS.map((card) => [card.id, card]));

export function getCardVisual(id: string): CardVisual | undefined {
  return CARD_VISUAL_BY_ID.get(id);
}

export function getCardArt(id: string, variant: "art" | "thumb" | "battle" = "thumb"): string | undefined {
  const visual = getCardVisual(id);
  return visual?.[variant];
}
