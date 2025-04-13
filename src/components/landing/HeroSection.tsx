
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

const HeroSection = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<"signin" | "signup">("signup");

  const openAuthModal = (type: "signin" | "signup") => {
    setAuthType(type);
    setAuthModalOpen(true);
  };

  return (
    <>
      <section className="pt-28 pb-16 md:pt-40 md:pb-20 lg:pt-48 lg:pb-28 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center staggered-animate">
            <h1 className="heading-xl mb-6">
              Master <span className="text-gradient">Group Discussions</span> & <span className="text-gradient">Interviews</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              An interactive platform to practice, analyze, and improve your communication skills
              through real-time discussions and expert feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-effect text-lg" onClick={() => openAuthModal("signup")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="btn-effect text-lg" onClick={() => document.getElementById("features")?.scrollIntoView({behavior: "smooth"})}>
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-mockmate-primary/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-mockmate-secondary/10 blur-3xl"></div>

        {/* Hero illustration - we're using a simple, abstract shape for now */}
        <div className="mt-16 md:mt-20 max-w-5xl mx-auto px-4 relative">
          <div className="animated-bg h-64 md:h-80 rounded-xl shadow-lg flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg max-w-md animate-pulse-light">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-mockmate-primary/20 flex items-center justify-center text-mockmate-primary font-bold">
                  M
                </div>
                <div className="flex-1">
                  <p className="font-medium">Moderator</p>
                  <p className="text-sm text-foreground/70">Let's begin our discussion on sustainable technology.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-mockmate-secondary/20 flex items-center justify-center text-mockmate-secondary font-bold">
                  P
                </div>
                <div className="flex-1">
                  <p className="font-medium">Participant</p>
                  <p className="text-sm text-foreground/70">I believe renewable energy integration is the key challenge...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView={authType}
      />
    </>
  );
};

export default HeroSection;
