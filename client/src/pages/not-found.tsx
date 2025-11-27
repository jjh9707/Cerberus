import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">페이지를 찾을 수 없어요</h1>
          </div>

          <p className="text-muted-foreground">
            찾으시는 페이지가 존재하지 않거나 이동되었을 수 있어요.
          </p>

          <Link href="/">
            <Button className="gap-2" data-testid="button-home-404">
              <Home className="w-4 h-4" />
              홈으로 돌아가기
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
