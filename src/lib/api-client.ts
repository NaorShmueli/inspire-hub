import type {
  StartSessionRequest,
  StartSessionResponse,
  SubmitAnswersRequest,
  RoundAnalysisModel,
  GenerationStatusResponse,
  PlanEntity,
  JwtResponse,
  SubscribeRequest,
  StrategyResult,
  UserCreditsEntity,
  ConversationSession,
  SessionMetadata,
  CreditPackEntity,
  CreditPackRequest,
  UserSubscriptionEntity,
  ContactSalesRequest,
  FeedbackRequest,
  ProblemDetails,
} from "./api-types";

// Custom error class for API errors with ProblemDetails
export class ApiError extends Error {
  public problemDetails: ProblemDetails | null;

  constructor(message: string, problemDetails: ProblemDetails | null = null) {
    super(message);
    this.name = "ApiError";
    this.problemDetails = problemDetails;
  }
}

export const API_BASE_URL = "https://domforgeai.com/api";
//import.meta.env.VITE_API_URL || "https://dom-froge-ai-api.com/api";

class ApiClient {
  private accessToken: string | null = null;
  private tokenExpiration: Date | null = null;

  setTokens(accessToken: string, expirationTime?: string | Date) {
    this.accessToken = accessToken;
    if (expirationTime) {
      this.tokenExpiration = new Date(expirationTime);
      localStorage.setItem("token_expiration", this.tokenExpiration.toISOString());
    }
    localStorage.setItem("access_token", accessToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.tokenExpiration = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_expiration");
  }

  loadTokens() {
    this.accessToken = localStorage.getItem("access_token");
    const expiration = localStorage.getItem("token_expiration");
    if (expiration) {
      this.tokenExpiration = new Date(expiration);
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Check if token is expired or about to expire (within 1 minute)
  isTokenExpired(): boolean {
    if (!this.tokenExpiration) return false;
    const now = new Date();
    const bufferMs = 60 * 1000; // 1 minute buffer
    return now.getTime() >= this.tokenExpiration.getTime() - bufferMs;
  }
  private async requestBlob(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Blob> {
    // Ensure tokens are loaded from localStorage
    if (!this.accessToken) {
      this.loadTokens();
    }

    // Proactively refresh if token is expired
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }

    const headers: HeadersInit = {
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Important: send cookies for refresh token
    });

    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        (headers as Record<string, string>)["Authorization"] =
          `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });

        if (!retryResponse.ok) {
          throw new Error(`API Error: ${retryResponse.status}`);
        }

        return retryResponse.blob();
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to download file (${response.status})`);
    }

    return response.blob();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    // Ensure tokens are loaded
    if (!this.accessToken) {
      this.loadTokens();
    }

    // Proactively refresh if token is expired
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Important: send cookies for refresh token
    });

    if (response.status === 401) {
      // Try to refresh token using HttpOnly cookie
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        (headers as Record<string, string>)["Authorization"] =
          `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });
        if (!retryResponse.ok) {
          throw new Error(`API Error: ${retryResponse.status}`);
        }
        return retryResponse.json();
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Check if it's a ProblemDetails response
      const problemDetails: ProblemDetails | null =
        errorData.title || errorData.detail
          ? {
              type: errorData.type || null,
              title: errorData.title || null,
              status: errorData.status || response.status,
              detail: errorData.detail || null,
              instance: errorData.instance || null,
            }
          : null;

      throw new ApiError(
        errorData.detail || errorData.title || `API Error: ${response.status}`,
        problemDetails,
      );
    }

    // Handle 202 Accepted (may have content or no content)
    if (response.status === 202) {
      const text = await response.text();
      if (text) {
        return JSON.parse(text) as T;
      }
      return {} as T;
    }

    // Handle 204 No Content or empty responses
    if (response.status === 204) {
      return {} as T;
    }

    // Handle empty body (e.g., DELETE success with 200)
    const text = await response.text();
    if (!text) {
      return {} as T;
    }
    return JSON.parse(text) as T;
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      // Refresh token is sent automatically via HttpOnly cookie
      const response = await fetch(`${API_BASE_URL}/Token/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // This sends the HttpOnly refresh_token cookie
      });
      if (response.ok) {
        const data: StrategyResult<JwtResponse> = await response.json();
        if (data.data?.accessToken) {
          this.setTokens(data.data.accessToken, data.data.expirationTime);
          return true;
        }
      }
    } catch {
      // Refresh failed
    }
    this.clearTokens();
    return false;
  }

  // Auth endpoints
  getGoogleLoginUrl(): string {
    return `${API_BASE_URL}/GoogleLogin/login`;
  }

  async createToken(userId: number): Promise<StrategyResult<JwtResponse>> {
    return this.request<StrategyResult<JwtResponse>>("/Token/create", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  // Credit balance endpoint
  async getCreditBalance(): Promise<UserCreditsEntity> {
    return this.request<UserCreditsEntity>("/conversation/credit/balance");
  }

  // Conversation endpoints
  async startSession(data: StartSessionRequest): Promise<StartSessionResponse> {
    return this.request<StartSessionResponse>("/conversation/start", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async submitCoreAnswers(
    sessionId: number,
    data: SubmitAnswersRequest,
  ): Promise<RoundAnalysisModel> {
    return this.request<RoundAnalysisModel>(
      `/conversation/${sessionId}/core-answers`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async submitFollowupAnswers(
    sessionId: number,
    roundNumber: number,
    data: SubmitAnswersRequest,
  ): Promise<RoundAnalysisModel> {
    return this.request<RoundAnalysisModel>(
      `/conversation/${sessionId}/followup-answers/${roundNumber}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async approveDomain(sessionId: number): Promise<void> {
    return this.request<void>(`/conversation/${sessionId}/approve-domain`, {
      method: "POST",
    });
  }

  async getSessionStatus(sessionId: number): Promise<GenerationStatusResponse> {
    return this.request<GenerationStatusResponse>(
      `/conversation/${sessionId}/status`,
    );
  }

  // Get sessions by status (completed or In analyze)
  async getSessionsByStatus(status: string): Promise<ConversationSession[]> {
    return this.request<ConversationSession[]>(
      `/conversation/all/by/${status}`,
    );
  }

  // Get session metadata with rounds
  async getSessionMetadata(sessionId: number): Promise<SessionMetadata> {
    return this.request<SessionMetadata>(`/conversation/metadata/${sessionId}`);
  }

  // Delete session
  async deleteSession(sessionId: number): Promise<void> {
    return this.request<void>(`/conversation/delete/${sessionId}`, {
      method: "DELETE",
    });
  }

  // Plans endpoints - returns single plan or array based on API response
  async getPlans(): Promise<StrategyResult<PlanEntity | PlanEntity[]>> {
    return this.request<StrategyResult<PlanEntity | PlanEntity[]>>(
      "/Plans/details",
    );
  }

  async getUserPlan(userId: number): Promise<UserSubscriptionEntity> {
    return this.request<UserSubscriptionEntity>(`/Plans/user/plan/${userId}`);
  }

  async getCreditPacks(): Promise<StrategyResult<CreditPackEntity[]>> {
    return this.request<StrategyResult<CreditPackEntity[]>>(
      "/Plans/creditPacks",
    );
  }

  // Subscription endpoints
  async subscribe(
    data: SubscribeRequest,
  ): Promise<{ sessionId: string; checkoutUrl: string }> {
    return this.request<{ sessionId: string; checkoutUrl: string }>(
      "/StripeSubscription/subscribe",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async cancelSubscription(userId: number): Promise<void> {
    return this.request<void>("/StripeSubscription/cancel", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async buyCreditPack(
    data: CreditPackRequest,
  ): Promise<{ sessionId: string; checkoutUrl: string }> {
    return this.request<{ sessionId: string; checkoutUrl: string }>(
      "/StripeSubscription/buy/pack",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  // Download endpoint
  getDownloadUrl(sessionId: number): string {
    return `${API_BASE_URL}/system/download/session/${sessionId}`;
  }

  async downloadProject(sessionId: number): Promise<Blob> {
    return this.requestBlob(`/system/download/session/${sessionId}`, {
      method: "GET",
    });
  }

  // User Inputs endpoints
  async submitContactSales(data: ContactSalesRequest): Promise<void> {
    return this.request<void>("/UserInputs/contact-sales", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async submitFeedback(data: FeedbackRequest): Promise<void> {
    return this.request<void>("/UserInputs/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
