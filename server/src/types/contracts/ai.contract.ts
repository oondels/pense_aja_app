export interface ImproveTextRequest {
  projectName: string;
  situationBefore: string;
  situationNow: string;
}

export interface ImproveTextResult {
  before: string;
  after: string;
}

export interface ImproveTextResponse {
  result: ImproveTextResult;
}
