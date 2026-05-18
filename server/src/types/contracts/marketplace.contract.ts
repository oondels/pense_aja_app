import { DassOffice } from "./common.contract";

export type MarketplaceItemType = "physical" | "voucher";

export type MarketplaceRequestStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "fulfillment_in_progress"
  | "completed"
  | "cancelled"
  | "refunded";

export type MarketplaceFulfillmentType =
  | "physical_separation"
  | "physical_delivery"
  | "voucher_issue";

export interface MarketplaceCatalogItemRecord {
  id: string;
  legacyProductId: string | null;
  dassOffice: DassOffice;
  name: string;
  imageUrl: string | null;
  pointsCost: number;
  itemType: MarketplaceItemType;
  active: boolean;
  availableQuantity: number | null;
  metadata: Record<string, unknown> | null;
}

export interface MarketplaceRequestRecord {
  id: number;
  registration: string;
  requesterName: string | null;
  dassOffice: DassOffice;
  catalogItemId: string;
  catalogItemName: string | null;
  catalogItemPointsCost: number | null;
  catalogItemType: MarketplaceItemType | null;
  requestStatus: MarketplaceRequestStatus;
  reservedLedgerEntryId: number | null;
  approvalActorRegistration: string | null;
  approvalActorName: string | null;
  fulfillmentType: string;
  legacyPrizeId: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MarketplaceRequestListFilters {
  dassOffice: DassOffice | string;
  registration?: string | number;
  status?: MarketplaceRequestStatus | string;
  page?: string | number;
  limit?: string | number;
}

export interface MarketplaceRequestListResponse {
  data: MarketplaceRequestRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateMarketplaceRequestInput {
  dassOffice: DassOffice;
  catalogItemId: string;
  registration?: string | number;
  requesterName?: string;
  reason?: string;
}

export interface MarketplaceTransitionInput {
  dassOffice: DassOffice;
  reason?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface ExecuteFulfillmentInput extends MarketplaceTransitionInput {
  stepType?: MarketplaceFulfillmentType;
}

export interface UpsertCatalogItemInput {
  id?: string;
  name: string;
  imageUrl?: string | null;
  pointsCost: number;
  itemType?: MarketplaceItemType;
  active?: boolean;
  availableQuantity?: number | null;
  metadata?: Record<string, unknown> | null;
}
