// Relative luminance of one sRGB channel (0-255), per the WCAG definition.
const channelLuminance = (value: number) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

// Picks black or white text for a background color: whichever has the higher contrast.
// A dark accent gets white text, a light accent gets black text.
export const readableTextColor = (hex: string): '#000000' | '#FFFFFF' => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return '#000000';
  const value = parseInt(match[1], 16);
  const luminance =
    0.2126 * channelLuminance((value >> 16) & 255) +
    0.7152 * channelLuminance((value >> 8) & 255) +
    0.0722 * channelLuminance(value & 255);
  const contrastWithBlack = (luminance + 0.05) / 0.05;
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  return contrastWithBlack >= contrastWithWhite ? '#000000' : '#FFFFFF';
};
