"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar () {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex flex-col sticky top-0 z-50 justify-between border-b border-white/10 bg-[#080b14] px-4 py-4 md:px-8 md:flex-row">
      <div className="flex w-full items-center justify-between"> 
         <h1 className="text-2xl font-bold text-cyan-400">
            RiskRadar
          </h1>

          <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-2 py-2 rounded:lg transition md:hidden flex text-slate-100 hover:text-cyan-400"
          >
              {menuOpen ? '✕' : '☰'}
          </button>
      </div>

      <div className="hidden items-center gap-6 md:flex">
        <a href="#home" className="text-slate-300 transition hover:text-cyan-400">Home</a>
        <a href="#features" className="text-slate-300 transition hover:text-cyan-400">Features</a>
        <a href="#how-it-works" className="text-slate-300 transition hover:text-cyan-400 whitespace-nowrap">How It Works</a>
        <a href="/" className="text-slate-300 transition hover:text-cyan-400">Login</a>

        <button className="rounded-lg cursor-pointer bg-cyan-400 px-5 py-2 font-medium text-slate-950 transition hover:bg-cyan-300 whitespace-nowrap">
          Get Started
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0}}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col pt-4 gap-6 md:hidden bg-[#080b14] border-t border-white/10">
            <a href="/" className="block px-2 py-2 text-slate-300 transition hover:text-cyan-400">Home</a>
            <a href="/" className="px-2 py-2 text-slate-300 transition hover:text-cyan-400">Features</a>
            <a href="/" className="px-2 py-2 text-slate-300 transition hover:text-cyan-400">How It Works</a>
            <a href="/" className="px-2 py-2 text-slate-300 transition hover:text-cyan-400">Login</a>

            <button className="rounded-lg bg-cyan-400 px-5 py-2 font-medium text-slate-950 transition hover:bg-cyan-300">
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}