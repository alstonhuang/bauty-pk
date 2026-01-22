'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Trophy, Swords, Upload, Sparkles } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#0a0a0f]">

      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl z-10 flex flex-col items-center"
      >
        <motion.div variants={itemVariants} className="text-center mb-16 relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 text-white/5 text-9xl pointer-events-none"
          >
            ✧
          </motion.div>

          <h1 className="text-7xl font-black mb-6 tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
              Beauty
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
              PK
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            The ultimate visual showdown. Vote for the best, climb the ranks, and discover stunning aesthetics.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
          <Link href="/pk" className="group">
            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/5 backdrop-blur-md rounded-3xl p-8 h-full flex flex-col items-center text-center hover:bg-white/10 transition-all border border-white/5 border-t-pink-500/50 hover:shadow-[0_20px_40px_-10px_rgba(236,72,153,0.3)]"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Swords className="w-8 h-8 text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Start Match</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Judge random pairs in a head-to-head battle. Your vote decides the winner.
              </p>
            </motion.div>
          </Link>

          <Link href="/upload" className="group">
            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/5 backdrop-blur-md rounded-3xl p-8 h-full flex flex-col items-center text-center hover:bg-white/10 transition-all border border-white/5 border-t-purple-500/50 hover:shadow-[0_20px_40px_-10px_rgba(168,85,247,0.3)]"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Upload className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Upload Photo</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Submit your masterpiece. Enter the arena and compete for the top spot.
              </p>
            </motion.div>
          </Link>

          <Link href="/leaderboard" className="group">
            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/5 backdrop-blur-md rounded-3xl p-8 h-full flex flex-col items-center text-center hover:bg-white/10 transition-all border border-white/5 border-t-yellow-500/50 hover:shadow-[0_20px_40px_-10px_rgba(234,179,8,0.3)]"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Leaderboard</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                View the Hall of Fame. See who reigns supreme in the global rankings.
              </p>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-16 text-white/20 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Powered by Next.js & Supabase</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
