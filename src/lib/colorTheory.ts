export function hexToRgb(hex: string) {
  // handle short hex if needed, but our data uses 6 chars
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

export function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;
  h /= 360;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

export function getWeightedAverageColor(colors: {hex: string, weight: number}[]): string | null {
  if (colors.length === 0) return null;
  let totalWeight = 0;
  let sumR = 0, sumG = 0, sumB = 0;

  for (const c of colors) {
    if (!c.hex) continue;
    const rgb = hexToRgb(c.hex);
    sumR += rgb.r * c.weight;
    sumG += rgb.g * c.weight;
    sumB += rgb.b * c.weight;
    totalWeight += c.weight;
  }
  if (totalWeight === 0) return null;
  return rgbToHex(sumR / totalWeight, sumG / totalWeight, sumB / totalWeight);
}

export function getTheoryColors(baseHex: string) {
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Monotone
  const monotone = [];
  monotone.push('#FFFFFF');
  monotone.push('#000000');
  if (hsl.l > 0.5) {
    const darkGray = hslToRgb(0, 0, 0.3);
    monotone.push(rgbToHex(darkGray.r, darkGray.g, darkGray.b));
  } else {
    const lightGray = hslToRgb(0, 0, 0.7);
    monotone.push(rgbToHex(lightGray.r, lightGray.g, lightGray.b));
  }

  // Analogous
  const analogous = [];
  const a1 = hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l);
  const a2 = hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l);
  analogous.push(rgbToHex(a1.r, a1.g, a1.b));
  analogous.push(rgbToHex(a2.r, a2.g, a2.b));

  // Complementary
  const complementary = [];
  const c1 = hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l);
  complementary.push(rgbToHex(c1.r, c1.g, c1.b));

  // Triadic
  const triadic = [];
  const t1 = hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l);
  const t2 = hslToRgb((hsl.h - 120 + 360) % 360, hsl.s, hsl.l);
  triadic.push(rgbToHex(t1.r, t1.g, t1.b));
  triadic.push(rgbToHex(t2.r, t2.g, t2.b));

  return { monotone, analogous, complementary, triadic };
}
