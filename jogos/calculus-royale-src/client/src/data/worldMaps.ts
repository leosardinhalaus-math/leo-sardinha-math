export type WorldMapVisual = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  art: string;
  accent: string;
};

export const WORLD_MAPS: WorldMapVisual[] = [
  { id: 1, slug: "limites", title: "Ilha dos Limites", subtitle: "Onde o infinito revela o verdadeiro valor", art: "./assets/maps/world-1.webp", accent: "#2ED6E8" },
  { id: 2, slug: "derivadas", title: "Ilha das Derivadas", subtitle: "Onde a mudança revela o movimento", art: "./assets/maps/world-2.webp", accent: "#FF7C67" },
  { id: 3, slug: "integrais", title: "Ilha das Integrais", subtitle: "Onde tudo se soma em harmonia", art: "./assets/maps/world-3.webp", accent: "#3DDA9A" },
  { id: 4, slug: "series", title: "Ilha das Séries", subtitle: "Onde os padrões seguem ao infinito", art: "./assets/maps/world-4.webp", accent: "#8D63FF" },
  { id: 5, slug: "aplicacoes", title: "Ilha das Aplicações", subtitle: "Onde o cálculo ganha o mundo", art: "./assets/maps/world-5.webp", accent: "#F3C86A" },
];

export const getWorldMap = (index: number) => WORLD_MAPS[index] ?? WORLD_MAPS[0];
