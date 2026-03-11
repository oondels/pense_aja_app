# Frontend Business Rules

## Sessão e identidade

- o login decodifica `userData` retornado pela auth API e grava os dados em `sessionStorage`
- a store `userStore` apenas reidrata esses dados
- logout limpa `sessionStorage` e recarrega a página
- se a sessão expira, o interceptor mostra alerta, limpa armazenamento e recarrega a app

## Unidade Dass

- a unidade é pré-requisito de quase todo fluxo de negócio
- `GetUserOffice.vue` pede matrícula e resolve `unidadeDass`
- sem `unidadeDass` em `localStorage`, várias consultas não funcionam corretamente
- o frontend trata `SEST` como fallback em vários pontos quando a unidade não está resolvida

## Login e permissões

- a UI considera permissões elevadas quando `funcao` contém:
  - `analista`
  - `gerente`
  - `automacao`
- essa regra existe em `userService.setUserRole` e `userService.getUserPermission`
- a autorização visual pode divergir do backend se os dados de sessão estiverem inconsistentes

## Cadastro de Pense Aja

- o cadastro exige no mínimo:
  - nome do projeto
  - data do projeto
  - situação anterior
  - situação atual
- o frontend deriva `turno` a partir do último caractere de `userData.setor`
- o payload enviado ao backend traduz os nomes locais do formulário para o contrato da API
- ao sucesso:
  - mostra notificação
  - dispara confete
  - recarrega a página depois de alguns segundos

## IA no cadastro

- existe integração com `/ai/improve-text`
- a função está disponível em `aiService.js`
- o botão de melhoria por IA está desabilitado na UI atual do cadastro

## Listagem e filtros

- a tela principal usa filtros locais e remotos para reduzir o conjunto exibido
- a UI trabalha com filtros multi-seleção para nome, gerente, setor, status, projeto e turno
- o status exibido ao usuário é calculado no frontend, não apenas consumido pronto da API

## Regra de status no frontend

Funções como `setPenseAjaStatus` derivam o status em cascata:

- `REPROVADO` se gerente ou analista reprovou
- `EM ESPERA` se `em_espera === "1"`
- `SEM ANÁLISE` se nenhum avaliador está preenchido
- `VISTO PELA MELHORIA CONTINUA` se só o analista avaliou
- `VISTO PELO GERENTE` se só o gerente avaliou
- `AVALIADO` se ambos avaliaram

Isso é relevante porque o frontend usa essas labels para:

- legenda da listagem
- agregações de relatório
- parte do detalhamento visual

## Avaliação

- o frontend exige `avaliacao` para quase todos os status, exceto `exclude` e `reprove`
- o frontend exige `justificativa` para todos os casos, exceto `exclude`
- a validação final continua sendo do backend
- após sucesso, a UI fecha o diálogo e mostra popup

## Dashboard

- a tela usa período padrão do ano atual até o dia presente
- `dashboardService.getMonthlyData` deve respeitar o período recebido pelos filtros
- `dashboardService.getIdeaHighlights` deve respeitar o período recebido pelos filtros
- os composables de dashboard retornam dados fallback em caso de erro
- o relatório XLSX é montado no cliente a partir de dados brutos e agregados
- a aba `Detalhes Pense&Aja` exporta a coluna `Pontuação` quando a ideia possuir registro em `pense_aja_pontos`

## Perfil e notificações

- a página de perfil usa a matrícula da sessão como pré-condição
- o formulário só considera mudança quando email ou preferências diferem do snapshot inicial
- o checkbox "Receber notificações por email" controla a presença de `pense_aja` em `authorized_notifications_apps`
- ao salvar, a página recarrega

## Popup de email

- o popup não depende apenas de login; ele depende de:
  - `unidadeDass`
  - `emailProvided`
  - `emailSkipUntil`
- "Agora não" adia o popup por 3 dias
- "Não tenho email" oculta permanentemente via `localStorage`
- o fluxo também redireciona para `/news` quando apropriado

## Store e recompensas

- loja e cadastro convivem na navbar
- resgate usa rota autenticada de compra e exige feedback visual via popup
- criação de produto usa um upload service separado em `http://10.100.1.43:3020/`
- edição de produtos chama o backend principal

## PWA

- a instalação depende do evento `beforeinstallprompt`
- se o browser não disponibilizar o evento, a UI mostra que o recurso ainda não está disponível

## Riscos atuais observáveis

- forte dependência de `window.location.reload()`
- regras de status duplicadas em mais de um arquivo
- parte das permissões é inferida no cliente
- há mistura entre dados reais e fallback/mock em widgets analíticos
- alguns serviços usam endpoints/hosts hardcoded fora de env, como o upload da loja
