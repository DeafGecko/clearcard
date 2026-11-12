import { describe, it, expect } from 'vitest';
import { readableTextColor } from '../../lib/color';

describe('readableTextColor', () => {
  it('uses black text on light accents', () => {
    expect(readableTextColor('#FACC15')).toBe('#000000');
    expect(readableTextColor('#22D3EE')).toBe('#000000');
    expect(readableTextColor('#FFFFFF')).toBe('#000000');
  });

  it('uses white text on dark accents', () => {
    expect(readableTextColor('#1E3A8A')).toBe('#FFFFFF');
    expect(readableTextColor('#000000')).toBe('#FFFFFF');
    expect(readableTextColor('#7F1D1D')).toBe('#FFFFFF');
  });

  it('accepts hex without the leading # and in any case', () => {
    expect(readableTextColor('1e3a8a')).toBe('#FFFFFF');
  });

  it('falls back to black for a value that is not a hex color', () => {
    expect(readableTextColor('not-a-color')).toBe('#000000');
  });
});
