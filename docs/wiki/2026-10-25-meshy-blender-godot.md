# 25/10/2026 — Fluxo Meshy → Blender → Godot no Calculus Royale

**Estado:** procedimento planejado/documentado. **Conta Meshy ainda não conectada nesta conversa**; o responsável informou que pretende criá-la. Não houve geração Meshy nem operação no Blender nesta etapa. A integração técnica documentada não significa que o Meshy tenha sido executado.

## Necessidade e histórico
No Calculus Royale as cartas apresentam personagens ilustrados com identidades marcantes, mas os modelos 3D procedurais ainda se parecem com geometria simplificada. O objetivo é avançar em **proporção, rosto, cabelo, roupa, arma, silhueta e animação** sem redesenhar as cartas. A referência à movimentação de jogos de luta diz respeito ao balanço corporal e à qualidade de animação, não à cópia de personagens ou marcas.

- [PR #4 — segurança e LGPD](https://github.com/leosardinhalaus-math/leo-sardinha-math/pull/4): segurança, testes, build somente leitura.
- [PR #7 — arena 3D e combate](https://github.com/leosardinhalaus-math/leo-sardinha-math/pull/7): conciliação do combate tático, close-up da câmera, melhorias dos GLBs e testes Chrome desktop/mobile.
- [PR #8 — Godot 4, Arqueira e Mago](https://github.com/leosardinhalaus-math/leo-sardinha-math/pull/8): refinamentos nativos, galeria 3D, testes reais no Godot 4.7.2. **Rascunho**; não publicado em `main`.

## Fluxo experimental proposto
1. **Referência artística:** usar a imagem original da carta, não o modelo geométrico como referência principal. Começar pela **Arqueira da Derivada** (`slope`), depois pelo **Mago da Potência** (`power`). Preparar vistas frontal, lateral e costas apenas se puderem preservar a identidade visual original.
2. **Meshy, Image to 3D:** criar um modelo piloto a partir da(s) referência(s). Conferir condições atuais de créditos, direitos de uso comercial e formatos de exportação **antes** de gastar créditos ou assinar um plano; recursos e limites podem mudar. Não presumir que toda conta gratuita permite exportar todos os modelos. Registrar prompt, configurações, ferramenta, data e resultado de cada geração.
3. **Blender:** importar o modelo 3D, revisar faces/silhueta, separar ou corrigir roupas e acessórios, preparar topologia, aplicar rigging/weight painting se necessário e gerar animações próprias (idle, walk, run, summon, attack, power, hurt, victory, defeat). O plugin/Bridge do Meshy não é requisito: arquivos exportados podem ser importados quando licenciados e disponíveis.
4. **Godot 4:** importar `.glb` ou cena compatível com malha/esqueleto e animações, ajustar escala e pivôs, vincular o personagem à carta original. Confirmar desempenho Web/Android, câmera, colisão, animações e identidade no jogo.
5. **Comparação visual e regressão:** comparar imagem da carta e captura do modelo em 4 vistas (frente, costas, esquerda e direita) e em estados parado/andando/atacando. Priorizar anatomia e silhueta sem apagar detalhes próprios da carta; validar no computador e num celular real antes de homologar.

## Protocolo de comparação por personagem
| Critério | Arqueira da Derivada | Mago da Potência |
|---|---|---|
| Identidade | Cabelo preso alto, roupa escura, capa vermelha, arco e flecha | Capuz rubro, barba branca comprida, manto ornamentado, cajado dourado com energia |
| Movimento | Respiração, transferência de peso, armamento preparado, tração e soltura da corda, balanço do rabo de cavalo e capa | Respiração, antecipação do feitiço, impacto e recuperação, atraso na barba e no manto |
| Falha a evitar | Trocar por arqueira genérica, cabelo fixo, arco sem corda, pose travada | Mago genérico sem barba longa, cajado básico, braço rígido e gestos sem peso |
| Evidência exigida | Comparação lado a lado e clipes curtos no Godot | Comparação lado a lado e clipes curtos no Godot |

## Arquitetura disponível
- Projeto Godot nativo na raiz: `project.godot`, `scenes/CharacterGallery.tscn`, `scripts/NativeCharacter.gd` e `scripts/NativeMotion.gd`. O projeto já contém 45 perfis e galeria de referência.
- Código de geração Three.js paralelo: `jogos/calculus-royale-src/client/src/game/proceduralCharacters.ts` e `scripts/generate-models.ts`.
- Referências de imagens de cartas no projeto: `jogos/calculus-royale/assets/cards/characters/`.
- Scripts de testes nativos: `tests/godot/test_game.gd` e `tests/godot/test_character_identity.gd`.

## Registro de verificações
- **Confirmado no PR #8:** testes de importação nativa, identidade do personagem e jogabilidade passaram no workflow GitHub Actions do Godot; isso verifica execução de código e existência dos elementos, não aparência orgânica perfeita.
- **Pendente:** criar a conta Meshy, executar uma geração piloto, verificar custos/licenças reais, exportar um modelo gerado, abrir e revisar no Blender, comparar com a carta e importar no Godot. Nenhum dos passos pendentes deve ser marcado como concluído por antecipação.
- **Segurança:** nunca colocar chave da Meshy ou credenciais pessoais no GitHub, no site estático ou em prints; guardar eventual token só em ambiente seguro.

## Links úteis
- [Meshy](https://www.meshy.ai/)
- [Godot](https://godotengine.org/)
- [Blender](https://www.blender.org/)
- [PR #8 — progresso e testes](https://github.com/leosardinhalaus-math/leo-sardinha-math/pull/8)

**Conclusão:** a trilha de evolução será Meshy para prototipagem do volume 3D, Blender para acabamento/rigging e Godot para integração, enquanto a versão web antiga permanece preservada. A qualidade será julgada pelos modelos e testes visuais reais, não apenas por CI aprovado.
