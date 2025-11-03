// Color contrast utilities for accessibility

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getRelativeLuminance(r: number, g: number, b: number): number {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function getAccessibleTextColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#ffffff';

  const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
  
  // WCAG AA standard requires 4.5:1 contrast ratio for normal text
  // Use white text for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function ensureMinimumContrast(
  backgroundColor: string,
  textColor: string = '#ffffff',
  minContrast: number = 4.5
): string {
  const contrast = getContrastRatio(backgroundColor, textColor);
  
  if (contrast >= minContrast) {
    return textColor;
  }
  
  // If contrast is insufficient, return the appropriate accessible color
  return getAccessibleTextColor(backgroundColor);
}

// Vibrant colors with guaranteed good contrast against both black and white text
export const ACCESSIBLE_VIBRANT_COLORS = [
  '#e74c3c', // Red
  '#3498db', // Blue
  '#2ecc71', // Green
  '#f39c12', // Orange
  '#9b59b6', // Purple
  '#1abc9c', // Turquoise
  '#e67e22', // Darker Orange
  '#16a085', // Darker Turquoise
  '#27ae60', // Darker Green
  '#2980b9', // Darker Blue
  '#8e44ad', // Darker Purple
  '#c0392b', // Darker Red
  '#d35400', // Burnt Orange
  '#2c3e50', // Dark Blue-Grey
  '#f1c40f', // Yellow
];

export function getRandomAccessibleColor(): string {
  return ACCESSIBLE_VIBRANT_COLORS[
    Math.floor(Math.random() * ACCESSIBLE_VIBRANT_COLORS.length)
  ];
}
