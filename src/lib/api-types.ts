// API Types from Swagger Spec

export interface StartSessionRequest {
  userId: number;
  projectName: string | null;
  projectDescription?: string | null;
}

export interface ConversationSession {
  sessionId: number;
  userId: number;
  projectName: string | null;
  projectDescription: string | null;
  currentPhase: string | null;
  domainAnalysisJson: string | null;
  lockedArchitecture: string | null;
  confidenceScore: number | null;
  totalRounds: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface FoundationQuestion {
  questionId: number;
  sectionId: number;
  questionOrder: number;
  questionText: string | null;
  questionTypeId: number;
  questionTypeName: string | null;
  placeholder: string | null;
  helpText: string | null;
  createdAt: string;
}

export interface StartSessionResponse {
  session: ConversationSession;
  foundationQuestions: FoundationQuestion[];
}

export interface SubmitAnswersRequest {
  answers: Record<string, string>;
  roundeId?: number | null;
}

export interface Question {
  questionId: number;
  questionText: string | null;
  reason: string | null;
  affectsDomains: string[] | null;
  priority: string | null;
  expectedAnswerType: string | null;
  followUpIfAnswer: Record<string, string> | null;
}

export interface RoundMetadata {
  roundNumber: number;
  confidenceScoreBefore: number;
  confidenceScoreAfterExpected: number;
  questionsCount: number;
  requiresAnotherRound: boolean;
  reasoning: string | null;
}

export interface ChangeFromPrevious {
  changeType: string | null;
  description: string | null;
}

export interface IdentifiedRisk {
  risk: string | null;
  severity: string | null;
  description: string | null;
}

export interface RefinedDomainAnalysis {
  changesFromPrevious: ChangeFromPrevious[] | null;
  identifiedRisks: IdentifiedRisk[] | null;
  assumptionsToValidate: string[] | null;
}

export interface UpdatedDomain {
  domainName: string | null;
  estimatedEntities: number;
  changes: string | null;
  newProbableEntities: string[] | null;
}

export interface RoundAnalysisModel {
  roundMetadata: RoundMetadata;
  questions: Question[] | null;
  refinedDomainAnalysis: RefinedDomainAnalysis;
  updatedDomains: UpdatedDomain[] | null;
  nextRoundFocus: string[] | null;
  roundId: number;
  roundNumber: number;
}

export interface PackageDto {
  packageId: number;
  name: string | null;
  description: string | null;
  order: number;
  status: string | null;
  recommendedTool: string | null;
  estimatedTimeMinutes: number;
  dependencies: string[] | null;
  fileCount: number;
}

export interface GenerationStatusResponse {
  currentPhase: string | null;
  progress: number;
  currentPackage: string | null;
  packages: PackageDto[] | null;
  errorMessage: string | null;
}

export interface PlanHighlight {
  text: string | null;
  sortOrder: number;
}

export interface PlanEntity {
  id: number;
  stripePriceId: string | null;
  name: string | null;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  domainCredits: number;
  microserviceCredits: number;
  isContactSales: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  creditsSummary: string | null;
  isDomainOnly: boolean;
  pricingDisplay: string | null;
  highlights: PlanHighlight[] | null;
}

export interface JwtRequest {
  userId?: number | null;
}

export interface JwtResponse {
  accessToken: string | null;
  expirationTime: string;
  tokenType: string;
}

export interface SubscribeRequest {
  userId: number;
  planId: number;
  successUrl: string | null;
  cancelUrl: string | null;
}

export interface CancelSubscriptionRequest {
  userId: number;
}

export interface StrategyResult<T> {
  data: T;
  errors: Record<string, string> | null;
  hasErrors: boolean;
}

export interface ProblemDetails {
  type: string | null;
  title: string | null;
  status: number | null;
  detail: string | null;
  instance: string | null;
}

// User type for auth context
export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
}
