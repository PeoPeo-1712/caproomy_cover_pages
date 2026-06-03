import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip.jsx";
import PersonalCoverPage from "./pages/PersonalCoverPage.jsx";
import PersonalCoverEditorPage from "./pages/PersonalCoverEditorPage.jsx";
import { useEffect } from "react";

const queryClient = new QueryClient();

function RouteHandler() {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    if (location === "/") {
      setLocation("/personal-cover");
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/personal-cover/edit" component={PersonalCoverEditorPage} />
      <Route path="/personal-cover" component={PersonalCoverPage} />
      <Route path="/">
        <div className="min-h-screen w-full flex items-center justify-center bg-[#050007] text-white">
          <div className="animate-pulse">Loading experience...</div>
        </div>
      </Route>
      <Route>
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050007] text-white">
          <h1 className="text-4xl font-bold tracking-tighter text-pink-400">404</h1>
          <p className="mt-2 text-zinc-400">Memory not found.</p>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <RouteHandler />
        </WouterRouter>
        <Toaster theme="dark" position="bottom-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
