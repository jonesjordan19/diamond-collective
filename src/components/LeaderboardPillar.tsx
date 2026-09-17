'use client';

import { useState, useEffect } from 'react';

interface AthleteRow {
  athleteEmail?: string;
  isProfileVisible?: boolean | string;
  primaryRole?: 'HITTER' | 'PITCHER' | 'TWP';
  currentCollege?: string;
  portalStatus?: string;
  recordedDateHitting?: string;
  maxExitVelo?: number | string;
  ninetyEV?: number | string;
  recordedDatePitching?: string;
  peakFB?: number | string;
  offSpeedVelo?: number | string;
  social1_Type?: string;
  social1_Url?: string;
  social2_Type?: string;
  social2_Url?: string;
}

export default function LeaderboardPillar() {
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'HITTER' | 'PITCHER' | 'TWP'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sheetUrl = process.env.NEXT_PUBLIC_SCOUTING_SHEET_URL;
    if (!sheetUrl) {
      setLoading(false);
      return;
    }

    fetch(sheetUrl)
      .then((res) => res.json())
      .then((data: AthleteRow[]) => {
        const visible = data.filter((row) => {
          const val = String(row.isProfileVisible).toUpperCase();
          return val === 'TRUE' || val === '1';
        });
        setAthletes(visible);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load leaderboard data:', err);
        setLoading(false);
      });
  }, []);

  const displayed = athletes.filter((a) => filter === 'ALL' || a.primaryRole === filter);

  return (
    <div className="space-y-4">
      {/* Role Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'HITTER', 'PITCHER', 'TWP'] as const).map((role) => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
              filter === role
                ? 'bg-emerald-400 text-black border-emerald-400'
                : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-500'
            }`}
          >
            {role === 'TWP' ? 'Two-Way' : role}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">Loading scout scoreboard...</p>
      ) : displayed.length === 0 ? (
        <p className="text-sm text-neutral-500">No athletes visible yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-neutral-800 rounded-lg">
            <thead className="bg-neutral-900 text-neutral-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Player / School</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-right">Top Metrics</th>
                <th className="p-3">Honor Date</th>
                <th className="p-3">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-200">
              {displayed.map((a, i) => (
                <tr key={i} className="hover:bg-neutral-800/40">
                  <td className="p-3">
                    <div className="font-semibold text-white">{a.athleteEmail?.split('@')[0] || 'Member'}</div>
                    <div className="text-[11px] text-neutral-400">{a.currentCollege || 'Undeclared'}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 border border-neutral-700">
                      {a.primaryRole || 'ATHLETE'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">
                    {a.peakFB && <div>FB: {a.peakFB} mph</div>}
                    {a.maxExitVelo && <div>EV: {a.maxExitVelo} mph</div>}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-neutral-400">
                    {a.recordedDatePitching || a.recordedDateHitting || 'Recent'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {a.social1_Url && (
                        <a href={a.social1_Url} target="_blank" rel="noreferrer" className="text-emerald-400 underline text-[11px]">
                          {a.social1_Type || 'Social 1'}
                        </a>
                      )}
                      {a.social2_Url && (
                        <a href={a.social2_Url} target="_blank" rel="noreferrer" className="text-emerald-400 underline text-[11px]">
                          {a.social2_Type || 'Social 2'}
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
