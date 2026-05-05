# Estratégia Marketplace Pense Aja + Liberação de Brindes

## Resumo

- O Pense Aja não deve duplicar o fluxo operacional de brindes/vouchers.
- O marketplace do Pense Aja passa a cuidar de: solicitação do usuário, reserva de pontos, aprovação interna de
  uso dos pontos e integração com o app de Liberação de Brindes.
- O app de Liberação de Brindes continua sendo a fonte de verdade para aprovação operacional final, separação,
  voucher, retirada, troca e histórico operacional do brinde.
- Decisões adotadas: catálogo vem do app de brindes; integração após aprovação é síncrona com estado de pendência
  em caso de falha; pontos são consumidos após criação bem-sucedida da solicitação no app de brindes.

## Fluxo Alvo

- Usuário comum solicita resgate no Pense Aja usando um brinde_id vindo do catálogo do app de brindes.
- Pense Aja valida saldo, cria reserve no ledger e registra solicitação local como pending_approval.
- Usuário com marketplace.request.approve aprova ou rejeita.
- Se rejeitar, Pense Aja cria release e encerra como rejected.
- Se aprovar, Pense Aja chama o app de brindes para criar uma solicitação tipo_requisicao = "pense_aja".
- Se a criação externa funcionar, Pense Aja cria commit, salva o id externo e muda status local para
  external_created.
- Se a criação externa falhar, mantém a reserva e marca integration_failed, permitindo retry sem duplicar
  solicitação.
- A partir daí, separação, voucher, retirada, troca, aprovação operacional e rejeição operacional acontecem no app
  de brindes.
- Pense Aja mantém histórico/status espelhado por consulta ou callback, sem tentar controlar fulfillment.

## Mudanças No Pense Aja

- Simplificar estados locais do marketplace para representar integração, não fulfillment próprio:
    - pending_approval
    - rejected
    - approved
    - integration_failed
    - external_created
    - external_rejected
    - external_cancelled
    - external_waiting_separation
    - external_voucher_pending
    - external_redeemed
    - refunded
- Manter ledger:
    - reserve na criação da solicitação local.
    - release na rejeição antes da integração.
    - commit somente quando a solicitação externa for criada com sucesso.
    - refund se o app de brindes rejeitar/cancelar uma solicitação já criada externamente.
- Remover ou despriorizar no Pense Aja as rotas próprias de fulfillment/voucher:
    - PUT /marketplace/requests/:id/fulfillment
    - PUT /marketplace/requests/:id/complete
    - PUT /marketplace/requests/:id/refund continua útil, mas deve refletir evento externo ou ação administrativa.
- Adicionar/ajustar operações:
    - POST /marketplace/requests: cria solicitação e reserva pontos.
    - PUT /marketplace/requests/:id/approve: aprova internamente e tenta criar solicitação externa.
    - PUT /marketplace/requests/:id/reject: rejeita internamente e libera reserva.
    - POST /marketplace/requests/:id/retry-integration: reenvia criação externa quando status for
      integration_failed.
    - GET /marketplace/requests/:id/status: retorna status local + status externo consultado/cacheado.
- Persistir rastreabilidade:
    - external_app = "liberacao_brindes"
    - external_request_id
    - external_status
    - external_voucher_code, se retornado/consultado
    - external_last_sync_at
    - integration_attempts
    - integration_error
    - idempotency_key

## Plano Separado No App De Liberação De Brindes

- Criar endpoint de integração para o Pense Aja:
    - POST /integracoes/pense-aja/solicitacoes
    - Autenticação por service token/API key ou credencial interna equivalente.
    - Payload mínimo: matrícula, nome, brinde_id, tipo_requisicao = "pense_aja", id da solicitação Pense Aja,
      unidade, observação, idempotency key.
    - Deve ser idempotente por id da solicitação Pense Aja.
- Criar endpoint de consulta específico:
    - GET /integracoes/pense-aja/solicitacoes/:penseAjaRequestId/status
    - Retorna id externo, status da solicitação, status do voucher, brinde, datas principais e histórico resumido.
- Opcional recomendado: callback para atualizar o Pense Aja em tempo quase real:
    - App de brindes chama POST /marketplace/integrations/gifts/status-events no Pense Aja.
    - Eventos: aprovado, rejeitado, aguardando_separacao, voucher_gerado, retirado, cancelado, aguardando_troca.
    - Pense Aja valida assinatura/token, atualiza status espelhado e aplica refund quando evento externo indicar
      rejeição/cancelamento após commit.
- O app de brindes permanece dono de:
    - aprovação operacional final;
    - separação;
    - geração/validação de voucher;
    - retirada por bipagem;
    - troca;
    - histórico operacional do brinde.

## Testes E Aceite

- Solicitação com saldo suficiente cria reserve e status pending_approval.
- Rejeição no Pense Aja cria release e status rejected.
- Aprovação com criação externa bem-sucedida salva external_request_id, cria commit e muda para external_created.
- Falha na criação externa mantém reserva, status integration_failed e permite retry idempotente.
- Retry não duplica solicitação externa quando idempotency key já existir.
- Evento externo rejeitado/cancelado após commit cria refund.
- Evento externo retirado atualiza status local para external_redeemed sem mexer no ledger.
- Consulta de status retorna dados locais mesmo se app de brindes estiver indisponível, marcando status externo
  como desatualizado.

## Assumptions

- O catálogo de brindes será fonte do app de Liberação de Brindes; o Pense Aja apenas referencia brinde_id e exibe
  os dados necessários.
- Aprovação do Pense Aja significa autorização para usar pontos, não aprovação operacional final do brinde.
- A criação no app de brindes é o ponto em que os pontos deixam de ser reserva e viram consumo confirmado.
- O app de brindes terá capacidade de criar e consultar solicitações tipo_requisicao = "pense_aja" via rota
  específica de integração.