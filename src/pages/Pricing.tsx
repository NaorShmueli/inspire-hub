import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Check, Zap, Building2, Rocket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { PlanEntity } from "@/lib/api-types";
import { ContactSalesDialog } from "@/components/ContactSalesDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const planIcons: Record<string, React.ElementType> = {
  Starter: Rocket,
  Professional: Zap,
  Enterprise: Building2,
  Pro: Zap,
  Basic: Rocket,
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<PlanEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanEntity | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showContactSalesDialog, setShowContactSalesDialog] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const result = await apiClient.getPlans();
        if (result.data && Array.isArray(result.data)) {
          setPlans(result.data.filter((p) => p.active));
        } else if (result.data) {
          // Handle single plan response
          setPlans([result.data as unknown as PlanEntity]);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        toast({
          title: "Failed to load plans",
          description: "Please refresh the page to try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = (plan: PlanEntity) => {
    if (plan.isContactSales) {
      setShowContactSalesDialog(true);
      return;
    }

    if (!isAuthenticated) {
      // Redirect to auth with return URL
      navigate("/auth", { state: { returnTo: "/pricing", planId: plan.id } });
      return;
    }

    setSelectedPlan(plan);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlan || !user) return;

    setIsSubscribing(true);
    try {
      const response = await apiClient.subscribe({
        userId: user.id,
        planId: selectedPlan.id,
        successUrl: `${window.location.origin}/dashboard?subscription=success`,
        cancelUrl: `${window.location.origin}/pricing?subscription=cancelled`,
      });

      if (response.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = response.checkoutUrl;
      } else {
        toast({
          title: "Subscription initiated",
          description: "Redirecting to payment...",
        });
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      toast({
        title: "Subscription failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
      setShowConfirmDialog(false);
    }
  };

  const getPlanIcon = (planName: string | null) => {
    if (!planName) return Rocket;
    return planIcons[planName] || Rocket;
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-glow opacity-30" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Simple, <span className="text-gradient">Transparent</span> Pricing
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Enterprise-grade architecture at a fraction of the usual cost.
              Choose the plan that fits your project
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                No plans available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              {plans.map((plan, index) => {
                const Icon = getPlanIcon(plan.name);
                const isPopular =
                  plan.name?.toLowerCase() === "professional" ||
                  plan.name?.toLowerCase() === "pro";
                const isFreePlan =
                  plan.name?.toLowerCase() === "free" ||
                  plan.priceMonthly === 0;
                const showButton = !isFreePlan || !isAuthenticated;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative rounded-2xl p-8 h-full flex flex-col ${
                      isPopular
                        ? "glass border-2 border-primary shadow-glow"
                        : "glass"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary rounded-full text-primary-foreground text-sm font-medium">
                        Most Popular
                      </div>
                    )}

                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>

                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-6">
                      {plan.description}
                    </p>

                    <div className="mb-8">
                      {plan.isContactSales ? (
                        <>
                          <span className="text-4xl font-bold">Custom</span>
                          <span className="text-muted-foreground ml-2">
                            / contact us
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">
                            ${plan.priceMonthly}
                          </span>
                          {plan.priceMonthly !== 0 ? (
                            <span className="text-muted-foreground ml-2">
                              / month
                            </span>
                          ) : null}
                        </>
                      )}
                    </div>

                    {/* Credits Info */}
                    <div className="mb-6 p-3 rounded-lg bg-secondary/50">
                      <p className="text-sm font-medium">
                        {plan.isContactSales
                          ? "Custom domain credits, Custom microservice credits"
                          : plan.creditsSummary ||
                            `${plan.domainCredits} domain credits, ${plan.microserviceCredits} microservice credits`}
                      </p>
                    </div>

                    {/* Plan Highlights */}
                    {plan.highlights && plan.highlights.length > 0 && (
                      <ul className="space-y-4 mb-8 flex-grow">
                        {plan.highlights
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((highlight, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">
                                {highlight.text}
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}

                    <div className="mt-auto">
                      {showButton && (
                        <Button
                          variant={isPopular ? "hero" : "outline"}
                          size="lg"
                          className="w-full"
                          onClick={() => handleSelectPlan(plan)}
                        >
                          {plan.isContactSales
                            ? "Contact Sales"
                            : "Get Started"}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {/* Section Intro */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              The True <span className="text-gradient">Cost Comparison</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See how DomForgeAI delivers enterprise-grade microservices at a
              fraction of traditional development costs.
            </p>
          </motion.div>

          {/* Cost Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-2xl p-8 max-w-3xl mx-auto"
          >
            <div className="space-y-6">
              {/* Traditional Development */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                <div>
                  <h4 className="font-semibold">Traditional Development</h4>
                  <p className="text-sm text-muted-foreground">
                    Senior architect + full development cycle
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-destructive">
                    $10,000 - $25,000
                  </div>
                  <p className="text-sm text-muted-foreground">
                    per microservice
                  </p>
                </div>
              </div>

              {/* DomForgeAI */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-primary/10 border border-primary/30">
                <div>
                  <h4 className="font-semibold">With DomForgeAI</h4>
                  <p className="text-sm text-muted-foreground">
                    Automated generation + refinement
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">$197</div>
                  <p className="text-sm text-muted-foreground">
                    per microservice
                  </p>
                </div>
              </div>

              {/* Savings Highlight */}
              <div className="text-center pt-6 border-t border-border">
                <span className="inline-block mb-2 px-3 py-1 rounded-full bg-primary/20 text-primary font-medium text-sm">
                  Cost-Effective
                </span>
                <div className="text-3xl md:text-4xl font-bold text-gradient">
                  A fraction of traditional development costs
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Questions? We're Here to Help
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contact our team to discuss your specific needs and get a custom
              quote.
            </p>
            <Button
              variant="hero-outline"
              size="lg"
              onClick={() => setShowContactSalesDialog(true)}
            >
              Contact Us
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Subscription Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Subscription</DialogTitle>
            <DialogDescription>
              You're about to subscribe to the {selectedPlan?.name} plan.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="py-4 space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{selectedPlan.name}</span>
                  <span className="font-bold text-primary">
                    ${selectedPlan.priceMonthly}/mo
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedPlan.creditsSummary ||
                    `${selectedPlan.domainCredits} domain credits, ${selectedPlan.microserviceCredits} microservice credits`}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                You'll be redirected to Stripe to complete your payment
                securely.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubscribing}
            >
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={handleConfirmSubscription}
              disabled={isSubscribing}
            >
              {isSubscribing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm & Pay"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Sales Dialog */}
      <ContactSalesDialog
        open={showContactSalesDialog}
        onOpenChange={setShowContactSalesDialog}
      />
    </Layout>
  );
};

export default Pricing;
