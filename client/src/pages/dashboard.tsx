import { useState } from "react";
import { UserDashboard } from "@/components/user-dashboard";
import { QuestionInterface } from "@/components/question-interface";
import { AIFeedback } from "@/components/ai-feedback";
import { ReferralSection } from "@/components/referral-section";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/hooks/use-auth";

type ViewState = "dashboard" | "question" | "feedback";

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");
  const [lastEvaluation, setLastEvaluation] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReferralSection, setShowReferralSection] = useState(false);
  const { user } = useAuth();

  const handleStartQuestion = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (user.questionsAvailable <= 0) {
      setShowReferralSection(true);
      return;
    }
    
    setCurrentView("question");
  };

  const handleAnswerSubmitted = (evaluation: any) => {
    setLastEvaluation(evaluation);
    setCurrentView("feedback");
  };

  const handleNoQuestionsLeft = () => {
    setShowAuthModal(true);
  };

  const handleNextQuestion = () => {
    setCurrentView("question");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setShowReferralSection(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to continue</h1>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg"
          >
            Sign In
          </button>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          mode="login"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === "dashboard" && (
        <>
          <UserDashboard 
            onGetMoreQuestions={() => setShowReferralSection(true)}
            onShareReferral={() => setShowReferralSection(true)}
          />
          
          {/* Quick Start Section */}
          <section className="py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready for your next question?</h2>
              <p className="text-muted-foreground mb-6">
                Challenge yourself with a new interview question and get AI-powered feedback
              </p>
              <button
                onClick={handleStartQuestion}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors"
                data-testid="button-start-question"
              >
                Start New Question
              </button>
            </div>
          </section>
          
          {showReferralSection && <ReferralSection />}
        </>
      )}

      {currentView === "question" && (
        <QuestionInterface
          onAnswerSubmitted={handleAnswerSubmitted}
          onNoQuestionsLeft={handleNoQuestionsLeft}
        />
      )}

      {currentView === "feedback" && lastEvaluation && (
        <AIFeedback
          evaluation={lastEvaluation}
          onNextQuestion={handleNextQuestion}
          onTryAnother={handleBackToDashboard}
        />
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        mode="register"
      />
    </div>
  );
}
