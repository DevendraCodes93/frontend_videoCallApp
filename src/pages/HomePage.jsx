import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";
import { useVideoStore } from "../store/videoStore";
const HomePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  const { joinRandom, socket } = useVideoStore();
  const Navigate = useNavigate();
  const handleLogout = () => {
    logout();
    Navigate("/login");
  };

  return (
    <div className="min-h-screen  text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-gray-500 shadow-md">
        <h1 className="text-xl font-bold">StrangerConnect</h1>
        <div className="flex items-center gap-4">
          <button className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="hidden sm:flex gap-4">
            <button className="hover:underline">More Options</button>
            <button
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              onClick={() => handleLogout()}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Toggle menu on small screens */}
      {menuOpen && (
        <div className="sm:hidden bg-gray-500  px-4 py-2 space-y-2">
          <button className="w-full text-left hover:underline">
            More Options
          </button>
          <button
            className="w-full text-left bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            onClick={() => handleLogout()}
          >
            Logout
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center">
        <button
          className="text-2xl  bg-blue-600 px-4 py-4 w-[70%] rounded-lg hover:bg-blue-700 transition"
          onClick={() => {
            Navigate("/finding-user");
            joinRandom();
          }}
        >
          Connect to Random Stranger
        </button>
      </main>
    </div>
  );
};

export default HomePage;
