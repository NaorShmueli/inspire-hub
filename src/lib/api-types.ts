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

export interface ConversationRounds {
  roundId: number;
  sessionId: number;
  roundNumber: number;
  roundType: string | null;
  questionsAnswersJson: string | null;
  aiAnalysisJson: string | null;
  confidenceScore: number | null;
  createdAt: string;
  answeredAt: string | null;
  analyzedAt: string | null;
}

export interface SessionMetadata {
  session: ConversationSession;
  rounds: ConversationRounds[] | null;
}

export interface FoundationQuestion {
  question_id: number;
  sectionId: number;
  questionOrder: number;
  question: string | null;
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
  question_id: number;
  question: string | null;
  reason: string | null;
  affects_domains: string[] | null;
  priority: string | null;
  expected_answer_type: string | null;
  follow_up_if_answer: Record<string, string> | null;
}

export interface RoundMetadata {
  round_number: number;
  confidence_score_before: number;
  confidence_score_after_expected: number;
  questions_count: number;
  requires_another_round: boolean;
  reasoning: string | null;
}

export interface ChangeFromPrevious {
  change_type: string | null;
  description: string | null;
}

export interface IdentifiedRisk {
  risk: string | null;
  severity: string | null;
  description: string | null;
}

export interface RefinedDomainAnalysis {
  changes_from_previous: ChangeFromPrevious[] | null;
  identified_risks: IdentifiedRisk[] | null;
  assumptions_to_validate: string[] | null;
}

export interface UpdatedDomain {
  domain_name: string | null;
  estimated_entities: number;
  changes: string | null;
  new_probable_entities: string[] | null;
}

// Domain Analysis Result types
export interface AnalysisSummary {
  total_domains_identified: number;
  confidence_score: number;
  requires_followup: boolean;
  reasoning: string | null;
}

export interface IdentifiedDomain {
  domain_name: string | null;
  description: string | null;
  business_capability: string | null;
  estimated_entities: number;
  probable_entities: string[] | null;
  key_responsibilities: string[] | null;
  user_types_served: string[] | null;
  confidence: number;
}

export interface DomainRelationship {
  from_domain: string | null;
  to_domain: string | null;
  relationship_type: string | null;
  interaction_pattern: string | null;
  description: string | null;
  data_shared: string[] | null;
  notes: string | null;
}

export interface CrossCuttingConcern {
  concern: string | null;
  affected_domains: string[] | null;
  recommendation: string | null;
  notes: string | null;
}

export interface IntegrationPoint {
  external_system: string | null;
  integrating_domain: string | null;
  integration_type: string | null;
  purpose: string | null;
  criticality: string | null;
}

export interface ComplianceImpact {
  regulation: string | null;
  affected_domains: string[] | null;
  requirements: string[] | null;
  architectural_impact: string | null;
}

export interface ScaleConsiderations {
  expected_load: string | null;
  high_traffic_domains: string[] | null;
  recommendations: string[] | null;
}

export interface PotentialIssue {
  issue: string | null;
  description: string | null;
  recommendation: string | null;
  severity: string | null;
}

export interface RecommendedMicroservicesCount {
  minimum: number;
  optimal: number;
  maximum: number;
  rationale: string | null;
  optimal_service_names: string[] | null;
}

export interface DomainAnalysisResult {
  analysis_summary: AnalysisSummary | null;
  identified_domains: IdentifiedDomain[] | null;
  domain_relationships: DomainRelationship[] | null;
  cross_cutting_concerns: CrossCuttingConcern[] | null;
  integration_points: IntegrationPoint[] | null;
  compliance_impacts: ComplianceImpact[] | null;
  scale_considerations: ScaleConsiderations | null;
  potential_issues: PotentialIssue[] | null;
  recommended_microservices_count: RecommendedMicroservicesCount | null;
}

export interface RoundAnalysisModel {
  round_metadata: RoundMetadata;
  questions: Question[] | null;
  refined_domain_analysis: RefinedDomainAnalysis;
  updated_domains: UpdatedDomain[] | null;
  next_round_focus: string[] | null;
  last_analysis_data: DomainAnalysisResult | null;
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

export interface CreditPackEntity {
  creditPackId: number;
  name: string | null;
  description: string | null;
  credits: number;
  price: number;
  active: boolean;
  createdAt: string;
}

export interface CreditPackRequest {
  userId: number;
  packId: number;
  successUrl: string | null;
  cancelUrl: string | null;
}

export interface UserCreditsEntity {
  userId: number;
  creditsBalance: number;
  lastReset: string;
  createdAt: string;
  updatedAt: string;
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

// Chat message type for chat-like questionnaire
export interface ChatMessage {
  id: string;
  type: "system" | "ai" | "user";
  content: string;
  timestamp: Date;
  metadata?: {
    questionId?: number;
    roundNumber?: number;
    confidenceScore?: number;
    domains?: UpdatedDomain[];
    analysis?: RoundAnalysisModel;
    domainAnalysis?: DomainAnalysisResult;
  };
}
