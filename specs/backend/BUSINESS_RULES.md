# Backend Business Rules

## Unidades válidas

Grande parte do backend rejeita qualquer operação fora destas unidades:

- `SEST`
- `VDC`
- `ITB`
- `VDC-CONF`
- `STJ`

Essa validação é centralizada em `checkDassOffice`.

## Cadastro de ideia

- Um cadastro só é aceito se os campos essenciais vierem preenchidos.
- As 8 perdas lean são persistidas como colunas binárias no banco.
- Ganhos são gravados como JSON.
- O backend tenta impedir duplicidade concorrente com lock transacional e verificação por:
  - matrícula
  - nome do projeto
  - data realizada
  - unidade

## Avaliação

### Papéis aceitos

- `analista`
- `gerente`
- `automacao`

### Efeito por papel

- analista escreve em `status_analista`, `analista_avaliador`, `data_avaanalista` e `justificativa_analista`
- gerente ou admin escreve em `status_gerente`, `gerente_aprovador`, `data_aprogerente` e `justificativa_gerente`

### Regras de status

- `exclude`: marca o registro como excluído
- `reprove`: reprova sem classificação
- outros status: atualizam `classificacao`, `a3_mae`, `em_espera` e `replicavel`

### Restrições

- apenas gerente ou admin podem excluir
- não pode reprovar e ao mesmo tempo informar classificação
- o update só atinge registros não excluídos

## Pontuação

- Ao aprovar com nota, o sistema grava pontos em `pense_aja.pense_aja_pontos`.
- O mapeamento da nota numérica é:
  - `1 -> C`
  - `2 -> B`
  - `3 -> A`
- Se `avaliadoAnteriormente = true`, a pontuação existente é atualizada em vez de criar nova linha.
- Se um gerente reprova ou exclui, os pontos do registro são apagados.

## Loja e resgate

- Produtos pertencem a uma unidade Dass.
- Resgate só acontece se o produto existir e o colaborador tiver saldo suficiente.
- Saldo disponível = `pontos - pontos_resgatados`.
- O resgate gera uma linha em `pense_aja.pense_aja_premios`.
- Atualização de loja aceita lote parcial: alguns itens podem falhar e outros serem persistidos.

## Usuário e notificações

- O email do usuário precisa ser corporativo `@grupodass.com.br`.
- O backend usa o array JSON `authorized_notifications_apps` para saber se o app `pense_aja` está autorizado.
- Quando a lista chega vazia na atualização, a implementação grava `["null"]` como fallback.

## Notificações

- No cadastro de ideia:
  - busca o gerente do colaborador
  - só notifica se o gerente existir e tiver `pense_aja` habilitado
- Na avaliação:
  - busca o email do colaborador avaliado
  - só notifica se o email existir e o app estiver habilitado

## Dashboard

### Summary

- considera apenas `excluido = false`
- usa aprovações e reprovações baseadas nos status de gerente e analista
- usa `valor_amortizado` para total e média

### Monthly

- agrega por `createdat`
- o retorno `value` representa aprovados, apesar do nome sugerir valor monetário

### Dimensional

- entrega top 10 de gerente, setor e fábrica
- ignora campos nulos ou vazios

### Idea highlights

- prioriza ideias aprovadas com maior `valor_amortizado`
- categoria é inferida por palavras do setor
- likes e comments são fabricados em memória para enriquecer a UI

### Engagement

- ranqueia colaboradores por volume de ideias
- considera implementação apenas por `status_gerente = 'approve'`
- cargo e departamento são estimados via heurística, não vêm do banco

## IA

- hoje existe rota apenas para melhoria de texto
- a service também possui `resumeText`, mas ela não está exposta em rota
- o prompt tem limite de 3000 tokens antes da chamada ao Gemini

## Inconsistências atuais visíveis no código

- há vocabulário misto de status:
  - `approve` e `reprove` no dashboard
  - `APROVADO` e `REPROVADO` em partes do frontend
- `POST /pense-aja/:dassOffice` e `POST /ai/improve-text` não exigem autenticação no código atual
- `GET /dashboard/idea-highlights` e `GET /dashboard/engagement` usam dados parcialmente inferidos/sintéticos para apresentação
