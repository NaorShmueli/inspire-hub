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
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

const features = [
  {
    icon: Layers,
    title: "5-Layer Architecture",
    description: "Complete enterprise architecture with API, Models, DAL, Business Logic, and Validators layers.",
    highlights: ["Repository Pattern", "Unit of Work", "Clean Architecture", "DDD Principles"],
  },
  {
    icon: FileCode2,
    title: "50-65 Files Generated",
    description: "Complete Visual Studio solution with all necessary files for a production microservice.",
    highlights: ["Controllers", "DTOs", "Entities", "Repositories"],
  },
  {
    icon: Zap,
    title: "30 Second Generation",
    description: "From specifications to complete, buildable code in under 30 seconds.",
    highlights: ["Instant Results", "No Waiting", "Rapid Iteration", "Quick Feedback"],
  },
  {
    icon: Shield,
    title: "Zero Compilation Errors",
    description: "Generated code builds successfully out of the box. No debugging required.",
    highlights: ["Type Safety", "Proper Imports", "Valid Syntax", "Tested Output"],
  },
  {
    icon: Package,
    title: "Docker & Kubernetes Ready",
    description: "Includes Dockerfile, docker-compose, and optional Kubernetes manifests.",
    highlights: ["Containerized", "Cloud-Ready", "Scalable", "Portable"],
  },
  {
    icon: GitBranch,
    title: "Multiple Input Formats",
    description: "Accept DBML schemas, OpenAPI specs, or use our AI-guided questionnaire.",
    highlights: ["DBML Support", "OpenAPI", "Natural Language", "Flexible Input"],
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
              Enterprise-Grade{" "}
              <span className="text-gradient">Features</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Everything you need to generate production-ready microservices 
              that follow industry best practices.
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
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2 text-sm text-muted-foreground">
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
              Complete Output{" "}
              <span className="text-gradient">Package</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Every generated microservice includes everything you need to deploy to production.
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
                { title: "Visual Studio Solution", desc: "Complete .sln with 5 projects" },
                { title: "API Layer", desc: "RESTful controllers with full CRUD" },
                { title: "Models Layer", desc: "Entities, DTOs, Enums, Responses" },
                { title: "Data Access Layer", desc: "Repository pattern, UnitOfWork" },
                { title: "Business Logic Layer", desc: "Service interfaces & implementations" },
                { title: "Validators Layer", desc: "FluentValidation rules for all DTOs" },
                { title: "Docker Support", desc: "Dockerfile and docker-compose.yml" },
                { title: "Documentation", desc: "README with setup instructions" },
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
              Start generating enterprise-grade microservices today.
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