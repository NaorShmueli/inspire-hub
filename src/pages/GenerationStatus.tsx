import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  Zap,
  Download,
  CheckCircle2,
  Loader2,
  Package,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import type { GenerationStatusResponse, PackageDto } from "@/lib/api-types";

const GenerationStatus = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<GenerationStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await apiClient.getSessionStatus(Number(sessionId));
      setStatus(response);
      setError(null);

      if (response.currentPhase === "completed" || response.currentPhase === "failed") {
        setIsPolling(false);
        
        if (response.currentPhase === "failed") {
          toast({
            title: "Generation failed",
            description: response.errorMessage || "Please try again",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Generation complete!",
            description: "Your architecture packages are ready to download",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch status:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch status");
    }
  }, [sessionId]);

  useEffect(() => {
    fetchStatus();

    let interval: NodeJS.Timeout;
    if (isPolling) {
      interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchStatus, isPolling]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await apiClient.downloadProject(Number(sessionId));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `domforgeai-${sessionId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: "Your architecture package is being downloaded",
      });
    } catch (err) {
      console.error("Download failed:", err);
      toast({
        title: "Download failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getPackageStatusIcon = (packageStatus: string | null) => {
    switch (packageStatus) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "generating":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case "pending":
        return <Clock className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const isComplete = status?.currentPhase === "completed";
  const isFailed = status?.currentPhase === "failed";
  const isGenerating = status?.currentPhase === "generating_packages";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow-sm">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold">Generation Status</span>
              <span className="text-sm text-muted-foreground ml-2">
                Session #{sessionId}
              </span>
            </div>
          </div>

          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Status Overview */}
          <div className="bg-card border border-border/50 rounded-2xl p-8">
            <div className="text-center space-y-6">
              {/* Status Icon */}
              <div className="relative inline-flex">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  isComplete 
                    ? "bg-green-500/10 border-2 border-green-500" 
                    : isFailed 
                    ? "bg-destructive/10 border-2 border-destructive"
                    : "bg-primary/10 border-2 border-primary"
                }`}>
                  {isComplete ? (
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  ) : isFailed ? (
                    <AlertCircle className="w-12 h-12 text-destructive" />
                  ) : (
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  )}
                </div>
                {isGenerating && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                )}
              </div>

              {/* Status Text */}
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {isComplete
                    ? "Generation Complete!"
                    : isFailed
                    ? "Generation Failed"
                    : "Generating Your Architecture"}
                </h1>
                <p className="text-muted-foreground">
                  {isComplete
                    ? "Your enterprise architecture packages are ready for download"
                    : isFailed
                    ? status?.errorMessage || "An error occurred during generation"
                    : status?.currentPackage
                    ? `Currently generating: ${status.currentPackage}`
                    : "Analyzing requirements and generating packages..."}
                </p>
              </div>

              {/* Progress Bar */}
              {!isComplete && !isFailed && (
                <div className="space-y-2 max-w-md mx-auto">
                  <Progress value={status?.progress || 0} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {status?.progress || 0}% complete
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-4">
                {isComplete && (
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download Package
                      </>
                    )}
                  </Button>
                )}

                {isFailed && (
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={() => navigate("/dashboard")}
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Packages List */}
          {status?.packages && status.packages.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Generated Packages</h2>
              
              <div className="grid gap-4">
                {status.packages
                  .sort((a, b) => a.order - b.order)
                  .map((pkg: PackageDto) => (
                    <motion.div
                      key={pkg.packageId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-card border rounded-xl p-5 transition-colors ${
                        pkg.status === "completed"
                          ? "border-green-500/30"
                          : pkg.status === "generating"
                          ? "border-primary/50"
                          : "border-border/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {getPackageStatusIcon(pkg.status)}
                          <div>
                            <h3 className="font-semibold">{pkg.name}</h3>
                            {pkg.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {pkg.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {pkg.fileCount > 0 && (
                                <span>{pkg.fileCount} files</span>
                              )}
                              {pkg.estimatedTimeMinutes > 0 && (
                                <span>~{pkg.estimatedTimeMinutes} min</span>
                              )}
                              {pkg.recommendedTool && (
                                <span className="px-2 py-0.5 bg-muted rounded">
                                  {pkg.recommendedTool}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {pkg.dependencies && pkg.dependencies.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>Depends on:</span>
                            {pkg.dependencies.map((dep, i) => (
                              <span key={i} className="px-1 bg-muted rounded">
                                {dep}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 rounded-xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setError(null);
                  setIsPolling(true);
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {/* Next Steps */}
          {isComplete && (
            <div className="bg-card/50 border border-border/50 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">What's in your package?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">C4 Architecture Diagrams</span>
                    <p className="text-sm text-muted-foreground">
                      System context, container, and component views
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">OpenAPI Specifications</span>
                    <p className="text-sm text-muted-foreground">
                      Complete API contracts for each microservice
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Database Schemas (DBML)</span>
                    <p className="text-sm text-muted-foreground">
                      Entity relationships and data models
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">AI Implementation Prompts</span>
                    <p className="text-sm text-muted-foreground">
                      Ready-to-use prompts for Cursor, Bolt, and Lovable
                    </p>
                  </div>
                </li>
              </ul>

              <Button
                variant="hero-outline"
                className="mt-6 w-full"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default GenerationStatus;
