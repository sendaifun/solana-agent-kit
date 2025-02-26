"use client";

import { motion } from "framer-motion";

export function BackgroundGrid() {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf6/50_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf6/50_1px,transparent_1px)] bg-[size:14px_24px]"
      />
    </div>
  );
}
