import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Plus,
  FolderOpen,
  Clock,
  CheckCircle2,
  Loader2,
  LogOut,
  ChevronRight,
  Download,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import type { ConversationSession, SessionMetadata, ConversationRounds } from "@/lib/api-types";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [activeTab, setActiveTab] = useState("completed");
  const [completedSessions, setCompletedSessions] = useState<ConversationSession[]>([]);
  const [inAnalyzeSessions, setInAnalyzeSessions] = useState<ConversationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      navigate(`/project/${response.session.sessionId}/questionnaire`, {
        state: {
          session: response.session,
          questions: response.foundationQuestions,
        },
      });
    } catch (error) {
      console.error("Failed to create project:", error);
      toast({
        title: "Failed to create project",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
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
    try {
      const metadata = await apiClient.getSessionMetadata(sessionId);
      const rounds = metadata.rounds || [];
      
      // Sort rounds by roundNumber to find the latest
      const sortedRounds = [...rounds].sort((a, b) => a.roundNumber - b.roundNumber);
      
      // Find the round where aiAnalysisJson is null (incomplete round)
      const incompleteRound = sortedRounds.find(r => r.aiAnalysisJson === null);
      
      if (incompleteRound) {
        // Parse questionsAnswersJson - it contains questions as keys
        const questionsAnswers = incompleteRound.questionsAnswersJson 
          ? JSON.parse(incompleteRound.questionsAnswersJson) 
          : {};
        
        // Check if answers are empty (values are empty strings or null)
        const hasEmptyAnswers = Object.values(questionsAnswers).every(
          (val) => val === "" || val === null
        );
        
        // Build resume state with all history data
        navigate(`/project/${sessionId}/questionnaire`, {
          state: {
            session: metadata.session,
            resumeData: {
              rounds: sortedRounds,
              currentRound: incompleteRound,
              questionsAnswers,
              hasEmptyAnswers,
              roundNumber: incompleteRound.roundNumber,
            },
          },
        });
      } else if (sortedRounds.length > 0) {
        // All rounds complete, check last round for analysis
        const lastRound = sortedRounds[sortedRounds.length - 1];
        const analysis = lastRound.aiAnalysisJson 
          ? JSON.parse(lastRound.aiAnalysisJson) 
          : null;
        
        // If we have analysis, might need domain approval
        if (analysis && !analysis.round_metadata?.requires_another_round) {
          navigate(`/project/${sessionId}/questionnaire`, {
            state: {
              session: metadata.session,
              resumeData: {
                rounds: sortedRounds,
                showDomainApproval: true,
                lastAnalysis: analysis,
              },
            },
          });
        } else {
          // Go to status page
          navigate(`/project/${sessionId}/status`);
        }
      } else {
        // No rounds - start fresh with foundation questions
        toast({
          title: "Session needs to be restarted",
          description: "Please create a new project",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to continue session:", error);
      toast({
        title: "Failed to continue",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const renderSessionCard = (session: ConversationSession, isCompleted: boolean) => (
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

          {isCompleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleDownload(session.sessionId, e)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
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
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow-sm">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Dom<span className="text-gradient">Forge</span>AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back,{" "}
                <span className="text-gradient">{user?.name || "Developer"}</span>
              </h1>
              <p className="text-muted-foreground">
                Create new architecture packages or continue existing projects
              </p>
            </div>
            <Button
              variant="hero"
              size="lg"
              onClick={() => setShowNewProject(true)}
              className="shrink-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </div>

          {/* New Project Form */}
          {showNewProject && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
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
                  <input
                    type="text"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Brief description of your project"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Completed ({completedSessions.length})
              </TabsTrigger>
              <TabsTrigger value="in-analyze" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                In Analyze ({inAnalyzeSessions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="completed" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : completedSessions.length === 0 ? (
                renderEmptyState("No completed projects yet")
              ) : (
                <div className="grid gap-4">
                  {completedSessions.map((session) =>
                    renderSessionCard(session, true)
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="in-analyze" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : inAnalyzeSessions.length === 0 ? (
                renderEmptyState("No projects in analysis")
              ) : (
                <div className="grid gap-4">
                  {inAnalyzeSessions.map((session) =>
                    renderSessionCard(session, false)
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
