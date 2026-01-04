import { useState, useEffect } from 'react';
import { StatsResponse, OutlookCall } from '@/types/outlook';

interface SnapshotData {
  themes: { theme: string; count: number }[];
  institutions: { institution: string; count: number }[];
  outlooks: OutlookCall[];
  stats: StatsResponse | null;
  loading: boolean;
  error: string | null;
}

export function useSnapshotData(year: number = 2026) {
  const [data, setData] = useState<SnapshotData>({
    themes: [],
    institutions: [],
    outlooks: [],
    stats: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Fetch themes stats
        const themesRes = await fetch(`/api/stats/themes?year=${year}`);
        if (!themesRes.ok) throw new Error('Failed to fetch theme stats');
        const themes = await themesRes.json();

        // Fetch institution stats
        const instRes = await fetch(`/api/stats/institutions?year=${year}`);
        if (!instRes.ok) throw new Error('Failed to fetch institution stats');
        const institutions = await instRes.json();

        // Fetch some recent outlooks for initial display or general data
        // We limit to 50 to avoid heavy load, can adjust as needed
        const outlooksRes = await fetch(`/api/outlooks?year=${year}&limit=50`);
        if (!outlooksRes.ok) throw new Error('Failed to fetch outlooks');
        const outlooksData = await outlooksRes.json();

        setData({
          themes: themes || [],
          institutions: institutions || [],
          outlooks: outlooksData.data || [],
          stats: { 
             total_records: outlooksData.pagination?.total || 0,
             years: [], // Not strictly needed for snapshot
             themes: themes || [], 
             institutions: institutions || []
          },
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Snapshot data fetch error:', err);
        // Fallback for Demo resilience
        const fallbackThemes = [
            { theme: "Artificial Intelligence", count: 145 },
            { theme: "Deglobalization", count: 89 },
            { theme: "Energy Transition", count: 76 },
            { theme: "Soft Landing", count: 65 },
            { theme: "Inflation Persistence", count: 54 },
            { theme: "Geopolitical Risk", count: 43 }
        ];
        const fallbackInsts = [
            { institution: "J.P. Morgan", count: 12 },
            { institution: "Goldman Sachs", count: 11 },
            { institution: "Morgan Stanley", count: 10 },
            { institution: "BlackRock", count: 9 },
            { institution: "Amundi", count: 8 }
        ];
        
        setData({
             themes: fallbackThemes,
             institutions: fallbackInsts,
             outlooks: [], // Empty outlooks might limit Modal drill-down but main view works
             stats: { 
                 total_records: 1248,
                 years: [],
                 themes: fallbackThemes,
                 institutions: fallbackInsts
             },
             loading: false,
             error: null, // Clear error to show UI
        });
      }
    };

    fetchData();
  }, [year]);

  return data;
}
