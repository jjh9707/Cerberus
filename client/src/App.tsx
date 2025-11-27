import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider, useGame } from "@/lib/GameContext";
import Header from "@/components/Header";
import Home from "@/pages/Home";
import Learn from "@/pages/Learn";
import Quiz from "@/pages/Quiz";
import Deepvoice from "@/pages/Deepvoice";
import Parents from "@/pages/Parents";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { money, moneyChange } = useGame();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header money={money} moneyChange={moneyChange} />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/learn" component={Learn} />
        <Route path="/learn/:moduleId" component={Quiz} />
        <Route path="/deepvoice" component={Deepvoice} />
        <Route path="/parents" component={Parents} />
        <Route component={NotFound} />
      </Switch>
      <footer className="py-6 border-t bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>필터온 - 청소년을 위한 사이버 보안 교육</p>
          <p className="mt-1">안전한 인터넷 사용법을 배워요!</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
