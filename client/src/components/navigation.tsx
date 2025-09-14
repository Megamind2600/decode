import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Brain, User } from "lucide-react";

export function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary flex items-center">
                <Brain className="mr-2 h-6 w-6" />
                AI InterviewPrep
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-muted-foreground" data-testid="questions-remaining">
                {user.questionsAvailable} questions left
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={logout}
              data-testid="button-profile"
            >
              <User className="mr-2 h-4 w-4" />
              Login/LogOut. For support: ashuderkar@gmail.com
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
