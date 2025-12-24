import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Zap,
  Loader2,
  Target,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  Layers,
  Box,
  ChevronDown,
  ChevronUp,
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
  ChatMessage,
  UpdatedDomain,
  ConversationRounds,
} from "@/lib/api-types";
import { getCachedFoundationQuestions } from "@/lib/foundation-question-cache";

interface ResumeData {
  rounds: ConversationRounds[];
  currentRound?: ConversationRounds;
  questionsAnswers?: Record<string, string>;
  hasEmptyAnswers?: boolean;
  roundNumber?: number;
  showDomainApproval?: boolean;
  lastAnalysis?: RoundAnalysisModel;
}

// Helper to parse AiAnalysisJson which can be either camelCase or snake_case
const parseAiAnalysisJson = (jsonString: string): RoundAnalysisModel | null => {
  try {
    const parsed = JSON.parse(jsonString);
    // Normalize property names - API might return camelCase or snake_case
    return {
      round_metadata: parsed.round_metadata || parsed.roundMetadata || {
        round_number: parsed.round_metadata?.round_number || parsed.roundMetadata?.roundNumber || 0,
        confidence_score_before: parsed.round_metadata?.confidence_score_before || parsed.roundMetadata?.confidenceScoreBefore || 0,
        confidence_score_after_expected: parsed.round_metadata?.confidence_score_after_expected || parsed.roundMetadata?.confidenceScoreAfterExpected || 0,
        questions_count: parsed.round_metadata?.questions_count || parsed.roundMetadata?.questionsCount || 0,
        requires_another_round: parsed.round_metadata?.requires_another_round ?? parsed.roundMetadata?.requiresAnotherRound ?? true,
        reasoning: parsed.round_metadata?.reasoning || parsed.roundMetadata?.reasoning || null,
      },
      questions: (parsed.questions || []).map((q: any) => ({
        question_id: q.question_id || q.questionId || 0,
        question: q.question || q.questionText || null,
        reason: q.reason || null,
        affects_domains: q.affects_domains || q.affectsDomains || null,
        priority: q.priority || null,
        expected_answer_type: q.expected_answer_type || q.expectedAnswerType || null,
        follow_up_if_answer: q.follow_up_if_answer || q.followUpIfAnswer || null,
      })),
      refined_domain_analysis: parsed.refined_domain_analysis || parsed.refinedDomainAnalysis || {
        changes_from_previous: parsed.refined_domain_analysis?.changes_from_previous || parsed.refinedDomainAnalysis?.changesFromPrevious || null,
        identified_risks: parsed.refined_domain_analysis?.identified_risks || parsed.refinedDomainAnalysis?.identifiedRisks || null,
        assumptions_to_validate: parsed.refined_domain_analysis?.assumptions_to_validate || parsed.refinedDomainAnalysis?.assumptionsToValidate || null,
      },
      updated_domains: (parsed.updated_domains || parsed.updatedDomains || []).map((d: any) => ({
        domain_name: d.domain_name || d.domainName || null,
        estimated_entities: d.estimated_entities || d.estimatedEntities || 0,
        changes: d.changes || null,
        new_probable_entities: d.new_probable_entities || d.newProbableEntities || null,
      })),
      next_round_focus: parsed.next_round_focus || parsed.nextRoundFocus || null,
      roundId: parsed.roundId || parsed.round_id || 0,
      roundNumber: parsed.roundNumber || parsed.round_number || 0,
    };
  } catch {
    return null;
  }
};

const Questionnaire = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [session, setSession] = useState<ConversationSession | null>(
    location.state?.session || null
  );
  const [foundationQuestions, setFoundationQuestions] = useState<
    FoundationQuestion[]
  >(location.state?.questions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [roundAnalysis, setRoundAnalysis] = useState<RoundAnalysisModel | null>(
    null
  );
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [isFoundationPhase, setIsFoundationPhase] = useState(true);
  const [followupQuestions, setFollowupQuestions] = useState<Question[]>([]);
  const [followupIndex, setFollowupIndex] = useState(0);
  const [showDomainApproval, setShowDomainApproval] = useState(false);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set()
  );
  const [isResuming, setIsResuming] = useState(false);

  // Handle resume from Dashboard
  useEffect(() => {
    const resumeData = location.state?.resumeData as ResumeData | undefined;
    if (resumeData && !isResuming) {
      setIsResuming(true);
      initializeFromResumeData(resumeData);
    }
  }, [location.state?.resumeData]);

  const initializeFromResumeData = (resumeData: ResumeData) => {
    const chatMessages: ChatMessage[] = [];
    
    // Get cached foundation questions to resolve Q1, Q2, etc. to actual question text
    const cachedFoundationQuestions = getCachedFoundationQuestions(Number(sessionId));
    
    // Helper to get question text from Q1, Q2 keys
    const getQuestionText = (key: string, roundNumber: number, previousAnalysis: RoundAnalysisModel | null): string => {
      // If key is already a full question text (not Q1/Q2/FQ1 format), return as-is
      if (!key.match(/^(Q|FQ)\d+$/i)) {
        return key;
      }
      
      // For foundation round (round 0 or round that uses Q1, Q2 format)
      if (key.match(/^Q\d+$/i) && cachedFoundationQuestions) {
        const qNum = parseInt(key.replace(/^Q/i, "")) - 1;
        if (qNum >= 0 && qNum < cachedFoundationQuestions.length) {
          return cachedFoundationQuestions[qNum].question || key;
        }
      }
      
      // For follow-up rounds, look for questions in the previous round's AI analysis
      if (key.match(/^FQ\d+$/i) && previousAnalysis?.questions) {
        const qNum = parseInt(key.replace(/^FQ/i, "")) - 1;
        if (qNum >= 0 && qNum < previousAnalysis.questions.length) {
          return previousAnalysis.questions[qNum].question || key;
        }
      }
      
      return key;
    };
    
    // Add welcome message
    chatMessages.push({
      id: "welcome",
      type: "system",
      content: `Welcome back! Let's continue designing your system architecture for "${
        session?.projectName || "your project"
      }".`,
      timestamp: new Date(),
    });

    // Find the incomplete round (if any)
    const incompleteRound = resumeData.rounds.find((r) => {
      const aiAnalysisJson =
        (r as any).aiAnalysisJson ??
        (r as any).ai_analysis_json ??
        (r as any).AiAnalysisJson ??
        null;
      return aiAnalysisJson === null || aiAnalysisJson === "" || aiAnalysisJson === "null";
    });

    // Track the previous round's analysis for question resolution
    let previousRoundAnalysis: RoundAnalysisModel | null = null;

    // Build history from all rounds
    resumeData.rounds.forEach((round, roundIndex) => {
      const aiAnalysisJsonRaw =
        (round as any).aiAnalysisJson ??
        (round as any).ai_analysis_json ??
        (round as any).AiAnalysisJson ??
        null;
      const questionsAnswersJson =
        (round as any).questionsAnswersJson ??
        (round as any).questions_answers_json ??
        (round as any).QuestionsAnswersJson ??
        null;
      const roundNumber =
        (round as any).roundNumber ??
        (round as any).round_number ??
        (round as any).RoundNumber ??
        0;
      const analyzedAt =
        (round as any).analyzedAt ??
        (round as any).analyzed_at ??
        (round as any).AnalyzedAt ??
        null;
      const createdAt =
        (round as any).createdAt ??
        (round as any).created_at ??
        (round as any).CreatedAt ??
        null;

      const isCompleteRound =
        aiAnalysisJsonRaw && aiAnalysisJsonRaw !== "" && aiAnalysisJsonRaw !== "null";

      // Parse questions/answers for this round
      let questionsAnswers: Record<string, string> = {};
      if (questionsAnswersJson) {
        try {
          questionsAnswers = JSON.parse(questionsAnswersJson);
        } catch {
          questionsAnswers = {};
        }
      }

      // For completed rounds, show the full Q&A history
      if (isCompleteRound) {
        // Parse the AI analysis using our helper
        const analysis = parseAiAnalysisJson(aiAnalysisJsonRaw);
        
        if (!analysis) {
          console.error("Failed to parse AI analysis JSON for round", roundNumber);
          return;
        }

        // Add round header
        chatMessages.push({
          id: `round-${roundNumber}-header`,
          type: "system",
          content: roundNumber === 0 ? "Foundation Questions" : `Round ${roundNumber}`,
          timestamp: new Date(createdAt || Date.now()),
        });

        // Display all Q&A pairs for this round
        const questionKeys = Object.keys(questionsAnswers);
        questionKeys.forEach((key, i) => {
          const answer = questionsAnswers[key];
          // Get the actual question text
          const questionText = getQuestionText(key, roundNumber, previousRoundAnalysis);
          
          // Add question
          chatMessages.push({
            id: `round-${roundNumber}-q-${i}`,
            type: "ai",
            content: questionText,
            timestamp: new Date(createdAt || Date.now()),
          });

          // Add answer if exists
          if (answer && answer !== "") {
            chatMessages.push({
              id: `round-${roundNumber}-a-${i}`,
              type: "user",
              content: answer,
              timestamp: new Date(createdAt || Date.now()),
            });
          }
        });

        // Add the AI analysis summary after the Q&A with domain information
        const confidencePercent = Math.round(
          (analysis.round_metadata?.confidence_score_after_expected || 0) * 100
        );
        
        let analysisContent = `Analysis complete. Confidence: ${confidencePercent}%`;
        
        // Add reasoning if available
        if (analysis.round_metadata?.reasoning) {
          analysisContent += `\n\n${analysis.round_metadata.reasoning}`;
        }
        
        chatMessages.push({
          id: `round-${roundNumber}-analysis`,
          type: "ai",
          content: analysisContent,
          timestamp: new Date(analyzedAt || createdAt || Date.now()),
          metadata: {
            roundNumber,
            confidenceScore: confidencePercent,
            domains: analysis.updated_domains || [],
            analysis,
          },
        });

        // Update confidence from last analyzed round
        if (analysis.round_metadata) {
          setConfidenceScore(confidencePercent);
        }
        setRoundAnalysis(analysis);
        
        // Store this analysis for the next round's question resolution
        previousRoundAnalysis = analysis;
      }
    });

    // Check if we should show domain approval
    if (resumeData.showDomainApproval && resumeData.lastAnalysis) {
      setRoundAnalysis(resumeData.lastAnalysis);
      setConfidenceScore(
        (resumeData.lastAnalysis.round_metadata?.confidence_score_after_expected || 0) * 100
      );
      setShowDomainApproval(true);
      setIsFoundationPhase(false);
      setMessages(chatMessages);
      return;
    }

    // Handle incomplete round - continue from where user left off
    if (incompleteRound && resumeData.questionsAnswers) {
      const roundNumber =
        (incompleteRound as any).roundNumber ??
        (incompleteRound as any).round_number ??
        (incompleteRound as any).RoundNumber ??
        0;
      setCurrentRound(roundNumber);
      setIsFoundationPhase(roundNumber === 0);

      // Build questions from questionsAnswers keys with proper text resolution
      const questionKeys = Object.keys(resumeData.questionsAnswers);
      const questions: Question[] = questionKeys.map((key, i) => ({
        question_id: i + 1,
        question: getQuestionText(key, roundNumber, previousRoundAnalysis),
        reason: null,
        affects_domains: null,
        priority: null,
        expected_answer_type: null,
        follow_up_if_answer: null,
      }));

      setFollowupQuestions(questions);

      // Add round header for incomplete round
      chatMessages.push({
        id: `round-${roundNumber}-header`,
        type: "system",
        content: roundNumber === 0 ? "Resuming Foundation Questions" : `Resuming Round ${roundNumber}`,
        timestamp: new Date(),
      });

      // If answers are empty, start from first question
      if (resumeData.hasEmptyAnswers) {
        if (questions.length > 0) {
          chatMessages.push({
            id: `fq-${questions[0].question_id}`,
            type: "ai",
            content: questions[0].question || "",
            timestamp: new Date(),
            metadata: { questionId: questions[0].question_id },
          });
        }
        setFollowupIndex(0);
      } else {
        // Find first unanswered question
        const answeredCount = Object.values(resumeData.questionsAnswers).filter(
          (v) => v && v !== ""
        ).length;
        
        // Show history of answered questions for incomplete round
        questionKeys.forEach((key, i) => {
          const answer = resumeData.questionsAnswers![key];
          const questionText = getQuestionText(key, roundNumber, previousRoundAnalysis);
          
          if (answer && answer !== "") {
            chatMessages.push({
              id: `incomplete-round-q-${i}`,
              type: "ai",
              content: questionText,
              timestamp: new Date(),
            });
            chatMessages.push({
              id: `incomplete-round-a-${i}`,
              type: "user",
              content: answer,
              timestamp: new Date(),
            });
          }
        });

        // Set answers state
        const existingAnswers: Record<string, string> = {};
        questionKeys.forEach((key, i) => {
          const answer = resumeData.questionsAnswers![key];
          if (answer && answer !== "") {
            existingAnswers[`FQ${i + 1}`] = answer;
          }
        });
        setAnswers(existingAnswers);

        // Continue from next unanswered question
        if (answeredCount < questions.length) {
          chatMessages.push({
            id: `fq-${answeredCount}-continue`,
            type: "ai",
            content: questions[answeredCount].question || "",
            timestamp: new Date(),
            metadata: { questionId: questions[answeredCount].question_id },
          });
          setFollowupIndex(answeredCount);
        }
      }
    }

    setMessages(chatMessages);
  };

  // Initialize chat with first question (only for new sessions)
  useEffect(() => {
    if (foundationQuestions.length > 0 && messages.length === 0 && !location.state?.resumeData) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        type: "system",
        content: `Welcome to DomForgeAI! Let's design your system architecture for "${
          session?.projectName || "your project"
        }". I'll ask you a series of questions to understand your requirements.`,
        timestamp: new Date(),
      };

      const firstQuestion = foundationQuestions[0];
      const questionMessage: ChatMessage = {
        id: `q-${firstQuestion.question_id}`,
        type: "ai",
        content: firstQuestion.question || "",
        timestamp: new Date(),
        metadata: {
          questionId: firstQuestion.question_id,
        },
      };

      setMessages([welcomeMessage, questionMessage]);
    }
  }, [foundationQuestions, messages.length, session?.projectName, location.state?.resumeData]);

  // Redirect if no session
  useEffect(() => {
    if (!session && !sessionId) {
      navigate("/dashboard");
    }
  }, [session, sessionId, navigate]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getCurrentQuestion = (): FoundationQuestion | Question | null => {
    if (isFoundationPhase) {
      return foundationQuestions[currentQuestionIndex] || null;
    } else {
      return followupQuestions[followupIndex] || null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSubmitting) return;

    const userAnswer = inputValue.trim();
    setInputValue("");

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: userAnswer,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Store answer - use question_id for both types
    const questionKey = isFoundationPhase
      ? `Q${(currentQuestion as FoundationQuestion).question_id}`
      : `FQ${(currentQuestion as Question).question_id}`;
    const updatedAnswers = { ...answers, [questionKey]: userAnswer };
    setAnswers(updatedAnswers);

    if (isFoundationPhase) {
      // Check if more foundation questions
      if (currentQuestionIndex < foundationQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        const nextQ = foundationQuestions[currentQuestionIndex + 1];

        setTimeout(() => {
          const aiMessage: ChatMessage = {
            id: `q-${nextQ.question_id}`,
            type: "ai",
            content: nextQ.question || "",
            timestamp: new Date(),
            metadata: { questionId: nextQ.question_id },
          };
          setMessages((prev) => [...prev, aiMessage]);
        }, 500);
      } else {
        // Submit foundation answers
        await submitFoundationAnswers(updatedAnswers);
      }
    } else {
      // Followup phase
      if (followupIndex < followupQuestions.length - 1) {
        setFollowupIndex((prev) => prev + 1);
        const nextQ = followupQuestions[followupIndex + 1];

        setTimeout(() => {
          const aiMessage: ChatMessage = {
            id: `fq-${nextQ.question_id}`,
            type: "ai",
            content: nextQ.question || "",
            timestamp: new Date(),
            metadata: { questionId: nextQ.question_id },
          };
          setMessages((prev) => [...prev, aiMessage]);
        }, 500);
      } else {
        // Submit followup answers
        await submitFollowupAnswers(updatedAnswers);
      }
    }

    inputRef.current?.focus();
  };

  const submitFoundationAnswers = async (
    allAnswers: Record<string, string>
  ) => {
    setIsSubmitting(true);

    // Add processing message
    const processingMessage: ChatMessage = {
      id: "processing-foundation",
      type: "system",
      content: "Analyzing your requirements and identifying domains...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, processingMessage]);

    try {
      const response = await apiClient.submitCoreAnswers(Number(sessionId), {
        answers: allAnswers,
      });

      setRoundAnalysis(response);
      setConfidenceScore(
        response.round_metadata.confidence_score_after_expected * 100
      );
      setCurrentRound(response.roundNumber);
      setIsFoundationPhase(false);
      setFollowupQuestions(response.questions || []);
      setFollowupIndex(0);
      setAnswers({});

      // Add domain analysis message
      const analysisMessage: ChatMessage = {
        id: `analysis-${response.roundNumber}`,
        type: "ai",
        content: `I've analyzed your requirements. Current confidence: ${Math.round(
          response.round_metadata.confidence_score_after_expected * 100
        )}%. ${
          response.round_metadata.requires_another_round
            ? "I need a few more details to refine the architecture."
            : "We've reached the confidence threshold!"
        }`,
        timestamp: new Date(),
        metadata: {
          roundNumber: response.roundNumber,
          confidenceScore:
            response.round_metadata.confidence_score_after_expected * 100,
          domains: response.updated_domains || [],
          analysis: response,
        },
      };
      setMessages((prev) => [...prev, analysisMessage]);

      // If threshold reached, show approval UI
      if (!response.round_metadata.requires_another_round) {
        setShowDomainApproval(true);
      } else if (response.questions && response.questions.length > 0) {
        // Add first followup question
        setTimeout(() => {
          const firstFollowup = response.questions![0];
          const followupMessage: ChatMessage = {
            id: `fq-${firstFollowup.question_id}`,
            type: "ai",
            content: firstFollowup.question || "",
            timestamp: new Date(),
            metadata: { questionId: firstFollowup.question_id },
          };
          setMessages((prev) => [...prev, followupMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to submit foundation:", error);
      toast({
        title: "Submission failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitFollowupAnswers = async (allAnswers: Record<string, string>) => {
    setIsSubmitting(true);

    const processingMessage: ChatMessage = {
      id: `processing-round-${currentRound}`,
      type: "system",
      content: "Refining domain analysis based on your answers...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, processingMessage]);

    try {
      const response = await apiClient.submitFollowupAnswers(
        Number(sessionId),
        currentRound,
        { answers: allAnswers, roundeId: roundAnalysis?.roundId }
      );

      setRoundAnalysis(response);
      setConfidenceScore(
        response.round_metadata.confidence_score_after_expected * 100
      );

      // Add analysis message
      const analysisMessage: ChatMessage = {
        id: `analysis-${response.roundNumber}`,
        type: "ai",
        content: `Round ${
          response.roundNumber
        } complete. Confidence: ${Math.round(
          response.round_metadata.confidence_score_after_expected * 100
        )}%. ${
          response.round_metadata.requires_another_round
            ? "Let me ask a few more questions."
            : "Domain recognition complete!"
        }`,
        timestamp: new Date(),
        metadata: {
          roundNumber: response.roundNumber,
          confidenceScore:
            response.round_metadata.confidence_score_after_expected * 100,
          domains: response.updated_domains || [],
          analysis: response,
        },
      };
      setMessages((prev) => [...prev, analysisMessage]);

      if (response.round_metadata.requires_another_round) {
        // Continue with more questions
        setCurrentRound(response.roundNumber);
        setFollowupQuestions(response.questions || []);
        setFollowupIndex(0);
        setAnswers({});

        if (response.questions && response.questions.length > 0) {
          setTimeout(() => {
            const nextQ = response.questions![0];
            const nextMessage: ChatMessage = {
              id: `fq-${nextQ.question_id}-r${response.roundNumber}`,
              type: "ai",
              content: nextQ.question || "",
              timestamp: new Date(),
              metadata: { questionId: nextQ.question_id },
            };
            setMessages((prev) => [...prev, nextMessage]);
          }, 1000);
        }
      } else {
        // Threshold reached, show domain approval
        setShowDomainApproval(true);
      }
    } catch (error) {
      console.error("Failed to submit followup:", error);
      toast({
        title: "Submission failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveDomain = async () => {
    setIsSubmitting(true);

    const approvalMessage: ChatMessage = {
      id: "approving",
      type: "system",
      content: "Starting system generation...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, approvalMessage]);

    try {
      await apiClient.approveDomain(Number(sessionId));

      toast({
        title: "Domain approved!",
        description: "Redirecting to generation status...",
      });

      navigate(`/project/${sessionId}/status`);
    } catch (error) {
      console.error("Failed to approve domain:", error);
      toast({
        title: "Approval failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDomainExpand = (domainName: string) => {
    setExpandedDomains((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(domainName)) {
        newSet.delete(domainName);
      } else {
        newSet.add(domainName);
      }
      return newSet;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const progress = isFoundationPhase
    ? ((currentQuestionIndex + 1) / foundationQuestions.length) * 100
    : confidenceScore;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
                  {isFoundationPhase ? "Foundation" : `Round ${currentRound}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {!isFoundationPhase && (
                <div className="flex items-center gap-2 bg-card border border-border/50 rounded-full px-4 py-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    <span className="text-gradient">
                      {Math.round(confidenceScore)}%
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">/ 85%</span>
                </div>
              )}
            </div>
          </div>

          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>
              {isFoundationPhase
                ? `Question ${currentQuestionIndex + 1} of ${
                    foundationQuestions.length
                  }`
                : `Confidence threshold: 85%`}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden flex flex-col container mx-auto px-4 max-w-4xl">
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground ml-12"
                      : message.type === "system"
                      ? "bg-secondary/50 text-muted-foreground border border-border/50"
                      : "bg-card border border-border/50 mr-12"
                  }`}
                >
                  {/* AI/System message header */}
                  {message.type === "ai" && (
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Brain className="w-4 h-4" />
                      <span className="text-xs font-medium">DomForgeAI</span>
                    </div>
                  )}

                  {message.type === "system" && (
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-medium">System</span>
                    </div>
                  )}

                  {/* Message content */}
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* Domain Analysis Panel */}
                  {message.metadata?.domains &&
                    message.metadata.domains.length > 0 && (
                      <DomainAnalysisPanel
                        domains={message.metadata.domains}
                        analysis={message.metadata.analysis}
                        expandedDomains={expandedDomains}
                        toggleDomainExpand={toggleDomainExpand}
                      />
                    )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Domain Approval UI */}
          {showDomainApproval && roundAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border-2 border-primary/50 rounded-2xl p-6 shadow-glow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Domain Recognition Complete</h3>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {Math.round(confidenceScore)}%
                  </p>
                </div>
              </div>

              {/* Domain summary */}
              {roundAnalysis.updated_domains &&
                roundAnalysis.updated_domains.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-sm font-medium">Identified Domains:</p>
                    <div className="flex flex-wrap gap-2">
                      {roundAnalysis.updated_domains.map((domain, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium flex items-center gap-2"
                        >
                          <Layers className="w-3 h-3" />
                          {domain.domain_name}
                          <span className="text-xs opacity-70">
                            ({domain.estimated_entities} entities)
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Risks warning */}
              {roundAnalysis.refined_domain_analysis?.identified_risks &&
                roundAnalysis.refined_domain_analysis.identified_risks.length >
                  0 && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">
                        Identified Risks
                      </span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {roundAnalysis.refined_domain_analysis.identified_risks.map(
                        (risk, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            <span>
                              {risk.risk}: {risk.description}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              <div className="flex gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={handleApproveDomain}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Generation...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve & Generate
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        {!showDomainApproval && (
          <div className="border-t border-border/50 py-4">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isSubmitting
                    ? "Processing..."
                    : "Type your answer and press Enter..."
                }
                disabled={isSubmitting}
                className="flex-1 min-h-[52px] max-h-32 px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                rows={1}
              />
              <Button
                variant="hero"
                size="icon"
                className="h-[52px] w-[52px]"
                onClick={handleSendMessage}
                disabled={isSubmitting || !inputValue.trim()}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

// Domain Analysis Panel Component
function DomainAnalysisPanel({
  domains,
  analysis,
  expandedDomains,
  toggleDomainExpand,
}: {
  domains: UpdatedDomain[];
  analysis?: RoundAnalysisModel;
  expandedDomains: Set<string>;
  toggleDomainExpand: (name: string) => void;
}) {
  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <p className="text-xs font-medium text-muted-foreground mb-3">
        Identified Domains & Microservices
      </p>
      <div className="space-y-2">
        {domains.map((domain, i) => {
          const isExpanded = expandedDomains.has(domain.domain_name || "");
          return (
            <div key={i} className="rounded-lg bg-secondary/30 overflow-hidden">
              <button
                onClick={() => toggleDomainExpand(domain.domain_name || "")}
                className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">
                    {domain.domain_name}
                  </span>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                    {domain.estimated_entities} entities
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/50"
                  >
                    <div className="p-3 space-y-2">
                      {domain.changes && (
                        <p className="text-xs text-muted-foreground">
                          {domain.changes}
                        </p>
                      )}
                      {domain.new_probable_entities &&
                        domain.new_probable_entities.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">
                              Probable Entities:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {domain.new_probable_entities.map((entity, j) => (
                                <span
                                  key={j}
                                  className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded flex items-center gap-1"
                                >
                                  <Box className="w-3 h-3" />
                                  {entity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Next Round Focus */}
      {analysis?.next_round_focus && analysis.next_round_focus.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Next focus: {analysis.next_round_focus.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

export default Questionnaire;
