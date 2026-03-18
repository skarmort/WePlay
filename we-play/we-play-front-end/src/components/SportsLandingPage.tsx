import React, { useState, useEffect } from 'react';
import SportsHeader from './SportsHeader';
import SportSection from './SportsSection';
import SportsFooter from './SportsFooter';
//import animations from '../styles/animations';

const SportsLandingPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sports = [
    {
      sport: 'Football',
      emoji: '⚽',
      description: 'Master the beautiful game with our comprehensive football training platform. Perfect your dribbling, passing, and shooting techniques while connecting with players from around the globe.',
      animationType: 'dribble' as const,
      color: '#00ff41'
    },
    {
      sport: 'Basketball',
      emoji: '🏀',
      description: 'Elevate your basketball skills to new heights. Practice your shooting form, improve your handles, and dominate the court with our advanced training modules and community challenges.',
      animationType: 'shoot' as const,
      color: '#ff6b35'
    },
    {
      sport: 'American Football',
      emoji: '🏈',
      description: 'Experience the intensity of American football like never before. Develop strategic thinking, improve your physical conditioning, and master both offensive and defensive plays.',
      animationType: 'run' as const,
      color: '#4a90e2'
    },
    {
      sport: 'Boxing',
      emoji: '🥊',
      description: 'Step into the ring with confidence. Learn proper technique, build strength and endurance, and master the sweet science of boxing through our expert-guided training programs.',
      animationType: 'punch' as const,
      color: '#e74c3c'
    },
    {
      sport: 'E-Sports',
      emoji: '🎮',
      description: 'Dominate the digital battlefield. Enhance your gaming skills, learn advanced strategies, and compete in the fastest-growing sport in the world with our cutting-edge e-sports platform.',
      animationType: 'game' as const,
      color: '#9b59b6'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      
      
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        
        <div className="relative z-10 text-center space-y-8 px-6 mt-16">
          <div className="relative inline-block" style={{ perspective: '1000px' }}>
            <h1 className="text-8xl md:text-9xl font-bold text-white mb-8 relative z-10">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                WePlay!
              </span>
            </h1>
            
            <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
              {['⚽', '🏀', '🏈', '🥊', '🎮', '🎾'].map((emoji, index) => (
                <div 
                  key={index}
                  className="absolute text-3xl"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: `orbit3d-${index + 1} ${8 + index * 0.5}s linear infinite`
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-3xl font-bold text-yellow-400 mb-4 tracking-wide">
            We came. We saw. We dreamt. We played!!
          </p>
          
          <p className="text-xl text-blue-300 font-semibold mb-8">
            For the players!!
          </p>
          
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Your ultimate destination for sports training, community, and competition across multiple disciplines
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 rounded-full font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Start Your Journey
            </button>
            <button className="border-2 border-white/30 text-white px-10 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {sports.map((sportData, index) => (
        <SportSection
          key={sportData.sport}
          {...sportData}
          reverse={index % 2 === 1}
        />
      ))}

      <SportsFooter />
      
      <style>{`
        @keyframes orbit3d-1 {
          0% { 
            transform: translate(-50%, -50%) rotateY(0deg) rotateX(0deg) translateZ(200px) rotateY(0deg) rotateX(0deg);
            opacity: 1;
            scale: 1;
          }
          25% { 
            transform: translate(-50%, -50%) rotateY(90deg) rotateX(15deg) translateZ(200px) rotateY(-90deg) rotateX(-15deg);
            opacity: 0.8;
            scale: 0.9;
          }
          50% { 
            transform: translate(-50%, -50%) rotateY(180deg) rotateX(0deg) translateZ(200px) rotateY(-180deg) rotateX(0deg);
            opacity: 0.6;
            scale: 0.7;
          }
          75% { 
            transform: translate(-50%, -50%) rotateY(270deg) rotateX(-15deg) translateZ(200px) rotateY(-270deg) rotateX(15deg);
            opacity: 0.8;
            scale: 0.9;
          }
          100% { 
            transform: translate(-50%, -50%) rotateY(360deg) rotateX(0deg) translateZ(200px) rotateY(-360deg) rotateX(0deg);
            opacity: 1;
            scale: 1;
          }
        }
        
        @keyframes orbit3d-2 {
          0% { 
            transform: translate(-50%, -50%) rotateY(45deg) rotateX(30deg) translateZ(180px) rotateY(-45deg) rotateX(-30deg);
            opacity: 1;
            scale: 1;
          }
          25% { 
            transform: translate(-50%, -50%) rotateY(135deg) rotateX(45deg) translateZ(180px) rotateY(-135deg) rotateX(-45deg);
            opacity: 0.7;
            scale: 0.8;
          }
          50% { 
            transform: translate(-50%, -50%) rotateY(225deg) rotateX(30deg) translateZ(180px) rotateY(-225deg) rotateX(-30deg);
            opacity: 0.5;
            scale: 0.6;
          }
          75% { 
            transform: translate(-50%, -50%) rotateY(315deg) rotateX(45deg) translateZ(180px) rotateY(-315deg) rotateX(-45deg);
            opacity: 0.7;
            scale: 0.8;
          }
          100% { 
            transform: translate(-50%, -50%) rotateY(405deg) rotateX(30deg) translateZ(180px) rotateY(-405deg) rotateX(-30deg);
            opacity: 1;
            scale: 1;
          }
        }
        
        @keyframes orbit3d-3 {
          0% { 
            transform: translate(-50%, -50%) rotateY(90deg) rotateX(-20deg) translateZ(220px) rotateY(-90deg) rotateX(20deg);
            opacity: 1;
            scale: 1;
          }
          25% { 
            transform: translate(-50%, -50%) rotateY(180deg) rotateX(-35deg) translateZ(220px) rotateY(-180deg) rotateX(35deg);
            opacity: 0.8;
            scale: 0.9;
          }
          50% { 
            transform: translate(-50%, -50%) rotateY(270deg) rotateX(-20deg) translateZ(220px) rotateY(-270deg) rotateX(20deg);
            opacity: 0.6;
            scale: 0.7;
          }
          75% { 
            transform: translate(-50%, -50%) rotateY(360deg) rotateX(-35deg) translateZ(220px) rotateY(-360deg) rotateX(35deg);
            opacity: 0.8;
            scale: 0.9;
          }
          100% { 
            transform: translate(-50%, -50%) rotateY(450deg) rotateX(-20deg) translateZ(220px) rotateY(-450deg) rotateX(20deg);
            opacity: 1;
            scale: 1;
          }
        }
        
        @keyframes orbit3d-4 {
          0% { 
            transform: translate(-50%, -50%) rotateY(180deg) rotateX(45deg) translateZ(160px) rotateY(-180deg) rotateX(-45deg);
            opacity: 1;
            scale: 1;
          }
          25% { 
            transform: translate(-50%, -50%) rotateY(270deg) rotateX(60deg) translateZ(160px) rotateY(-270deg) rotateX(-60deg);
            opacity: 0.7;
            scale: 0.8;
          }
          50% { 
            transform: translate(-50%, -50%) rotateY(360deg) rotateX(45deg) translateZ(160px) rotateY(-360deg) rotateX(-45deg);
            opacity: 0.5;
            scale: 0.6;
          }
          75% { 
            transform: translate(-50%, -50%) rotateY(450deg) rotateX(60deg) translateZ(160px) rotateY(-450deg) rotateX(-60deg);
            opacity: 0.7;
            scale: 0.8;
          }
          100% { 
            transform: translate(-50%, -50%) rotateY(540deg) rotateX(45deg) translateZ(160px) rotateY(-540deg) rotateX(-45deg);
            opacity: 1;
            scale: 1;
          }
        }
        
        @keyframes orbit3d-5 {
          0% { 
            transform: translate(-50%, -50%) rotateY(270deg) rotateX(60deg) translateZ(190px) rotateY(-270deg) rotateX(-60deg);
            opacity: 1;
            scale: 1;
          }
          25% { 
            transform: translate(-50%, -50%) rotateY(360deg) rotateX(75deg) translateZ(190px) rotateY(-360deg) rotateX(-75deg);
            opacity: 0.8;
            scale: 0.9;
          }
          50% { 
            transform: translate(-50%, -50%) rotateY(450deg) rotateX(60deg) translateZ(190px) rotateY(-450deg) rotateX(-60deg);
            opacity: 0.6;
            scale: 0.7;
          }
          75% { 
            transform: translate(-50%, -50%) rotateY(540deg) rotateX(75deg) translateZ(190px) rotateY(-540deg) rotateX(-75deg);
            opacity: 0.8;
            scale: 0.9;
          }
          100% { 
            transform: translate(-50%, -50%) rotateY(630deg) rotateX(60deg) translateZ(190px) rotateY(-630deg) rotateX(-60deg);
            opacity: 1;
            scale: 1;
          }
        }
        
        @keyframes orbit3d-6 {
          0% { 
            transform: translate(-50%, -50%) rotateY(315deg) rotateX(-45deg) translateZ(140px) rotateY(-315deg) rotateX(45deg);
            opacity: 1;
            scale: 1;
          }
          25% { 
            transform: translate(-50%, -50%) rotateY(405deg) rotateX(-60deg) translateZ(140px) rotateY(-405deg) rotateX(60deg);
            opacity: 0.7;
            scale: 0.8;
          }
          50% { 
            transform: translate(-50%, -50%) rotateY(495deg) rotateX(-45deg) translateZ(140px) rotateY(-495deg) rotateX(45deg);
            opacity: 0.5;
            scale: 0.6;
          }
          75% { 
            transform: translate(-50%, -50%) rotateY(585deg) rotateX(-60deg) translateZ(140px) rotateY(-585deg) rotateX(60deg);
            opacity: 0.7;
            scale: 0.8;
          }
          100% { 
            transform: translate(-50%, -50%) rotateY(675deg) rotateX(-45deg) translateZ(140px) rotateY(-675deg) rotateX(45deg);
            opacity: 1;
            scale: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SportsLandingPage;