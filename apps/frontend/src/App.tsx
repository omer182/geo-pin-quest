import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreateRoomPage from "./pages/CreateRoomPage";
import { RoomLobby } from "./components/multiplayer/RoomLobby";
import { MultiplayerGame } from "./components/multiplayer/MultiplayerGame";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Multiplayer Routes */}
          <Route path="/multiplayer/create" element={<CreateRoomPage />} />
          <Route path="/multiplayer/join/:roomId?" element={<Index />} />
          <Route path="/multiplayer/lobby/:roomId" element={<RoomLobby />} />
          <Route path="/multiplayer/game/:roomId" element={<MultiplayerGame />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
