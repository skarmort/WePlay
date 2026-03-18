import React, { useEffect, useState } from 'react';
import { statsAPI } from '../services/api';
import { Trophy, Target, Zap, Award, TrendingUp, Star } from 'lucide-react';

type SportStats = {
  matchesPlayed?: number;
  matchesWon?: number;
  tournamentsPlayed?: number;
  tournamentsWon?: number;
  rating?: number;
  level?: number;
  speed?: number;
  agility?: number;
  endurance?: number;
  strength?: number;
  // Soccer-specific
  goals?: number;
  assists?: number;
  cleanSheets?: number;
  // Basketball-specific
  points?: number;
  rebounds?: number;
  steals?: number;
  blocks?: number;
  // Tennis-specific
  aces?: number;
  doubleFaults?: number;
  // Boxing-specific
  knockouts?: number;
  fights?: number;
  // Generic
  sport: string;
};

type PlayerStats = {
  id?: string;
  userId: string;
  sportStatistics: SportStats[];
  overallRating?: number;
  overallLevel?: number;
  achievementCount?: number;
};

interface StatsPageProps {
  isDarkMode?: boolean;
}

const StatsPage: React.FC<StatsPageProps> = ({ isDarkMode = true }) => {
  const theme = isDarkMode ? {
    bg: 'bg-black',
    surface: 'bg-white/5',
    border: 'border-white/10',
    text: 'text-white',
    textMuted: 'text-white/70',
    textSecondary: 'text-white/60',
    buttonActive: 'bg-blue-600 text-white',
    buttonInactive: 'bg-white/10 text-white/70 hover:bg-white/20',
  } : {
    bg: 'bg-gray-50',
    surface: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    textSecondary: 'text-gray-500',
    buttonActive: 'bg-blue-600 text-white',
    buttonInactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  };
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSport, setActiveSport] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await statsAPI.getMyStats();
      setStats(data);
      if (data.sportStatistics && data.sportStatistics.length > 0) {
        setActiveSport(data.sportStatistics[0].sport);
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // No stats yet, show empty state
        setStats(null);
      } else {
        setError(err?.response?.data?.message || 'Failed to load statistics');
      }
    } finally {
      setLoading(false);
    }
  };

  const getWinRate = (played: number = 0, won: number = 0) => {
    if (played === 0) return 0;
    return Math.round((won / played) * 100);
  };

  const getSkillLevel = (value: number = 0) => {
    if (value >= 90) return { label: 'Elite', color: 'text-yellow-400' };
    if (value >= 75) return { label: 'Expert', color: 'text-purple-400' };
    if (value >= 50) return { label: 'Intermediate', color: 'text-blue-400' };
    if (value >= 25) return { label: 'Beginner', color: 'text-green-400' };
    return { label: 'Novice', color: 'text-gray-400' };
  };

  const renderStatBar = (label: string, value: number, max: number = 100, color: string = 'bg-blue-500') => (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className={theme.textMuted}>{label}</span>
        <span className={theme.textSecondary}>{value}/{max}</span>
      </div>
      <div className={`h-2 ${theme.surface} rounded-full overflow-hidden`}>
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderSportSpecificStats = (sport: SportStats) => {
    const s = sport.sport?.toLowerCase() || '';
    
    if (s.includes('soccer') || s.includes('football')) {
      return (
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className={`${theme.surface} p-3 rounded-full text-center`}>
            <div className="text-sm font-bold text-green-400">{sport.goals || 0}</div>
            <div className={`text-[10px] ${theme.textSecondary}`}>Goals</div>
          </div>
          <div className={`${theme.surface} p-3 rounded-full text-center`}>
            <div className="text-sm font-bold text-blue-400">{sport.assists || 0}</div>
            <div className={`text-[10px] ${theme.textSecondary}`}>Assists</div>
          </div>
          <div className={`${theme.surface} p-3 rounded-full text-center`}>
            <div className="text-sm font-bold text-purple-400">{sport.cleanSheets || 0}</div>
            <div className={`text-[10px] ${theme.textSecondary}`}>Clean Sheets</div>
          </div>
        </div>
      );
    }
    
    if (s.includes('basketball')) {
      return (
        <div className="grid grid-cols-4 gap-3 mt-3">
          <div className={`${theme.surface} p-3 rounded-full text-center`}>
            <div className="text-sm font-bold text-orange-400">{sport.points || 0}</div>
            <div className={`text-[10px] ${theme.textSecondary}`}>Points</div>
          </div>
          <div className={`${theme.surface} p-3 rounded-full text-center`}>
            <div className="text-sm font-bold text-blue-400">{sport.rebounds || 0}</div>
            <div className={`text-[10px] ${theme.textSecondary}`}>Rebounds</div>
          </div>
          <div className={`${theme.surface} p-3 rounded-full text-center`}>
            <div className="text-sm font-bold text-green-400">{sport.steals || 0}</div>
            <div className={`text-[10px] ${theme.textSecondary}`}>Steals</div>
          </div>
          <div className={`${theme.surface} p-3 rounded-full text-center`}>
            <div className="text-sm font-bold text-red-400">{sport.blocks || 0}</div>
            <div className={`text-[10px] ${theme.textSecondary}`}>Blocks</div>
          </div>
        </div>
      );
    }
    
    if (s.includes('tennis')) {
      return (
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className={`${theme.surface} p-3 rounded-full text-center`}>
            <div className="text-sm font-bold text-yellow-400">{sport.aces || 0}</div>
            <div className={`text-[10px] ${theme.textSecondary}`}>Aces</div>
          </div>
          <div className={`${theme.surface} p-3 rounded-full text-center`}>
            <div className="text-sm font-bold text-red-400">{sport.doubleFaults || 0}</div>
            <div className={`text-[10px] ${theme.textSecondary}`}>Double Faults</div>
          </div>
        </div>
      );
    }
    
    if (s.includes('boxing') || s.includes('mma')) {
      return (
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className={`${theme.surface} p-3 rounded-full text-center`}>
            <div className="text-sm font-bold text-red-400">{sport.knockouts || 0}</div>
            <div className={`text-[10px] ${theme.textSecondary}`}>Knockouts</div>
          </div>
          <div className={`${theme.surface} p-3 rounded-full text-center`}>
            <div className="text-sm font-bold text-blue-400">{sport.fights || 0}</div>
            <div className={`text-[10px] ${theme.textSecondary}`}>Total Fights</div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.text}`}>
        Loading your statistics...
      </div>
    );
  }

  const activeSportStats = stats?.sportStatistics?.find(s => s.sport === activeSport);

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className={`max-w-4xl mx-auto px-4 py-6 ${theme.text}`}>
        <div className="mb-4">
          <h1 className="text-xl font-bold">My Statistics</h1>
          <p className={`${theme.textMuted} mt-1 text-xs`}>Track your performance across all sports</p>
        </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-3 py-2 rounded-full mb-4 text-xs">
          {error}
        </div>
      )}

      {!stats || stats.sportStatistics?.length === 0 ? (
        <div className={`${theme.surface} border ${theme.border} rounded-xl p-8 text-center`}>
          <TrendingUp size={32} className={`mx-auto mb-3 ${theme.textSecondary}`} />
          <h2 className="text-sm font-semibold mb-2">No Statistics Yet</h2>
          <p className={`${theme.textSecondary} mb-4 text-xs`}>
            Play matches, join tournaments, and participate in events to start building your stats!
          </p>
          <a href="/tournaments" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full inline-block text-xs">
            Browse Tournaments
          </a>
        </div>
      ) : (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
              <Star size={20} className="mx-auto mb-1 text-yellow-400" />
              <div className="text-xl font-bold">{stats.overallRating || 0}</div>
              <div className={`${theme.textMuted} text-[10px]`}>Overall Rating</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
              <Award size={20} className="mx-auto mb-1 text-blue-400" />
              <div className="text-xl font-bold">Level {stats.overallLevel || 1}</div>
              <div className={`${theme.textMuted} text-[10px]`}>Player Level</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 text-center">
              <Trophy size={20} className="mx-auto mb-1 text-green-400" />
              <div className="text-xl font-bold">{stats.achievementCount || 0}</div>
              <div className={`${theme.textMuted} text-[10px]`}>Achievements</div>
            </div>
          </div>

          {/* Sport Selector */}
          {stats.sportStatistics && stats.sportStatistics.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {stats.sportStatistics.map((ss) => (
                <button
                  key={ss.sport}
                  onClick={() => setActiveSport(ss.sport)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-xs ${
                    activeSport === ss.sport
                      ? theme.buttonActive
                      : theme.buttonInactive
                  }`}
                >
                  {ss.sport}
                </button>
              ))}
            </div>
          )}

          {activeSportStats && (
            <div className={`${theme.surface} border ${theme.border} rounded-xl p-4`}>
              <h2 className="text-sm font-semibold mb-4">{activeSportStats.sport} Statistics</h2>

              {/* Match/Tournament Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className={`${theme.surface} p-3 rounded-full text-center border ${theme.border}`}>
                  <Target size={14} className="mx-auto mb-1 text-blue-400" />
                  <div className="text-sm font-bold">{activeSportStats.matchesPlayed || 0}</div>
                  <div className={`text-[10px] ${theme.textSecondary}`}>Matches Played</div>
                </div>
                <div className={`${theme.surface} p-3 rounded-full text-center border ${theme.border}`}>
                  <Zap size={14} className="mx-auto mb-1 text-green-400" />
                  <div className="text-sm font-bold">{getWinRate(activeSportStats.matchesPlayed, activeSportStats.matchesWon)}%</div>
                  <div className={`text-[10px] ${theme.textSecondary}`}>Win Rate</div>
                </div>
                <div className={`${theme.surface} p-3 rounded-full text-center border ${theme.border}`}>
                  <Trophy size={14} className="mx-auto mb-1 text-yellow-400" />
                  <div className="text-sm font-bold">{activeSportStats.tournamentsPlayed || 0}</div>
                  <div className={`text-[10px] ${theme.textSecondary}`}>Tournaments</div>
                </div>
                <div className={`${theme.surface} p-3 rounded-full text-center border ${theme.border}`}>
                  <Award size={14} className="mx-auto mb-1 text-purple-400" />
                  <div className="text-sm font-bold">{activeSportStats.tournamentsWon || 0}</div>
                  <div className={`text-[10px] ${theme.textSecondary}`}>Wins</div>
                </div>
              </div>

              {/* Rating & Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-xs font-medium mb-2">Sport Rating</h3>
                  <div className="flex items-center gap-3">
                    <div className="text-xl font-bold">{activeSportStats.rating || 0}</div>
                    <div>
                      <div className={`text-xs font-medium ${getSkillLevel(activeSportStats.rating).color}`}>
                        {getSkillLevel(activeSportStats.rating).label}
                      </div>
                      <div className={`text-[10px] ${theme.textSecondary}`}>Level {activeSportStats.level || 1}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Attributes */}
              <h3 className="text-xs font-medium mb-2">Physical Attributes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                {renderStatBar('Speed', activeSportStats.speed || 0, 100, 'bg-blue-500')}
                {renderStatBar('Agility', activeSportStats.agility || 0, 100, 'bg-green-500')}
                {renderStatBar('Endurance', activeSportStats.endurance || 0, 100, 'bg-yellow-500')}
                {renderStatBar('Strength', activeSportStats.strength || 0, 100, 'bg-red-500')}
              </div>

              {/* Sport-Specific Stats */}
              {renderSportSpecificStats(activeSportStats)}
            </div>
          )}
        </>
      )}
    </div>
  </div>
  );
};

export default StatsPage;
