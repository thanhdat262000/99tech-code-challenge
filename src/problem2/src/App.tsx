import "./App.css";
import Swap from "@/components/Swap";
import { Header } from "@/components/Header";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <Swap />
      </main>
    </div>
  );
}

export default App;
