// src/pages/LoginPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// *** Update the import path for useAuth ***
// It should now point to your new useAuth.ts file
import { useAuth } from "@/hooks/useAuth"; // Assuming your @/ alias includes src, and hooks is a folder in src
// OR using relative path if hooks is in src and pages is in src/pages:
// import { useAuth } from "../hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("admin@careforme.com");
  const [password, setPassword] = useState("admin123");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // The AuthContext's onAuthStateChanged listener will update the user state,
      // and you might have routing set up elsewhere to redirect based on the user state.
      // If not, this navigate("/") will happen immediately after the login promise resolves,
      // potentially before the onAuthStateChanged listener updates the user state.
      // Consider handling navigation based on the 'user' state in a higher-level component or router.
      navigate("/"); // Navigate to the dashboard on successful login
    } catch (error) {
      console.error("Login failed:", error);
      // The AuthContext already shows a toast on error, so no need for another error display here unless you want different UI feedback.
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-careforme-light-bg p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-careforme-cyan">CareForMe</h1>
          <p className="mt-2 text-careforme-text-secondary">Admin Portal</p>
        </div>

        <Card className="border border-border shadow-lg">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@careforme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-careforme-cyan hover:bg-careforme-cyan/90"
                disabled={loading} // Disable button while loading
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 text-center text-sm text-careforme-text-secondary">
          <p>For demo purposes, use:</p>
          <p className="font-medium">
            Email: admin@careforme.com | Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
