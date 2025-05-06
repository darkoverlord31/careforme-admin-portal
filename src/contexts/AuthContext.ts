// src/contexts/AuthContext.ts

import { createContext } from "react";
// *** Import the AuthContextType from the AuthContext.tsx file ***
import { AuthContextType } from "./AuthContext.tsx"; // <-- Import from the provider file

// Define and export the Auth context object
// This file now ONLY exports the context object and imports its type
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The AuthContextType interface is defined and exported from AuthContext.tsx
// The AuthProvider component is defined and exported from AuthContext.tsx
// The useAuth hook is defined and exported from src/hooks/useAuth.ts
