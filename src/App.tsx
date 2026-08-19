import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Stats from "./components/Stats";
import HowItWorks from "./components/HowItWorks";
import Tokenomics from "./components/Tokenomics";
import Partners from "./components/Partners";
import Cta from "./components/Cta";
import Footer from "./components/Footer";
import BootScreen from "./components/BootScreen";
import CursorGlow from "./components/CursorGlow";
import ScrollProgress from "./components/ScrollProgress";

export default function App() {
  const [booting, setBooting] = useState(true);

  // Prevent scrolling under the boot screen
  useEffect(() => {
    document.body.style.overflow = booting ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [booting]);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <AnimatePresence>
        {booting && <BootScreen onDone={() => setBooting(false)} />}
      </AnimatePresence>

      {/* Global layers: drifting aurora background + CRT scanlines + cursor glow */}
      <div className="aurora" aria-hidden="true">
        <span className="aurora__blob aurora__blob--1" />
        <span className="aurora__blob aurora__blob--2" />
        <span className="aurora__blob aurora__blob--3" />
      </div>
      <div className="scanlines" aria-hidden="true" />
      <CursorGlow />
      <ScrollProgress />

      <Navbar />
      <main>
        <Hero />
        <Marquee />
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
