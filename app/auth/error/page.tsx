"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "CredentialsSignin":
        return "Invalid email or password. Please check your credentials and try again.";
      case "AccessDenied":
        return "Access denied. You don't have permission to access this resource.";
      case "Verification":
        return "Email verification failed. Please check your email and try again.";
      case "Configuration":
        return "Authentication configuration error. Please contact support.";
      case "Default":
      default:
        return "An unexpected error occurred during authentication. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <CardTitle className="text-2xl">Authentication Error</CardTitle>
                <CardDescription>
                  There was a problem with your authentication
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {getErrorMessage(error)}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2">
              <Link href="/auth/signin">
                <Button className="w-full">Try Again</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 