import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Generated complete DBML + OpenAPI specs in 10 minutes. Would've taken me 2 weeks manually. DomForge is a game-changer.",
    name: "Sarah Kim",
    role: "Technical Lead",
  },
  {
    quote: "I was dreading the architecture docs for our new microservices. DomForge did it in literally 12 minutes. Mind blown 🤯",
    name: "Alex Rivera",
    role: "Full Stack Developer",
  },
  {
    quote: "From blank slate to production-ready architecture in under an hour. This is exactly what we needed.",
    name: "James Patterson",
    role: "Engineering Manager",
  },
  {
    quote: "Saved $45K on architecture consulting. Used DomForge instead. Got same quality, 500x faster.",
    name: "Emily Chen",
    role: "CTO",
  },
  {
    quote: "Was quoted $30K and 6 weeks for system architecture. DomForge delivered better results in 15 minutes for $49.",
    name: "David Miller",
    role: "Founder & CEO",
  },
  {
    quote: "I used to spend 40% of my time on documentation. DomForge handles it better than I could. Now I focus on high-value work.",
    name: "Michael Brown",
    role: "Enterprise Architect",
  },
  {
    quote: "Went from idea to fully-documented architecture in under 20 minutes. Started building same day. This is startup speed.",
    name: "Kevin Zhang",
    role: "Founder & CEO",
  },
  {
    quote: "Shipped 3 microservices this quarter vs 1 last quarter. DomForge eliminated the architecture bottleneck.",
    name: "Nicole Martinez",
    role: "Enterprise Architect",
  },
  {
    quote: "Finally understand microservices architecture by studying DomForge's output. Better than any tutorial.",
    name: "Jordan Smith",
    role: "Developer",
  },
  {
    quote: "Before DomForge: Hiring consultants, waiting weeks, spending $$$ — After DomForge: Done in minutes, enterprise quality, minimal cost. Simple decision.",
    name: "Paul Anderson",
    role: "CTO",
  },
];

export const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Quote Icon */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-primary">
          <Quote className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Testimonial Card */}
      <div className="glass rounded-3xl pt-12 pb-8 px-8 md:px-16 min-h-[280px] flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="text-center"
          >
            <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic">
              "{currentTestimonial.quote}"
            </p>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-lg font-semibold text-primary">
                  {currentTestimonial.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <p className="font-semibold text-foreground">{currentTestimonial.name}</p>
              <p className="text-sm text-muted-foreground">{currentTestimonial.role}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 rounded-full hover:bg-primary/10"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 rounded-full hover:bg-primary/10"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-primary w-6"
                : "bg-border hover:bg-primary/30"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
