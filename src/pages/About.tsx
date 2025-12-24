import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  Lightbulb,
  Users,
  ArrowRight,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

const values = [
  {
    icon: Target,
    title: "Mission",
    description:
      "To accelerate microservices adoption by providing AI-powered domain analysis and architecture generation, helping teams move from concept to implementation faster.",
  },
  {
    icon: Lightbulb,
    title: "Vision",
    description:
      "We envision a world where any organization can adopt microservices architecture best practices without extensive consulting costs or lengthy analysis phases.",
  },
  {
    icon: Users,
    title: "Who We Serve",
    description:
      "Companies, startups, individuals, and development teams who want to transform their systems into modern microservices architecture with professional-grade deliverables.",
  },
];

const useCases = [
  {
    title: "System Modernization",
    description:
      "Organizations breaking down monolithic applications into well-defined microservices with clear boundaries.",
  },
  {
    title: "Greenfield Projects",
    description:
      "Startups and teams starting new projects with a solid microservices foundation from day one.",
  },
  {
    title: "Architecture Documentation",
    description:
      "Teams needing comprehensive C4 diagrams, database schemas, and API specifications for their systems.",
  },
  {
    title: "Rapid Prototyping",
    description:
      "Quickly validating microservices architecture ideas with real, runnable .NET Core 8 code.",
  },
];

const About = () => {
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
              About <span className="text-gradient">DomForgeAI</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              We're transforming how enterprise software is created, one
              microservice at a time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass rounded-2xl p-8 md:p-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why We Built <span className="text-gradient">DomForgeAI</span>
              </h2>
              <div className="space-y-4 text-muted-foreground text-lg">
                <p>
                  DomForgeAI is a SaaS platform that provides comprehensive
                  domain analysis for companies, individuals, and startups
                  looking to implement microservices architecture the right way.
                </p>
                <p>
                  Through an intelligent AI-guided questionnaire, we analyze
                  your business requirements and identify domain boundaries with
                  confidence scoring. The iterative process ensures we truly
                  understand your system before generating any architecture.
                </p>
                <p>
                  The output is a complete package: C4 architecture diagrams,
                  .NET Core 8 Visual Studio solutions with boilerplate
                  implementations, DBML database schemas, and OpenAPI YAML
                  specifications for each microservice.
                </p>
                <p className="text-foreground font-medium">
                  Everything is delivered as a downloadable ZIP file, ready to
                  extend and deploy.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
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
              Our <span className="text-gradient">Core Values</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-2xl p-8 text-center hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Real-World <span className="text-gradient">Use Cases</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See how organizations are using DomForgeAI to transform their
              development.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-xl p-6 hover:border-primary/30 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                <p className="text-muted-foreground">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-3xl p-12 max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Have questions about DomForgeAI? We'd love to hear from you. Our
              team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg">
                <Mail className="w-5 h-5" />
                Email Us
              </Button>
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
              Ready to Transform Your Development?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the future of enterprise software development.
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

export default About;
