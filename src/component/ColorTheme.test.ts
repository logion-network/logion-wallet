import { rgbaToHex } from './ColorTheme';

test('rgbaToHex with 2-digits hex alpha', () => {
    const hex = rgbaToHex('#ffffff', 0.6);
    expect(hex).toBe('#ffffff99');
});

test('rgbaToHex with 1-digit hex alpha', () => {
    const hex = rgbaToHex('#ffffff', 0.05);
    expect(hex).toBe('#ffffff0d');
});

test('rgbaToHex with 0 alpha', () => {
    const hex = rgbaToHex('#ffffff', 0);
    expect(hex).toBe('#ffffff00');
});

test('rgbaToHex with 1 alpha', () => {
    const hex = rgbaToHex('#ffffff', 1);
    expect(hex).toBe('#ffffffff');
});

test('rgbaToHex with negative alpha', () => {
    expect(() => rgbaToHex('#ffffff', -1)).toThrowError();
});

test('rgbaToHex with alpha > 1', () => {
    expect(() => rgbaToHex('#ffffff', 2)).toThrowError();
});
