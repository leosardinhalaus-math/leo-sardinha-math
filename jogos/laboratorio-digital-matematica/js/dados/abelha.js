// Edite os nove quadrados, o baralho e os avanços para adaptar a atividade.
export const casas=[
 {tipo:'unitária',exemplo:[1,3],avanco:2},
 {tipo:'própria',exemplo:[2,5],avanco:1},
 {tipo:'equivalente',exemplo:[2,4],avanco:2},
 {tipo:'imprópria',exemplo:[5,3],avanco:1},
 {tipo:'mista',exemplo:[7,3],avanco:2},
 {tipo:'própria',exemplo:[3,5],avanco:1},
 {tipo:'unitária',exemplo:[1,5],avanco:2},
 {tipo:'equivalente',exemplo:[3,6],avanco:2},
 {tipo:'imprópria',exemplo:[7,5],avanco:1}
];
// O tipo equivalente se refere a uma igualdade explícita, não a uma fração isolada.
export const sorteaveis=[
 {texto:'1/2',tipo:'unitária',explicacao:'O numerador é 1.',visual:[1,2]},
 {texto:'1/5',tipo:'unitária',explicacao:'O numerador é 1.',visual:[1,5]},
 {texto:'2/5',tipo:'própria',explicacao:'O numerador é menor que o denominador.',visual:[2,5]},
 {texto:'3/4',tipo:'própria',explicacao:'O numerador é menor que o denominador.',visual:[3,4]},
 {texto:'5/3',tipo:'imprópria',explicacao:'O numerador é maior que o denominador.',visual:[2,3]},
 {texto:'7/4',tipo:'imprópria',explicacao:'O numerador é maior que o denominador.',visual:[3,4]},
 {texto:'1 1/2',tipo:'mista',explicacao:'Há uma parte inteira e uma fração.',visual:[1,2]},
 {texto:'2 1/3',tipo:'mista',explicacao:'Há duas partes inteiras e uma fração.',visual:[1,3]},
 {texto:'1/2 = 2/4',tipo:'equivalente',explicacao:'As duas representações têm o mesmo valor.',visual:[2,4]},
 {texto:'2/3 = 4/6',tipo:'equivalente',explicacao:'Multiplicar numerador e denominador pelo mesmo número preserva o valor.',visual:[4,6]}
];
