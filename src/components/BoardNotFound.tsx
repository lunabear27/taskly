import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";

export const BoardNotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Board not found</h2>
          <p className="text-muted-foreground mb-6">
            The board you're looking for doesn't exist or you don't have
            permission to access it.
          </p>
          <Link to="/dashboard">
            <Button className="shadow-glow hover:shadow-glow-lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
