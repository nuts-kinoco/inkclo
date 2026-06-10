// Conversion from Hex to RGB
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

// Conversion from RGB to XYZ
function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  let [rL, gL, bL] = [r / 255, g / 255, b / 255];

  rL = rL > 0.04045 ? Math.pow((rL + 0.055) / 1.055, 2.4) : rL / 12.92;
  gL = gL > 0.04045 ? Math.pow((gL + 0.055) / 1.055, 2.4) : gL / 12.92;
  bL = bL > 0.04045 ? Math.pow((bL + 0.055) / 1.055, 2.4) : bL / 12.92;

  rL *= 100;
  gL *= 100;
  bL *= 100;

  const x = rL * 0.4124 + gL * 0.3576 + bL * 0.1805;
  const y = rL * 0.2126 + gL * 0.7152 + bL * 0.0722;
  const z = rL * 0.0193 + gL * 0.1192 + bL * 0.9505;

  return [x, y, z];
}

// Conversion from XYZ to LAB
function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  // Reference white D65
  const refX = 95.047;
  const refY = 100.0;
  const refZ = 108.883;

  let [xL, yL, zL] = [x / refX, y / refY, z / refZ];

  xL = xL > 0.008856 ? Math.pow(xL, 1 / 3) : 7.787 * xL + 16 / 116;
  yL = yL > 0.008856 ? Math.pow(yL, 1 / 3) : 7.787 * yL + 16 / 116;
  zL = zL > 0.008856 ? Math.pow(zL, 1 / 3) : 7.787 * zL + 16 / 116;

  const l = 116 * yL - 16;
  const a = 500 * (xL - yL);
  const b = 200 * (yL - zL);

  return [l, a, b];
}

// Calculate CIE76 Delta E
export function deltaE(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const xyz1 = rgbToXyz(...rgb1);
  const xyz2 = rgbToXyz(...rgb2);

  const lab1 = xyzToLab(...xyz1);
  const lab2 = xyzToLab(...xyz2);

  const deltaL = lab1[0] - lab2[0];
  const deltaA = lab1[1] - lab2[1];
  const deltaB = lab1[2] - lab2[2];

  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}
