import React, { useEffect, useState } from 'react';
import { userAPI } from '../services/api';

type UserProfile = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  sports?: string[];
  activeSport?: string;
  roles?: string[];
};

const availableSports = [
  'Soccer',
  'Basketball',
  'Tennis',
  'Boxing',
  'Baseball',
  'Cycling'
];

interface ProfilePageProps {
  isDarkMode?: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ isDarkMode = true }) => {
  const theme = isDarkMode ? {
    bg: 'bg-black',
    surface: 'bg-white/5',
    border: 'border-white/10',
    text: 'text-white',
    textMuted: 'text-white/70',
    textSecondary: 'text-white/60',
    input: 'bg-black/40 border-white/10 text-white',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonActive: 'bg-blue-600 border-blue-400',
    buttonInactive: 'bg-white/5 border-white/10',
  } : {
    bg: 'bg-gray-50',
    surface: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    textSecondary: 'text-gray-500',
    input: 'bg-white border-gray-300 text-gray-900',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonActive: 'bg-blue-600 border-blue-400 text-white',
    buttonInactive: 'bg-gray-100 border-gray-200 text-gray-900',
  };
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [sports, setSports] = useState<string[]>([]);
  const [activeSport, setActiveSport] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userAPI.getProfile();
        setProfile(data);
        setDisplayName(data.displayName || data.username);
        setBio(data.bio || '');
        setSports(data.sports || []);
        setActiveSport(data.activeSport || '');
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const toggleSport = (sport: string) => {
    setSports((prev) => {
      if (prev.includes(sport)) {
        const updated = prev.filter((s) => s !== sport);
        if (activeSport === sport) {
          setActiveSport('');
        }
        return updated;
      }
      return [...prev, sport];
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (activeSport && !sports.includes(activeSport)) {
      setError('Active sport must be one of your selected sports.');
      return;
    }

    setSaving(true);
    try {
      const updated = await userAPI.updateProfile({
        displayName,
        bio,
        sports,
        activeSport: activeSport || undefined
      });
      setProfile(updated);
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.text}`}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className={`max-w-4xl mx-auto px-4 py-8 ${theme.text}`}>
        <h1 className="text-xl font-bold mb-2">Profile</h1>
        <p className={`${theme.textMuted} text-xs mb-4`}>Manage your account and sport preferences.</p>

      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-xs px-4 py-2 rounded-full mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/40 text-green-200 text-xs px-4 py-2 rounded-full mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${theme.surface} border ${theme.border} rounded-xl p-4`}>
          <h2 className="text-sm font-semibold mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className={`block text-xs ${theme.textMuted}`}>Display Name</label>
              <input
                className={`w-full mt-2 px-4 py-2 text-xs rounded-full ${theme.input} border`}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
              />
            </div>
            <div>
              <label className={`block text-xs ${theme.textMuted}`}>Bio</label>
              <textarea
                className={`w-full mt-2 px-4 py-2 text-xs rounded-lg ${theme.input} border`}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={4}
              />
            </div>
            <div className={`text-[10px] ${theme.textSecondary}`}>
              <div>Email: {profile?.email}</div>
              <div>Username: {profile?.username}</div>
            </div>
          </div>
        </div>

        <div className={`${theme.surface} border ${theme.border} rounded-xl p-4`}>
          <h2 className="text-sm font-semibold mb-4">Sports Selection</h2>
          <p className={`text-xs ${theme.textMuted} mb-4`}>Select multiple sports, but only one active at a time.</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {availableSports.map((sport) => (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={`px-4 py-2 text-xs rounded-full border transition-colors ${theme.text} ${
                  sports.includes(sport)
                    ? theme.buttonActive
                    : theme.buttonInactive
                }`}
              >
                {sport}
              </button>
            ))}
          </div>

          <div>
            <label className={`block text-xs ${theme.textMuted}`}>Active Sport</label>
            <select
              className={`w-full mt-2 px-4 py-2 text-xs rounded-full ${theme.input} border`}
              value={activeSport}
              onChange={(e) => setActiveSport(e.target.value)}
              disabled={sports.length === 0}
            >
              <option value="">Select active sport</option>
              {sports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
            {sports.length === 0 && (
              <p className="text-xs text-yellow-500 mt-2">
                Add at least one sport to set an active sport.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 text-xs rounded-full ${theme.buttonPrimary} transition-colors disabled:opacity-60`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  </div>
  );
};

export default ProfilePage;