// src/lib/scoring/weights.ts

import { Rank, ScoreWeights } from '@/types';

export const DEFAULT_WEIGHTS: ScoreWeights = {
  color: 0.35,
  style: 0.25,
  season: 0.15,
  balance: 0.25,
};

const RANK_TABLE: { min: number; rank: Rank }[] = [
  { min: 96, rank: 'X'  },
  { min: 91, rank: 'S+' },
  { min: 85, rank: 'S'  },
  { min: 79, rank: 'A+' },
  { min: 72, rank: 'A'  },
  { min: 65, rank: 'A-' },
  { min: 58, rank: 'B+' },
  { min: 50, rank: 'B'  },
  { min: 42, rank: 'B-' },
  { min: 33, rank: 'C+' },
  { min: 22, rank: 'C'  },
  { min: 0,  rank: 'C-' },
];

export function scoreToRank(score: number): Rank {
  for (const entry of RANK_TABLE) {
    if (score >= entry.min) return entry.rank;
  }
  return 'C-';
}

export const RANK_COLORS: Record<Rank, { bg: string; text: string; border: string }> = {
  'X':  { bg: 'bg-gradient-to-r from-amber-400 to-yellow-300', text: 'text-amber-900', border: 'border-amber-500' },
  'S+': { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
  'S':  { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
  'A+': { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-700' },
  'A':  { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' },
  'A-': { bg: 'bg-purple-400', text: 'text-white', border: 'border-purple-500' },
  'B+': { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
  'B':  { bg: 'bg-blue-400', text: 'text-white', border: 'border-blue-500' },
  'B-': { bg: 'bg-blue-300', text: 'text-blue-900', border: 'border-blue-400' },
  'C+': { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' },
  'C':  { bg: 'bg-green-400', text: 'text-green-900', border: 'border-green-500' },
  'C-': { bg: 'bg-gray-300', text: 'text-gray-700', border: 'border-gray-400' },
};
