import { useState } from "react";
import { QuestionInterface } from "@/components/question-interface";
import { AIFeedback } from "@/components/ai-feedback";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

type QuestionState = "answering" | "feedback";

export default function Question() {
  const [currentState, setCurrentState] = useState<QuestionState>("answering");
  const [lastEvaluation, setLastEvaluation] = useState<any>(null);
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/" />;
  }

  const handleAnswerSubmitted = (evaluation: any) => {
    setLastEvaluation(evaluation);
    setCurrentState("feedback");
  };

  const handleNextQuestion = () => {
    setCurrentState("answering");
  };

  const handleBackToDashboard = () => {
    // Navigate back to dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-background">
      {currentState === "answering" && (
        <QuestionInterface
          onAnswerSubmitted={handleAnswerSubmitted}
          onNoQuestionsLeft={handleBackToDashboard}
        />
      )}

      {currentState === "feedback" && lastEvaluation && (
        <AIFeedback
          evaluation={lastEvaluation}
          onNextQuestion={handleNextQuestion}
          onTryAnother={handleBackToDashboard}
        />
      )}
    </div>
  );
}
