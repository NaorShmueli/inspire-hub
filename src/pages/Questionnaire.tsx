import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Zap,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Target,
  Brain,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import type {
  FoundationQuestion,
  Question,
  RoundAnalysisModel,
  ConversationSession,
} from "@/lib/api-types";

type QuestionnairePhase = "foundation" | "followup" | "generating";

const Questionnaire = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<QuestionnairePhase>("foundation");
  const [session, setSession] = useState<ConversationSession | null>(
    location.state?.session || null
  );
  const [foundationQuestions, setFoundationQuestions] = useState<FoundationQuestion[]>(
    location.state?.questions || []
  );
  const [followupQuestions, setFollowupQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [roundAnalysis, setRoundAnalysis] = useState<RoundAnalysisModel | null>(null);

  const currentQuestions =
    phase === "foundation" ? foundationQuestions : followupQuestions;
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const totalQuestions = currentQuestions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // If no session data, redirect to dashboard
  useEffect(() => {
    if (!session && !sessionId) {
      navigate("/dashboard");
    }
  }, [session, sessionId, navigate]);

  const handleAnswerChange = (value: string) => {
    const questionKey = phase === "foundation" 
      ? `Q${(currentQuestion as FoundationQuestion).questionId}`
      : `FQ${(currentQuestion as Question).questionId}`;
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));
  };

  const getCurrentAnswer = () => {
    const questionKey = phase === "foundation"
      ? `Q${(currentQuestion as FoundationQuestion).questionId}`
      : `FQ${(currentQuestion as Question).questionId}`;
    return answers[questionKey] || "";
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitFoundation = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.submitCoreAnswers(
        Number(sessionId),
        { answers }
      );

      setRoundAnalysis(response);
      setFollowupQuestions(response.questions || []);
      setConfidenceScore(response.roundMetadata.confidenceScoreAfterExpected * 100);
      setRoundNumber(response.roundNumber);
      setPhase("followup");
      setCurrentQuestionIndex(0);
      setAnswers({});

      toast({
        title: "Foundation complete!",
        description: `Starting domain recognition. Confidence: ${Math.round(response.roundMetadata.confidenceScoreAfterExpected * 100)}%`,
      });
    } catch (error) {
      console.error("Failed to submit foundation:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFollowup = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.submitFollowupAnswers(
        Number(sessionId),
        roundNumber,
        { answers, roundeId: roundAnalysis?.roundId }
      );

      if (response && "roundMetadata" in response) {
        const analysisResponse = response as RoundAnalysisModel;
        setRoundAnalysis(analysisResponse);
        setConfidenceScore(analysisResponse.roundMetadata.confidenceScoreAfterExpected * 100);

        if (analysisResponse.roundMetadata.requiresAnotherRound) {
          // Continue with next round
          setFollowupQuestions(analysisResponse.questions || []);
          setRoundNumber(analysisResponse.roundNumber);
          setCurrentQuestionIndex(0);
          setAnswers({});

          toast({
            title: `Round ${analysisResponse.roundNumber} complete`,
            description: `Confidence: ${Math.round(analysisResponse.roundMetadata.confidenceScoreAfterExpected * 100)}%. Continuing to next round...`,
          });
        } else {
          // Threshold reached, navigate to generation status
          setPhase("generating");
          navigate(`/project/${sessionId}/status`);
        }
      } else {
        // 202 Accepted - generation started
        setPhase("generating");
        navigate(`/project/${sessionId}/status`);
      }
    } catch (error) {
      console.error("Failed to submit followup:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (phase === "foundation") {
      handleSubmitFoundation();
    } else {
      handleSubmitFollowup();
    }
  };

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const canProceed = getCurrentAnswer().trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow-sm">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold">
                  {session?.projectName || "New Project"}
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  {phase === "foundation" ? "Foundation Questions" : `Round ${roundNumber}`}
                </span>
              </div>
            </div>

            {phase === "followup" && (
              <div className="flex items-center gap-2 bg-card border border-border/50 rounded-full px-4 py-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  Confidence: <span className="text-gradient">{Math.round(confidenceScore)}%</span>
                </span>
                <span className="text-xs text-muted-foreground">/ 85%</span>
              </div>
            )}
          </div>

          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${phase}-${currentQuestionIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Round Analysis Panel */}
            {phase === "followup" && roundAnalysis && (
              <div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="font-medium">AI Analysis</span>
                </div>
                
                {roundAnalysis.updatedDomains && roundAnalysis.updatedDomains.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {roundAnalysis.updatedDomains.map((domain, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {domain.domainName} ({domain.estimatedEntities} entities)
                      </span>
                    ))}
                  </div>
                )}

                {roundAnalysis.nextRoundFocus && roundAnalysis.nextRoundFocus.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Focus areas: {roundAnalysis.nextRoundFocus.join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Question Card */}
            <div className="bg-card border border-border/50 rounded-2xl p-8 space-y-6">
              {/* Question Header */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary-foreground">
                    {currentQuestionIndex + 1}
                  </span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold leading-tight">
                    {phase === "foundation"
                      ? (currentQuestion as FoundationQuestion)?.questionText
                      : (currentQuestion as Question)?.questionText}
                  </h2>
                  
                  {/* Help text for foundation questions */}
                  {phase === "foundation" && (currentQuestion as FoundationQuestion)?.helpText && (
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {(currentQuestion as FoundationQuestion).helpText}
                    </p>
                  )}

                  {/* Reason for followup questions */}
                  {phase === "followup" && (currentQuestion as Question)?.reason && (
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                      {(currentQuestion as Question).reason}
                    </p>
                  )}

                  {/* Affected domains */}
                  {phase === "followup" && (currentQuestion as Question)?.affectsDomains && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(currentQuestion as Question).affectsDomains?.map((domain, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded"
                        >
                          {domain}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Answer Input */}
              <div className="space-y-3">
                <textarea
                  value={getCurrentAnswer()}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder={
                    phase === "foundation"
                      ? (currentQuestion as FoundationQuestion)?.placeholder || "Type your answer..."
                      : "Provide your answer..."
                  }
                  className="w-full h-32 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {phase === "foundation"
                    ? `Question type: ${(currentQuestion as FoundationQuestion)?.questionTypeName || "Text"}`
                    : `Expected: ${(currentQuestion as Question)?.expectedAnswerType || "Text response"}`}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-3">
                {!isLastQuestion ? (
                  <Button
                    variant="hero"
                    onClick={handleNext}
                    disabled={!canProceed}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="hero"
                    onClick={handleSubmit}
                    disabled={!canProceed || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {phase === "foundation" ? "Submit & Continue" : "Submit Round"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Questionnaire;
