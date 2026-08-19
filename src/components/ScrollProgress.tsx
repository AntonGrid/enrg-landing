import { motion, useScroll } from "framer-motion";

/** Neon scroll progress bar above the header. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-neon via-cyber to-lime"
      style={{
        scaleX: scrollYProgress,
        boxShadow: "0 0 12px rgba(150,247,255,0.9)",
      }}
    />
  );
}
