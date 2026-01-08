import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Brain,
  Layers,
  Code2,
  Package,
  ArrowRight,
  ArrowDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Start Your Project",
    description:
      "Log in with Google and create a new project. Provide your project name and a brief description of the system you want to build.",
    details: ["Google Sign-In", "Project Creation", "5 Free Credits"],
  },
  {
    number: "02",
    icon: Brain,
    title: "Answer Core Questions",
    description:
      "Our AI-guided questionnaire asks targeted questions about your business requirements, helping us understand your domain and constraints.",
    details: ["Business Context", "Requirements Gathering", "Guided Questions"],
  },
  {
    number: "03",
    icon: Layers,
    title: "Iterative Domain Analysis",
    description:
      "DomForgeAI analyzes your answers to identify domains, domain relationships, cross-cutting concerns, integration points, and potential architectural risks. Follow-up questions refine the model until a confident architecture emerges.",
    details: [
      "Identified Domains",
      "Domain Relationships",
      "Cross-Cutting Concerns",
      "Integration Points",
      "Risk Detection",
    ],
  },
  {
    number: "04",
    icon: Code2,
    title: "Architecture Generation",
    description:
      "Once confidence is high enough, approve the analysis. DomForgeAI generates a production-ready architecture including C4 diagrams, DBML schemas, OpenAPI specifications, and a recommended microservices structure based on scale and complexity.",
    details: [
      "C4 Architecture",
      "DBML Schemas",
      "OpenAPI YAML",
      "Microservices Count",
    ],
  },
  {
    number: "05",
    icon: Package,
    title: "Download Your Package",
    description:
      "Download a ZIP package containing everything you need: architecture artifacts, microservice solutions (.NET Core 8), database schemas, and API specifications.",
    details: [".NET Core Solutions", "Complete Package", "Ready to Extend"],
  },
];

const HowItWorks = () => {
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
              How <span className="text-gradient">DomForgeAI</span> Works
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              From business requirements to production-ready architecture and
              code in minutes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="absolute left-[27px] top-[80px] w-0.5 h-[calc(100%-40px)] bg-gradient-to-b from-primary/50 to-border hidden md:block" />
                )}

                <div className="flex flex-col md:flex-row gap-6 mb-12">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-glow-sm">
                      <step.icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="text-sm font-mono text-primary mt-2">
                      {step.number}
                    </span>
                  </div>

                  <div className="glass rounded-2xl p-6 md:p-8 flex-1 hover:border-primary/30 transition-all duration-300">
                    <h3 className="text-xl md:text-2xl font-semibold mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.details.map((detail) => (
                        <span
                          key={detail}
                          className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="flex justify-center mb-8 md:hidden">
                    <ArrowDown className="w-6 h-6 text-primary/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Intelligence */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI-Powered{" "}
              <span className="text-gradient">Architecture Intelligence</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              DomForgeAI analyzes your system like a senior software architect —
              before generating any code.
            </p>
          </motion.div>

          {/* Intelligence Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Domain identification & relationships",
              "Cross-cutting concerns (security, observability, consistency)",
              "Integration points & system boundaries",
              "Compliance and regulatory considerations",
              "Scalability and growth constraints",
              "Potential architectural risks and trade-offs",
              "Recommended microservices count",
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass hover:shadow-glow-md transition-all duration-300 rounded-2xl p-6 flex items-start gap-3"
              >
                {/* Icon Check */}
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                {/* Text */}
                <p className="font-medium text-foreground">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Summary */}
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
              Time Comparison:{" "}
              <span className="text-gradient">Traditional vs DomForgeAI</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-2xl p-8 max-w-4xl mx-auto overflow-x-auto"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold">Task</th>
                  <th className="text-center py-4 px-4 font-semibold text-destructive">
                    Traditional
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-primary">
                    DomForgeAI
                  </th>
                  <th className="text-center py-4 px-4 font-semibold">
                    Outcome
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    task: "Domain Analysis",
                    trad: "3–5 days",
                    ai: "Minutes",
                    save: "Automated",
                  },
                  {
                    task: "Architecture Design (C4)",
                    trad: "2–3 days",
                    ai: "Auto-generated",
                    save: "Automated",
                  },
                  {
                    task: "Database Schema (DBML)",
                    trad: "2–3 days",
                    ai: "Auto-generated",
                    save: "Automated",
                  },
                  {
                    task: "API Specification",
                    trad: "2–3 days",
                    ai: "Auto-generated",
                    save: "Automated",
                  },
                  {
                    task: "Microservice Boilerplate",
                    trad: "5–7 days",
                    ai: "Auto-generated",
                    save: "Automated",
                  },
                  {
                    task: "Total Project Setup",
                    trad: "16–24 days",
                    ai: "2–3 hours",
                    save: "Major Reduction",
                  },
                ].map((row) => (
                  <tr
                    key={row.task}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-4 px-4">{row.task}</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">
                      {row.trad}
                    </td>
                    <td className="text-center py-4 px-4 text-primary font-medium">
                      {row.ai}
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {row.save}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
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
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Experience the future of enterprise microservice architecture.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Start Generating
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default HowItWorks;
