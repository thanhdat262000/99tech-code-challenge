import "./App.css";
import Swap from "@/components/Swap/Swap";
import { Header } from "@/components/Header";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <Swap />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
