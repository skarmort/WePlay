import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as THREE from 'three';
import { 
  Plus, 
  User, 
  Home, 
  Newspaper, 
  Video, 
  Users, 
  Trophy, 
  Map, 
  Activity, 
  Gamepad2,
  Upload,
  Camera,
  Watch,
  Headphones,
  Zap,
  Heart,
  Target,
  MessageSquare,
  ShoppingBag,
  X,
  ChevronDown,
  Moon,
  Sun,
  Calendar,
  BarChart3
} from 'lucide-react';
import FeedPage from './FeedPage';
import EventsPage from './EventsPage';
import TournamentsPage from './TournamentsPage';
import MapPage from './MapPage';
import StatsPage from './StatsPage';
import ProfilePage from './ProfilePage';
import TeamsPage from './TeamsPage';
import ShopPage from './ShopPage';

type Sport = { name: string; icon: string };
const WePlayLandingPage = () => {
    const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('Home');
  const [activeSubTab, setActiveSubTab] = useState<string>('');
  const [showSportsMenu, setShowSportsMenu] = useState<boolean>(false);
  const [selectedSports, setSelectedSports] = useState<Array<Sport>>([]);
  const [mapView, setMapView] = useState<string>('2D');
  const [showMessages, setShowMessages] = useState<boolean>(false);
  const [showProfilePicture, setShowProfilePicture] = useState<boolean>(false);
  const [activeTheme, setActiveTheme] = useState<string>('default');
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showTournamentMenu, setShowTournamentMenu] = useState<boolean>(false);
  const [showTeamMenu, setShowTeamMenu] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const earthRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);

  const sports = [
    { name: 'Football', icon: '⚽' },
    { name: 'Basketball', icon: '🏀' },
    { name: 'American Football', icon: '🏈' },
    { name: 'Rugby', icon: '🏉' },
    { name: 'Golf', icon: '⛳' },
    { name: 'Tennis', icon: '🎾' },
    { name: 'Volleyball', icon: '🏐' },
    { name: 'Boxing', icon: '🥊' },
    { name: 'Skiing', icon: '⛷️' },
    { name: 'Snowboarding', icon: '🏂' },
    { name: 'Parkour', icon: '🤸' },
    { name: 'Gaming', icon: '🎮' },
    { name: 'Baseball', icon: '⚾' },
    { name: 'Handball', icon: '🤾' }
  ];

  const tabs = [
    { name: 'Home', icon: Home },
    { name: 'Feed', icon: Newspaper },
    { name: 'Events', icon: Calendar },
    { name: 'Tournaments', icon: Trophy },
    { name: 'Teams', icon: Users },
    { name: 'Activity Map', icon: Map },
    { name: 'My Stats', icon: BarChart3 },
    { name: 'Profile', icon: User },
    { name: 'Analytics', icon: Video, hasSubtabs: true },
    { name: 'Communities', icon: Users, hasSubtabs: true },
    { name: 'BioConnect', icon: Activity, hasSubtabs: true },
    { name: 'Game+', icon: Gamepad2 },
    { name: 'Shop', icon: ShoppingBag }
  ];

  const bioConnectOptions = [
    { name: 'Watch', icon: Watch },
    { name: 'Handwrist', icon: Zap },
    { name: 'Headset/HeadBand', icon: Headphones },
    { name: 'Anklebands', icon: Target },
    { name: 'Chest', icon: Heart },
    { name: 'Trunk', icon: Activity },
    { name: 'Quadriceps', icon: Target }
  ];

  useEffect(() => {
    if (!earthRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(60, 60);
    renderer.setClearColor(0x000000, 0);
    (earthRef.current as HTMLDivElement).appendChild(renderer.domElement);
    sceneRef.current = scene;
    rendererRef.current = renderer;
    const earthGeometry = new THREE.SphereGeometry(0.5, 24, 24);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: isDarkMode ? 0x007AFF : 0x2563EB,
      shininess: 30,
      transparent: true,
      opacity: isDarkMode ? 0.8 : 0.95
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    const orbitingObjects: THREE.Mesh[] = [];
    const colors = [0x007AFF, 0x34C759, 0xFF9500];
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.SphereGeometry(0.02, 8, 8);
      const material = new THREE.MeshPhongMaterial({ 
        color: colors[i],
        transparent: true,
        opacity: 0.7 
      });
      const obj = new THREE.Mesh(geometry, material);
      const angle = (i / 3) * Math.PI * 2;
      const radius = 0.8 + (i * 0.1);
      obj.userData = { 
        angle, 
        radius,
        speed: 0.01 + i * 0.005,
      };
      orbitingObjects.push(obj);
      scene.add(obj);
    }
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.6, 100);
    pointLight.position.set(3, 3, 3);
    scene.add(pointLight);
    camera.position.z = 2.5;
    const animate = () => {
      frameRef.current = window.requestAnimationFrame(animate);
      earth.rotation.y += 0.005;
      orbitingObjects.forEach(obj => {
        (obj.userData as any).angle += (obj.userData as any).speed;
        const x = Math.cos((obj.userData as any).angle) * (obj.userData as any).radius;
        const z = Math.sin((obj.userData as any).angle) * (obj.userData as any).radius;
        obj.position.x = x;
        obj.position.z = z;
        obj.position.y = 0;
      });
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      if (earthRef.current && renderer.domElement && (earthRef.current as HTMLDivElement).contains(renderer.domElement)) {
        (earthRef.current as HTMLDivElement).removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.sports-menu')) {
        setShowSportsMenu(false);
      }
      if (!target.closest('.tournament-menu')) {
        setShowTournamentMenu(false);
      }
      if (!target.closest('.team-menu')) {
        setShowTeamMenu(false);
      }
      if (!target.closest('.profile-menu')) {
        setShowProfilePicture(false);
      }
      if (!target.closest('.messages-menu')) {
        setShowMessages(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const addSport = (sport: Sport): void => {
    if (!selectedSports.find((s: Sport) => s.name === sport.name)) {
      setSelectedSports([...selectedSports, sport]);
    }
    setShowSportsMenu(false);
  };
  const removeSport = (sportName: string): void => {
    setSelectedSports(selectedSports.filter((s: Sport) => s.name !== sportName));
    if (activeTheme === sportName.toLowerCase()) {
      setActiveTheme('default');
    }
  };
  const handleSportClick = (sport: Sport): void => {
    setActiveTheme(sport.name.toLowerCase());
  };
  const handleSportRightClick = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>, sport: Sport): void => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(sport.name);
  };
  const handleRemoveSport = (sportName: string): void => {
    removeSport(sportName);
    setShowContextMenu(null);
  };
  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        bg: 'bg-black',
        surface: 'bg-gray-900',
        elevated: 'bg-gray-800',
        border: 'border-gray-800',
        text: 'text-white',
        textMuted: 'text-gray-400',
        textSecondary: 'text-gray-300',
        button: 'bg-gray-800 hover:bg-gray-700 text-white',
        buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
        input: 'bg-gray-800 border-gray-700 text-white placeholder-gray-400',
        shadow: 'shadow-xl shadow-black/20'
      };
    } else {
      return {
        bg: 'bg-white',
        surface: 'bg-gray-50',
        elevated: 'bg-white',
        border: 'border-gray-200',
        text: 'text-gray-900',
        textMuted: 'text-gray-500',
        textSecondary: 'text-gray-700',
        button: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200',
        buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
        input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
        shadow: 'shadow-xl shadow-black/5'
      };
    }
  };
  const theme = getThemeClasses();
  const getTabContent = () => {
    // Render actual page components for main features
    switch (activeTab) {
      case 'Feed':
        return <FeedPage isDarkMode={isDarkMode} />;
      case 'Events':
        return <EventsPage isDarkMode={isDarkMode} />;
      case 'Tournaments':
        return <TournamentsPage isDarkMode={isDarkMode} />;
      case 'Teams':
        return <TeamsPage isDarkMode={isDarkMode} />;
      case 'Activity Map':
        return <MapPage isDarkMode={isDarkMode} />;
      case 'My Stats':
        return <StatsPage isDarkMode={isDarkMode} />;
      case 'Profile':
        return <ProfilePage isDarkMode={isDarkMode} />;
      case 'Home':
        return (
          <div className={`h-full ${theme.bg} relative`}>
            {/* Quick access profile button */}
            <div className="absolute top-4 left-4 z-10">
              <div className="relative profile-menu">
                <button
                  onClick={() => setShowProfilePicture(!showProfilePicture)}
                  className={`w-10 h-10 ${theme.elevated} ${theme.border} rounded-full border transition-all duration-200 transform hover:scale-105 flex items-center justify-center`}
                >
                  <User size={16} className={theme.textMuted} />
                </button>
                {showProfilePicture && (
                  <div className={`absolute top-0 left-14 w-56 ${theme.elevated} ${theme.border} border rounded-2xl p-4`}>
                    <h3 className={`text-sm font-semibold ${theme.text} mb-3`}>Quick Actions</h3>
                    <div className="space-y-2">
                      <button 
                        onClick={() => setActiveTab('Profile')}
                        className={`w-full ${theme.buttonPrimary} px-4 py-2 rounded-full flex items-center gap-2 text-xs font-medium transition-all duration-200`}
                      >
                        <User size={14} />
                        View Profile
                      </button>
                      <button 
                        onClick={() => setActiveTab('My Stats')}
                        className={`w-full ${theme.button} px-4 py-2 rounded-full flex items-center gap-2 text-xs font-medium transition-all duration-200`}
                      >
                        <BarChart3 size={14} />
                        My Stats
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Messages button */}
            <div className="absolute top-4 right-4 z-10">
              <div className="relative messages-menu">
                <button
                  onClick={() => setShowMessages(!showMessages)}
                  className={`${theme.elevated} ${theme.border} border p-2 rounded-full transition-all duration-200 transform hover:scale-105`}
                >
                  <MessageSquare size={16} className={theme.textMuted} />
                </button>
                {showMessages && (
                  <div className={`absolute top-0 right-14 w-72 h-80 ${theme.elevated} ${theme.border} border rounded-2xl transition-all duration-300`}>
                    <div className={`p-4 ${theme.border} border-b flex justify-between items-center`}>
                      <h3 className={`text-sm font-semibold ${theme.text}`}>Messages</h3>
                      <button 
                        onClick={() => setShowMessages(false)}
                        className={`${theme.textMuted} hover:${theme.text} transition-colors`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="p-4 h-full flex items-center justify-center">
                      <p className={`${theme.textMuted} text-xs`}>No messages yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Welcome content */}
            <div className="flex items-center justify-center h-full px-6">
              <div className="text-center max-w-2xl">
                <h1 className={`text-3xl font-light ${theme.text} mb-4 tracking-tight`}>Welcome to WePLay</h1>
                <p className={`text-sm ${theme.textMuted} mb-8 font-light`}>Your sports community hub</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button 
                    onClick={() => setActiveTab('Feed')}
                    className={`${theme.surface} ${theme.border} border rounded-2xl p-4 hover:scale-105 transition-all`}
                  >
                    <Newspaper size={24} className={`mx-auto mb-2 ${theme.textMuted}`} />
                    <span className={`${theme.text} text-xs`}>Feed</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('Events')}
                    className={`${theme.surface} ${theme.border} border rounded-2xl p-4 hover:scale-105 transition-all`}
                  >
                    <Calendar size={24} className={`mx-auto mb-2 ${theme.textMuted}`} />
                    <span className={`${theme.text} text-xs`}>Events</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('Tournaments')}
                    className={`${theme.surface} ${theme.border} border rounded-2xl p-4 hover:scale-105 transition-all`}
                  >
                    <Trophy size={24} className={`mx-auto mb-2 ${theme.textMuted}`} />
                    <span className={`${theme.text} text-xs`}>Tournaments</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('Activity Map')}
                    className={`${theme.surface} ${theme.border} border rounded-2xl p-4 hover:scale-105 transition-all`}
                  >
                    <Map size={24} className={`mx-auto mb-2 ${theme.textMuted}`} />
                    <span className={`${theme.text} text-xs`}>Activity Map</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('My Stats')}
                    className={`${theme.surface} ${theme.border} border rounded-2xl p-4 hover:scale-105 transition-all`}
                  >
                    <BarChart3 size={24} className={`mx-auto mb-2 ${theme.textMuted}`} />
                    <span className={`${theme.text} text-xs`}>My Stats</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('Communities')}
                    className={`${theme.surface} ${theme.border} border rounded-2xl p-4 hover:scale-105 transition-all`}
                  >
                    <Users size={24} className={`mx-auto mb-2 ${theme.textMuted}`} />
                    <span className={`${theme.text} text-xs`}>Communities</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Communities':
        return (
          <div className={`h-full ${theme.bg} px-6 py-4`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-xl font-light ${theme.text} tracking-tight`}>Communities</h1>
                <p className={`${theme.textMuted} mt-1 text-xs`}>Connect through events, tournaments and teams.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubTab('Events')}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeSubTab === 'Events' || activeSubTab === ''
                      ? theme.buttonPrimary
                      : theme.button
                  }`}
                >
                  Events
                </button>
                <button
                  onClick={() => setActiveSubTab('Tournaments')}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeSubTab === 'Tournaments'
                      ? theme.buttonPrimary
                      : theme.button
                  }`}
                >
                  Tournaments
                </button>
                <button
                  onClick={() => setActiveSubTab('Teams')}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeSubTab === 'Teams' ? theme.buttonPrimary : theme.button
                  }`}
                >
                  Teams
                </button>
              </div>
            </div>

            {(activeSubTab === '' || activeSubTab === 'Events') && (
              <div className={`${theme.surface} ${theme.border} border rounded-2xl p-4 mb-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-sm font-semibold ${theme.text}`}>Events</h2>
                  <button 
                    onClick={() => setActiveTab('Events')}
                    className={`${theme.buttonPrimary} px-4 py-2 rounded-full text-xs font-medium`}
                  >
                    Create Event
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {['Summer Soccer Championship', 'Basketball Skills Clinic', 'Tennis Doubles Tournament', 'Community Fun Run'].map((name) => (
                    <div key={name} className={`${theme.elevated} ${theme.border} border rounded-xl p-3`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`text-xs font-medium ${theme.text}`}>{name}</h3>
                        <span className={`text-[10px] ${theme.textMuted}`}>Open</span>
                      </div>
                      <p className={`${theme.textMuted} text-[10px] mt-1`}>Join local athletes and participate in exciting events.</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === 'Tournaments' && (
              <div className={`${theme.surface} ${theme.border} border rounded-2xl p-4 mb-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-sm font-semibold ${theme.text}`}>Tournaments</h2>
                  <button 
                    onClick={() => setActiveTab('Tournaments')}
                    className={`${theme.buttonPrimary} px-4 py-2 rounded-full text-xs font-medium`}
                  >
                    Create Tournament
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {['City Sprint Series', 'Weekend Hoops Clash', 'WePlay Open Cup', 'Community 5v5 League'].map((name) => (
                    <div key={name} className={`${theme.elevated} ${theme.border} border rounded-xl p-3`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`text-xs font-medium ${theme.text}`}>{name}</h3>
                        <span className={`text-[10px] ${theme.textMuted}`}>Open</span>
                      </div>
                      <p className={`${theme.textMuted} text-[10px] mt-1`}>Join athletes near you and compete weekly.</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === 'Teams' && (
              <div className={`${theme.surface} ${theme.border} border rounded-2xl p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-sm font-semibold ${theme.text}`}>Teams</h2>
                  <button 
                    onClick={() => setActiveTab('Teams')}
                    className={`${theme.buttonPrimary} px-4 py-2 rounded-full text-xs font-medium`}
                  >
                    Create Team
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {['Westside Runners', 'Skyline Strikers', 'River City United', 'WePlay Elite Squad'].map((name) => (
                    <div key={name} className={`${theme.elevated} ${theme.border} border rounded-xl p-3`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`text-xs font-medium ${theme.text}`}>{name}</h3>
                        <span className={`text-[10px] ${theme.textMuted}`}>Active</span>
                      </div>
                      <p className={`${theme.textMuted} text-[10px] mt-1`}>Find teammates, schedule practices, and grow together.</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'Analytics':
        return (
          <div className={`h-full ${theme.bg} px-6 py-4`}>
            <div className="mb-4">
              <h1 className={`text-xl font-light ${theme.text} tracking-tight`}>Analytics</h1>
              <p className={`${theme.textMuted} mt-1 text-xs`}>Upload your gameplay videos to generate analytics and create highlights.</p>
            </div>

            {/* Upload Video */}
            <div className={`${theme.surface} ${theme.border} border rounded-2xl p-4 max-w-md`}>
              <div className={`w-10 h-10 ${theme.buttonPrimary} rounded-full flex items-center justify-center mb-3`}>
                <Upload size={18} />
              </div>
              <h2 className={`text-sm font-semibold ${theme.text} mb-1`}>Upload Video</h2>
              <p className={`${theme.textMuted} text-[10px] mb-3`}>Upload recorded gameplay for analysis and highlights extraction.</p>
              <button className={`${theme.buttonPrimary} px-4 py-2 rounded-full text-xs font-medium w-full`}>
                Select File
              </button>
            </div>

            {/* Recent Uploads */}
            <div className={`${theme.surface} ${theme.border} border rounded-2xl p-4 mt-4`}>
              <h2 className={`text-sm font-semibold ${theme.text} mb-3`}>Recent Uploads</h2>
              <div className={`${theme.elevated} ${theme.border} border rounded-xl p-6 text-center`}>
                <Video size={32} className={`mx-auto mb-3 ${theme.textMuted}`} />
                <p className={`${theme.textMuted} text-xs`}>No uploads yet. Upload your first gameplay video!</p>
              </div>
            </div>

            {/* Analytics Pipeline Status */}
            <div className={`${theme.surface} ${theme.border} border rounded-2xl p-4 mt-4`}>
              <h2 className={`text-sm font-semibold ${theme.text} mb-3`}>Analytics Pipeline</h2>
              <div className="grid gap-3 md:grid-cols-3">
                <div className={`${theme.elevated} ${theme.border} border rounded-xl p-3 text-center`}>
                  <div className="text-lg font-bold text-green-500">0</div>
                  <div className={`text-[10px] ${theme.textMuted}`}>Videos Processed</div>
                </div>
                <div className={`${theme.elevated} ${theme.border} border rounded-xl p-3 text-center`}>
                  <div className="text-lg font-bold text-blue-500">0</div>
                  <div className={`text-[10px] ${theme.textMuted}`}>Highlights Generated</div>
                </div>
                <div className={`${theme.elevated} ${theme.border} border rounded-xl p-3 text-center`}>
                  <div className="text-lg font-bold text-purple-500">0</div>
                  <div className={`text-[10px] ${theme.textMuted}`}>Stats Extracted</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'BioConnect':
        return (
          <div className={`h-full ${theme.bg} px-6 py-4`}>
            <div className="mb-4">
              <h1 className={`text-xl font-light ${theme.text} tracking-tight`}>BioConnect</h1>
              <p className={`${theme.textMuted} mt-1 text-xs`}>Connect wearable devices for biometrics and motion tracking.</p>
            </div>

            {/* Device Categories */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {bioConnectOptions.map((device) => (
                <div key={device.name} className={`${theme.surface} ${theme.border} border rounded-xl p-3 cursor-pointer hover:scale-105 transition-all`}>
                  <div className={`w-8 h-8 ${theme.elevated} ${theme.border} border rounded-full flex items-center justify-center mb-2`}>
                    <device.icon size={16} className={theme.textMuted} />
                  </div>
                  <h3 className={`text-xs font-medium ${theme.text}`}>{device.name}</h3>
                  <p className={`text-[10px] ${theme.textMuted} mt-1`}>Not connected</p>
                </div>
              ))}
            </div>

            {/* Connected Devices */}
            <div className={`${theme.surface} ${theme.border} border rounded-2xl p-4 mt-4`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-sm font-semibold ${theme.text}`}>Connected Devices</h2>
                <button className={`${theme.buttonPrimary} px-4 py-2 rounded-full text-xs font-medium`}>
                  + Add Device
                </button>
              </div>
              <div className={`${theme.elevated} ${theme.border} border rounded-xl p-6 text-center`}>
                <Activity size={32} className={`mx-auto mb-3 ${theme.textMuted}`} />
                <p className={`${theme.textMuted} text-xs`}>No devices connected. Pair your wearables to start tracking.</p>
              </div>
            </div>

            {/* Biometrics Overview */}
            <div className={`${theme.surface} ${theme.border} border rounded-2xl p-4 mt-4`}>
              <h2 className={`text-sm font-semibold ${theme.text} mb-3`}>Live Biometrics</h2>
              <div className="grid gap-3 md:grid-cols-4">
                <div className={`${theme.elevated} ${theme.border} border rounded-xl p-3 text-center`}>
                  <Heart size={18} className="mx-auto mb-1 text-red-500" />
                  <div className="text-lg font-bold text-red-500">--</div>
                  <div className={`text-[10px] ${theme.textMuted}`}>Heart Rate</div>
                </div>
                <div className={`${theme.elevated} ${theme.border} border rounded-xl p-3 text-center`}>
                  <Zap size={18} className="mx-auto mb-1 text-yellow-500" />
                  <div className="text-lg font-bold text-yellow-500">--</div>
                  <div className={`text-[10px] ${theme.textMuted}`}>Calories</div>
                </div>
                <div className={`${theme.elevated} ${theme.border} border rounded-xl p-3 text-center`}>
                  <Target size={18} className="mx-auto mb-1 text-blue-500" />
                  <div className="text-lg font-bold text-blue-500">--</div>
                  <div className={`text-[10px] ${theme.textMuted}`}>Steps</div>
                </div>
                <div className={`${theme.elevated} ${theme.border} border rounded-xl p-3 text-center`}>
                  <Activity size={18} className="mx-auto mb-1 text-green-500" />
                  <div className="text-lg font-bold text-green-500">--</div>
                  <div className={`text-[10px] ${theme.textMuted}`}>Active Min</div>
                </div>
              </div>
            </div>

            {/* Pitch Measurement */}
            <div className={`${theme.surface} ${theme.border} border rounded-2xl p-4 mt-4`}>
              <h2 className={`text-sm font-semibold ${theme.text} mb-1`}>Pitch Measurement</h2>
              <p className={`${theme.textMuted} text-[10px] mb-3`}>Use wearable spatial points to measure and set up your playing area anywhere.</p>
              <button className={`${theme.button} px-4 py-2 rounded-full text-xs font-medium`}>
                Start Measurement
              </button>
            </div>
          </div>
        );
      case 'Game+':
        return (
          <div className={`h-full ${theme.bg} px-6 py-4`}>
            <div className="mb-4">
              <h1 className={`text-xl font-light ${theme.text} tracking-tight`}>Game+</h1>
              <p className={`${theme.textMuted} mt-1 text-xs`}>Unlock features and rewards based on your participation.</p>
            </div>

            {/* Level Progress */}
            <div className={`${theme.surface} ${theme.border} border rounded-2xl p-4 mb-4`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className={`text-sm font-semibold ${theme.text}`}>Your Level</h2>
                  <p className={`${theme.textMuted} text-[10px]`}>Play more to unlock new features</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-500">1</div>
                  <div className={`text-[10px] ${theme.textMuted}`}>Rookie</div>
                </div>
              </div>
              <div className={`h-2 ${theme.elevated} rounded-full overflow-hidden`}>
                <div className="h-full w-1/10 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </div>
              <p className={`${theme.textMuted} text-[10px] mt-2`}>0 / 100 XP to next level</p>
            </div>

            {/* Feature Unlocks */}
            <div className={`${theme.surface} ${theme.border} border rounded-2xl p-4 mb-4`}>
              <h2 className={`text-sm font-semibold ${theme.text} mb-3`}>Feature Unlocks</h2>
              <div className="space-y-2">
                {[
                  { name: 'Basic Profile', level: 1, unlocked: true },
                  { name: 'Stats Tracking', level: 2, unlocked: false },
                  { name: 'Create Events', level: 3, unlocked: false },
                  { name: 'Create Tournaments', level: 5, unlocked: false },
                  { name: 'Advanced Analytics', level: 10, unlocked: false },
                  { name: 'Custom Themes', level: 15, unlocked: false },
                  { name: 'Pro Badge', level: 25, unlocked: false },
                ].map((feature) => (
                  <div key={feature.name} className={`flex items-center justify-between p-2 ${theme.elevated} ${theme.border} border rounded-lg`}>
                    <div className="flex items-center gap-2">
                      {feature.unlocked ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px]">✓</span>
                        </div>
                      ) : (
                        <div className={`w-6 h-6 ${theme.surface} rounded-full flex items-center justify-center`}>
                          <span className={`${theme.textMuted} text-[10px]`}>🔒</span>
                        </div>
                      )}
                      <span className={`text-xs ${feature.unlocked ? theme.text : theme.textMuted}`}>{feature.name}</span>
                    </div>
                    <span className={`text-[10px] ${theme.textMuted}`}>Level {feature.level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className={`${theme.surface} ${theme.border} border rounded-2xl p-4`}>
              <h2 className={`text-sm font-semibold ${theme.text} mb-3`}>Achievements</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { name: 'First Steps', desc: 'Complete your profile', icon: '👤', earned: false },
                  { name: 'Team Player', desc: 'Join your first team', icon: '🤝', earned: false },
                  { name: 'Competitor', desc: 'Enter a tournament', icon: '🏆', earned: false },
                  { name: 'Analyst', desc: 'Upload 10 recordings', icon: '📹', earned: false },
                  { name: 'Social Star', desc: 'Get 100 profile views', icon: '⭐', earned: false },
                  { name: 'Champion', desc: 'Win a tournament', icon: '🥇', earned: false },
                ].map((achievement) => (
                  <div key={achievement.name} className={`${theme.elevated} ${theme.border} border rounded-xl p-3 text-center ${!achievement.earned && 'opacity-50'}`}>
                    <div className="text-xl mb-1">{achievement.icon}</div>
                    <h3 className={`text-xs font-medium ${theme.text}`}>{achievement.name}</h3>
                    <p className={`text-[10px] ${theme.textMuted} mt-1`}>{achievement.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'Shop':
        return <ShopPage isDarkMode={isDarkMode} />;
      // ...existing code...
      default:
        return (
          <div className={`h-full ${theme.bg} flex items-center justify-center px-6`}>
            <div className="text-center max-w-2xl">
              <h1 className={`text-xl font-light ${theme.text} mb-4 tracking-tight`}>{activeTab}</h1>
              <p className={`text-sm ${theme.textMuted} mb-6 font-light`}>Welcome to {activeTab}</p>
              <div className={`w-full h-48 ${theme.surface} rounded-2xl flex items-center justify-center ${theme.border} border`}>
                <p className={`${theme.textMuted} text-xs font-light`}>{activeTab} content goes here</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex transition-colors duration-300`} onClick={() => setShowContextMenu(null)}>
      {/* Context menu for sport removal */}
      {showContextMenu && (
        <div 
          className={`fixed ${theme.elevated} ${theme.border} border rounded-xl ${theme.shadow} z-50 py-1 overflow-hidden`}
          style={{ 
            left: `${contextMenuPos.x}px`, 
            top: `${contextMenuPos.y}px` 
          }}
        >
          <button
            onClick={() => handleRemoveSport(showContextMenu)}
            className={`w-full text-left px-4 py-2 hover:${theme.surface} text-red-500 hover:text-red-600 transition-colors font-medium`}
          >
            Remove
          </button>
        </div>
      )}
      {/* Sidebar with original orbiting logo */}
      <div className={`w-20 ${theme.elevated} ${theme.border} border-r flex flex-col`}>
        {/* Sidebar top-left logo above sports menu */}
        <div className={`h-20 ${theme.border} border-b flex items-center justify-center`}>
          <div
            ref={earthRef}
            className={`h-12 w-12 rounded-full border-2 ${isDarkMode ? 'border-blue-400/60 bg-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'border-blue-500 bg-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]'} flex items-center justify-center overflow-hidden`}
          />
        </div>
        <div className="flex flex-col items-center py-4 space-y-3">
          <div className="sports-menu">
            <button
              onClick={() => setShowSportsMenu(!showSportsMenu)}
              className={`w-12 h-12 ${theme.buttonPrimary} rounded-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 ${theme.shadow}`}
            >
              <Plus size={18} />
            </button>
            {showSportsMenu && (
              <div className={`absolute left-20 top-24 ${theme.elevated} ${theme.border} border rounded-2xl p-4 w-64 max-h-96 overflow-y-auto z-50 ${theme.shadow}`}>
                <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Select Sports</h3>
                <div className="space-y-1">
                  {sports.map((sport) => (
                    <button
                      key={sport.name}
                      onClick={() => addSport(sport)}
                      className={`w-full text-left p-3 hover:${theme.surface} rounded-xl flex items-center gap-3 transition-colors font-medium`}
                    >
                      <span className="text-xl">{sport.icon}</span>
                      <span className={theme.text}>{sport.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {selectedSports.map((sport) => (
              <div
                key={sport.name}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer group relative transition-all duration-200 ${
                  activeTheme === sport.name.toLowerCase() 
                    ? `${theme.buttonPrimary} ${theme.shadow}` 
                    : `${theme.elevated} hover:${theme.surface} ${theme.border} border`
                }`}
                onClick={() => handleSportClick(sport)}
                onContextMenu={(e) => handleSportRightClick(e, sport)}
              >
                <span className="text-lg">{sport.icon}</span>
                <div className={`absolute left-16 ${theme.elevated} ${theme.text} px-3 py-2 rounded-xl text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 ${theme.shadow} ${theme.border} border`}>
                  {sport.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`flex-1 flex flex-col`}>
        {/* Header reverted to original, add logout button */}
        <div className={`${theme.elevated} ${theme.border} border-b px-6 py-3 flex justify-between items-center`}>
          <h1 className={`text-lg font-light ${theme.text} tracking-tight`}>WePLay</h1>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`${theme.button} p-2 rounded-full transition-all duration-200 transform hover:scale-105`}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => {
                // Use window.location for full logout redirect
                if (window.location.pathname !== '/') {
                  window.location.href = '/';
                }
                // Use AuthContext's logout function
                if (typeof logout === 'function') {
                  logout();
                }
              }}
              className={`${theme.buttonPrimary} px-4 py-2 rounded-full transition-all duration-200 text-xs font-medium`}
            >
              Logout
            </button>
          </div>
        </div>
        <div className={`${theme.elevated} ${theme.border} border-b flex overflow-x-auto`}>
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name);
                setActiveSubTab('');
                setShowTournamentMenu(false);
                setShowTeamMenu(false);
              }}
              className={`px-4 py-3 flex items-center gap-2 text-xs font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                activeTab === tab.name
                  ? `${theme.text} border-blue-600`
                  : `${theme.textMuted} hover:${theme.text} border-transparent`
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
        <div className={`flex-1 overflow-auto ${theme.bg}`}>
          {getTabContent()}
        </div>
      </div>
    </div>
  );
};

export default WePlayLandingPage;
