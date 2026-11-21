// grades.js — the five Vice City colour grades of Neon Bay Cover Studio.
// A grade is a canvas filter for the photos plus two translucent gradient
// washes laid over each panel, so a cover keeps its own photos while the
// whole poster shares one sunset or neon mood.

export const GRADES = [
  {
    id: 'sunset',
    nama: 'Sunset',
    filter: 'saturate(1.35) contrast(1.12) brightness(1.04)',
    washes: [
      { from: 'rgba(255,94,138,0.30)', to: 'rgba(255,154,61,0.08)', blend: 'overlay', dir: 'top' },
      { from: 'rgba(123,92,255,0.08)', to: 'rgba(255,94,138,0.26)', blend: 'soft-light', dir: 'bottom' },
    ],
  },
  {
    id: 'neon',
    nama: 'Neon Nights',
    filter: 'saturate(1.55) contrast(1.18)',
    washes: [
      { from: 'rgba(0,229,255,0.30)', to: 'rgba(255,46,166,0.20)', blend: 'overlay', dir: 'top' },
      { from: 'rgba(16,4,40,0.08)', to: 'rgba(255,46,166,0.30)', blend: 'soft-light', dir: 'bottom' },
    ],
  },
  {
    id: 'gold',
    nama: 'Golden Hour',
    filter: 'saturate(1.25) contrast(1.08) brightness(1.08) sepia(0.22)',
    washes: [
      { from: 'rgba(255,214,90,0.28)', to: 'rgba(255,214,90,0.04)', blend: 'soft-light', dir: 'top' },
      { from: 'rgba(255,120,40,0.06)', to: 'rgba(150,60,200,0.26)', blend: 'overlay', dir: 'bottom' },
    ],
  },
  {
    id: 'noir',
    nama: 'Teal Noir',
    filter: 'saturate(1.15) contrast(1.28) brightness(0.94)',
    washes: [
      { from: 'rgba(0,90,100,0.36)', to: 'rgba(0,40,60,0.12)', blend: 'overlay', dir: 'top' },
      { from: 'rgba(0,0,0,0.32)', to: 'rgba(0,0,0,0)', blend: 'multiply', dir: 'top' },
    ],
  },
  {
    id: 'candy',
    nama: 'Candy Pop',
    filter: 'saturate(1.8) contrast(1.15) brightness(1.05)',
    washes: [
      { from: 'rgba(255,0,180,0.26)', to: 'rgba(0,220,255,0.20)', blend: 'overlay', dir: 'top' },
      { from: 'rgba(255,240,0,0.04)', to: 'rgba(255,120,200,0.26)', blend: 'soft-light', dir: 'bottom' },
    ],
  },
];

/** The grade with this id, or the first grade when the id is unknown. */
export function cariGrade(id) {
  return GRADES.find((grade) => grade.id === id) || GRADES[0];
}
