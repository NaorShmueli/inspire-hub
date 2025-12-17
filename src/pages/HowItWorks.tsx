import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ClipboardList, 
  Brain, 
  Layers, 
  Code2, 
  Package,
  ArrowRight,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Specification Collection",
    description: "Provide your business requirements through an AI-guided questionnaire or upload existing specifications like DBML schemas or OpenAPI specs.",
    details: ["Natural language input", "DBML schema upload", "OpenAPI spec import"],
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Analysis",
    description: "Our AI analyzes your requirements to understand domain boundaries, entities, relationships, and business operations.",
    details: ["Entity identification", "Relationship mapping", "Operation detection"],
  },
  {
    number: "03",
    icon: Layers,
    title: "Architecture Generation",
    description: "DomForgeAI generates complete architecture including database schemas, API specifications, C4 models, and infrastructure configs.",
    details: ["DBML schemas", "OpenAPI specs", "C4 models", "Terraform configs"],
  },
  {
    number: "04",
    icon: Code2,
    title: "Code Generation",
    description: "The platform produces complete source code for all layers: API controllers, entity models, repositories, business logic, and validators.",
    details: ["5-layer architecture", "50-65 files", "Zero errors"],
  },
  {
    number: "05",
    icon: Package,
    title: "Package & Deliver",
    description: "Everything is packaged into a downloadable ZIP containing a complete Visual Studio solution ready to build and deploy.",
    details: ["Visual Studio solution", "Docker support", "Documentation"],
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
              How{" "}
              <span className="text-gradient">DomForgeAI</span>{" "}
              Works
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              From your business requirements to production-ready code in 5 simple steps.
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
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[27px] top-[80px] w-0.5 h-[calc(100%-40px)] bg-gradient-to-b from-primary/50 to-border hidden md:block" />
                )}

                <div className="flex flex-col md:flex-row gap-6 mb-12">
                  {/* Step Number & Icon */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-glow-sm">
                      <step.icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="text-sm font-mono text-primary mt-2">{step.number}</span>
                  </div>

                  {/* Content */}
                  <div className="glass rounded-2xl p-6 md:p-8 flex-1 hover:border-primary/30 transition-all duration-300">
                    <h3 className="text-xl md:text-2xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
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

                {/* Arrow for mobile */}
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
                  <th className="text-center py-4 px-4 font-semibold text-destructive">Traditional</th>
                  <th className="text-center py-4 px-4 font-semibold text-primary">DomForgeAI</th>
                  <th className="text-center py-4 px-4 font-semibold">Savings</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { task: "Architecture Design", trad: "3-5 days", ai: "30 seconds", save: "99.9%" },
                  { task: "Project Setup", trad: "1-2 days", ai: "30 seconds", save: "99.9%" },
                  { task: "Entity Models", trad: "2-3 days", ai: "30 seconds", save: "100%" },
                  { task: "DTOs Creation", trad: "2-3 days", ai: "30 seconds", save: "100%" },
                  { task: "Repositories", trad: "3-4 days", ai: "30 seconds", save: "100%" },
                  { task: "Controllers", trad: "5-7 days", ai: "2-3 hours", save: "95%" },
                ].map((row) => (
                  <tr key={row.task} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4">{row.task}</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">{row.trad}</td>
                    <td className="text-center py-4 px-4 text-primary font-medium">{row.ai}</td>
                    <td className="text-center py-4 px-4">
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {row.save}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-primary/5">
                  <td className="py-4 px-4 font-bold">TOTAL</td>
                  <td className="text-center py-4 px-4 font-bold text-destructive">16-24 days</td>
                  <td className="text-center py-4 px-4 font-bold text-primary">2-3 hours</td>
                  <td className="text-center py-4 px-4 font-bold">
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm">
                      99%
                    </span>
                  </td>
                </tr>
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
              Experience the future of enterprise software development.
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