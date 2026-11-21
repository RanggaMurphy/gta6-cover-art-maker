// Vice City colour grades: a canvas filter for the photo plus one or two
// translucent gradient washes drawn over each panel. Every grade is our own
// mix; the names are original, the mood is sunset and neon.

export const GRADES = [
  {
    id: 'sunset',
    name: 'Sunset',
    filter: 'saturate(1.35) contrast(1.12) brightness(1.04)',
    washes: [
      { from: 'rgba(255, 94, 138, 0.28)', to: 'rgba(255, 154, 61, 0.05)', blend: 'overlay', top: true },
      { from: 'rgba(123, 47, 247, 0.10)', to: 'rgba(255, 94, 138, 0.22)', blend: 'soft-light', top: false },
    ],
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    filter: 'saturate(1.55) contrast(1.18) brightness(0.98)',
    washes: [
      { from: 'rgba(45, 226, 197, 0.16)', to: 'rgba(255, 94, 138, 0.30)', blend: 'overlay', top: false },
      { from: 'rgba(20, 10, 60, 0.25)', to: 'rgba(255, 0, 110, 0.12)', blend: 'soft-light', top: true },
    ],
  },
  {
    id: 'gold',
    name: 'Golden Hour',
    filter: 'saturate(1.25) contrast(1.08) brightness(1.08) sepia(0.22)',
    washes: [
      { from: 'rgba(255, 190, 80, 0.30)', to: 'rgba(255, 120, 40, 0.06)', blend: 'soft-light', top: true },
      { from: 'rgba(255, 140, 0, 0.10)', to: 'rgba(120, 30, 90, 0.14)', blend: 'overlay', top: false },
    ],
  },
  {
    id: 'noir',
    name: 'Teal Noir',
    filter: 'saturate(1.15) contrast(1.28) brightness(0.94)',
    washes: [
      { from: 'rgba(10, 60, 70, 0.34)', to: 'rgba(255, 94, 138, 0.16)', blend: 'overlay', top: false },
      { from: 'rgba(0, 0, 0, 0.28)', to: 'rgba(0, 0, 0, 0)', blend: 'multiply', top: true },
    ],
  },
  {
    id: 'candy',
    name: 'Candy Pop',
    filter: 'saturate(1.8) contrast(1.15) brightness(1.05)',
    washes: [
      { from: 'rgba(255, 0, 150, 0.26)', to: 'rgba(0, 200, 255, 0.18)', blend: 'overlay', top: true },
      { from: 'rgba(255, 230, 120, 0.10)', to: 'rgba(255, 94, 138, 0.20)', blend: 'soft-light', top: false },
    ],
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}
