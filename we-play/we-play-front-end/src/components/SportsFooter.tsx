import React from 'react';
import AnimatedLogo from './AnimatedLogo';
import { Link } from 'react-router-dom';

const SportsFooter: React.FC = () => {
  return (
    <footer className="bg-black text-white py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <Link to="/">
            <AnimatedLogo />
          </Link>
        </div>
        <p className="text-gray-400 mb-8">
          Join thousands of athletes worldwide in their journey to excellence
        </p>
        <div className="flex justify-center space-x-8 text-sm text-gray-400">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
        </div>
        <p className="text-gray-500 mt-8 text-sm">
          © 2025 WePlay! All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default SportsFooter;