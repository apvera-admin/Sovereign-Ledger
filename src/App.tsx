import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import DocumentView from "./pages/DocumentView";
import KnowledgeBasePage from "./pages/KnowledgeBase";
import ResetPassword from "./pages/ResetPassword";
import ProfilePage from "@/components/ProfilePage";
import { useAppContext } from "@/contexts/AppContext";

const queryClient = new QueryClient();

const ProfileRoute = () => {
  const { user } = useAppContext();
  
  if (!user) {
    return <Login />;
  }
  
  return (
    <ProfilePage 
      userEmail={user.email || ''} 
      onBack={() => window.history.back()}
    />
  );
};

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfileRoute />} />
              <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
              <Route path="/document/:recordNumber" element={<DocumentView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
