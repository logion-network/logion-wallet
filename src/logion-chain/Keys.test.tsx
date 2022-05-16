jest.mock('detect-browser');

import { setBrowser } from '../__mocks__/DetectBrowserMock';
import { recommendedExtension } from './Keys';

test("detects Firefox", () => {
    setBrowser('firefox');
    const extension = recommendedExtension();
    expect(extension).not.toBeNull();
    expect(extension!.browser).toBe('firefox');
});

test("detects Chrome", () => {
    setBrowser('chrome');
    const extension = recommendedExtension();
    expect(extension).not.toBeNull();
    expect(extension!.browser).toBe('chrome');
});

test("detects none", () => {
    setBrowser(null);
    const extension = recommendedExtension();
    expect(extension).toBeNull();
});
