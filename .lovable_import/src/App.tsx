import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Promises from "./pages/Promises";
import PromiseDetail from "./pages/PromiseDetail";
import Politicians from "./pages/Politicians";
import PoliticianDetail from "./pages/PoliticianDetail";
import Parties from "./pages/Parties";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/promises" element={<Promises />} />
          <Route path="/promises/:id" element={<PromiseDetail />} />
          <Route path="/politicians" element={<Politicians />} />
          <Route path="/politicians/:id" element={<PoliticianDetail />} />
          <Route path="/parties" element={<Parties />} />
          <Route path="/parties/:id" element={<Parties />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:id" element={<CategoryDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/methodology" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
