import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import HowItWorks from "./components/HowItWorks";
import Tokenomics from "./components/Tokenomics";
import Partners from "./components/Partners";
import Cta from "./components/Cta";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <Tokenomics />
        <Partners />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
