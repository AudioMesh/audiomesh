import { MelodyNote, Node } from './types';

export const INITIAL_NODES: Node[] = [
  {
    id: 'macbook',
    name: 'MacBook Pro',
    volume: 80,
    latency: 0,
    status: 'active',
  },
  { id: 'ipad', name: 'iPad Pro', volume: 60, latency: 15, status: 'active' },
  {
    id: 'android',
    name: 'Galaxy S24',
    volume: 75,
    latency: 10,
    status: 'active',
  },
  {
    id: 'speaker',
    name: 'Mesh Speaker',
    volume: 65,
    latency: -18,
    status: 'active',
  },
  {
    id: 'iphone',
    name: 'iPhone 15',
    volume: 90,
    latency: -5,
    status: 'syncing',
  },
];

export const BEETHOVEN_MELODY: MelodyNote[] = [
  // Phrase 1
  { f: 659.25, d: 0.20 }, // E5
  { f: 622.25, d: 0.20 }, // D#5
  { f: 659.25, d: 0.20 }, // E5
  { f: 622.25, d: 0.20 }, // D#5
  { f: 659.25, d: 0.20 }, // E5
  { f: 493.88, d: 0.20 }, // B4
  { f: 587.33, d: 0.20 }, // D5
  { f: 523.25, d: 0.20 }, // C5
  { f: 440.00, d: 0.60, g: 0.15 }, // A4

  // Phrase 2
  { f: 261.63, d: 0.20 }, // C4
  { f: 329.63, d: 0.20 }, // E4
  { f: 440.00, d: 0.20 }, // A4
  { f: 493.88, d: 0.60, g: 0.15 }, // B4

  // Phrase 3
  { f: 329.63, d: 0.20 }, // E4
  { f: 415.30, d: 0.20 }, // G#4
  { f: 493.88, d: 0.20 }, // B4
  { f: 523.25, d: 0.60, g: 0.15 }, // C5

  // Phrase 4 (Repeat Phrase 1)
  { f: 659.25, d: 0.20 }, // E5
  { f: 622.25, d: 0.20 }, // D#5
  { f: 659.25, d: 0.20 }, // E5
  { f: 622.25, d: 0.20 }, // D#5
  { f: 659.25, d: 0.20 }, // E5
  { f: 493.88, d: 0.20 }, // B4
  { f: 587.33, d: 0.20 }, // D5
  { f: 523.25, d: 0.20 }, // C5
  { f: 440.00, d: 0.60, g: 0.15 }, // A4

  // Phrase 5 (Repeat Phrase 2)
  { f: 261.63, d: 0.20 }, // C4
  { f: 329.63, d: 0.20 }, // E4
  { f: 440.00, d: 0.20 }, // A4
  { f: 493.88, d: 0.60, g: 0.15 }, // B4

  // Phrase 6 (Ending)
  { f: 329.63, d: 0.20 }, // E4
  { f: 523.25, d: 0.20 }, // C5
  { f: 493.88, d: 0.20 }, // B4
  { f: 440.00, d: 0.60, g: 0.80 }, // A4 followed by a long pause
];
