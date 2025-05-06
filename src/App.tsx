
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext.tsx"; // <-- Add .tsx extension
import { useEffect } from "react";
import { initializeSampleData } from "@/lib/firebase";

// Layout
import Layout from "@/components/Layout";

// Pages
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import DoctorsPage from "@/pages/DoctorsPage";
import AddEditDoctorPage from "@/pages/AddEditDoctorPage";
import ViewDoctorPage from "@/pages/ViewDoctorPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialize sample data for demo
  useEffect(() => {
    initializeSampleData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route
                path="/"
                element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                }
              />
              
              <Route
                path="/doctors"
                element={
                  <Layout>
                    <DoctorsPage />
                  </Layout>
                }
              />
              
              <Route
                path="/doctors/add"
                element={
                  <Layout>
                    <AddEditDoctorPage />
                  </Layout>
                }
              />
              
              <Route
                path="/doctors/edit/:id"
                element={
                  <Layout>
                    <AddEditDoctorPage />
                  </Layout>
                }
              />
              
              <Route
                path="/doctors/view/:id"
                element={
                  <Layout>
                    <ViewDoctorPage />
                  </Layout>
                }
              />
              
              <Route
                path="/reports"
                element={
                  <Layout>
                    <ReportsPage />
                  </Layout>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <Layout>
                    <SettingsPage />
                  </Layout>
                }
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
