/* eslint-disable @typescript-eslint/no-explicit-any */
// src/contexts/AuthContext.tsx

import React, { useState, useEffect, ReactNode } from "react"; // Removed createContext and useContext

// Import the AuthContext object from its separate file
// This file now imports the context object and defines/exports the provider component and the type
import { AuthContext } from "./AuthContext.ts"; // <-- Import the context object

// Import specific Firebase Auth functions to provide type information
import {
  signInWithEmailAndPassword, // Used in the login function
  signOut, // Used in the logout function
  onAuthStateChanged, // Used in the useEffect listener
  Auth // Import the Auth type itself
} from 'firebase/auth';

// Import the initialized Firebase Auth instance from your config
// Ensure this path is correct relative to this file's location
import { auth } from "../firebaseConfig"; // <-- This import should be correct if firebaseConfig.ts is in src

// Import the useToast hook from your UI library
import { useToast } from "@/components/ui/use-toast"; // Assuming this path is correct

// Define the shape of the Admin User (can be simple for now)
type User = {
  uid: string;
  email: string | null; // Allow email to be null as per FirebaseUser type
} | null;

// *** Define and Export the AuthContextType interface from THIS file ***
// This interface is used by the Context object file and the hook file
export type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  // You might also add an error state here if you want to display errors in the UI
  // error: string | null;
};

// *** Removed the AuthContext object definition and export from here ***
// It is now in src/contexts/AuthContext.ts

// Define the Auth Provider component
// This is the ONLY component exported from this file now
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  // We can use the error state from the context if needed for UI display
  // const [error, setError] = useState<string | null>(null);

  // Use the toast hook from your UI library
  const { toast } = useToast();

  useEffect(() => {
    // Listen for authentication state changes using the imported onAuthStateChanged function
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // firebaseUser is of type FirebaseAuthUser | null
      if (firebaseUser) {
        // User is signed in
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email, // firebaseUser.email is string | null
        });
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false); // Auth state is loaded
    });

    // Clean up the listener when the component unmounts
    return unsubscribe;
  }, []); // Empty dependency array means this runs once on mount

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Call the signInWithEmailAndPassword function using the imported auth instance
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // userCredential.user is of type FirebaseAuthUser
      setUser(userCredential.user);
      // Using localStorage is common in web apps to persist login state across tabs/reloads
      localStorage.setItem("user", JSON.stringify(userCredential.user)); // Note: Storing full user object might not be best practice, consider storing only necessary info or using secure cookies/storage
      toast({
        title: "Login Successful",
        description: "Welcome to CareForMe Admin Portal",
      });
    } catch (error: any) { // Changed type from 'any' to 'Error'
      // setError(error.message); // Set error state if you want to display it in the UI
      console.error("Login failed:", error); // Log the error
      toast({
        title: "Login Failed",
        description: error.message, // Display the error message in the toast
        variant: "destructive",
      });
      // throw error; // You might not need to re-throw if toast handles feedback
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
       // Call the signOut function using the imported auth instance
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("user");
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    } catch (error: any) { // Changed type from 'any' to 'Error'
      // setError(error.message); // Set error state if needed
      console.error("Logout failed:", error); // Log the error
      toast({
        title: "Logout Failed",
        description: error.message, // Display error message
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// *** Removed the useAuth hook definition and export from here ***
// It is now in src/hooks/useAuth.ts

// *** Export the AuthContextType interface from here (already done above) ***
// *** Removed the AuthContext object export from here ***
// It is now exported from src/contexts/AuthContext.ts
