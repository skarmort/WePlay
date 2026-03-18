import React, { useEffect, useState } from 'react';
import { tournamentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Trophy, Calendar, MapPin, X, Clock, Check, UserPlus, UserX, DollarSign, FileText, Settings } from 'lucide-react';

type JoinRequest = {
  odId: string;
  odName: string;
  requestedAt: string;
};

type Tournament = {
  id: string;
  name: string;
  description?: string;
  sport: string;
  format: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  maxParticipants: number;
  currentParticipants: number;
  prizePot: number;
  prizeDistribution: string;
  status: string;
  creatorId: string;
  isPublic: boolean;
  participantIds: string[];
  joinRequestStatus?: 'none' | 'pending' | 'participant';
  pendingRequests?: JoinRequest[];
  donationPot: number;
  rules?: string[];
};

interface TournamentsPageProps {
  isDarkMode?: boolean;
}

const TournamentsPage: React.FC<TournamentsPageProps> = ({ isDarkMode = true }) => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'browse' | 'my' | 'create'>('browse');
  const [filterSport, setFilterSport] = useState('');
  const [showRequestsModal, setShowRequestsModal] = useState<string | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [editingRules, setEditingRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');

  // Theme classes based on dark/light mode
  const theme = isDarkMode ? {
    bg: 'bg-gray-900',
    surface: 'bg-gray-800',
    elevated: 'bg-gray-700',
    border: 'border-gray-700',
    text: 'text-white',
    textMuted: 'text-gray-400',
    textSecondary: 'text-gray-300',
    input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
    button: 'bg-gray-700 hover:bg-gray-600 text-white',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    card: 'bg-gray-800/50 border-gray-700/50',
  } : {
    bg: 'bg-gray-50',
    surface: 'bg-white',
    elevated: 'bg-gray-100',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-500',
    textSecondary: 'text-gray-700',
    input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    button: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    card: 'bg-white border-gray-200',
  };

  // Create form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sport: 'Soccer',
    format: '5v5',
    location: '',
    startDate: '',
    endDate: '',
    maxParticipants: 16,
    prizePot: 0,
    prizeDistribution: 'winner-takes-all',
    isPublic: true,
    rules: ''
  });
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTournaments();
  }, [filterSport]);

  const loadTournaments = async () => {
    setLoading(true);
    setError('');
    try {
      // Mock tournaments with join request data
      const mockTournaments: Tournament[] = [
        {
          id: 'tourney-1',
          name: 'City Soccer Championship',
          description: 'Annual citywide 5v5 soccer tournament',
          sport: 'Soccer',
          format: '5v5',
          location: 'Central Stadium',
          startDate: '2025-03-15',
          endDate: '2025-03-17',
          maxParticipants: 32,
          currentParticipants: 28,
          prizePot: 5000,
          prizeDistribution: 'top-3',
          status: 'open',
          creatorId: 'user-123',
          isPublic: true,
          participantIds: [],
          joinRequestStatus: 'none',
          pendingRequests: [
            { odId: 'user-1', odName: 'Chris Evans', requestedAt: '2025-01-22' },
            { odId: 'user-2', odName: 'Sarah Parker', requestedAt: '2025-01-23' }
          ],
          donationPot: 1250,
          rules: ['No slide tackles', 'Rolling substitutions allowed', 'Each half is 15 minutes', 'Yellow card = 2 min penalty']
        },
        {
          id: 'tourney-2',
          name: 'Basketball 3v3 Open',
          description: 'Open tournament for all skill levels',
          sport: 'Basketball',
          format: '3v3',
          location: 'Sports Arena',
          startDate: '2025-04-01',
          maxParticipants: 16,
          currentParticipants: 10,
          prizePot: 2000,
          prizeDistribution: 'winner-takes-all',
          status: 'open',
          creatorId: 'other-user',
          isPublic: true,
          participantIds: [],
          joinRequestStatus: 'pending',
          pendingRequests: [],
          donationPot: 350,
          rules: ['Standard FIBA 3x3 rules', 'Games to 21 points or 10 minutes', 'Win by 2']
        },
        {
          id: 'tourney-3',
          name: 'Tennis Singles Championship',
          sport: 'Tennis',
          format: '1v1',
          location: 'City Tennis Club',
          startDate: '2025-05-10',
          maxParticipants: 32,
          currentParticipants: 32,
          prizePot: 3500,
          prizeDistribution: 'top-3',
          status: 'open',
          creatorId: 'other-user',
          isPublic: true,
          participantIds: [],
          joinRequestStatus: 'none',
          pendingRequests: [],
          donationPot: 800,
          rules: ['Best of 3 sets', 'Tiebreak at 6-6', 'No coaching during matches']
        }
      ];

      // Filter by sport if specified
      const filteredTournaments = filterSport 
        ? mockTournaments.filter(t => t.sport === filterSport)
        : mockTournaments;

      setTournaments(filteredTournaments);
      setMyTournaments(mockTournaments.filter(t => t.creatorId === 'user-123'));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id: string) => {
    try {
      // Set pending status for the tournament
      setTournaments(tournaments.map(t => 
        t.id === id ? { ...t, joinRequestStatus: 'pending' as const } : t
      ));
      setSuccess('Join request sent! Waiting for organizer approval.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to join tournament');
    }
  };

  const handleCancelRequest = (id: string) => {
    setTournaments(tournaments.map(t => 
      t.id === id ? { ...t, joinRequestStatus: 'none' as const } : t
    ));
    setSuccess('Join request cancelled.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleApproveRequest = (tournamentId: string, odId: string) => {
    setTournaments(tournaments.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          currentParticipants: t.currentParticipants + 1,
          pendingRequests: t.pendingRequests?.filter(r => r.odId !== odId) || []
        };
      }
      return t;
    }));
    setSuccess('Request approved! Player has been added to the tournament.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRejectRequest = (tournamentId: string, odId: string) => {
    setTournaments(tournaments.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          pendingRequests: t.pendingRequests?.filter(r => r.odId !== odId) || []
        };
      }
      return t;
    }));
    setSuccess('Request rejected.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleLeave = async (id: string) => {
    try {
      await tournamentsAPI.leave(id);
      loadTournaments();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to leave tournament');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await tournamentsAPI.publish(id);
      loadTournaments();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to publish tournament');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    try {
      await tournamentsAPI.delete(id);
      loadTournaments();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete tournament');
    }
  };

  const handleDonate = () => {
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }
    if (selectedTournament) {
      setTournaments(tournaments.map(t => 
        t.id === selectedTournament.id 
          ? { ...t, donationPot: (t.donationPot || 0) + amount }
          : t
      ));
      setSuccess(`Thank you for donating $${amount.toFixed(2)} to ${selectedTournament.name}!`);
      setShowDonateModal(false);
      setDonationAmount('');
      setSelectedTournament(null);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleAddRule = () => {
    if (newRule.trim() && selectedTournament) {
      const updatedRules = [...editingRules, newRule.trim()];
      setEditingRules(updatedRules);
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setEditingRules(editingRules.filter((_, i) => i !== index));
  };

  const handleSaveRules = () => {
    if (selectedTournament) {
      setTournaments(tournaments.map(t =>
        t.id === selectedTournament.id
          ? { ...t, rules: editingRules }
          : t
      ));
      setSuccess('Tournament rules updated!');
      setShowRulesModal(false);
      setSelectedTournament(null);
      setEditingRules([]);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const openRulesModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setEditingRules(tournament.rules || []);
    setShowRulesModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      await tournamentsAPI.create({
        ...formData,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      });
      setSuccess('Tournament created successfully!');
      setFormData({
        name: '',
        description: '',
        sport: 'Soccer',
        format: '5v5',
        location: '',
        startDate: '',
        endDate: '',
        maxParticipants: 16,
        prizePot: 0,
        prizeDistribution: 'winner-takes-all',
        isPublic: true,
        rules: ''
      });
      loadTournaments();
      setTimeout(() => setActiveTab('my'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create tournament');
    } finally {
      setCreating(false);
    }
  };

  const renderTournamentCard = (t: Tournament, showActions = false) => {
    const isParticipant = t.participantIds.includes(user?.id || '');
    const isCreator = t.creatorId === user?.id;

    return (
      <div key={t.id} className={`${theme.card} border rounded-xl p-4 hover:scale-[1.02] transition-transform`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-sm font-semibold ${theme.text}`}>{t.name}</h3>
          <span className={`px-2 py-1 text-[10px] rounded-full ${
            t.status === 'open' ? 'bg-green-500/20 text-green-400' :
            t.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
            t.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {t.status}
          </span>
        </div>

        {t.description && <p className={`${theme.textMuted} text-xs mb-3`}>{t.description}</p>}

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className={`flex items-center gap-1 ${theme.textSecondary}`}>
            <Trophy size={10} />
            <span>{t.sport} · {t.format}</span>
          </div>
          <div className={`flex items-center gap-1 ${theme.textSecondary}`}>
            <Users size={10} />
            <span>{t.currentParticipants}/{t.maxParticipants} players</span>
          </div>
          {t.location && (
            <div className={`flex items-center gap-1 ${theme.textSecondary}`}>
              <MapPin size={10} />
              <span>{t.location}</span>
            </div>
          )}
          {t.startDate && (
            <div className={`flex items-center gap-1 ${theme.textSecondary}`}>
              <Calendar size={10} />
              <span>{new Date(t.startDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {t.prizePot > 0 && (
          <div className="text-emerald-400 font-semibold mb-3 text-xs">
            💰 Prize Pool: ${t.prizePot.toLocaleString()} ({t.prizeDistribution})
          </div>
        )}

        {/* Donation Pot */}
        <div className={`${theme.surface} rounded-lg p-3 mb-3`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-green-400" />
              <span className={`text-xs font-medium ${theme.text}`}>Donation Pot</span>
            </div>
            <span className="text-green-400 font-bold text-sm">${(t.donationPot || 0).toLocaleString()}</span>
          </div>
          <button
            onClick={() => {
              setSelectedTournament(t);
              setShowDonateModal(true);
            }}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs flex items-center justify-center gap-1"
          >
            <DollarSign size={10} />
            Donate to This Tournament
          </button>
        </div>

        {/* Rules Section */}
        {t.rules && t.rules.length > 0 && (
          <div className={`${theme.surface} rounded-lg p-3 mb-3`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-blue-400" />
                <span className={`text-xs font-medium ${theme.text}`}>Tournament Rules</span>
              </div>
              <button
                onClick={() => openRulesModal(t)}
                className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
              >
                <Settings size={10} />
                View All
              </button>
            </div>
            <ul className={`text-xs ${theme.textMuted} space-y-1`}>
              {t.rules.slice(0, 2).map((rule, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{rule}</span>
                </li>
              ))}
              {t.rules.length > 2 && (
                <li className="text-blue-400 cursor-pointer hover:underline" onClick={() => openRulesModal(t)}>
                  +{t.rules.length - 2} more rules...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Availability indicator */}
        {t.currentParticipants < t.maxParticipants && t.status === 'open' && (
          <div className="flex items-center gap-1 mb-3 text-green-400 text-xs">
            <Check size={10} />
            <span>{t.maxParticipants - t.currentParticipants} spots available</span>
          </div>
        )}
        {t.currentParticipants >= t.maxParticipants && (
          <div className="flex items-center gap-1 mb-3 text-red-400 text-xs">
            <X size={10} />
            <span>Tournament is full</span>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {showActions && isCreator && t.status === 'draft' && (
            <>
              <button
                onClick={() => handlePublish(t.id)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs"
              >
                Publish
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs"
              >
                Delete
              </button>
            </>
          )}

          {/* Join button for open tournaments with space */}
          {t.status === 'open' && !isParticipant && !isCreator && t.currentParticipants < t.maxParticipants && t.joinRequestStatus === 'none' && (
            <button
              onClick={() => handleJoin(t.id)}
              className={`${theme.buttonPrimary} px-4 py-2 rounded-full text-xs flex items-center gap-1`}
            >
              <UserPlus size={10} />
              Request to Join
            </button>
          )}

          {/* Pending request indicator */}
          {t.joinRequestStatus === 'pending' && (
            <div className="flex items-center gap-1">
              <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center gap-1">
                <Clock size={10} />
                Request Pending
              </span>
              <button
                onClick={() => handleCancelRequest(t.id)}
                className="px-2 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full text-xs"
                title="Cancel Request"
              >
                <X size={10} />
              </button>
            </div>
          )}

          {/* Organizer actions - manage requests */}
          {isCreator && t.pendingRequests && t.pendingRequests.length > 0 && (
            <button
              onClick={() => setShowRequestsModal(t.id)}
              className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-full text-xs flex items-center gap-1"
            >
              <Users size={10} />
              {t.pendingRequests.length} Requests
            </button>
          )}

          {t.status === 'open' && isParticipant && !isCreator && (
            <button
              onClick={() => handleLeave(t.id)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-xs"
            >
              Leave
            </button>
          )}

          {/* Participant badge */}
          {isParticipant && (
            <span className={`px-4 py-2 ${theme.surface} rounded-full text-xs text-green-400 flex items-center gap-1`}>
              <Check size={10} />
              Joined
            </span>
          )}

          {/* Organizer badge */}
          {isCreator && (
            <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center gap-1">
              <Trophy size={10} />
              Organizer
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.text}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading tournaments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto px-4 py-6 ${theme.text}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className={`text-xl font-bold ${theme.text}`}>Tournaments</h1>
          <p className={`${theme.textMuted} mt-1 text-xs`}>Create, join, and compete in tournaments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 mb-4 border-b ${theme.border} pb-4`}>
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 rounded-full text-xs transition-colors ${
            activeTab === 'browse' ? theme.buttonPrimary : theme.button
          }`}
        >
          Browse Open
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-full text-xs transition-colors ${
            activeTab === 'my' ? theme.buttonPrimary : theme.button
          }`}
        >
          My Tournaments
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-full text-xs transition-colors flex items-center gap-2 ${
            activeTab === 'create' ? theme.buttonPrimary : theme.button
          }`}
        >
          <Plus size={12} /> Create New
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-2 rounded-full mb-4 flex items-center justify-between text-xs">
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={12} /></button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/40 text-green-300 px-4 py-2 rounded-full mb-4 flex items-center justify-between text-xs">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><X size={12} /></button>
        </div>
      )}

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <>
          <div className="mb-4">
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
              className={`px-4 py-2 rounded-full text-xs ${theme.input} border`}
            >
              <option value="">All Sports</option>
              <option value="Soccer">Soccer</option>
              <option value="Basketball">Basketball</option>
              <option value="Tennis">Tennis</option>
              <option value="Boxing">Boxing</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournaments.length === 0 ? (
              <div className={`col-span-2 text-center py-8 ${theme.surface} rounded-xl border ${theme.border}`}>
                <Trophy size={32} className={`mx-auto mb-3 ${theme.textMuted}`} />
                <p className={`${theme.textMuted} text-xs`}>No open tournaments found.</p>
              </div>
            ) : (
              tournaments.map((t) => renderTournamentCard(t))
            )}
          </div>
        </>
      )}

      {/* My Tournaments Tab */}
      {activeTab === 'my' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myTournaments.length === 0 ? (
            <div className={`col-span-2 text-center py-8 ${theme.surface} rounded-xl border ${theme.border}`}>
              <Trophy size={32} className={`mx-auto mb-3 ${theme.textMuted}`} />
              <p className={`${theme.textMuted} text-xs`}>You haven't created any tournaments yet.</p>
              <button 
                onClick={() => setActiveTab('create')}
                className={`${theme.buttonPrimary} px-4 py-2 rounded-full text-xs mt-4`}
              >
                Create Tournament
              </button>
            </div>
          ) : (
            myTournaments.map((t) => renderTournamentCard(t, true))
          )}
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreate} className={`max-w-2xl ${theme.surface} rounded-xl p-4 border ${theme.border}`}>
          <h2 className={`text-sm font-semibold ${theme.text} mb-4`}>Create New Tournament</h2>
          <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>Tournament Name *</label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={100}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 rounded-full text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
                placeholder="Summer Basketball League"
              />
            </div>
            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>Sport *</label>
              <select
                required
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                className={`w-full px-4 py-2 rounded-full text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="Soccer">Soccer</option>
                <option value="Basketball">Basketball</option>
                <option value="Tennis">Tennis</option>
                <option value="Boxing">Boxing</option>
                <option value="Baseball">Baseball</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-xs ${theme.textMuted} mb-1`}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
              rows={3}
              maxLength={500}
              placeholder="Describe your tournament..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>Format *</label>
              <select
                required
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className={`w-full px-4 py-2 rounded-full text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="1v1">1v1</option>
                <option value="2v2">2v2</option>
                <option value="3v3">3v3</option>
                <option value="5v5">5v5</option>
                <option value="11v11">11v11</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>Max Participants</label>
              <input
                type="number"
                min={2}
                max={256}
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 16 })}
                className={`w-full px-4 py-2 rounded-full text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs ${theme.textMuted} mb-1`}>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`w-full px-4 py-2 rounded-full text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
              placeholder="Downtown Sports Complex"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full px-4 py-2 rounded-full text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full px-4 py-2 rounded-full text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>Prize Pot ($)</label>
              <input
                type="number"
                min={0}
                value={formData.prizePot}
                onChange={(e) => setFormData({ ...formData, prizePot: parseFloat(e.target.value) || 0 })}
                className={`w-full px-4 py-2 rounded-full text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>Prize Distribution</label>
              <select
                value={formData.prizeDistribution}
                onChange={(e) => setFormData({ ...formData, prizeDistribution: e.target.value })}
                className={`w-full px-4 py-2 rounded-full text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="winner-takes-all">Winner Takes All</option>
                <option value="podium">Podium (1st/2nd/3rd)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-xs ${theme.textMuted} mb-1`}>Tournament Rules (one per line)</label>
            <textarea
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter rules, one per line:&#10;No slide tackles&#10;15 minute halves&#10;Rolling substitutions allowed"
              rows={4}
            />
            <p className={`text-[10px] ${theme.textMuted} mt-1`}>These rules will be visible to all participants</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-3 h-3 rounded"
            />
            <label htmlFor="isPublic" className={`${theme.textSecondary} text-xs`}>Make tournament public (visible to all users)</label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className={`${theme.buttonPrimary} px-4 py-2 rounded-full text-xs font-medium disabled:opacity-50 flex items-center gap-1`}
            >
              {creating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={12} />
                  Create Tournament (as Draft)
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('browse')}
              className={`${theme.button} px-4 py-2 rounded-full text-xs font-medium`}
            >
              Cancel
            </button>
          </div>
          <p className={`text-xs ${theme.textMuted}`}>Tournament will be created as draft. You can publish it when ready.</p>
          </div>
        </form>
      )}

      {/* Pending Requests Modal for Tournament Organizers */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.surface} rounded-2xl p-4 max-w-lg w-full border ${theme.border} max-h-[80vh] overflow-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-sm font-semibold ${theme.text}`}>Pending Join Requests</h2>
              <button
                onClick={() => setShowRequestsModal(null)}
                className={`p-2 hover:bg-gray-700 rounded-full ${theme.textMuted}`}
              >
                <X size={14} />
              </button>
            </div>

            {(() => {
              const tournament = tournaments.find(t => t.id === showRequestsModal);
              if (!tournament || !tournament.pendingRequests || tournament.pendingRequests.length === 0) {
                return (
                  <div className="text-center py-6">
                    <Users size={32} className={`mx-auto mb-3 ${theme.textMuted}`} />
                    <p className={`${theme.textMuted} text-xs`}>No pending requests</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {tournament.pendingRequests.map((request) => (
                    <div
                      key={request.odId}
                      className={`${theme.card} border rounded-xl p-3 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${theme.buttonPrimary} flex items-center justify-center`}>
                          <UserPlus size={12} />
                        </div>
                        <div>
                          <p className={`font-medium text-xs ${theme.text}`}>{request.odName}</p>
                          <p className={`text-[10px] ${theme.textMuted}`}>
                            Requested {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleApproveRequest(tournament.id, request.odId)}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-full"
                          title="Approve"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(tournament.id, request.odId)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full"
                          title="Reject"
                        >
                          <UserX size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {showDonateModal && selectedTournament && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.surface} rounded-2xl p-4 max-w-md w-full border ${theme.border}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-sm font-semibold ${theme.text}`}>Donate to Tournament</h2>
              <button
                onClick={() => {
                  setShowDonateModal(false);
                  setSelectedTournament(null);
                  setDonationAmount('');
                }}
                className={`p-2 hover:bg-gray-700 rounded-full ${theme.textMuted}`}
              >
                <X size={14} />
              </button>
            </div>

            <div className="text-center mb-4">
              <DollarSign size={40} className="mx-auto text-green-400 mb-2" />
              <h3 className={`font-semibold ${theme.text}`}>{selectedTournament.name}</h3>
              <p className={`text-xs ${theme.textMuted} mt-1`}>
                Current pot: <span className="text-green-400 font-bold">${(selectedTournament.donationPot || 0).toLocaleString()}</span>
              </p>
            </div>

            <div className="mb-4">
              <label className={`block text-xs font-medium mb-2 ${theme.text}`}>
                Donation Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Enter amount"
                  className={`w-full pl-8 pr-3 py-2 ${theme.input} border rounded-lg text-sm`}
                />
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              {[5, 10, 25, 50, 100].map(amount => (
                <button
                  key={amount}
                  onClick={() => setDonationAmount(amount.toString())}
                  className={`flex-1 py-2 text-xs rounded-full ${
                    donationAmount === amount.toString()
                      ? 'bg-green-600 text-white'
                      : `${theme.button}`
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>

            <button
              onClick={handleDonate}
              disabled={!donationAmount || parseFloat(donationAmount) <= 0}
              className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full text-xs font-medium flex items-center justify-center gap-2"
            >
              <DollarSign size={12} />
              Donate ${donationAmount || '0'}
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && selectedTournament && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.surface} rounded-2xl p-4 max-w-lg w-full border ${theme.border} max-h-[80vh] overflow-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-sm font-semibold ${theme.text}`}>Tournament Rules</h2>
              <button
                onClick={() => {
                  setShowRulesModal(false);
                  setSelectedTournament(null);
                  setEditingRules([]);
                }}
                className={`p-2 hover:bg-gray-700 rounded-full ${theme.textMuted}`}
              >
                <X size={14} />
              </button>
            </div>

            <div className="text-center mb-4">
              <FileText size={40} className="mx-auto text-blue-400 mb-2" />
              <h3 className={`font-semibold ${theme.text}`}>{selectedTournament.name}</h3>
            </div>

            {/* Rules List */}
            <div className="space-y-2 mb-4">
              {editingRules.length === 0 ? (
                <p className={`text-center ${theme.textMuted} text-xs py-4`}>No rules set yet</p>
              ) : (
                editingRules.map((rule, index) => (
                  <div
                    key={index}
                    className={`${theme.card} border rounded-lg p-3 flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className={`text-xs ${theme.text}`}>{rule}</span>
                    </div>
                    {selectedTournament.creatorId === user?.id && (
                      <button
                        onClick={() => handleRemoveRule(index)}
                        className="p-1 hover:bg-red-500/20 text-red-400 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add New Rule (only for organizer) */}
            {selectedTournament.creatorId === user?.id && (
              <div className="mb-4">
                <label className={`block text-xs font-medium mb-2 ${theme.text}`}>
                  Add New Rule
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
                    placeholder="Enter a new rule"
                    className={`flex-1 px-3 py-2 ${theme.input} border rounded-lg text-xs`}
                  />
                  <button
                    onClick={handleAddRule}
                    disabled={!newRule.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full text-xs"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Save Button (only for organizer) */}
            {selectedTournament.creatorId === user?.id && (
              <button
                onClick={handleSaveRules}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium flex items-center justify-center gap-2"
              >
                <Settings size={12} />
                Save Rules
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsPage;
