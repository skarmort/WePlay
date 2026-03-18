import React, { useEffect, useState } from 'react';
import { feedAPI } from '../services/api';

type FeedItem = {
  id: string;
  title: string;
  summary: string;
  sport: string;
  createdAt: string;
};

interface FeedPageProps {
  isDarkMode?: boolean;
}

const FeedPage: React.FC<FeedPageProps> = ({ isDarkMode = true }) => {
  const theme = isDarkMode ? {
    bg: 'bg-black',
    surface: 'bg-white/5',
    border: 'border-white/10',
    text: 'text-white',
    textMuted: 'text-white/70',
    textSecondary: 'text-white/60',
  } : {
    bg: 'bg-gray-50',
    surface: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    textSecondary: 'text-gray-500',
  };
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const data = await feedAPI.getFeed();
        setItems(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load feed');
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.text}`}>
        Loading feed...
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className={`max-w-5xl mx-auto px-4 py-6 ${theme.text}`}>
        <h1 className="text-xl font-bold mb-1">News Feed</h1>
        <p className={`${theme.textMuted} text-xs mb-4`}>Updates and highlights based on your sports.</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-3 py-2 rounded-lg mb-4 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`${theme.surface} border ${theme.border} rounded-xl p-4`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-sm font-semibold ${theme.text}`}>{item.title}</h2>
                <span className={`text-[10px] ${theme.textSecondary}`}>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <p className={`${theme.textMuted} text-xs mt-1`}>{item.summary}</p>
              <div className="text-[10px] text-blue-500 mt-2">Sport: {item.sport}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;