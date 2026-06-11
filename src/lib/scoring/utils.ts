// src/lib/scoring/utils.ts

import { hexToRgb, rgbToHsl } from '../colorTheory';

/**
 * Ensures a value is within a given range.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates the standard deviation of an array of numbers.
 */
export function stddev(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map((val) => Math.pow(val - avg, 2));
  const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Gets the CIE L* (Lightness) from a hex color string.
 * We approximate it using HSL lightness for simplicity, mapped to 0-100.
 */
export function getLightness(hex: string): number {
  if (!hex) return 50; // fallback
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hsl.l * 100;
}

/**
 * Gets the HSL Saturation from a hex color string, mapped to 0-1.
 */
export function getSaturation(hex: string): number {
  if (!hex) return 0;
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hsl.s;
}

/**
 * Calculates the shortest distance between two hues on the color wheel (0-180).
 */
export function getHueDifference(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}
