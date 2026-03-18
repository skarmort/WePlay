import React, { useEffect, useState } from 'react';
import { eventsAPI } from '../services/api';
import { Plus, Calendar, MapPin, Users, X, Trophy, Clock, Check, UserPlus, UserX, DollarSign, FileText, Settings } from 'lucide-react';

type JoinRequest = {
  odId: string;
  odName: string;
  requestedAt: string;
};

type EventSummary = {
  id: string;
  name: string;
  sport: string;
  location: string;
  startDate: string;
  format: string;
  description?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  isPublic?: boolean;
  isOwner?: boolean;
  joinRequestStatus?: 'none' | 'pending' | 'participant';
  pendingRequests?: JoinRequest[];
  donationPot?: number;
  rules?: string[];
};

interface EventsPageProps {
  isDarkMode?: boolean;
}

const EventsPage: React.FC<EventsPageProps> = ({ isDarkMode = true }) => {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState('');
  const [showRequestsModal, setShowRequestsModal] = useState<string | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventSummary | null>(null);
  const [editingRules, setEditingRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');

  // Create form state
  const [formData, setFormData] = useState({
    name: '',
    sport: 'Soccer',
    format: '5v5',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    maxParticipants: 20,
    eventType: 'tournament',
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

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Mock events with join request data
      const mockEvents: EventSummary[] = [
        {
          id: 'event-1',
          name: 'Summer Soccer Championship',
          sport: 'Soccer',
          location: 'Central Park Fields',
          startDate: '2025-07-15T10:00',
          format: '5v5',
          description: 'Annual summer tournament open to all skill levels',
          maxParticipants: 32,
          currentParticipants: 24,
          isPublic: true,
          isOwner: true,
          joinRequestStatus: 'none',
          donationPot: 750,
          rules: ['No cleats on artificial turf', 'Teams must have matching jerseys', 'Registration closes 48hrs before event'],
          pendingRequests: [
            { odId: 'user-1', odName: 'Alex Johnson', requestedAt: '2025-01-20' },
            { odId: 'user-2', odName: 'Maria Garcia', requestedAt: '2025-01-21' }
          ]
        },
        {
          id: 'event-2',
          name: 'Basketball Skills Clinic',
          sport: 'Basketball',
          location: 'Downtown Gym',
          startDate: '2025-02-10T14:00',
          format: 'Workshop',
          description: 'Learn from pro coaches',
          maxParticipants: 20,
          currentParticipants: 15,
          isPublic: true,
          isOwner: false,
          joinRequestStatus: 'pending',
          donationPot: 300,
          rules: ['Bring your own basketball', 'Indoor shoes required', 'All skill levels welcome'],
          pendingRequests: []
        },
        {
          id: 'event-3',
          name: 'Tennis Doubles Tournament',
          sport: 'Tennis',
          location: 'City Tennis Club',
          startDate: '2025-03-05T09:00',
          format: '2v2',
          maxParticipants: 16,
          currentParticipants: 8,
          isPublic: true,
          isOwner: false,
          joinRequestStatus: 'none',
          donationPot: 0,
          rules: ['USTA rules apply', 'Bring extra balls'],
          pendingRequests: []
        }
      ];
      setEvents(mockEvents);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const newEvent: EventSummary = {
        id: `event-${Date.now()}`,
        name: formData.name,
        sport: formData.sport,
        location: formData.location,
        startDate: formData.startDate,
        format: formData.format,
        description: formData.description,
        maxParticipants: formData.maxParticipants
      };
      
      setEvents([newEvent, ...events]);
      setSuccess('Event created successfully!');
      setFormData({
        name: '',
        sport: 'Soccer',
        format: '5v5',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        maxParticipants: 20,
        eventType: 'tournament',
        rules: ''
      });
      setTimeout(() => setActiveTab('browse'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinEvent = (eventId: string) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, joinRequestStatus: 'pending' as const } : e
    ));
    setSuccess('Join request sent! Waiting for organizer approval.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCancelRequest = (eventId: string) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, joinRequestStatus: 'none' as const } : e
    ));
    setSuccess('Join request cancelled.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleApproveRequest = (eventId: string, userId: string) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          currentParticipants: (e.currentParticipants || 0) + 1,
          pendingRequests: e.pendingRequests?.filter(r => r.odId !== userId) || []
        };
      }
      return e;
    }));
    setSuccess('Request approved! User has been added to the event.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRejectRequest = (eventId: string, userId: string) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          pendingRequests: e.pendingRequests?.filter(r => r.odId !== userId) || []
        };
      }
      return e;
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
    if (selectedEvent) {
      setEvents(events.map(e => 
        e.id === selectedEvent.id 
          ? { ...e, donationPot: (e.donationPot || 0) + amount }
          : e
      ));
      setSuccess(`Thank you for donating $${amount.toFixed(2)} to ${selectedEvent.name}!`);
      setShowDonateModal(false);
      setDonationAmount('');
      setSelectedEvent(null);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleAddRule = () => {
    if (newRule.trim() && selectedEvent) {
      const updatedRules = [...editingRules, newRule.trim()];
      setEditingRules(updatedRules);
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setEditingRules(editingRules.filter((_, i) => i !== index));
  };

  const handleSaveRules = () => {
    if (selectedEvent) {
      setEvents(events.map(e =>
        e.id === selectedEvent.id
          ? { ...e, rules: editingRules }
          : e
      ));
      setSuccess('Event rules updated!');
      setShowRulesModal(false);
      setSelectedEvent(null);
      setEditingRules([]);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const openRulesModal = (event: EventSummary) => {
    setSelectedEvent(event);
    setEditingRules(event.rules || []);
    setShowRulesModal(true);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.text}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto px-4 py-6 ${theme.text}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className={`text-xl font-bold ${theme.text}`}>Events & Tournaments</h1>
          <p className={`${theme.textMuted} text-xs mt-1`}>Upcoming leagues, tournaments, and clinics.</p>
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
          Browse Events
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-full text-xs transition-colors flex items-center gap-2 ${
            activeTab === 'create' ? theme.buttonPrimary : theme.button
          }`}
        >
          <Plus size={12} /> Create Event
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-3 py-2 rounded-lg mb-4 flex items-center justify-between text-xs">
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={12} /></button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/40 text-green-300 px-3 py-2 rounded-lg mb-4 flex items-center justify-between text-xs">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><X size={12} /></button>
        </div>
      )}

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.length === 0 ? (
            <div className={`col-span-2 text-center py-8 ${theme.surface} rounded-xl border ${theme.border}`}>
              <Calendar size={32} className={`mx-auto mb-3 ${theme.textMuted}`} />
              <p className={`${theme.textMuted} text-xs`}>No events found. Create the first one!</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className={`${theme.card} border rounded-xl p-4 hover:scale-[1.02] transition-transform`}>
                <div className="flex justify-between items-start mb-2">
                  <h2 className={`text-sm font-semibold ${theme.text}`}>{event.name}</h2>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full bg-blue-500/20 text-blue-400`}>
                    {event.format}
                  </span>
                </div>
                
                {event.description && (
                  <p className={`${theme.textMuted} text-[10px] mb-3`}>{event.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                  <div className={`flex items-center gap-1 ${theme.textSecondary}`}>
                    <Trophy size={10} />
                    <span>{event.sport}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${theme.textSecondary}`}>
                    <MapPin size={10} />
                    <span>{event.location}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${theme.textSecondary}`}>
                    <Calendar size={10} />
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  {event.maxParticipants && (
                    <div className={`flex items-center gap-1 ${theme.textSecondary}`}>
                      <Users size={10} />
                      <span>{event.currentParticipants || 0}/{event.maxParticipants}</span>
                    </div>
                  )}
                </div>

                {/* Donation Pot */}
                <div className={`${theme.surface} rounded-lg p-3 mb-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-green-400" />
                      <span className={`text-xs font-medium ${theme.text}`}>Event Fund</span>
                    </div>
                    <span className="text-green-400 font-bold text-sm">${(event.donationPot || 0).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowDonateModal(true);
                    }}
                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs flex items-center justify-center gap-1"
                  >
                    <DollarSign size={10} />
                    Donate to This Event
                  </button>
                </div>

                {/* Rules Section */}
                {event.rules && event.rules.length > 0 && (
                  <div className={`${theme.surface} rounded-lg p-3 mb-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-blue-400" />
                        <span className={`text-xs font-medium ${theme.text}`}>Event Rules</span>
                      </div>
                      <button
                        onClick={() => openRulesModal(event)}
                        className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                      >
                        <Settings size={10} />
                        View All
                      </button>
                    </div>
                    <ul className={`text-xs ${theme.textMuted} space-y-1`}>
                      {event.rules.slice(0, 2).map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                      {event.rules.length > 2 && (
                        <li className="text-blue-400 cursor-pointer hover:underline" onClick={() => openRulesModal(event)}>
                          +{event.rules.length - 2} more rules...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Availability indicator */}
                {event.maxParticipants && (event.currentParticipants || 0) < event.maxParticipants && (
                  <div className="flex items-center gap-1 mb-3 text-green-400 text-[10px]">
                    <Check size={10} />
                    <span>{event.maxParticipants - (event.currentParticipants || 0)} spots available</span>
                  </div>
                )}
                {event.maxParticipants && (event.currentParticipants || 0) >= event.maxParticipants && (
                  <div className="flex items-center gap-1 mb-3 text-red-400 text-[10px]">
                    <X size={10} />
                    <span>Event is full</span>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {/* Join button for open events */}
                  {event.isPublic && event.maxParticipants && (event.currentParticipants || 0) < event.maxParticipants && event.joinRequestStatus === 'none' && !event.isOwner && (
                    <button
                      onClick={() => handleJoinEvent(event.id)}
                      className={`${theme.buttonPrimary} px-4 py-2 rounded-full text-xs flex items-center gap-1 flex-1`}
                    >
                      <UserPlus size={12} />
                      Request to Join
                    </button>
                  )}

                  {/* Pending request indicator */}
                  {event.joinRequestStatus === 'pending' && (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center gap-1 flex-1 justify-center">
                        <Clock size={12} />
                        Request Pending
                      </span>
                      <button
                        onClick={() => handleCancelRequest(event.id)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full text-xs"
                        title="Cancel Request"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {/* Owner actions - manage requests */}
                  {event.isOwner && event.pendingRequests && event.pendingRequests.length > 0 && (
                    <button
                      onClick={() => setShowRequestsModal(event.id)}
                      className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-full text-xs flex items-center gap-1"
                    >
                      <Users size={12} />
                      {event.pendingRequests.length} Pending Requests
                    </button>
                  )}

                  {/* Participant badge */}
                  {event.joinRequestStatus === 'participant' && !event.isOwner && (
                    <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1">
                      <Check size={12} />
                      Registered
                    </span>
                  )}

                  {/* Owner badge */}
                  {event.isOwner && (
                    <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center gap-1">
                      <Trophy size={12} />
                      Organizer
                    </span>
                  )}

                  <button className={`${theme.button} px-4 py-2 rounded-full text-xs`}>
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreate} className={`max-w-2xl ${theme.surface} rounded-xl p-4 border ${theme.border}`}>
          <h2 className={`text-sm font-semibold ${theme.text} mb-4`}>Create New Event</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs ${theme.textMuted} mb-1`}>Event Name *</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Summer Soccer League"
                />
              </div>
              <div>
                <label className={`block text-xs ${theme.textMuted} mb-1`}>Event Type *</label>
                <select
                  required
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="tournament">Tournament</option>
                  <option value="league">League</option>
                  <option value="clinic">Clinic/Workshop</option>
                  <option value="pickup">Pickup Game</option>
                  <option value="practice">Practice Session</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs ${theme.textMuted} mb-1`}>Sport *</label>
                <select
                  required
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
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
              <div>
                <label className={`block text-xs ${theme.textMuted} mb-1`}>Format *</label>
                <select
                  required
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="1v1">1v1</option>
                  <option value="2v2">2v2</option>
                  <option value="3v3">3v3</option>
                  <option value="5v5">5v5</option>
                  <option value="7v7">7v7</option>
                  <option value="11v11">11v11</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Open">Open Format</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
                rows={3}
                maxLength={500}
                placeholder="Describe your event..."
              />
            </div>

            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
                placeholder="Downtown Sports Complex"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs ${theme.textMuted} mb-1`}>Start Date *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-xs ${theme.textMuted} mb-1`}>End Date</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>Max Participants</label>
              <input
                type="number"
                min={2}
                max={500}
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 20 })}
                className={`w-full px-3 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div>
              <label className={`block text-xs ${theme.textMuted} mb-1`}>Event Rules (one per line)</label>
              <textarea
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg text-xs ${theme.input} border focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter rules, one per line:&#10;No cleats on artificial turf&#10;Registration closes 48hrs before"
                rows={3}
              />
              <p className={`text-[10px] ${theme.textMuted} mt-1`}>These rules will be visible to all participants</p>
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
                    Create Event
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

      {/* Pending Requests Modal for Event Organizers */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.surface} rounded-2xl p-4 max-w-lg w-full border ${theme.border} max-h-[80vh] overflow-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-sm font-semibold ${theme.text}`}>Pending Join Requests</h2>
              <button
                onClick={() => setShowRequestsModal(null)}
                className={`p-1 hover:bg-gray-700 rounded-lg ${theme.textMuted}`}
              >
                <X size={14} />
              </button>
            </div>

            {(() => {
              const event = events.find(e => e.id === showRequestsModal);
              if (!event || !event.pendingRequests || event.pendingRequests.length === 0) {
                return (
                  <div className="text-center py-6">
                    <Users size={32} className={`mx-auto mb-3 ${theme.textMuted}`} />
                    <p className={`${theme.textMuted} text-xs`}>No pending requests</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {event.pendingRequests.map((request) => (
                    <div
                      key={request.odId}
                      className={`${theme.card} border rounded-xl p-3 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${theme.buttonPrimary} flex items-center justify-center`}>
                          <UserPlus size={14} />
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${theme.text}`}>{request.odName}</p>
                          <p className={`text-[10px] ${theme.textMuted}`}>
                            Requested {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleApproveRequest(event.id, request.odId)}
                          className="p-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg"
                          title="Approve"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(event.id, request.odId)}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
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
      {showDonateModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.surface} rounded-2xl p-4 max-w-md w-full border ${theme.border}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-sm font-semibold ${theme.text}`}>Donate to Event</h2>
              <button
                onClick={() => {
                  setShowDonateModal(false);
                  setSelectedEvent(null);
                  setDonationAmount('');
                }}
                className={`p-2 hover:bg-gray-700 rounded-full ${theme.textMuted}`}
              >
                <X size={14} />
              </button>
            </div>

            <div className="text-center mb-4">
              <DollarSign size={40} className="mx-auto text-green-400 mb-2" />
              <h3 className={`font-semibold ${theme.text}`}>{selectedEvent.name}</h3>
              <p className={`text-xs ${theme.textMuted} mt-1`}>
                Current fund: <span className="text-green-400 font-bold">${(selectedEvent.donationPot || 0).toLocaleString()}</span>
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
      {showRulesModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.surface} rounded-2xl p-4 max-w-lg w-full border ${theme.border} max-h-[80vh] overflow-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-sm font-semibold ${theme.text}`}>Event Rules</h2>
              <button
                onClick={() => {
                  setShowRulesModal(false);
                  setSelectedEvent(null);
                  setEditingRules([]);
                }}
                className={`p-2 hover:bg-gray-700 rounded-full ${theme.textMuted}`}
              >
                <X size={14} />
              </button>
            </div>

            <div className="text-center mb-4">
              <FileText size={40} className="mx-auto text-blue-400 mb-2" />
              <h3 className={`font-semibold ${theme.text}`}>{selectedEvent.name}</h3>
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
                    {selectedEvent.isOwner && (
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
            {selectedEvent.isOwner && (
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
            {selectedEvent.isOwner && (
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

export default EventsPage;