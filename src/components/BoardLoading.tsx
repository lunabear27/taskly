import React from "react";
import { Card, CardContent } from "./ui/card";
import { Loader2 } from "lucide-react";

export const BoardLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Loading Board</h2>
          <p className="text-muted-foreground">
            Please wait while we load your board...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
