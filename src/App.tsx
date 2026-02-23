import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import RoleSelection from "./pages/RoleSelection";
import ShopkeeperDashboard from "./pages/ShopkeeperDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import ShopDetail from "./pages/ShopDetail";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/role-select" element={<RoleSelection />} />
            <Route path="/shopkeeper" element={
              <ProtectedRoute role="shopkeeper"><ShopkeeperDashboard /></ProtectedRoute>
            } />
            <Route path="/customer" element={
              <ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>
            } />
            <Route path="/shop/:shopId" element={
              <ProtectedRoute role="customer"><ShopDetail /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
