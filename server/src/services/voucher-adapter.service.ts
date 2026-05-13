import { QueryRunner } from "typeorm";
import MarketplaceVoucherDeliveryEntity from "../models/MarketplaceVoucherDelivery";

interface IssueVoucherInput {
  redemptionRequestId: string | number;
  adapter: string;
  payload: Record<string, unknown>;
}

export const VoucherAdapterService = {
  async issueVoucher(queryRunner: QueryRunner, input: IssueVoucherInput) {
    const repository = queryRunner.manager.getRepository(
      MarketplaceVoucherDeliveryEntity
    );
    const now = new Date();

    return repository.save(
      repository.create({
        redemption_request_id: String(input.redemptionRequestId),
        adapter: input.adapter || "noop",
        delivery_status: "pending_provider",
        external_reference: null,
        request_payload: input.payload,
        response_payload: {
          mode: "noop",
          message: "Voucher aguardando provider externo configurado.",
        },
        error_message: null,
        createdat: now,
        updatedat: now,
      })
    );
  },
};
