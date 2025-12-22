import { useState } from "react";
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";

interface ProjectSession {
  sessionId: number;
  projectName: string;
  status: "in_progress" | "generating" | "completed";
  confidenceScore: number | null;
  createdAt: string;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);

  // Mock sessions for demo - in production, fetch from API
  const [sessions] = useState<ProjectSession[]>([]);

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

      // Navigate to questionnaire with session data
      navigate(`/project/${response.session.sessionId}/questionnaire`, {
        state: { 
          session: response.session, 
          questions: response.foundationQuestions 
        },
      });
    } catch (error) {
      console.error("Failed to create project:", error);
      toast({
        title: "Failed to create project",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "generating":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

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
                Welcome back, <span className="text-gradient">{user?.name || "Developer"}</span>
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

          {/* Projects List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Projects</h2>
            
            {sessions.length === 0 ? (
              <div className="bg-card/50 border border-border/50 rounded-2xl p-12 text-center">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your first project to generate architecture packages
                </p>
                <Button 
                  variant="hero-outline" 
                  onClick={() => setShowNewProject(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {sessions.map((session) => (
                  <motion.div
                    key={session.sessionId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/project/${session.sessionId}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(session.status)}
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
                            <div className="text-xs text-muted-foreground">
                              Confidence
                            </div>
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
