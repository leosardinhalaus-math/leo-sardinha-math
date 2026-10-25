# Tookie OSINT — avaliação de integração

Fonte: https://github.com/Alfredredbird/tookie-osint
Autor: Alfredredbird. Licença declarada: MIT (preservar texto e avisos caso o código seja distribuído).
Escopo declarado: busca de perfis públicos por nome de usuário, com automação de requisições e navegador.
Dependências declaradas no requirements.txt: colorama, requests, argparse, selenium, webdriver-manager, flask, PySocks.

## Status
**Integração de referência/documentação apenas.** Nenhum código terceiro foi copiado, executado, instalado ou hospedado; nenhuma conta foi investigada. Arquivos remotos não são importados automaticamente pelo site ou ChatGPT.

## Condições para uso
1. Usar apenas em pesquisas legítimas, com autorização quando se tratar de contas de pessoas.
2. Respeitar privacidade, LGPD, termos de uso, rate limits, bloqueios e mecanismos de autenticação.
3. Não produzir dossiês invasivos, rastreamento de pessoas, desanonimização, coleta de senhas ou dados não públicos.
4. Não fornecer aos navegadores do público um executor remoto de comandos, proxy aberto, crawler genérico ou acesso às redes internas.
5. Se um servidor próprio for considerado no futuro, auditar e fixar versões de dependências; aplicar autenticação, allowlist de sites, filas com limites, logs mínimos, controle de custos, limites de tráfego e processo de exclusão de dados.
6. Validar licenciamento e procedência do commit antes de qualquer instalação ou fork.

## Implementação recomendada
Manter Tookie como ferramenta administrativa separada, nunca conectado automaticamente aos visitantes do Leo Sardinha.Math. Publicar uma documentação educativa sobre OSINT ético, não um endpoint de investigação de terceiros.

## ChatGPT
O repositório GitHub não é um plugin do ChatGPT. Para uma integração real, é preciso desenvolver e registrar um app/servidor de ferramentas compatível e conceder conexão explicitamente. Até lá, o ChatGPT pode auxiliar com métodos e análises de fontes públicas, sem alegar executar o Tookie.
