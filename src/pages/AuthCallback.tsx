import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      const userId = searchParams.get("userId");
      const error = searchParams.get("error");

      if (error) {
        toast({
          title: "Authentication failed",
          description: error,
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      if (userId) {
        try {
          await handleAuthCallback(Number(userId));
          toast({
            title: "Welcome!",
            description: "You have successfully signed in",
          });
          navigate("/dashboard");
        } catch (err) {
          console.error("Auth callback error:", err);
          toast({
            title: "Authentication failed",
            description: "Please try again",
            variant: "destructive",
          });
          navigate("/auth");
        }
      } else {
        navigate("/auth");
      }
    };

    processCallback();
  }, [searchParams, handleAuthCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
