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
} from "./api-types";

const API_BASE_URL = "http://localhost:5145/api";

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setTokens(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    if (refreshToken) this.refreshToken = refreshToken;
    localStorage.setItem("access_token", accessToken);
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  loadTokens() {
    this.accessToken = localStorage.getItem("access_token");
    this.refreshToken = localStorage.getItem("refresh_token");
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.refreshToken) {
      // Try to refresh token
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
        if (!retryResponse.ok) {
          throw new Error(`API Error: ${retryResponse.status}`);
        }
        return retryResponse.json();
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.title || `API Error: ${response.status}`);
    }

    // Handle 202 Accepted (may have content or no content)
    if (response.status === 202) {
      const text = await response.text();
      if (text) {
        return JSON.parse(text) as T;
      }
      return {} as T;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/Token/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.refreshToken}`,
        },
      });
      if (response.ok) {
        const data: StrategyResult<JwtResponse> = await response.json();
        if (data.data?.accessToken) {
          this.setTokens(data.data.accessToken);
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
    data: SubmitAnswersRequest
  ): Promise<RoundAnalysisModel> {
    return this.request<RoundAnalysisModel>(
      `/conversation/${sessionId}/core-answers`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async submitFollowupAnswers(
    sessionId: number,
    roundNumber: number,
    data: SubmitAnswersRequest
  ): Promise<RoundAnalysisModel> {
    return this.request<RoundAnalysisModel>(
      `/conversation/${sessionId}/followup-answers/${roundNumber}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async approveDomain(sessionId: number): Promise<void> {
    return this.request<void>(`/conversation/${sessionId}/approve-domain`, {
      method: "POST",
    });
  }

  async getSessionStatus(sessionId: number): Promise<GenerationStatusResponse> {
    return this.request<GenerationStatusResponse>(
      `/conversation/${sessionId}/status`
    );
  }

  // Get sessions by status (completed or In analyze)
  async getSessionsByStatus(status: string): Promise<ConversationSession[]> {
    return this.request<ConversationSession[]>(`/conversation/all/by/${status}`);
  }

  // Get session metadata with rounds
  async getSessionMetadata(sessionId: number): Promise<SessionMetadata> {
    return this.request<SessionMetadata>(`/conversation/metadata/${sessionId}`);
  }

  // Plans endpoints
  async getPlans(): Promise<StrategyResult<PlanEntity[]>> {
    return this.request<StrategyResult<PlanEntity[]>>("/Plans/details");
  }

  async getCreditPacks(): Promise<StrategyResult<CreditPackEntity[]>> {
    return this.request<StrategyResult<CreditPackEntity[]>>("/Plans/creditPacks");
  }

  // Subscription endpoints
  async subscribe(data: SubscribeRequest): Promise<{ sessionId: string; checkoutUrl: string }> {
    return this.request<{ sessionId: string; checkoutUrl: string }>("/StripeSubscription/subscribe", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async cancelSubscription(userId: number): Promise<void> {
    return this.request<void>("/StripeSubscription/cancel", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async buyCreditPack(data: CreditPackRequest): Promise<{ sessionId: string; checkoutUrl: string }> {
    return this.request<{ sessionId: string; checkoutUrl: string }>("/StripeSubscription/buy/pack", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Download endpoint
  getDownloadUrl(sessionId: number): string {
    return `${API_BASE_URL}/system/download/session/${sessionId}`;
  }

  async downloadProject(sessionId: number): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/system/download/session/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to download project");
    }
    return response.blob();
  }
}

export const apiClient = new ApiClient();
