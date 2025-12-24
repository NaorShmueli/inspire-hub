import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  CreditCard,
  Package,
  Crown,
  Check,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import type { PlanEntity, CreditPackEntity, UserCreditsEntity } from "@/lib/api-types";

const MyPlan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<PlanEntity | null>(null);
  const [creditPacks, setCreditPacks] = useState<CreditPackEntity[]>([]);
  const [credits, setCredits] = useState<UserCreditsEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [buyingPackId, setBuyingPackId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [planResult, packsResult, creditsResult] = await Promise.all([
          apiClient.getPlans(),
          apiClient.getCreditPacks(),
          apiClient.getCreditBalance(),
        ]);

        if (!planResult.hasErrors && planResult.data) {
          // Assume first plan is current (in production, API would return user's actual plan)
          setCurrentPlan(Array.isArray(planResult.data) ? planResult.data[0] : planResult.data);
        }

        if (!packsResult.hasErrors && packsResult.data) {
          setCreditPacks(Array.isArray(packsResult.data) ? packsResult.data : [packsResult.data]);
        }

        setCredits(creditsResult);
      } catch (error) {
        console.error("Failed to fetch plan data:", error);
        toast({
          title: "Failed to load plan data",
          description: "Please try again",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBuyPack = async (pack: CreditPackEntity) => {
    if (!user) return;

    setBuyingPackId(pack.creditPackId);
    try {
      const result = await apiClient.buyCreditPack({
        userId: user.id,
        packId: pack.creditPackId,
        successUrl: `${window.location.origin}/my-plan?success=true`,
        cancelUrl: `${window.location.origin}/error`,
      });

      // API returns checkoutUrl for Stripe redirect
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Failed to buy pack:", error);
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setBuyingPackId(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    setIsCancelling(true);
    try {
      await apiClient.cancelSubscription(user.id);
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled",
      });
      // Refresh plan data
      window.location.reload();
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast({
        title: "Cancellation failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow-sm">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">My Plan</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Credit Balance */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Credit Balance</p>
                  <p className="text-4xl font-bold text-gradient">
                    {credits?.creditsBalance || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last reset: {credits?.lastReset ? new Date(credits.lastReset).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <CreditCard className="w-12 h-12 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          {/* Current Plan */}
          {currentPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
                    <p className="text-muted-foreground">{currentPlan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      ${currentPlan.priceMonthly}
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </p>
                  </div>
                </div>

                {currentPlan.highlights && currentPlan.highlights.length > 0 && (
                  <ul className="space-y-2">
                    {currentPlan.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {highlight.text}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => navigate("/pricing")}>
                    Upgrade Plan
                  </Button>
                  {!currentPlan.isContactSales && currentPlan.priceMonthly > 0 && (
                    <Button
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mr-2" />
                      )}
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Credit Packs */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Buy Credit Packs
            </h2>
            <p className="text-muted-foreground">
              Need more credits? Purchase a one-time credit pack.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {creditPacks.filter(p => p.active).map((pack) => (
                <Card key={pack.creditPackId} className="relative overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold">{pack.name}</h3>
                      <p className="text-sm text-muted-foreground">{pack.description}</p>
                    </div>

                    <div className="text-center py-4">
                      <p className="text-3xl font-bold text-gradient">{pack.credits}</p>
                      <p className="text-sm text-muted-foreground">credits</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-semibold">${pack.price}</p>
                    </div>

                    <Button
                      variant="hero-outline"
                      className="w-full"
                      onClick={() => handleBuyPack(pack)}
                      disabled={buyingPackId === pack.creditPackId}
                    >
                      {buyingPackId === pack.creditPackId ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Buy Now"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default MyPlan;
