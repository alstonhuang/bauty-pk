"use client";

import { motion } from "framer-motion";
import { Heart, Coffee } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: Branding */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
              Beauty PK
            </h3>
            <p className="text-white/40 text-sm">
              Discover and vote for the world's most stunning visuals
            </p>
          </div>

          {/* Center: Support */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-white/60">
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
              <span className="text-sm font-medium">Support this project</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Buy Me a Coffee */}
              <motion.a
                href="https://buymeacoffee.com/registerc"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold rounded-lg shadow-lg hover:shadow-yellow-400/20 transition-shadow"
              >
                <Coffee className="w-4 h-4" />
                <span className="text-sm">Buy me a coffee</span>
              </motion.a>

              {/* PayPal */}
              <motion.a
                href="https://www.paypal.com/paypalme/alstonhuang"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/20 transition-shadow"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .922-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.72-4.458z" />
                </svg>
                <span className="text-sm">PayPal</span>
              </motion.a>
            </div>
          </div>

          {/* Right: Links */}
          <div className="flex flex-col items-center md:items-end gap-2 text-sm text-white/40">
            <p>Made with ❤️ by the community</p>
            <p className="text-xs">© 2026 Beauty PK. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
