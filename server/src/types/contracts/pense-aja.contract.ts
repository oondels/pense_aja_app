import { AuthenticatedUserIdentity, DassOffice } from "./common.contract";
import { UserManagerNotificationTarget, UserProfileData } from "./user.contract";

export interface PenseAjaData {
  nome: string;
  createDate: string | Date;
  situationBefore: string;
  situationNow: string;
  registration: string | number;
  perdas: string[];
  userName: string;
  gerente: string;
  setor: string;
  turno: string;
  a3Mae?: string;
  valorA?: string;
  valorB?: string;
  valorAmortizado?: string;
  outrosGanhos?: string;
  ganhos?: string[];
  ganhoDetalhes?: string;
  areaMelhoria: string;
  factory: string;
}

export interface PenseAjaFilters {
  startDate?: Date;
  endDate?: Date;
  name?: string;
  sector?: string;
  manager?: string;
  project?: string;
  turno?: string;
  status?: string;
}

export interface PenseAjaListItem {
  id: number;
  criado: string;
  matricula: number;
  fabrica: string | null;
  nome: string;
  setor: string;
  gerente: string;
  nome_projeto: string;
  turno: string;
  situacao_anterior: string;
  situacao_atual: string;
  ganhos: string[] | null;
  outros_ganhos: string | null;
  gerente_aprovador: string | null;
  analista_avaliador: string | null;
  status_gerente: string | null;
  status_analista: string | null;
  em_espera: string | boolean | null;
  createdat: string | Date;
  classificacao: string | null;
  pontuacao: number | null;
}

export interface PenseAjaDetails {
  matricula: number;
  nome: string;
  setor: string;
  turno: string;
  gerente: string;
  criado: string | Date;
  situacao_anterior: string;
  situacao_atual: string;
  nome_projeto: string;
  super_producao: number;
  transporte: number;
  processamento: number;
  movimento: number;
  estoque: number;
  espera: number;
  talento: number;
  retrabalho: number;
  gerente_aprovador: string | null;
  data_aprogerente: string | Date | null;
  analista_avaliador: string | null;
  classificacao: string | null;
  a3_mae: string | null;
  fabrica: string | null;
  ganhos: string[] | null;
  justificativa_analista: string | null;
  outros_ganhos: string | null;
}

export interface CreatedPenseAjaRecord {
  id: number;
  nome: string;
  nome_projeto: string;
  ganhos: string[] | null;
}

export interface CreatePenseAjaResult {
  pense_aja: CreatedPenseAjaRecord;
  userManager: UserManagerNotificationTarget | null;
  duplicated: boolean;
}

export interface SubmitPenseAjaResponse {
  statusCode: 200 | 201;
  body: {
    message: string;
    id: number;
  };
}

export interface EvaluationData extends AuthenticatedUserIdentity {
  avaliacao?: string;
  classification?: string;
  emEspera: boolean;
  replicavel: boolean;
  justificativa?: string;
  avaliadoAnteriormente?: boolean;
  nome?: string;
  dassOffice: DassOffice;
  status: string;
  a3Mae?: string;
  bonusPoints?: number;
  bonusJustification?: string;
  actorRegistration?: string;
  permissions?: string[];
}

export interface PenseAjaEvaluationRow {
  id: number;
  data_realizada: string | Date;
  fabrica: string | null;
  nome: string;
  matricula: number;
  setor: string;
  gerente: string;
  nome_projeto: string;
  turno: string;
  situacao_anterior: string;
  situacao_atual: string;
  gerente_aprovador: string | null;
  analista_avaliador: string | null;
  status_gerente: string | null;
  status_analista: string | null;
  em_espera: string | boolean | null;
  criado: string | Date;
}

export interface EvaluatePenseAjaResult {
  newEvaluation: PenseAjaEvaluationRow;
  role: string;
}

export interface EvaluatePenseAjaResponse {
  message: string;
  data: PenseAjaEvaluationRow;
}

export interface ProductRecord {
  id: string;
  nome: string;
  imagem: string;
  valor: number;
  user_create?: string;
  created_at?: string | Date;
}

export interface ProductSelection {
  id: string | number;
}

export interface CollaboratorData {
  matricula: number;
  nome: string;
}

export interface AnalystData {
  analistaUser: string;
  analistaName: string;
}

export interface PurchaseProductPayload {
  product: ProductSelection;
  colaboradorData: CollaboratorData;
  analista: AnalystData;
  dassOffice: DassOffice;
  actorRegistration?: string;
  actorName?: string;
}

export interface PurchaseProductResponse {
  message: string;
  data: number;
}

export interface ProductUpdateInput {
  id: string;
  nome: string;
  valor: number;
}

export interface NewProduct {
  name: string;
  points: number;
  image: string;
}

export interface UploadFileReference {
  fileUrl: string;
}

export interface UserPointsBalance
  extends Pick<UserProfileData, "pontos" | "pontos_resgatados"> {}
