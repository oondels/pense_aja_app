# Prompt de Plano de Atualização Frontend

```markdown
A implementação do backend foi concluída. Sua missão é analisar o front end e criar um plano completo de atualização do frontend da aplicação Pense Aja para alinhar a interface aos novos contratos, fluxos e regras do backend.

## Contexto

O frontend atual possui páginas que ainda podem estar usando contratos antigos. O backend agora inclui fluxos mais estruturados para:

- ideias Pense Aja;
- avaliação;
- RBAC/permissões;
- ledger e saldo;
- marketplace/resgates;
- catálogo;
- auditoria;
- dashboard;
- notificações;
- histórico de pontos.

Você deve revisar o frontend existente e propor um plano de atualização que contemple:

1. atualização das páginas já existentes;
2. criação de novas páginas quando necessário;
3. ajustes nos services/composables/stores;
4. adequação aos contratos atuais do backend;
5. melhoria da experiência visual e operacional.

## Fontes Obrigatórias

Leia primeiro:

- `specs/frontend/README.md`
- `specs/frontend/ROUTES.md`
- `specs/frontend/BUSINESS_RULES.md`
- `specs/frontend/INTEGRATIONS.md`
- `specs/backend/ROUTES.md`
- `specs/backend/BUSINESS_RULES.md`
- `specs/backend/INTEGRATIONS.md`
- `specs/DESIGN_SPEC.md`

Depois audite:

- `cliente/src/views`
- `cliente/src/components`
- `cliente/src/services`
- `cliente/src/stores`
- `cliente/src/router`
- `cliente/src/composables`
- `cliente/src/config`

## Objetivo

Crie um plano de implementação para atualizar o frontend ao novo backend.

O plano deve cobrir:

- quais telas existentes precisam ser alteradas;
- quais telas novas devem ser criadas;
- quais chamadas de API devem mudar;
- quais contratos antigos devem ser removidos;
- quais stores/services precisam ser atualizados;
- quais componentes reutilizáveis devem ser criados;
- quais testes/validações devem ser feitos.

## Diretrizes Visuais

Siga o contrato visual atual da aplicação, mas modernize a experiência onde fizer sentido.

Regras obrigatórias:

- usar Tailwind CSS;
- não adicionar CSS puro novo;
- manter consistência com o layout, cores e padrões já existentes;
- criar uma interface profissional, limpa e operacional;
- telas administrativas devem ter dados suficientes para auditoria, tomada de decisão e rastreabilidade;
- priorizar interfaces densas, escaneáveis e úteis, não páginas decorativas;
- evitar hero sections, cards excessivamente grandes ou layout de marketing;
- usar ícones em botões e estados;
- garantir responsividade para mobile e desktop.

## Referências de Experiência

Use como inspiração produtos com fluxos semelhantes:

- dashboards administrativos;
- páginas de acompanhamento de solicitação;
- marketplaces internos;
- painéis de auditoria;
- sistemas de workflow/aprovação;
- rastreamento de pedido;
- timeline operacional.

## Exemplo de Componente Esperado

Criar ou planejar um componente de acompanhamento de solicitação para web e mobile.

### Estrutura

- timeline horizontal em desktop;
- timeline vertical ou compacta em mobile;
- 5 etapas representadas por ícones circulares;
- cada etapa deve exibir:
  - ícone;
  - título;
  - data/hora, quando existir;
  - status auxiliar, como `Aguardando...`.

### Estados Visuais

- etapas concluídas:
  - ícones preenchidos em verde floresta;
  - `check` ou ícone representativo;
  - linha anterior marcada como concluída;

- etapa atual:
  - borda, halo ou glow amarelo/neon discreto;
  - destaque visual sem quebrar o layout;

- etapas futuras:
  - ícones e linhas em cinza claro;
  - aparência desabilitada.

### Estilo

- fundo branco;
- verde floresta para sucesso;
- cinza suave para etapas futuras;
- amarelo/neon apenas para destaque da etapa atual;
- tipografia limpa;
- títulos abaixo dos ícones;
- textos auxiliares menores;
- layout minimalista, moderno e profissional.

## Áreas Funcionais a Considerar

Avalie a necessidade de páginas ou melhorias para:

### Ideias

- listagem;
- detalhes;
- cadastro;
- avaliação;
- auditoria da ideia;
- filtros por unidade, status, setor, gerente, período e turno.

### Dashboard

- resumo geral;
- métricas de pontuação;
- métricas de marketplace;
- engajamento;
- destaques;
- filtros por unidade e período.

### Marketplace

- catálogo;
- solicitação de resgate;
- acompanhamento da solicitação;
- histórico de solicitações;
- aprovação/rejeição/estorno;
- visualização de saldo disponível.

### Administração

- gestão de catálogo;
- gestão de RBAC;
- vínculos usuário/unidade/papel;
- permissões;
- auditoria;
- logs funcionais ou timeline operacional.

### Perfil do Usuário

- dados básicos;
- saldo;
- histórico de pontos;
- resgates;
- preferências de notificação.

## Resultado Esperado

Produza um plano em Markdown com a seguinte estrutura:

# Plano de Atualização do Frontend Pense Aja

## Resumo Executivo

Explique o estado esperado do frontend após a atualização.

## Mapa de Impacto

Liste:

- páginas existentes que precisam mudar;
- páginas novas;
- services/stores/composables afetados;
- componentes compartilhados necessários.

## Contratos de API

Para cada área, indique:

- endpoint usado;
- payload esperado;
- resposta esperada;
- ajuste necessário no frontend.

## Plano de Implementação

Divida em fases:

### Fase 1 - Alinhamento de contratos

- services;
- tipos/modelos;
- stores;
- tratamento de erro;
- autenticação/permissões.

### Fase 2 - Atualização de páginas existentes

- página por página;
- mudança necessária;
- impacto visual e funcional.

### Fase 3 - Novas páginas

- objetivo da página;
- dados necessários;
- componentes usados;
- estados de loading/erro/vazio;
- permissões de acesso.

### Fase 4 - Componentes reutilizáveis

Inclua, no mínimo:

- componente de timeline de solicitação;
- cards/resumos de métricas;
- tabela administrativa;
- filtros por unidade/período/status;
- indicador de saldo;
- bloco de auditoria/timeline.

### Fase 5 - Testes e validação

Inclua:

- cenários manuais;
- cenários automatizados, se aplicável;
- responsividade;
- permissões;
- erros de API;
- estados vazios;
- regressão visual.

## Diretrizes de UX/UI

Descreva padrões visuais e comportamentais que devem ser seguidos.

## Riscos e Cuidados

Liste riscos como:

- quebra de contrato com backend;
- permissões incorretas;
- exposição indevida de dados;
- telas administrativas sem contexto suficiente;
- inconsistência entre saldo, ledger e resgates.

## Critérios de Aceite

Liste critérios objetivos para considerar a atualização concluída.

## Restrições

- Não implementar ainda.
- Não alterar arquivos.
- Não assumir contratos sem verificar as specs e o código.
- Se houver divergência entre frontend atual e backend/specs, priorize backend/specs e registre o impacto.
- Se identificar uma experiência melhor que a documentada, proponha como melhoria com justificativa.
```
