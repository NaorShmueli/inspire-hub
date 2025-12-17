import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Zap, Building2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

const plans = [
  {
    name: "Starter",
    icon: Rocket,
    price: "$49",
    period: "per month",
    description: "Perfect for individual developers and small projects.",
    features: [
      "5 microservice generations/month",
      "Basic architecture patterns",
      "Visual Studio solution output",
      "Docker support",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    icon: Zap,
    price: "$197",
    period: "per month",
    description: "For teams building multiple microservices at scale.",
    features: [
      "Unlimited generations",
      "Advanced architecture patterns",
      "Kubernetes manifests",
      "C4 model diagrams",
      "Terraform configurations",
      "Priority support",
      "Custom templates",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    period: "contact us",
    description: "For large organizations with custom requirements.",
    features: [
      "Everything in Professional",
      "Custom architecture templates",
      "On-premise deployment",
      "SSO integration",
      "Dedicated support",
      "SLA guarantees",
      "Training & onboarding",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
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
              Simple,{" "}
              <span className="text-gradient">Transparent</span>{" "}
              Pricing
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Save 99.7% compared to traditional development costs. 
              Choose the plan that fits your needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? "glass border-2 border-primary shadow-glow"
                    : "glass"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary rounded-full text-primary-foreground text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <plan.icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">/{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth">
                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    size="lg"
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              The True{" "}
              <span className="text-gradient">Cost Comparison</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See how DomForgeAI compares to traditional development costs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-2xl p-8 max-w-3xl mx-auto"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                <div>
                  <h4 className="font-semibold">Traditional Development</h4>
                  <p className="text-sm text-muted-foreground">Senior architect + development time</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-destructive">$35,000 - $80,000</div>
                  <p className="text-sm text-muted-foreground">per microservice</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl bg-primary/10 border border-primary/30">
                <div>
                  <h4 className="font-semibold">With DomForgeAI</h4>
                  <p className="text-sm text-muted-foreground">Automated generation + refinement</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">$197</div>
                  <p className="text-sm text-muted-foreground">per microservice</p>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-muted-foreground mb-2">Your Savings</p>
                <div className="text-4xl font-bold text-gradient">99.7%</div>
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
              Contact our team to discuss your specific needs and get a custom quote.
            </p>
            <Link to="/about">
              <Button variant="hero-outline" size="lg">
                Contact Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Pricing;