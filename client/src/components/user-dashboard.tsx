import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { userApi } from "@/lib/api";
import { TrendingUp, HelpCircle, Users } from "lucide-react";

interface UserDashboardProps {
  onGetMoreQuestions: () => void;
  onShareReferral: () => void;
}

export function UserDashboard({ onGetMoreQuestions, onShareReferral }: UserDashboardProps) {
  const { user } = useAuth();

  const { data: progress } = useQuery({
    queryKey: ["/api/user", user?.id, "progress"],
    queryFn: () => userApi.getProgress(user!.id),
    enabled: !!user?.id,
  });

  const { data: referralStats } = useQuery({
    queryKey: ["/api/user", user?.id, "referrals"],
    queryFn: () => userApi.getReferrals(user!.id),
    enabled: !!user?.id,
  });

  if (!user) return null;

  const progressPercentage = progress ? 
    (progress.questionsCompleted / (progress.questionsCompleted + progress.questionsAvailable)) * 100 : 0;

  return (
    <section className="py-12 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Progress Card */}
          <Card data-testid="card-progress">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Your Progress</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Questions Completed</span>
                  <span data-testid="text-progress">
                    {progress?.questionsCompleted || 0}/{(progress?.questionsCompleted || 0) + (progress?.questionsAvailable || 0)}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <span className="text-2xl font-bold text-primary" data-testid="text-average-score">
                  {progress?.averageScore?.toFixed(1) || "0.0"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Questions Available */}
          <Card data-testid="card-questions">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Available Questions</CardTitle>
              <HelpCircle className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2" data-testid="text-questions-available">
                  {user.questionsAvailable}
                </div>
                <p className="text-sm text-muted-foreground">questions remaining</p>
                <Button 
                  className="mt-4 w-full" 
                  variant="secondary"
                  onClick={onGetMoreQuestions}
                  data-testid="button-get-more-questions"
                >
                  Get More Questions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Referral Stats */}
          <Card data-testid="card-referrals">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Referrals</CardTitle>
              <Users className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Friends Referred</span>
                <span className="font-semibold" data-testid="text-referrals-count">
                  {referralStats?.totalReferrals || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bonus Questions Earned</span>
                <span className="font-semibold text-accent" data-testid="text-bonus-questions">
                  {referralStats?.questionsEarned || 0}
                </span>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={onShareReferral}
                data-testid="button-share-earn"
              >
                Share & Earn
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
