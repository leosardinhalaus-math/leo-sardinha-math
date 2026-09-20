export type PowerUpType = 'limit' | 'root' | 'zoom';
export type Challenge = { type: PowerUpType; question: string; options: string[]; answer: string };
type Question = Omit<Challenge, 'type'>;
const q = (question: string, answer: string, ...wrong: string[]): Question => ({ question, answer, options: [answer, ...wrong] });

// Topics follow WORLD_MAPS: limits, derivatives, series, integrals, applications.
export const QUESTION_BANK: Question[][] = [
  [
    q('Qual é lim (x → 2) de (3x + 1)?', '7', '5', '6', '3'),
    q('Qual é lim (x → 3) de x²?', '9', '6', '3', '0'),
    q('Qual é lim (x → 1) de (x² − 1)/(x − 1)?', '2', '0', '1', 'Não existe'),
    q('Qual é lim (x → 0) de sen(x)/x, em radianos?', '1', '0', '−1', 'Não existe'),
    q('Qual é lim (x → +∞) de 1/x?', '0', '1', '+∞', '−∞'),
    q('Qual é lim (x → +∞) de (2x + 1)/(x + 3)?', '2', '1', '1/3', '0'),
    q('Se os limites laterais são diferentes, o limite bilateral…', 'não existe', 'é zero', 'é a soma dos dois', 'é sempre infinito'),
    q('Qual é lim (x → 4) de √x?', '2', '4', '16', '0'),
  ],
  [
    q('Qual é a derivada de x²?', '2x', 'x', 'x²', '2'),
    q('Qual é a derivada de x³?', '3x²', 'x²', '3x', 'x⁴/4'),
    q('Qual é a derivada de 5x + 2?', '5', '2', '7', '5x'),
    q('Qual é a derivada da constante 8?', '0', '1', '8', '8x'),
    q('Qual é a derivada de sen(x)?', 'cos(x)', '−cos(x)', '−sen(x)', 'sen(x)'),
    q('Qual é a derivada de eˣ?', 'eˣ', 'xeˣ', 'e', 'ln(x)'),
    q('Se f(x) = x², quanto vale f′(3)?', '6', '9', '3', '2'),
    q('Se f′(x) > 0 em todo um intervalo, f é…', 'crescente nesse intervalo', 'decrescente nesse intervalo', 'constante', 'sempre negativa'),
  ],
  [
    q('Quanto vale a soma infinita 1 + 1/2 + 1/4 + 1/8 + …?', '2', '1', '3/2', '+∞'),
    q('Quanto vale a soma infinita 3 + 3/2 + 3/4 + …?', '6', '3', '9', '+∞'),
    q('A série geométrica de razão r converge quando…', '|r| < 1', '|r| > 1', 'r = 1', 'r ≥ 2'),
    q('A série harmônica 1 + 1/2 + 1/3 + … é…', 'divergente', 'convergente para 1', 'convergente para 2', 'uma soma finita'),
    q('Se os termos de uma série não tendem a zero, ela…', 'diverge', 'converge para zero', 'converge para 1', 'é sempre geométrica'),
    q('Qual é o próximo termo de 1, 1/3, 1/9, …?', '1/27', '1/12', '1/18', '1/81'),
    q('Qual é o polinômio de Taylor de grau 1 de eˣ em x = 0?', '1 + x', 'x', '1 − x', 'x²'),
    q('A série 1 + 1/4 + 1/9 + 1/16 + … converge porque é uma série p com…', 'p = 2 > 1', 'p = 1', 'p = 0', 'p = −2'),
  ],
  [
    q('Qual é uma primitiva de 2x?', 'x²', '2x²', 'x', 'ln(x)'),
    q('Qual é ∫ de 3x² dx?', 'x³ + C', '6x + C', '3x³ + C', 'x² + C'),
    q('Qual é ∫₀¹ 2x dx?', '1', '2', '1/2', '0'),
    q('Qual é ∫₀² 3 dx?', '6', '3', '2', '0'),
    q('Qual é ∫₀¹ x² dx?', '1/3', '1/2', '1', '3'),
    q('Trocar os limites de integração faz o valor da integral…', 'trocar de sinal', 'dobrar', 'ficar sempre zero', 'ficar igual'),
    q('Qual é ∫₁¹ (x² + 5) dx?', '0', '1', '6', '5'),
    q('Se F′(x) = f(x), então ∫ de a até b de f(x) dx vale…', 'F(b) − F(a)', 'F(a) − F(b)', 'F(a) + F(b)', 'F(a) × F(b)'),
  ],
  [
    q('Se s(t) = t² metros, qual é a velocidade em t = 3 s?', '6 m/s', '9 m/s', '3 m/s', '2 m/s'),
    q('Um móvel tem velocidade constante de 4 m/s por 3 s. Qual é o deslocamento?', '12 m', '7 m', '1 m', '4/3 m'),
    q('Qual é o valor mínimo de f(x) = (x − 2)²?', '0', '2', '4', '−2'),
    q('O método de Simpson aproxima integrais usando trechos de…', 'parábolas', 'retas apenas', 'círculos', 'hipérboles'),
    q('Qual é o valor médio de f(x) = 2x no intervalo [0, 2]?', '2', '4', '1', '0'),
    q('Uma população é P(t) = 100eᵗ. Qual é a taxa P′(0)?', '100', '0', '1', '200'),
    q('Se f′(a) = 0 e f″(a) > 0, o teste da segunda derivada indica…', 'mínimo local em a', 'máximo local em a', 'função constante', 'nenhum ponto crítico'),
    q('Para achar uma raiz de f, Newton usa qual atualização?', 'x − f(x)/f′(x)', 'x + f(x)/f′(x)', 'f(x) × f′(x)', 'x − f′(x)/f(x)'),
  ],
];

export function createChallengePicker(random = Math.random) {
  const queues = new Map<number, Question[]>();
  const last = new Map<number, string>();
  const shuffle = <T,>(values: T[]) => {
    const copy = [...values];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  return (worldIndex: number, type: PowerUpType): Challenge => {
    const index = Math.max(0, Math.min(4, Math.trunc(worldIndex)));
    let queue = queues.get(index);
    if (!queue?.length) {
      queue = shuffle(QUESTION_BANK[index]);
      if (queue[0].question === last.get(index)) [queue[0], queue[1]] = [queue[1], queue[0]];
      queues.set(index, queue);
    }
    const question = queue.shift()!;
    last.set(index, question.question);
    return { ...question, options: shuffle(question.options), type };
  };
}
