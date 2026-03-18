import React, { useState, useEffect } from 'react';
import SportObject3D from './SportObject3D';

interface SportSectionProps {
  sport: string;
  emoji: string;
  description: string;
  animationType: 'dribble' | 'shoot' | 'run' | 'punch' | 'game';
  color: string;
  reverse?: boolean;
}

const SportSection: React.FC<SportSectionProps> = ({ 
  sport, 
  emoji, 
  description, 
  animationType,
  color,
  reverse = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`sport-${sport}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [sport]);

  return (
    <section 
      id={`sport-${sport}`}
      className={`min-h-screen flex items-center justify-center px-8 py-16 ${
        reverse ? 'bg-gradient-to-l' : 'bg-gradient-to-r'
      } from-slate-900 via-purple-900 to-slate-900`}
    >
      <div className={`max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
        reverse ? 'lg:grid-flow-col-dense' : ''
      }`}>
        <div className={`${reverse ? 'lg:col-start-2' : ''} flex justify-center`}>
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-20'
          }`}>
            <SportObject3D 
              sport={sport}
              animationType={animationType}
              color={color}
            />
          </div>
        </div>
        
        <div className={`${reverse ? 'lg:col-start-1' : ''} space-y-8`}>
          <div className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 transform translate-x-0' : `opacity-0 transform ${reverse ? 'translate-x-20' : '-translate-x-20'}`
          }`}>
            <h2 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {sport}
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              {description}
            </p>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Track your performance and progress</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
                <span>Connect with other athletes worldwide</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-200"></div>
                <span>Join tournaments and competitions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
                <span>Access professional training resources</span>
              </div>
            </div>
            <button className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Get Started with {sport}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SportSection;