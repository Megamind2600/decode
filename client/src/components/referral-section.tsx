import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { userApi, marketingApi } from "@/lib/api";
import { Copy, MessageCircle, Linkedin, Mail, Trophy } from "lucide-react";

export function ReferralSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shareMessage, setShareMessage] = useState("");

  const { data: referralStats } = useQuery({
    queryKey: ["/api/user", user?.id, "referrals"],
    queryFn: () => userApi.getReferrals(user!.id),
    enabled: !!user?.id,
  });

  const { data: marketingConfig } = useQuery({
    queryKey: ["/api/marketing", user?.abGroup],
    queryFn: () => marketingApi.getConfig(user!.abGroup),
    enabled: !!user?.abGroup,
  });

  // Set default share message from marketing config
  useEffect(() => {
    if (!user) return;
    
    const msg = marketingConfig?.referralMessage?.replace("{referralCode}", user.referralCode || "") || 
      `Hey! I've been practicing interview questions on AI InterviewPrep and it's amazing! 🚀 The AI feedback is super detailed and helping me improve. You should try it out - use my referral code ${user.referralCode} to get 5 free bonus questions! 💪`;
    
    setShareMessage(msg);
  }, [marketingConfig, user?.referralCode]);

  const copyReferralCode = async () => {
    if (user?.referralCode) {
      try {
        await navigator.clipboard.writeText(user.referralCode);
        toast({
          title: "Copied!",
          description: "Referral code copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Please copy the code manually",
          variant: "destructive",
        });
      }
    }
  };

  const generateShareLinks = () => {
    const message = encodeURIComponent(shareMessage);
    return {
      whatsapp: `https://wa.me/?text=${message}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${message}`,
      email: `mailto:?subject=${encodeURIComponent("Try AI InterviewPrep!")}&body=${message}`,
    };
  };

  const shareLinks = generateShareLinks();

  if (!user) return null;

  return (
    <section className="py-12 bg-gradient-to-r from-primary/10 to-secondary/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg" data-testid="card-referral">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">Share & Earn More Questions</h2>
              <p className="text-lg text-muted-foreground">
                {marketingConfig?.referralDescription || 
                 "Invite friends and get 10 bonus questions for each successful referral. Your friends get 5 questions to start!"
                }
              </p>
            </div>

            {/* Referral Code */}
            <Card className="bg-muted mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Your Referral Code</label>
                    <div className="text-2xl font-mono font-bold text-primary" data-testid="text-referral-code">
                      {user.referralCode}
                    </div>
                  </div>
                  <Button 
                    onClick={copyReferralCode}
                    variant="outline"
                    data-testid="button-copy-code"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pre-written Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Share This Message</label>
              <Textarea
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                className="min-h-[120px]"
                data-testid="textarea-share-message"
              />
            </div>

            {/* Social Share Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Button
                asChild
                className="bg-[#25D366] hover:bg-[#25D366]/90 text-white p-4 h-auto"
                data-testid="button-share-whatsapp"
              >
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-3 h-5 w-5" />
                  Share on WhatsApp
                </a>
              </Button>
              <Button
                asChild
                className="bg-[#0077B5] hover:bg-[#0077B5]/90 text-white p-4 h-auto"
                data-testid="button-share-linkedin"
              >
                <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="mr-3 h-5 w-5" />
                  Post on LinkedIn
                </a>
              </Button>
              <Button
                asChild
                className="bg-[#EA4335] hover:bg-[#EA4335]/90 text-white p-4 h-auto"
                data-testid="button-share-email"
              >
                <a href={shareLinks.email}>
                  <Mail className="mr-3 h-5 w-5" />
                  Send via Email
                </a>
              </Button>
            </div>

            {/* Referral Stats */}
            <div className="pt-6 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary" data-testid="text-total-referrals">
                    {referralStats?.totalReferrals || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Referrals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary" data-testid="text-questions-earned">
                    {referralStats?.questionsEarned || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Questions Earned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent flex items-center justify-center">
                    <Trophy className="mr-1 h-6 w-6" />
                    <span data-testid="text-rank">#1</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Leaderboard Rank</div>
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            {referralStats && (
              <div className="flex justify-center gap-2 mt-4">
                {referralStats.totalReferrals >= 1 && (
                  <Badge variant="secondary">First Referral 🎉</Badge>
                )}
                {referralStats.totalReferrals >= 5 && (
                  <Badge variant="default">Referral Champion 🏆</Badge>
                )}
                {referralStats.totalReferrals >= 10 && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    Master Recruiter 👑
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
