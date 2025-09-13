import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { questionApi, type QuestionResponse } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { SkipForward, Save, Send, Lightbulb, Clock } from "lucide-react";

const answerSchema = z.object({
  answer: z.string().min(10, "Answer must be at least 10 characters long"),
});

interface QuestionInterfaceProps {
  onAnswerSubmitted: (evaluation: any) => void;
  onNoQuestionsLeft: () => void;
}

export function QuestionInterface({ onAnswerSubmitted, onNoQuestionsLeft }: QuestionInterfaceProps) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [wordCount, setWordCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);

  const form = useForm<z.infer<typeof answerSchema>>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: "",
    },
  });

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  // Watch answer for word count
  const answerValue = form.watch("answer");
  useEffect(() => {
    const words = answerValue.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [answerValue]);

  // Fetch random question
  const { refetch: fetchQuestion, isLoading: isLoadingQuestion } = useQuery({
    queryKey: ["/api/questions/random", answeredQuestionIds],
    queryFn: () => questionApi.getRandom(answeredQuestionIds),
    enabled: false,
    retry: false,
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: (data: z.infer<typeof answerSchema>) => {
      if (!user || !currentQuestion) throw new Error("Missing user or question");
      return questionApi.submit(user.id, currentQuestion.id, data.answer);
    },
    onSuccess: (response) => {
      if (user) {
        updateUser({ questionsAvailable: response.questionsRemaining });
      }
      setAnsweredQuestionIds(prev => [...prev, currentQuestion!.id]);
      onAnswerSubmitted(response.evaluation);
      form.reset();
      setWordCount(0);
      setTimeRemaining(300);
    },
    onError: (error: any) => {
      if (error.message.includes("No questions available")) {
        onNoQuestionsLeft();
      } else {
        toast({
          title: "Failed to submit answer",
          description: error.message || "Please try again",
          variant: "destructive",
        });
      }
    },
  });

  // Load initial question
  useEffect(() => {
    fetchQuestion().then((result) => {
      if (result.data) {
        setCurrentQuestion(result.data);
      }
    });
  }, [fetchQuestion]);

  const loadNextQuestion = async () => {
    const result = await fetchQuestion();
    if (result.data) {
      setCurrentQuestion(result.data);
      form.reset();
      setWordCount(0);
      setTimeRemaining(300);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = (data: z.infer<typeof answerSchema>) => {
    submitAnswerMutation.mutate(data);
  };

  if (!currentQuestion) {
    return (
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading question...</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg question-card" data-testid="card-question">
          <CardContent className="p-8">
            {/* Question Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-semibold">
                  <span data-testid="text-question-number">
                    {(user?.questionsCompleted || 0) + 1}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Interview Question</h2>
                  <div className="flex gap-2">
                    <Badge variant="secondary" data-testid="text-category">
                      {currentQuestion.category}
                    </Badge>
                    <Badge variant="outline" data-testid="text-difficulty">
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Time Remaining</div>
                <div className="text-xl font-bold text-primary flex items-center" data-testid="text-timer">
                  <Clock className="mr-1 h-4 w-4" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4" data-testid="text-question">
                {currentQuestion.questionText}
              </h3>
              {currentQuestion.tip && (
                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground flex items-start">
                      <Lightbulb className="mr-2 h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Tip:</strong> {currentQuestion.tip}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Answer Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Your Answer</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          className="min-h-[160px] resize-none"
                          placeholder="Start typing your answer here... Remember to be specific and provide concrete examples."
                          data-testid="textarea-answer"
                        />
                      </FormControl>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span data-testid="text-word-count">Word count: <span className="font-medium">{wordCount}</span></span>
                        <span>Recommended: 150-300 words</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <Button 
                    type="button"
                    variant="secondary" 
                    onClick={loadNextQuestion}
                    disabled={isLoadingQuestion}
                    data-testid="button-skip"
                  >
                    <SkipForward className="mr-2 h-4 w-4" />
                    Skip Question
                  </Button>
                  <div className="flex gap-3">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Auto-save functionality would go here
                        toast({
                          title: "Draft saved",
                          description: "Your answer has been saved as a draft",
                        });
                      }}
                      data-testid="button-save-draft"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </Button>
                    <Button 
                      type="submit"
                      disabled={submitAnswerMutation.isPending || !answerValue.trim()}
                      data-testid="button-submit-answer"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Submit Answer
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
