import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";
import { useVideoStore } from "../store/videoStore";
import { motion } from "framer-motion";

const HomePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  const { joinRandom } = useVideoStore();
  const Navigate = useNavigate();

  const handleLogout = () => {
    logout();
    Navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-[#1a1a1a] border-b border-[#2a2a2a] shadow-md z-10">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          StrangerConnect
        </h1>
        <div className="flex items-center gap-4">
          <button
            className="sm:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="hidden sm:flex gap-4">
            <button className="text-gray-400 hover:text-white transition">
              More Options
            </button>
            <button
              className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-[#1a1a1a] border-b border-[#333] px-4 py-2 space-y-2">
          <button className="w-full text-left text-gray-300 hover:text-white">
            More Options
          </button>
          <button
            className="w-full text-left bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent drop-shadow-xl p-4"
        >
          Meet Strangers.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-lg text-gray-400"
        >
          Chat with a random person across the world 🌍
        </motion.p>

        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 0px 20px rgba(0,255,255,0.6)",
          }}
          whileTap={{ scale: 0.95 }}
          className="mt-10 text-xl font-semibold px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
          onClick={() => {
            Navigate("/finding-user");
            joinRandom();
          }}
        >
          Connect Now!
        </motion.button>
      </main>
    </div>
  );
};

export default HomePage;
