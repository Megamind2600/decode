import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/hooks/use-auth";
import { marketingApi } from "@/lib/api";
import { Brain, Play, Info } from "lucide-react";



export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  const { data: marketingConfig } = useQuery({
    queryKey: ["/api/marketing", user?.abGroup || "A"],
    queryFn: () => marketingApi.getConfig(user?.abGroup || "A"),
  });

  const heroTitle = marketingConfig?.heroTitle || "Master Your Next Interview";
  const heroSubtitle = marketingConfig?.heroSubtitle || 
    "Practice with AI-powered questions, get instant feedback, and boost your confidence with personalized interview preparation.";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="floating-element inline-block mb-6">
              <Brain className="h-16 w-16 opacity-80" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
              {heroTitle}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto" data-testid="text-hero-subtitle">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="bg-accent text-accent-foreground px-8 py-4 text-lg font-semibold hover:bg-accent/90 shadow-lg"
                onClick={() => setShowAuthModal(true)}
                data-testid="button-start-practice"
              >
                <Play className="mr-2 h-5 w-5" />
                Register/Login
              </Button>
            
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How AI InterviewPrep Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get ready for your dream job with our AI-powered interview preparation platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Practice Questions</h3>
              <p className="text-muted-foreground">
                Answer real interview questions from top companies. Start with 3 free questions, then unlock more.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-secondary text-secondary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Evaluation</h3>
              <p className="text-muted-foreground">
                Get instant feedback from our advanced AI that analyzes your answers and provides detailed scoring.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-accent text-accent-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Improve & Track</h3>
              <p className="text-muted-foreground">
                Track your progress, improve your scores, and earn more questions through referrals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of job seekers who have improved their interview skills with AI InterviewPrep
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="px-8 py-4 text-lg font-semibold"
            onClick={() => setShowAuthModal(true)}
            data-testid="button-get-started"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        mode="register"
      />
    </div>
  );
}
