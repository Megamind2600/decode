import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, TrendingUp, Check } from "lucide-react";

interface AIFeedbackProps {
  evaluation: {
    score: number;
    positiveComment: string;
    improvementComment: string;
    structureScore: number;
    contentScore: number;
    communicationScore: number;
  };
  onNextQuestion: () => void;
  onTryAnother: () => void;
}

export function AIFeedback({ evaluation, onNextQuestion, onTryAnother }: AIFeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  
  const getScoreGradient = (score: number) => {
    const percentage = (score / 10) * 100;
    return {
      background: `conic-gradient(from 0deg, hsl(217 91% 60%) 0%, hsl(217 91% 60%) ${percentage}%, hsl(220 13% 91%) ${percentage}%, hsl(220 13% 91%) 100%)`,
    };
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg" data-testid="card-feedback">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">AI Feedback</h2>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Your Score</div>
                  <div className={`text-3xl font-bold ${getScoreColor(evaluation.score)}`} data-testid="text-overall-score">
                    {evaluation.score.toFixed(1)}
                  </div>
                </div>
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={getScoreGradient(evaluation.score)}
                >
                  <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center">
                    <Check className="text-primary text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Positive Feedback */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <ThumbsUp className="text-secondary mr-2 h-5 w-5" />
                What You Did Well
              </h3>
              <Card className="bg-secondary/10 border border-secondary/20">
                <CardContent className="p-4">
                  <p className="text-foreground" data-testid="text-positive-feedback">
                    {evaluation.positiveComment}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Areas for Improvement */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                <TrendingUp className="text-accent mr-2 h-5 w-5" />
                Areas for Improvement
              </h3>
              <Card className="bg-accent/10 border border-accent/20">
                <CardContent className="p-4">
                  <p className="text-foreground" data-testid="text-improvement-feedback">
                    {evaluation.improvementComment}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Scoring */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="text-center bg-muted">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Structure</div>
                  <div className={`text-2xl font-bold ${getScoreColor(evaluation.structureScore)}`} data-testid="text-structure-score">
                    {evaluation.structureScore}
                  </div>
                </CardContent>
              </Card>
              <Card className="text-center bg-muted">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Content</div>
                  <div className={`text-2xl font-bold ${getScoreColor(evaluation.contentScore)}`} data-testid="text-content-score">
                    {evaluation.contentScore}
                  </div>
                </CardContent>
              </Card>
              <Card className="text-center bg-muted">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Communication</div>
                  <div className={`text-2xl font-bold ${getScoreColor(evaluation.communicationScore)}`} data-testid="text-communication-score">
                    {evaluation.communicationScore}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Badge */}
            <div className="text-center mb-6">
              {evaluation.score >= 8 && (
                <Badge variant="default" className="bg-green-100 text-green-800 px-4 py-2">
                  Excellent Performance! 🌟
                </Badge>
              )}
              {evaluation.score >= 6 && evaluation.score < 8 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 px-4 py-2">
                  Good Job! Keep practicing 👍
                </Badge>
              )}
              {evaluation.score < 6 && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 px-4 py-2">
                  Room for improvement 📈
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="secondary" 
                onClick={onTryAnother}
                data-testid="button-try-another"
              >
                Try Another Question
              </Button>
              <Button 
                onClick={onNextQuestion}
                data-testid="button-next-question"
              >
                Next Question →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
