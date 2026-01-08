import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Layers,
  Zap,
  Shield,
  Package,
  FileCode2,
  GitBranch,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

const features = [
  {
    icon: Layers,
    title: "Complete Architecture Package",
    description:
      "Get C4 architecture diagrams, system context, container views, and component diagrams for your entire system.",
    highlights: [
      "C4 Models",
      "System Architecture",
      "Container Diagrams",
      "Component Views",
    ],
  },
  {
    icon: FileCode2,
    title: ".NET Core Solutions",
    description:
      "Each microservice comes as a complete Visual Studio solution with boilerplate implementation ready to extend.",
    highlights: [
      ".NET Core 8",
      "Visual Studio Solution",
      "Boilerplate Code",
      "Best Practices",
    ],
  },
  {
    icon: Zap,
    title: "DBML Schema Generation",
    description:
      "Database schemas generated in DBML format, ready for visualization and database creation.",
    highlights: [
      "DBML Format",
      "Entity Relationships",
      "Database Design",
      "Schema Visualization",
    ],
  },
  {
    icon: Shield,
    title: "OpenAPI Specifications",
    description:
      "Complete OpenAPI YAML files for each microservice, documenting all endpoints and models.",
    highlights: [
      "OpenAPI 3.0",
      "YAML Format",
      "API Documentation",
      "Swagger Ready",
    ],
  },
  {
    icon: GitBranch,
    title: "AI-Driven Domain & Architecture Analysis",
    description:
      "DomForgeAI analyzes your business requirements to identify domains, relationships, cross-cutting concerns, and architectural risks — producing explainable, review-ready decisions.",
    highlights: [
      "Identified Domains & Relationships",
      "Cross-Cutting Concerns",
      "Integration Points",
      "Risk & Scalability Signals",
    ],
  },
  {
    icon: Layers,
    title: "Architecture Insight Report",
    description:
      "A structured architecture analysis report highlighting design decisions, potential risks, scalability considerations, and compliance impacts before code is written.",
    highlights: [
      "Analysis Summary",
      "Scale Considerations",
      "Compliance Impacts",
      "Potential Issues",
    ],
  },
  {
    icon: Package,
    title: "Downloadable ZIP Package",
    description:
      "Everything packaged into a single ZIP file - architecture files, microservice solutions, schemas, specs, and insight reports.",
    highlights: [
      "ZIP Download",
      "Organized Structure",
      "Ready to Use",
      "Complete Package",
    ],
  },
];

const Features = () => {
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
              Enterprise-Grade <span className="text-gradient">Features</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Everything you need to generate production-ready microservices
              with explainable architecture decisions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group glass rounded-2xl p-8 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:shadow-glow-sm transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="w-4 h-4 text-primary" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Output Package */}
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
              Complete Output <span className="text-gradient">Package</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Every generated microservice includes architecture files,
              insights, and code ready for production deployment.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Generated outputs include explainable architecture decisions,
              domain analysis, and service recommendations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-2xl p-8 max-w-4xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "C4 Architecture Files",
                  desc: "System context, container, and component diagrams",
                },
                {
                  title: ".NET Core Solutions",
                  desc: "Complete Visual Studio solutions per microservice",
                },
                {
                  title: "DBML Schema Files",
                  desc: "Database schema definitions for each service",
                },
                {
                  title: "OpenAPI YAML Specs",
                  desc: "Full API documentation in OpenAPI 3.0 format",
                },
                {
                  title: "Architecture Insight Summary",
                  desc: "Domain structure, relationships, risks, and system-wide concerns",
                },
                {
                  title: "Microservice Recommendations",
                  desc: "Suggested service count, boundaries, and responsibility split",
                },
                {
                  title: "Entity Definitions",
                  desc: "All entities and their relationships",
                },
                {
                  title: "ZIP Package Download",
                  desc: "Everything organized in a single download",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
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
              Ready to Experience These Features?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start generating enterprise-grade microservices today with full
              architectural insights.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Features;
