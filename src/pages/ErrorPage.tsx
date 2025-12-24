import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const ErrorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorType = searchParams.get("type") || "payment";

  const getErrorMessage = () => {
    switch (errorType) {
      case "payment":
        return {
          title: "Payment Failed",
          description: "There was an issue processing your payment. Please try again or contact support if the problem persists.",
        };
      case "subscription":
        return {
          title: "Subscription Error",
          description: "We couldn't complete your subscription. Please check your payment details and try again.",
        };
      default:
        return {
          title: "Something Went Wrong",
          description: "An unexpected error occurred. Please try again later.",
        };
    }
  };

  const error = getErrorMessage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{error.title}</h1>
          <p className="text-muted-foreground">{error.description}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button variant="hero" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Need help?{" "}
          <a href="mailto:support@domforgeai.com" className="text-primary hover:underline">
            Contact Support
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
