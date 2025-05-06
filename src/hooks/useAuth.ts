// src/hooks/useAuth.ts

import { useContext } from "react";
// *** Import the AuthContext object from its file and the type from the provider file ***
import { AuthContext } from "../contexts/AuthContext.ts"; // <-- Import the context object
import { AuthContextType } from "../contexts/AuthContext.tsx"; // <-- Import the type from the provider file

// Custom hook to easily consume the Auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  // Throw an error if the hook is used outside of an AuthProvider
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
