# Plano de Implementacao do Frontend

## Objetivo

Atualizar o frontend para consumir o contrato atual do backend, substituindo fluxos antigos onde necessario, adicionando paginas de marketplace, auditoria, RBAC, historico de pontos e administracao operacional, com UI profissional baseada em Tailwind e alinhada ao visual existente.

## Escopo Implementado

1. Sessao e permissoes
   - Carregar contexto de sessao via `/user/session-context/:dassOffice`.
   - Persistir permissoes efetivas em `sessionStorage`.
   - Usar permissoes RBAC como fonte primaria de exibicao de acoes.

2. Services de contrato atual
   - Criar services para marketplace, RBAC, auditoria de ideias e historico de pontos.
   - Encapsular chamadas HTTP por modulo para reduzir acoplamento em paginas.

3. Componentes reutilizaveis
   - Criar gates de permissao, badges de status, timeline de solicitacao, timeline de auditoria, resumo de pontos, tabela administrativa e estado de unidade ausente.
   - Usar Tailwind nos novos componentes, sem CSS puro novo.

4. Paginas novas
   - Marketplace de recompensas.
   - Administracao de solicitacoes de marketplace.
   - Administracao de catalogo.
   - Administracao RBAC.
   - Auditoria de ideia.
   - Historico de pontos do usuario.

5. Navegacao
   - Registrar novas rotas no Vue Router.
   - Expor atalhos de navegacao no topo e direcionar a loja mobile para o marketplace novo.

## Criterios de Aceite

- O build do frontend deve concluir sem erros.
- Fluxos protegidos devem ficar visiveis apenas quando a sessao tiver permissao compatível.
- Paginas novas devem usar os endpoints documentados em `specs/backend/ROUTES.md`.
- Novas telas devem manter layout profissional, denso o bastante para auditoria e visualizacao operacional.

## Observacoes de Contrato

- O endpoint atual de listagem de solicitacoes de marketplace e operacional e exige `marketplace.request.approve`.
- O historico de pontos permite leitura propria para a matricula autenticada e leitura de terceiros apenas com permissao operacional.
- Auditoria de ideias usa permissao de avaliacao ou exclusao, mantendo o backend como fonte de verdade.
