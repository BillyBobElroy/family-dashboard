'use client';

import React from 'react';

export type FamilyMember = {
  id: string;
  displayName: string;
  color?: string;
};

export type MemberProgress = {
  [memberId: string]: {
    total: number;
    completed: number;
  };
};

type Props = {
  members: FamilyMember[];
  progress: MemberProgress;
};

export function FamilyLegend({ members, progress }: Props) {
  return (
    <div className="flex overflow-x-auto gap-4 p-2 bg-white rounded shadow mb-4">
      {members.map((m) => {
        const p = progress[m.id] || { completed: 0, total: 0 };
        const percent = p.total > 0 ? (p.completed / p.total) * 100 : 0;

        return (
          <div key={m.id} className="flex flex-col items-center min-w-[80px]">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow"
                style={{ backgroundColor: m.color || '#ccc' }}
              >
                {m.displayName?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm font-medium whitespace-nowrap">
                {m.displayName || 'Unnamed'}
              </span>
            </div>
            <div className="w-full h-2 rounded bg-gray-200 mt-1 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${percent}%`,
                  backgroundColor: m.color || '#ccc',
                }}
              />
            </div>
            <span className="text-xs text-gray-500 mt-0.5">{p.completed}/{p.total}</span>
          </div>
        );
      })}
    </div>
  );
}
