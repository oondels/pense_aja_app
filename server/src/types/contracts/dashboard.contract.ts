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
