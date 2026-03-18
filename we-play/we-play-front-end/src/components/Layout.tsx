import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import AnimatedLogo from './AnimatedLogo';
import { ChevronDown, Menu, X, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <AnimatedLogo />
          </Link>
          
          {/* Menu Dropdown */}
          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              aria-label="Open shop"
              className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 text-white"
            >
              <ShoppingBag size={18} />
            </Link>
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 text-white"
              >
                <Menu size={20} />
                <span>Menu</span>
                <ChevronDown 
                  size={16} 
                  className={`transform transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>
              
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden z-50">
                  <Link 
                    to="/" 
                    className="block px-6 py-3 text-gray-800 hover:bg-blue-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🏠 Home
                  </Link>
                  <Link 
                    to="/shop" 
                    className="block px-6 py-3 text-gray-800 hover:bg-blue-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🛍️ Shop
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link 
                        to="/dashboard" 
                        className="block px-6 py-3 text-gray-800 hover:bg-blue-50 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        🎮 Dashboard
                      </Link>
                      <button
                        className="w-full text-left px-6 py-3 text-gray-800 hover:bg-blue-50 transition-colors duration-200"
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                        }}
                      >
                        🚪 Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        className="block px-6 py-3 text-gray-800 hover:bg-blue-50 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        🔐 Log In
                      </Link>
                      <Link 
                        to="/register" 
                        className="block px-6 py-3 text-gray-800 hover:bg-blue-50 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        📝 Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="pt-24"> {/* pt-24 to account for fixed header */}
        <Outlet /> {/* This is where your page content will go */}
      </main>
    </div>
  );
};

export default Layout;