# Frontend Business Rules

O frontend do Pense&Aja é uma camada de experiência e consumo de dados consolidados. Ele não é a fonte de verdade para autorização, saldo, pontuação ou decisão operacional.

## Sessão e identidade

### Estado atual

- login grava `userData` em `sessionStorage`
- `userStore` reidrata a sessão
- logout limpa armazenamento e recarrega a aplicação
- expiração de sessão também dispara limpeza e reload

### Modelo-alvo

- a sessão continua vindo do auth externo
- o frontend deve consumir snapshot de permissões e contexto já resolvidos pelo backend
- esse snapshot serve para UX, nunca para substituir validação do servidor

## Unidade Dass

### Estado atual

- `unidadeDass` é pré-requisito de quase todo fluxo
- `GetUserOffice.vue` resolve unidade a partir da matrícula
- existe fallback de `SEST` em alguns pontos

### Modelo-alvo

- a unidade continua sendo o eixo do escopo funcional
- a UI deve evitar mascarar ausência de contexto com fallback silencioso quando isso alterar comportamento de negócio

## Permissões na UI

### Estado atual

- a UI infere permissões quando `funcao` contém `analista`, `gerente` ou `automacao`

### Modelo-alvo

- permissões devem ser tratadas como dados derivados do backend
- papéis e ações podem variar por unidade
- a UI pode ocultar ou exibir ações com base no snapshot da sessão, mas a decisão final permanece no backend

## Cadastro de ideia

### Estado atual

- valida campos mínimos no formulário
- deriva `turno` a partir do contexto do usuário
- traduz campos da UI para o contrato da API

### Modelo-alvo

- continua sendo o ponto de entrada do fluxo
- a UI deve apresentar feedback claro para sucesso, duplicidade ou rejeição
- a integridade final do cadastro continua sendo do backend

## IA no cadastro

- a integração com `/ai/improve-text` permanece assistiva
- IA não deve participar de autorização, pontuação ou mudança formal de status

## Listagem e status

### Estado atual

- a tela principal usa filtros locais e remotos
- parte do status exibido ainda é derivada no frontend

### Modelo-alvo

- a UI pode manter labels amigáveis
- a semântica do status deve refletir o workflow resolvido pelo backend
- duplicação local de regra de status deve ser reduzida na Fase 2

## Avaliação

### Estado atual

- o formulário exige uma classificação configurada para a unidade na maior parte dos casos
- exige `justificativa` em quase todos os casos

### Modelo-alvo

- o formulário deve renderizar as classificações de `unitConfig.scoringRules`, carregadas no login por unidade
- a classificação enviada para o backend deve ser a letra canônica (`classification`)
- a bonificação extra da avaliação usa `bonusPoints` e `bonusJustification`
- o limite de bonificação exibido vem de `unitConfig.metadata.maxEvaluationBonusPoints` da unidade
- quando há bonificação maior que zero, a UI exige justificativa antes de enviar
- o formulário deve respeitar a etapa atual do workflow e as permissões devolvidas pelo backend
- a UI precisa estar pronta para exibir histórico e justificativas auditáveis
- a validação final continua sendo do servidor

## Perfil, saldo e pontuação

### Estado atual

- o perfil exibe pontuação e classificações agregadas

### Modelo-alvo

- saldo deve ser exibido como leitura consolidada do backend
- a UI não deve assumir soma simples de tabelas legadas
- histórico de pontos reflete eventos do ledger em linguagem compreensível ao usuário, incluindo avaliação, bonificação, ajuste manual e marketplace
- ajustes manuais ficam na guia de configurações da unidade e exigem permissão `points.adjust`
- ajustes de débito não devem ser enviados com valor que deixe saldo negativo; o bloqueio definitivo é do backend

## Marketplace e recompensas

### Estado atual

- resgate usa uma rota autenticada de compra
- criação e edição de produto já existem em módulos próprios

### Modelo-alvo

- o fluxo deve expor:
  - solicitação
  - reserva de saldo
  - aprovação ou rejeição
  - andamento de fulfillment
  - conclusão, liberação ou estorno
- item físico e voucher compartilham backbone de status, com detalhes específicos por tipo
- a UI deve refletir sempre o estado consolidado do backend

## Dashboard

### Estado atual

- consome agregações do backend e fallback local em parte dos composables
- o relatório XLSX é montado no cliente

### Modelo-alvo

- continua como camada de leitura
- métricas de pontuação e resgate devem consumir projeções do backend baseadas em ledger e marketplace
- dados heurísticos ou simulados precisam ficar claramente separados de dados canônicos

## Notificações e email

### Estado atual

- o perfil controla a presença de `pense_aja` em `authorized_notifications_apps`
- o popup de email depende de flags locais e da unidade

### Modelo-alvo

- a UX continua guiando opt-in e atualização de email
- eventos de avaliação, pontuação e resgate podem ampliar o uso de notificações

## PWA

- a PWA continua sendo camada de distribuição e conveniência
- ela não altera o modelo de verdade do domínio

## Riscos atuais observáveis

- forte dependência de `window.location.reload()`
- permissões ainda parcialmente inferidas no cliente
- regra de status duplicada
- mistura de dados reais e fallback/mock em alguns widgets
- upload da loja ainda depende de host hardcoded fora de env
