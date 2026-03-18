import React, { useState } from 'react';
import { Plus, Users, Trophy, MapPin, X, UserPlus, Settings, Shield, Star, Clock, Check, UserX, DollarSign, FileText } from 'lucide-react';

type JoinRequest = {
  odId: string;
  odName: string;
  requestedAt: string;
};

type Team = {
  id: string;
  name: string;
  sport: string;
  description?: string;
  location?: string;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  status: 'active' | 'recruiting' | 'inactive';
  createdAt: string;
  wins?: number;
  losses?: number;
  joinRequestStatus?: 'none' | 'pending' | 'member';
  pendingRequests?: JoinRequest[];
  isOwner?: boolean;
  donationPot?: number;
  rules?: string[];
};

interface TeamsPageProps {
  isDarkMode?: boolean;
}

const TeamsPage: React.FC<TeamsPageProps> = ({ isDarkMode = true }) => {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: 'team-1',
      name: 'Westside Warriors',
      sport: 'Soccer',
      description: 'Competitive 5v5 soccer team looking for skilled players',
      location: 'Westside Park',
      memberCount: 8,
      maxMembers: 15,
      isPublic: true,
      status: 'recruiting',
      createdAt: '2024-01-15',
      wins: 12,
      losses: 3,
      joinRequestStatus: 'none',
      donationPot: 450,
      rules: ['Must attend 2+ practices per week', 'Bring your own gear', 'No trash talk']
    },
    {
      id: 'team-2',
      name: 'Downtown Ballers',
      sport: 'Basketball',
      description: 'Casual basketball team for weekend pickup games',
      location: 'Downtown Courts',
      memberCount: 10,
      maxMembers: 12,
      isPublic: true,
      status: 'active',
      createdAt: '2024-02-01',
      wins: 8,
      losses: 5,
      joinRequestStatus: 'none',
      donationPot: 220,
      rules: ['Show up on time', 'Call your own fouls', 'Rotate players fairly']
    },
    {
      id: 'team-3',
      name: 'My Tennis Squad',
      sport: 'Tennis',
      description: 'Weekend doubles tennis group',
      location: 'Central Courts',
      memberCount: 4,
      maxMembers: 8,
      isPublic: true,
      status: 'recruiting',
      createdAt: '2024-03-01',
      wins: 5,
      losses: 2,
      joinRequestStatus: 'member',
      isOwner: true,
      donationPot: 150,
      rules: ['Doubles only', 'Book courts in advance', 'Share ball costs'],
      pendingRequests: [
        { odId: 'user-1', odName: 'John Doe', requestedAt: '2026-02-04' },
        { odId: 'user-2', odName: 'Jane Smith', requestedAt: '2026-02-05' }
      ]
    }
  ]);
  const [activeTab, setActiveTab] = useState<'browse' | 'my' | 'create'>('browse');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterSport, setFilterSport] = useState('');
  const [showRequestsModal, setShowRequestsModal] = useState<string | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editingRules, setEditingRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    sport: 'Soccer',
    description: '',
    location: '',
    maxMembers: 15,
    isPublic: true,
    rules: ''
  });

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: formData.name,
        sport: formData.sport,
        description: formData.description,
        location: formData.location,
        memberCount: 1,
        maxMembers: formData.maxMembers,
        isPublic: formData.isPublic,
        status: 'recruiting',
        createdAt: new Date().toISOString(),
        wins: 0,
        losses: 0
      };
      
      setTeams([newTeam, ...teams]);
      setSuccess('Team created successfully! You are now the team captain.');
      setFormData({
        name: '',
        sport: 'Soccer',
        description: '',
        location: '',
        maxMembers: 15,
        isPublic: true,
        rules: ''
      });
      setTimeout(() => setActiveTab('my'), 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTeam = (teamId: string) => {
    setTeams(teams.map(t => 
      t.id === teamId ? { ...t, joinRequestStatus: 'pending' as const } : t
    ));
    setSuccess('Join request sent! Waiting for team captain approval.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCancelRequest = (teamId: string) => {
    setTeams(teams.map(t => 
      t.id === teamId ? { ...t, joinRequestStatus: 'none' as const } : t
    ));
    setSuccess('Join request cancelled.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleApproveRequest = (teamId: string, userId: string) => {
    setTeams(teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          memberCount: t.memberCount + 1,
          pendingRequests: t.pendingRequests?.filter(r => r.odId !== userId)
        };
      }
      return t;
    }));
    setSuccess('Member approved and added to the team!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRejectRequest = (teamId: string, userId: string) => {
    setTeams(teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          pendingRequests: t.pendingRequests?.filter(r => r.odId !== userId)
        };
      }
      return t;
    }));
    setSuccess('Request rejected.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDonate = () => {
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }
    if (selectedTeam) {
      setTeams(teams.map(t => 
        t.id === selectedTeam.id 
          ? { ...t, donationPot: (t.donationPot || 0) + amount }
          : t
      ));
      setSuccess(`Thank you for donating $${amount.toFixed(2)} to ${selectedTeam.name}!`);
      setShowDonateModal(false);
      setDonationAmount('');
      setSelectedTeam(null);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleAddRule = () => {
    if (newRule.trim() && selectedTeam) {
      const updatedRules = [...editingRules, newRule.trim()];
      setEditingRules(updatedRules);
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setEditingRules(editingRules.filter((_, i) => i !== index));
  };

  const handleSaveRules = () => {
    if (selectedTeam) {
      setTeams(teams.map(t =>
        t.id === selectedTeam.id
          ? { ...t, rules: editingRules }
          : t
      ));
      setSuccess('Team rules updated!');
      setShowRulesModal(false);
      setSelectedTeam(null);
      setEditingRules([]);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const openRulesModal = (team: Team) => {
    setSelectedTeam(team);
    setEditingRules(team.rules || []);
    setShowRulesModal(true);
  };

  const filteredTeams = filterSport 
    ? teams.filter(t => t.sport === filterSport)
    : teams;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recruiting': return 'bg-green-500/20 text-green-400';
      case 'active': return 'bg-blue-500/20 text-blue-400';
      case 'inactive': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const renderTeamCard = (team: Team, showJoin = true) => (
    <div key={team.id} className={`${theme.card} border rounded-xl p-4 hover:scale-[1.02] transition-transform`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full ${theme.buttonPrimary} flex items-center justify-center`}>
            <Shield size={18} />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${theme.text}`}>{team.name}</h3>
            <span className={`text-xs ${theme.textMuted}`}>{team.sport}</span>
          </div>
        </div>
        <span className={`px-2 py-1 text-[10px] rounded-full capitalize ${getStatusColor(team.status)}`}>
          {team.status}
        </span>
      </div>

      {team.description && (
        <p className={`${theme.textMuted} text-xs mb-3`}>{team.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className={`flex items-center gap-1 ${theme.textSecondary}`}>
          <Users size={12} />
          <span>{team.memberCount}/{team.maxMembers} members</span>
        </div>
        {team.location && (
          <div className={`flex items-center gap-1 ${theme.textSecondary}`}>
            <MapPin size={12} />
            <span>{team.location}</span>
          </div>
        )}
        {(team.wins !== undefined || team.losses !== undefined) && (
          <div className={`flex items-center gap-1 ${theme.textSecondary}`}>
            <Trophy size={12} />
            <span>{team.wins}W - {team.losses}L</span>
          </div>
        )}
        <div className={`flex items-center gap-1 ${theme.textSecondary}`}>
          <Star size={12} />
          <span>{team.isPublic ? 'Public' : 'Private'}</span>
        </div>
      </div>

      {/* Donation Pot */}
      <div className={`${theme.surface} rounded-lg p-3 mb-3`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-green-400" />
            <span className={`text-xs font-medium ${theme.text}`}>Team Fund</span>
          </div>
          <span className="text-green-400 font-bold text-sm">${(team.donationPot || 0).toLocaleString()}</span>
        </div>
        <button
          onClick={() => {
            setSelectedTeam(team);
            setShowDonateModal(true);
          }}
          className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs flex items-center justify-center gap-1"
        >
          <DollarSign size={10} />
          Donate to This Team
        </button>
      </div>

      {/* Rules Section */}
      {team.rules && team.rules.length > 0 && (
        <div className={`${theme.surface} rounded-lg p-3 mb-3`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-blue-400" />
              <span className={`text-xs font-medium ${theme.text}`}>Team Rules</span>
            </div>
            <button
              onClick={() => openRulesModal(team)}
              className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
            >
              <Settings size={10} />
              View All
            </button>
          </div>
          <ul className={`text-xs ${theme.textMuted} space-y-1`}>
            {team.rules.slice(0, 2).map((rule, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{rule}</span>
              </li>
            ))}
            {team.rules.length > 2 && (
              <li className="text-blue-400 cursor-pointer hover:underline" onClick={() => openRulesModal(team)}>
                +{team.rules.length - 2} more rules...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Availability indicator */}
      {team.memberCount < team.maxMembers && team.status === 'recruiting' && (
        <div className="flex items-center gap-1 mb-3 text-green-400 text-xs">
          <Check size={12} />
          <span>{team.maxMembers - team.memberCount} spots available</span>
        </div>
      )}
      {team.memberCount >= team.maxMembers && (
        <div className="flex items-center gap-1 mb-3 text-red-400 text-xs">
          <X size={12} />
          <span>Team is full</span>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {/* Join button for teams user can join */}
        {showJoin && team.isPublic && team.status === 'recruiting' && team.memberCount < team.maxMembers && team.joinRequestStatus === 'none' && !team.isOwner && (
          <button
            onClick={() => handleJoinTeam(team.id)}
            className={`${theme.buttonPrimary} px-4 py-2 rounded-full text-xs flex items-center gap-1 flex-1`}
          >
            <UserPlus size={12} />
            Request to Join
          </button>
        )}

        {/* Pending request indicator */}
        {team.joinRequestStatus === 'pending' && (
          <div className="flex items-center gap-2 flex-1">
            <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center gap-1 flex-1 justify-center">
              <Clock size={12} />
              Request Pending
            </span>
            <button
              onClick={() => handleCancelRequest(team.id)}
              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full text-xs"
              title="Cancel Request"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Owner actions - manage requests */}
        {team.isOwner && team.pendingRequests && team.pendingRequests.length > 0 && (
          <button
            onClick={() => setShowRequestsModal(team.id)}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-full text-xs flex items-center gap-1"
          >
            <Users size={12} />
            {team.pendingRequests.length} Pending Requests
          </button>
        )}

        {/* Member badge */}
        {team.joinRequestStatus === 'member' && !team.isOwner && (
          <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1">
            <Check size={12} />
            Member
          </span>
        )}

        {/* Owner badge */}
        {team.isOwner && (
          <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center gap-1">
            <Shield size={12} />
            Captain
          </span>
        )}

        <button className={`${theme.button} px-4 py-2 rounded-full text-xs`}>
          View Team
        </button>
      </div>
    </div>
  );

  return (
    <div className={`max-w-6xl mx-auto px-4 py-8 ${theme.text}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className={`text-xl font-bold ${theme.text}`}>Teams</h1>
          <p className={`${theme.textMuted} mt-1 text-xs`}>Create or join teams to compete together.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 mb-4 border-b ${theme.border} pb-3`}>
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 rounded-full text-xs transition-colors ${
            activeTab === 'browse' ? theme.buttonPrimary : theme.button
          }`}
        >
          Browse Teams
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-full text-xs transition-colors ${
            activeTab === 'my' ? theme.buttonPrimary : theme.button
          }`}
        >
          My Teams
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-full text-xs transition-colors flex items-center gap-1 ${
            activeTab === 'create' ? theme.buttonPrimary : theme.button
          }`}
        >
          <Plus size={14} /> Create Team
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-2 rounded-full mb-4 flex items-center justify-between text-xs">
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/40 text-green-300 px-4 py-2 rounded-full mb-4 flex items-center justify-between text-xs">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><X size={14} /></button>
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
              <option value="Baseball">Baseball</option>
              <option value="Volleyball">Volleyball</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeams.length === 0 ? (
              <div className={`col-span-2 text-center py-8 ${theme.surface} rounded-xl border ${theme.border}`}>
                <Users size={36} className={`mx-auto mb-3 ${theme.textMuted}`} />
                <p className={`${theme.textMuted} text-xs`}>No teams found. Create the first one!</p>
              </div>
            ) : (
              filteredTeams.map((team) => renderTeamCard(team))
            )}
          </div>
        </>
      )}

      {/* My Teams Tab */}
      {activeTab === 'my' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`col-span-2 text-center py-8 ${theme.surface} rounded-xl border ${theme.border}`}>
            <Users size={36} className={`mx-auto mb-3 ${theme.textMuted}`} />
            <p className={`${theme.textMuted} text-xs`}>You haven't joined any teams yet.</p>
            <button 
              onClick={() => setActiveTab('browse')}
              className={`${theme.buttonPrimary} px-4 py-2 rounded-full text-xs mt-3`}
            >
              Browse Teams
            </button>
          </div>
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreate} className={`max-w-2xl ${theme.surface} rounded-xl p-4 border ${theme.border}`}>
          <h2 className={`text-sm font-semibold ${theme.text} mb-4`}>Create New Team</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs ${theme.textMuted} mb-1`}>Team Name *</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={50}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-full text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Awesome Team Name"
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
                  <option value="Volleyball">Volleyball</option>
                  <option value="Rugby">Rugby</option>
                  <option value="Golf">Golf</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>Team Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
                rows={3}
                maxLength={300}
                placeholder="Tell potential teammates about your team..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs ${theme.textMuted} mb-1`}>Home Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-4 py-2 rounded-full text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
                  placeholder="Where does your team usually play?"
                />
              </div>
              <div>
                <label className={`block text-xs ${theme.textMuted} mb-1`}>Max Team Members</label>
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 15 })}
                  className={`w-full px-4 py-2 rounded-full text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>Team Rules (one per line)</label>
              <textarea
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter rules, one per line:&#10;Must attend 2+ practices per week&#10;Bring your own gear"
                rows={3}
              />
              <p className={`text-[10px] ${theme.textMuted} mt-1`}>These rules will be visible to all members</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-3 h-3 rounded"
              />
              <label htmlFor="isPublic" className={`${theme.textSecondary} text-xs`}>
                Make team public (anyone can find and request to join)
              </label>
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
                    <Plus size={14} />
                    Create Team
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
          </div>
        </form>
      )}

      {/* Pending Requests Modal for Team Owners */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.surface} rounded-2xl p-4 max-w-lg w-full border ${theme.border} max-h-[80vh] overflow-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-sm font-semibold ${theme.text}`}>Pending Join Requests</h2>
              <button
                onClick={() => setShowRequestsModal(null)}
                className={`p-1 hover:bg-gray-700 rounded-full ${theme.textMuted}`}
              >
                <X size={16} />
              </button>
            </div>

            {(() => {
              const team = teams.find(t => t.id === showRequestsModal);
              if (!team || !team.pendingRequests || team.pendingRequests.length === 0) {
                return (
                  <div className="text-center py-6">
                    <Users size={32} className={`mx-auto mb-3 ${theme.textMuted}`} />
                    <p className={`${theme.textMuted} text-xs`}>No pending requests</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {team.pendingRequests.map((request) => (
                    <div
                      key={request.odId}
                      className={`${theme.card} border rounded-xl p-3 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${theme.buttonPrimary} flex items-center justify-center`}>
                          <UserPlus size={14} />
                        </div>
                        <div>
                          <p className={`font-medium text-xs ${theme.text}`}>{request.odName}</p>
                          <p className={`text-[10px] ${theme.textMuted}`}>
                            Requested {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveRequest(team.id, request.odId)}
                          className="p-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-full"
                          title="Approve"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(team.id, request.odId)}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full"
                          title="Reject"
                        >
                          <UserX size={14} />
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
      {showDonateModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.surface} rounded-2xl p-4 max-w-md w-full border ${theme.border}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-sm font-semibold ${theme.text}`}>Donate to Team</h2>
              <button
                onClick={() => {
                  setShowDonateModal(false);
                  setSelectedTeam(null);
                  setDonationAmount('');
                }}
                className={`p-2 hover:bg-gray-700 rounded-full ${theme.textMuted}`}
              >
                <X size={14} />
              </button>
            </div>

            <div className="text-center mb-4">
              <DollarSign size={40} className="mx-auto text-green-400 mb-2" />
              <h3 className={`font-semibold ${theme.text}`}>{selectedTeam.name}</h3>
              <p className={`text-xs ${theme.textMuted} mt-1`}>
                Current fund: <span className="text-green-400 font-bold">${(selectedTeam.donationPot || 0).toLocaleString()}</span>
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
      {showRulesModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.surface} rounded-2xl p-4 max-w-lg w-full border ${theme.border} max-h-[80vh] overflow-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-sm font-semibold ${theme.text}`}>Team Rules</h2>
              <button
                onClick={() => {
                  setShowRulesModal(false);
                  setSelectedTeam(null);
                  setEditingRules([]);
                }}
                className={`p-2 hover:bg-gray-700 rounded-full ${theme.textMuted}`}
              >
                <X size={14} />
              </button>
            </div>

            <div className="text-center mb-4">
              <FileText size={40} className="mx-auto text-blue-400 mb-2" />
              <h3 className={`font-semibold ${theme.text}`}>{selectedTeam.name}</h3>
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
                    {selectedTeam.isOwner && (
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

            {/* Add New Rule (only for owner) */}
            {selectedTeam.isOwner && (
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

            {/* Save Button (only for owner) */}
            {selectedTeam.isOwner && (
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

export default TeamsPage;
