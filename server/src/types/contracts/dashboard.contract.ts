import { DateRange } from "./common.contract";

export interface DashboardSummaryData {
  totalIdeas: number;
  implementedIdeas: number;
  pendingIdeas: number;
  rejectedIdeas: number;
  approvedByManager: number;
  inAnalysis: number;
  totalValue: number;
  avgValue: number;
  totalPointsEarned?: number;
  totalPointsRedeemed?: number;
  totalPointsReserved?: number;
  marketplacePending?: number;
  marketplaceCompleted?: number;
  report?: DashboardReportData;
}

export interface DashboardReportMetadata {
  dassOffice: string;
  startDate: string | null;
  endDate: string | null;
  generatedAt: string;
  version: string;
}

export interface DashboardReportKpis {
  totalIdeas: number;
  implementedIdeas: number;
  pendingIdeas: number;
  rejectedIdeas: number;
  inAnalysis: number;
  implementationRate: number;
  totalValue: number;
  avgValue: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  totalPointsReserved: number;
  marketplacePending: number;
  marketplaceCompleted: number;
}

export interface DashboardReportEvaluationSummary {
  totalReviewed: number;
  approved: number;
  rejected: number;
  pending: number;
  waiting: number;
  reviewRate: number;
  approvalRate: number;
}

export interface DashboardReportEvaluatorRanking {
  evaluatorName: string;
  totalReviewed: number;
  approved: number;
  rejected: number;
  pending: number;
  approvalRate: number;
}

export interface DashboardReportEvaluationMetrics {
  adminReview: DashboardReportEvaluationSummary & {
    ranking: DashboardReportEvaluatorRanking[];
  };
  ideaEvaluatorReview: DashboardReportEvaluationSummary & {
    ranking: DashboardReportEvaluatorRanking[];
  };
}

export interface DashboardReportIdeaRow {
  id: number;
  registration: string;
  collaboratorName: string;
  sector: string;
  manager: string;
  factory: string;
  shift: string;
  projectName: string;
  createdAt: string | Date;
  realizedAt: string | Date | null;
  canonicalStatus: string;
  classification: string | null;
  points: number;
  previousSituation: string;
  currentSituation: string;
  gains: unknown;
  adminEvaluator: string | null;
  adminStatus: string | null;
  adminReviewedAt: string | Date | null;
  adminJustification: string | null;
  ideaEvaluator: string | null;
  ideaEvaluatorStatus: string | null;
  ideaEvaluatorReviewedAt: string | Date | null;
  ideaEvaluatorJustification: string | null;
}

export interface DashboardReportDimensionRow {
  label: string;
  total: number;
  implemented: number;
  rejected: number;
  pending: number;
  waiting: number;
  adminReviewed: number;
  ideaEvaluatorReviewed: number;
  implementationRate: number;
}

export interface DashboardReportMonthlyRow extends DashboardReportDimensionRow {
  month: string;
  points: number;
}

export interface DashboardReportMarketplace {
  pending: number;
  completed: number;
  refunded: number;
  rejected: number;
  cancelled: number;
  pointsCommitted: number;
  pointsReserved: number;
  pointsRefunded: number;
}

export interface DashboardReportData {
  metadata: DashboardReportMetadata;
  kpis: DashboardReportKpis;
  evaluationMetrics: DashboardReportEvaluationMetrics;
  ideas: DashboardReportIdeaRow[];
  dimensions: {
    sector: DashboardReportDimensionRow[];
    manager: DashboardReportDimensionRow[];
    factory: DashboardReportDimensionRow[];
    shift: DashboardReportDimensionRow[];
    status: DashboardReportDimensionRow[];
  };
  monthly: DashboardReportMonthlyRow[];
  marketplace: DashboardReportMarketplace;
}

export interface DashboardSummaryOptions {
  includeReport?: boolean;
}

export interface DashboardMonthlyData {
  month: string;
  count: number;
  value: number;
}

export interface DashboardDimensionItem {
  label: string;
  count: number;
}

export interface DashboardDimensionalData {
  manager: DashboardDimensionItem[];
  sector: DashboardDimensionItem[];
  factory: DashboardDimensionItem[];
}

export interface DashboardIdeaHighlight {
  id: number;
  title: string;
  description: string;
  author: string;
  avatarColor: string;
  date: string;
  status: string;
  category: string;
  sector: string;
  factory: string;
  likes: number;
  comments: number;
  syntheticEngagement?: boolean;
}

export interface DashboardEngagementContributor {
  id: number;
  name: string;
  role: string;
  department: string;
  ideas: number;
  implemented: number;
  avatarColor: string;
}

export interface DashboardDateRange extends DateRange {}
