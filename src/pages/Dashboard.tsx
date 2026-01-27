import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderOpen,
  Clock,
  CheckCircle2,
  Loader2,
  LogOut,
  ChevronRight,
  Download,
  PlayCircle,
  CreditCard,
  Search,
  Trash2,
  ExternalLink,
  Layers,
  Database,
  FileCode,
  MessageSquare,
  Eye,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  cacheFoundationQuestions,
  getCachedFoundationQuestions,
} from "@/lib/foundation-question-cache";
import { toast } from "@/hooks/use-toast";
import type {
  ConversationSession,
  RoundAnalysisModel,
  DomainAnalysisResult,
} from "@/lib/api-types";

import { DomainAnalysisPanel } from "@/components/DomainAnalysisPanel";
import logo from "@/assets/logo.jpg";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const projectDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [activeTab, setActiveTab] = useState("completed");
  const [searchFilter, setSearchFilter] = useState("");
  const [completedSessions, setCompletedSessions] = useState<
    ConversationSession[]
  >([]);
  const [inAnalyzeSessions, setInAnalyzeSessions] = useState<
    ConversationSession[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] =
    useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "newProject" | "download" | "continue";
    sessionId?: number;
    event?: React.MouseEvent;
  } | null>(null);
  const [isCheckingCredits, setIsCheckingCredits] = useState(false);

  // Analysis dialog state
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [analysisData, setAnalysisData] = useState<{
    projectName: string;
    analysis: RoundAnalysisModel | null;
    domainAnalysis: DomainAnalysisResult | null;
  } | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const checkCreditsAndProceed = async (
    actionType: "newProject" | "download" | "continue",
    sessionId?: number,
    event?: React.MouseEvent
  ) => {
    setIsCheckingCredits(true);
    try {
      const creditData = await apiClient.getCreditBalance();
      if (creditData.creditsBalance > 2) {
        // Proceed with action
        if (actionType === "newProject") {
          setShowNewProject(true);
        } else if (actionType === "download" && sessionId && event) {
          await executeDownload(sessionId, event);
        } else if (actionType === "continue" && sessionId && event) {
          await executeContinue(sessionId, event);
        }
      } else {
        // Show insufficient credits dialog
        setPendingAction({ type: actionType, sessionId, event });
        setShowInsufficientCreditsDialog(true);
      }
    } catch (error) {
      console.error("Failed to check credit balance:", error);
      toast({
        title: "Failed to check credits",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCheckingCredits(false);
    }
  };

  // Fetch sessions on mount and tab change
  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const [completed, inAnalyze] = await Promise.all([
          apiClient.getSessionsByStatus("completed"),
          apiClient.getSessionsByStatus("In analyze"),
        ]);
        setCompletedSessions(completed);
        setInAnalyzeSessions(inAnalyze);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        toast({
          title: "Failed to load projects",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Prevent the description textarea from collapsing on first mount after SPA navigation.
  useLayoutEffect(() => {
    if (!showNewProject) return;
    const el = projectDescriptionRef.current;
    if (!el) return;

    const apply = () => {
      el.style.setProperty("min-height", "120px", "important");
      el.style.setProperty("height", "120px", "important");
    };

    apply();
    const raf = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(raf);
  }, [showNewProject]);

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiClient.startSession({
        userId: user?.id || 1,
        projectName: projectName.trim(),
        projectDescription: projectDescription.trim() || null,
      });

      cacheFoundationQuestions(
        response.session.sessionId,
        response.foundationQuestions
      );

      navigate(`/project/${response.session.sessionId}/questionnaire`, {
        state: {
          session: response.session,
          questions: response.foundationQuestions,
        },
      });
    } catch (error) {
      console.error("Failed to create project:", error);
      if (error instanceof ApiError && error.problemDetails) {
        toast({
          title: error.problemDetails.title || "Failed to create project",
          description: error.problemDetails.detail || "Please try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to create project",
          description:
            error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await checkCreditsAndProceed("download", sessionId, e);
  };

  const executeDownload = async (sessionId: number, e: React.MouseEvent) => {
    try {
      const blob = await apiClient.downloadProject(sessionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-${sessionId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Download started",
        description: "Your project package is downloading",
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleContinue = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await checkCreditsAndProceed("continue", sessionId, e);
  };

  const executeContinue = async (sessionId: number, e: React.MouseEvent) => {
    try {
      const metadata = await apiClient.getSessionMetadata(sessionId);
      const session = metadata.session;
      const currentPhase = session.currentPhase;
      const confidenceScore = session.confidenceScore ?? 0;
      const rawRounds = (metadata as any).rounds || [];

      // If generating_packages, go to status page
      if (currentPhase === "generating_packages" || currentPhase === "queued") {
        navigate(`/project/${sessionId}/status`);
        return;
      }

      // Normalize round fields (backend may return different casing)
      const normalizedRounds = rawRounds
        .map((r: any) => {
          const roundNumber =
            r.roundNumber ?? r.round_number ?? r.RoundNumber ?? 0;
          const aiAnalysisJson =
            r.aiAnalysisJson ?? r.ai_analysis_json ?? r.AiAnalysisJson ?? null;
          const questionsAnswersJson =
            r.questionsAnswersJson ??
            r.questions_answers_json ??
            r.QuestionsAnswersJson ??
            null;

          return {
            ...r,
            roundNumber,
            aiAnalysisJson,
            questionsAnswersJson,
          };
        })
        .sort((a: any, b: any) => a.roundNumber - b.roundNumber);

      // If failed, show domain approval UI with chat history
      if (currentPhase === "failed") {
        const lastRound =
          normalizedRounds.length > 0
            ? normalizedRounds[normalizedRounds.length - 1]
            : null;
        const lastAnalysis = lastRound?.aiAnalysisJson
          ? JSON.parse(lastRound.aiAnalysisJson)
          : null;

        navigate(`/project/${sessionId}/questionnaire`, {
          state: {
            session: session,
            resumeData: {
              rounds: normalizedRounds,
              showDomainApproval: true,
              lastAnalysis: lastAnalysis,
              failed: true,
            },
          },
        });
        return;
      }

      // If confidenceScore < 85, continue rounds
      if (confidenceScore < 85) {
        const nextRoundNumber = normalizedRounds.length + 1;

        // Find the first incomplete round (aiAnalysisJson null OR empty string)
        const incompleteRound = normalizedRounds.find(
          (r: any) =>
            r.aiAnalysisJson === null ||
            r.aiAnalysisJson === "" ||
            r.aiAnalysisJson === "null"
        );

        if (incompleteRound) {
          const questionsAnswers = incompleteRound.questionsAnswersJson
            ? JSON.parse(incompleteRound.questionsAnswersJson)
            : {};

          const hasEmptyAnswers = Object.values(questionsAnswers).every(
            (val) => val === "" || val === null
          );

          navigate(`/project/${sessionId}/questionnaire`, {
            state: {
              session: session,
              resumeData: {
                rounds: normalizedRounds,
                currentRound: incompleteRound,
                questionsAnswers,
                hasEmptyAnswers,
                roundNumber: incompleteRound.roundNumber,
              },
            },
          });
          return;
        }

        // No incomplete round found, start new round
        const lastRound =
          normalizedRounds.length > 0
            ? normalizedRounds[normalizedRounds.length - 1]
            : null;
        const lastAnalysis = lastRound?.aiAnalysisJson
          ? JSON.parse(lastRound.aiAnalysisJson)
          : null;

        navigate(`/project/${sessionId}/questionnaire`, {
          state: {
            session: session,
            resumeData: {
              rounds: normalizedRounds,
              roundNumber: nextRoundNumber,
              lastAnalysis: lastAnalysis,
              continueRounds: true,
            },
          },
        });
        return;
      }

      // No rounds yet - resume foundation questions (no API call needed)
      if (normalizedRounds.length === 0) {
        const cachedQuestions = getCachedFoundationQuestions(sessionId);

        if (cachedQuestions && cachedQuestions.length > 0) {
          navigate(`/project/${sessionId}/questionnaire`, {
            state: {
              session: session,
              questions: cachedQuestions,
            },
          });
          return;
        }

        // Fallback: start a new session (backend doesn't support restarting by sessionId)
        const safeProjectName =
          (session.projectName ?? "").trim() || `Project ${sessionId}`;

        const response = await apiClient.startSession({
          userId: user?.id || 1,
          projectName: safeProjectName,
          projectDescription: session.projectDescription || null,
        });

        cacheFoundationQuestions(
          response.session.sessionId,
          response.foundationQuestions
        );

        toast({
          title: "Started a new draft",
          description:
            "We couldn't restore the original draft questions, so we started a new session.",
        });

        navigate(`/project/${response.session.sessionId}/questionnaire`, {
          state: {
            session: response.session,
            questions: response.foundationQuestions,
          },
        });
        return;
      }

      // If nothing is incomplete and confidence >= 85, show domain approval
      const lastRound = normalizedRounds[normalizedRounds.length - 1];
      const analysis = lastRound.aiAnalysisJson
        ? (JSON.parse(lastRound.aiAnalysisJson) as any)
        : null;

      navigate(`/project/${sessionId}/questionnaire`, {
        state: {
          session: session,
          resumeData: {
            rounds: normalizedRounds,
            showDomainApproval: Boolean(
              analysis && !analysis.round_metadata?.requires_another_round
            ),
            lastAnalysis: analysis,
          },
        },
      });
    } catch (error) {
      console.error("Failed to continue session:", error);
      toast({
        title: "Failed to continue",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(
    null
  );

  const handleDelete = async (sessionId: number, projectName: string) => {
    setDeletingSessionId(sessionId);
    try {
      await apiClient.deleteSession(sessionId);
      // Remove from both lists
      setCompletedSessions((prev) =>
        prev.filter((s) => s.sessionId !== sessionId)
      );
      setInAnalyzeSessions((prev) =>
        prev.filter((s) => s.sessionId !== sessionId)
      );
      toast({
        title: "Project deleted",
        description: `"${projectName}" has been permanently deleted`,
      });
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast({
        title: "Failed to delete project",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setDeletingSessionId(null);
    }
  };

  // Helper to parse DomainAnalysisResult from raw data
  const parseDomainAnalysisResult = (
    data: any
  ): DomainAnalysisResult | null => {
    if (!data) return null;

    return {
      analysis_summary: data.analysis_summary || data.analysisSummary || null,
      identified_domains: (
        data.identified_domains ||
        data.identifiedDomains ||
        []
      ).map((d: any) => ({
        domain_name: d.domain_name || d.domainName || null,
        description: d.description || null,
        business_capability:
          d.business_capability || d.businessCapability || null,
        estimated_entities: d.estimated_entities || d.estimatedEntities || 0,
        probable_entities: d.probable_entities || d.probableEntities || null,
        key_responsibilities:
          d.key_responsibilities || d.keyResponsibilities || null,
        user_types_served: d.user_types_served || d.userTypesServed || null,
        confidence: d.confidence || 0,
      })),
      domain_relationships: (
        data.domain_relationships ||
        data.domainRelationships ||
        []
      ).map((r: any) => ({
        from_domain: r.from_domain || r.fromDomain || null,
        to_domain: r.to_domain || r.toDomain || null,
        relationship_type: r.relationship_type || r.relationshipType || null,
        interaction_pattern:
          r.interaction_pattern || r.interactionPattern || null,
        description: r.description || null,
        data_shared: r.data_shared || r.dataShared || null,
        notes: r.notes || null,
      })),
      cross_cutting_concerns: (
        data.cross_cutting_concerns ||
        data.crossCuttingConcerns ||
        []
      ).map((c: any) => ({
        concern: c.concern || null,
        affected_domains: c.affected_domains || c.affectedDomains || null,
        recommendation: c.recommendation || null,
        notes: c.notes || null,
      })),
      integration_points: (
        data.integration_points ||
        data.integrationPoints ||
        []
      ).map((i: any) => ({
        external_system: i.external_system || i.externalSystem || null,
        integrating_domain: i.integrating_domain || i.integratingDomain || null,
        integration_type: i.integration_type || i.integrationType || null,
        purpose: i.purpose || null,
        criticality: i.criticality || null,
      })),
      compliance_impacts: (
        data.compliance_impacts ||
        data.complianceImpacts ||
        []
      ).map((c: any) => ({
        regulation: c.regulation || null,
        affected_domains: c.affected_domains || c.affectedDomains || null,
        requirements: c.requirements || null,
        architectural_impact:
          c.architectural_impact || c.architecturalImpact || null,
      })),
      scale_considerations:
        data.scale_considerations || data.scaleConsiderations || null,
      potential_issues: (
        data.potential_issues ||
        data.potentialIssues ||
        []
      ).map((p: any) => ({
        issue: p.issue || null,
        description: p.description || null,
        recommendation: p.recommendation || null,
        severity: p.severity || null,
      })),
      recommended_microservices_count:
        data.recommended_microservices_count ||
        data.recommendedMicroservicesCount ||
        null,
    };
  };

  // Helper to check if an object looks like a DomainAnalysisResult
  const isDomainAnalysisResult = (obj: any): boolean => {
    if (!obj || typeof obj !== "object") return false;
    return (
      obj.analysis_summary ||
      obj.analysisSummary ||
      obj.identified_domains ||
      obj.identifiedDomains ||
      obj.recommended_microservices_count ||
      obj.recommendedMicroservicesCount
    );
  };

  // Parse AI analysis JSON
  const parseAiAnalysisJson = (
    jsonString: string
  ): RoundAnalysisModel | null => {
    try {
      const parsed = JSON.parse(jsonString);

      if (
        isDomainAnalysisResult(parsed) &&
        !parsed.round_metadata &&
        !parsed.roundMetadata
      ) {
        return {
          round_metadata: {
            round_number: 0,
            confidence_score_before: 0,
            confidence_score_after_expected:
              parsed.analysis_summary?.confidence_score ||
              parsed.analysisSummary?.confidenceScore ||
              0,
            questions_count: 0,
            requires_another_round:
              parsed.analysis_summary?.requires_followup ??
              parsed.analysisSummary?.requiresFollowup ??
              false,
            reasoning:
              parsed.analysis_summary?.reasoning ||
              parsed.analysisSummary?.reasoning ||
              null,
          },
          questions: [],
          refined_domain_analysis: null,
          updated_domains: [],
          next_round_focus: null,
          last_analysis_data: parseDomainAnalysisResult(parsed),
          roundId: 0,
          roundNumber: 0,
        };
      }

      let lastAnalysisData =
        parsed.last_analysis_data ||
        parsed.lastAnalysisData ||
        parsed.LastAnalysisData;
      if (!lastAnalysisData && isDomainAnalysisResult(parsed)) {
        lastAnalysisData = parsed;
      }

      return {
        round_metadata: parsed.round_metadata ||
          parsed.roundMetadata || {
            round_number:
              parsed.round_metadata?.round_number ||
              parsed.roundMetadata?.roundNumber ||
              0,
            confidence_score_before:
              parsed.round_metadata?.confidence_score_before ||
              parsed.roundMetadata?.confidenceScoreBefore ||
              0,
            confidence_score_after_expected:
              parsed.round_metadata?.confidence_score_after_expected ||
              parsed.roundMetadata?.confidenceScoreAfterExpected ||
              0,
            questions_count:
              parsed.round_metadata?.questions_count ||
              parsed.roundMetadata?.questionsCount ||
              0,
            requires_another_round:
              parsed.round_metadata?.requires_another_round ??
              parsed.roundMetadata?.requiresAnotherRound ??
              true,
            reasoning:
              parsed.round_metadata?.reasoning ||
              parsed.roundMetadata?.reasoning ||
              null,
          },
        questions: (parsed.questions || []).map((q: any) => ({
          question_id: q.question_id || q.questionId || 0,
          question: q.question || q.questionText || null,
          reason: q.reason || null,
          affects_domains: q.affects_domains || q.affectsDomains || null,
          priority: q.priority || null,
          expected_answer_type:
            q.expected_answer_type || q.expectedAnswerType || null,
          follow_up_if_answer:
            q.follow_up_if_answer || q.followUpIfAnswer || null,
        })),
        refined_domain_analysis:
          parsed.refined_domain_analysis ||
          parsed.refinedDomainAnalysis ||
          null,
        updated_domains: (
          parsed.updated_domains ||
          parsed.updatedDomains ||
          []
        ).map((d: any) => ({
          domain_name: d.domain_name || d.domainName || null,
          estimated_entities: d.estimated_entities || d.estimatedEntities || 0,
          changes: d.changes || null,
          new_probable_entities:
            d.new_probable_entities || d.newProbableEntities || null,
        })),
        next_round_focus:
          parsed.next_round_focus || parsed.nextRoundFocus || null,
        last_analysis_data: parseDomainAnalysisResult(lastAnalysisData),
        roundId: parsed.roundId || parsed.round_id || 0,
        roundNumber: parsed.roundNumber || parsed.round_number || 0,
      };
    } catch {
      return null;
    }
  };

  const handleViewAnalysis = async (
    session: ConversationSession,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setIsLoadingAnalysis(true);
    setShowAnalysisDialog(true);

    try {
      const metadata = await apiClient.getSessionMetadata(session.sessionId);
      const rounds = (metadata as any).rounds || [];

      // Find the last round with AI analysis
      let fullAnalysis: RoundAnalysisModel | null = null;
      for (let i = rounds.length - 1; i >= 0; i--) {
        const round = rounds[i];
        const aiAnalysisJson =
          round.aiAnalysisJson ??
          round.ai_analysis_json ??
          round.AiAnalysisJson ??
          null;
        if (
          aiAnalysisJson &&
          aiAnalysisJson !== "" &&
          aiAnalysisJson !== "null"
        ) {
          fullAnalysis = parseAiAnalysisJson(aiAnalysisJson);
          break;
        }
      }

      setAnalysisData({
        projectName: session.projectName || "Project",
        analysis: fullAnalysis,
        domainAnalysis: fullAnalysis?.last_analysis_data || null,
      });
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
      toast({
        title: "Failed to load analysis",
        description: "Please try again",
        variant: "destructive",
      });
      setShowAnalysisDialog(false);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const renderSessionCard = (
    session: ConversationSession,
    isCompleted: boolean
  ) => (
    <motion.div
      key={session.sessionId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Clock className="w-5 h-5 text-primary" />
          )}
          <div>
            <h3 className="font-semibold">{session.projectName}</h3>
            <p className="text-sm text-muted-foreground">
              Created {new Date(session.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {session.confidenceScore && (
            <div className="text-right">
              <div className="text-sm font-medium">
                {Math.round(session.confidenceScore * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <AlertDialog
              open={deletingSessionId === session.sessionId ? false : undefined}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Are you sure you want to delete "{session.projectName}"?
                    </p>
                    <p className="font-medium text-destructive">
                      This will permanently delete all domains, microservices,
                      files, and session analysis data. This action cannot be
                      undone.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(
                        session.sessionId,
                        session.projectName || ""
                      );
                    }}
                  >
                    Delete Forever
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {isCompleted ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleViewAnalysis(session, e)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Analysis</TooltipContent>
                </Tooltip>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleDownload(session.sessionId, e)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </>
            ) : (
              <Button
                variant="hero-outline"
                size="sm"
                onClick={(e) => handleContinue(session.sessionId, e)}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderEmptyState = (message: string) => (
    <div className="bg-card/50 border border-border/50 rounded-2xl p-12 text-center">
      <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-medium mb-2">No projects</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
      <Button variant="hero-outline" onClick={() => setShowNewProject(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Create New Project
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="DomForgeAI"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="text-xl font-bold">
              Dom<span className="text-gradient">Forge</span>AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/feedback")}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Feedback
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/my-plan")}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              My Plan
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back,{" "}
                <span className="text-gradient">
                  {user?.name || "Developer"}
                </span>
              </h1>
              <p className="text-muted-foreground">
                Create new architecture packages or continue existing projects
              </p>
            </div>
            <Button
              variant="hero"
              size="lg"
              onClick={() => checkCreditsAndProceed("newProject")}
              disabled={isCheckingCredits}
              className="shrink-0"
            >
              {isCheckingCredits ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              New Project
            </Button>
          </div>

          {/* New Project Form */}
          {showNewProject && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/50 rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-xl font-semibold">Create New Project</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Healthcare E-commerce Platform"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Description (optional)
                  </label>
                  <textarea
                    ref={projectDescriptionRef}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Brief description of your project goals, target users, and key features..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                    style={{ minHeight: 120, height: 120 }}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowNewProject(false);
                    setProjectName("");
                    setProjectDescription("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  onClick={handleCreateProject}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Start Project
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Projects Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setSearchFilter("");
            }}
            className="space-y-4"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger
                value="completed"
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Completed ({completedSessions.length})
              </TabsTrigger>
              <TabsTrigger
                value="in-analyze"
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                In Analyze ({inAnalyzeSessions.length})
              </TabsTrigger>
            </TabsList>

            {/* Search Filter & External Tool Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative max-w-md flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search by project name..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
                />
              </div>

              {/* External Tool Buttons */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        window.open("https://structurizr.com/dsl", "_blank")
                      }
                    >
                      <Layers className="w-4 h-4" />
                      C4 Editor
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="max-w-xs text-center"
                  >
                    <p className="font-medium mb-1">
                      C4 Architecture Visualizer
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use this tool to visualize your system architecture. Copy
                      the C4 DSL content from your downloaded package and paste
                      it into the Structurizr editor to generate interactive
                      architecture diagrams.
                    </p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        window.open("https://dbdiagram.io/d", "_blank")
                      }
                    >
                      <Database className="w-4 h-4" />
                      DBML Editor
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="max-w-xs text-center"
                  >
                    <p className="font-medium mb-1">
                      Database Schema Visualizer
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use this tool to visualize your database design. Copy the
                      DBML content from each microservice's package and paste it
                      into dbdiagram.io to generate entity-relationship
                      diagrams.
                    </p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        window.open("https://editor.swagger.io/", "_blank")
                      }
                    >
                      <FileCode className="w-4 h-4" />
                      OpenAPI Editor
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="max-w-xs text-center"
                  >
                    <p className="font-medium mb-1">REST API Visualizer</p>
                    <p className="text-xs text-muted-foreground">
                      Use this tool to visualize your API specifications. Copy
                      the OpenAPI YAML content from each microservice's package
                      and paste it into Swagger Editor to explore endpoints,
                      schemas, and test API calls.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <TabsContent value="completed" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                (() => {
                  const filtered = completedSessions.filter((session) =>
                    session.projectName
                      ?.toLowerCase()
                      .includes(searchFilter.toLowerCase())
                  );
                  return filtered.length === 0 ? (
                    searchFilter ? (
                      <div className="bg-card/50 border border-border/50 rounded-2xl p-12 text-center">
                        <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium mb-2">
                          No results found
                        </h3>
                        <p className="text-muted-foreground">
                          No projects match "{searchFilter}"
                        </p>
                      </div>
                    ) : (
                      renderEmptyState("No completed projects yet")
                    )
                  ) : (
                    <div className="grid gap-4">
                      {filtered.map((session) =>
                        renderSessionCard(session, true)
                      )}
                    </div>
                  );
                })()
              )}
            </TabsContent>

            <TabsContent value="in-analyze" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                (() => {
                  const filtered = inAnalyzeSessions.filter((session) =>
                    session.projectName
                      ?.toLowerCase()
                      .includes(searchFilter.toLowerCase())
                  );
                  return filtered.length === 0 ? (
                    searchFilter ? (
                      <div className="bg-card/50 border border-border/50 rounded-2xl p-12 text-center">
                        <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium mb-2">
                          No results found
                        </h3>
                        <p className="text-muted-foreground">
                          No projects match "{searchFilter}"
                        </p>
                      </div>
                    ) : (
                      renderEmptyState("No projects in analysis")
                    )
                  ) : (
                    <div className="grid gap-4">
                      {filtered.map((session) =>
                        renderSessionCard(session, false)
                      )}
                    </div>
                  );
                })()
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>


      {/* Insufficient Credits Dialog */}
      <Dialog
        open={showInsufficientCreditsDialog}
        onOpenChange={setShowInsufficientCreditsDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-destructive" />
              Insufficient Credits
            </DialogTitle>
            <DialogDescription>
              You need more than 2 credits to perform this action.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-muted-foreground">
                Your current credit balance is too low. Upgrade your
                subscription or purchase a credit pack to continue using
                DomForgeAI.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowInsufficientCreditsDialog(false);
                setPendingAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={() => {
                setShowInsufficientCreditsDialog(false);
                setPendingAction(null);
                navigate("/my-plan");
              }}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Go to My Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analysis Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Domain Analysis - {analysisData?.projectName}
            </DialogTitle>
            <DialogDescription>
              Full AI analysis from the last completed round
            </DialogDescription>
          </DialogHeader>

          <ScrollArea type="always" className="flex-1 min-h-0 pr-4">
            {isLoadingAnalysis ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Loading analysis...
                </span>
              </div>
            ) : analysisData?.domainAnalysis || analysisData?.analysis ? (
              <DomainAnalysisPanel
                domainAnalysis={analysisData.domainAnalysis}
                domains={analysisData.analysis?.updated_domains}
                analysis={analysisData.analysis || undefined}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No analysis data available for this project.</p>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowAnalysisDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
