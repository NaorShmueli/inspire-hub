import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Lightbulb, Users, ArrowRight, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

const values = [
  {
    icon: Target,
    title: "Mission",
    description: "To make enterprise-grade software development accessible to everyone, empowering businesses of all sizes to build modern, scalable systems without requiring massive teams or budgets.",
  },
  {
    icon: Lightbulb,
    title: "Vision",
    description: "We envision a world where skilled engineers focus on creative problem-solving and complex business challenges, not repetitive boilerplate code.",
  },
  {
    icon: Users,
    title: "Who We Serve",
    description: "Startups validating MVPs, enterprises modernizing legacy systems, consultancies scaling their delivery, and product teams building faster.",
  },
];

const useCases = [
  {
    title: "Enterprise Digital Transformation",
    description: "Large organizations replacing legacy systems with dozens of modern microservices in weeks instead of years.",
  },
  {
    title: "Startup MVP Development",
    description: "Startups building production-grade infrastructure before hiring a full engineering team.",
  },
  {
    title: "Consulting & Agency Work",
    description: "Consultancies delivering 5-10x more projects with the same team size.",
  },
  {
    title: "Internal Tools Development",
    description: "Enterprises rapidly building internal tools without diverting engineering resources.",
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
              About{" "}
              <span className="text-gradient">DomForgeAI</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              We're transforming how enterprise software is created, one microservice at a time.
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
                Why We Built{" "}
                <span className="text-gradient">DomForgeAI</span>
              </h2>
              <div className="space-y-4 text-muted-foreground text-lg">
                <p>
                  DomForgeAI was created from a fundamental belief: expensive, skilled engineers 
                  should spend their time on creative problem-solving, not repetitive typing.
                </p>
                <p>
                  The software development industry has long accepted that creating boilerplate code 
                  is simply "part of the job," but this acceptance comes at an enormous cost in 
                  both time and resources.
                </p>
                <p>
                  We identified a significant gap in the market: enterprises faced a choice between 
                  expensive traditional consulting ($15,000-$50,000 per microservice, 4-6 weeks) 
                  and AI-generated specifications that still required extensive manual coding.
                </p>
                <p className="text-foreground font-medium">
                  DomForgeAI fills this gap by providing traditional consulting quality with 
                  AI-powered speed at an affordable price.
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
              Our{" "}
              <span className="text-gradient">Core Values</span>
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
              Real-World{" "}
              <span className="text-gradient">Use Cases</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See how organizations are using DomForgeAI to transform their development.
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
              Have questions about DomForgeAI? We'd love to hear from you. 
              Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg">
                <Mail className="w-5 h-5" />
                Email Us
              </Button>
              <Button variant="hero-outline" size="lg">
                <MessageSquare className="w-5 h-5" />
                Schedule a Demo
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