import {
    isSuccessful
} from './Signature';
import { mockSubmittableResult } from './__mocks__/SignatureMock';

describe("Signature", () => {

    test("isSuccessful with null", () => {
        const result = isSuccessful(null);
        expect(result).toBe(false);
    });

    test("isSuccessful if not inBlock", () => {
        const result = isSuccessful(mockSubmittableResult(false));
        expect(result).toBe(false);
    });

    test("isSuccessful if inBlock and success", () => {
        const result = isSuccessful(mockSubmittableResult(true, "InBlock", false));
        expect(result).toBe(true);
    });

    test("isSuccessful if inBlock and error", () => {
        const result = isSuccessful(mockSubmittableResult(true, "InBlock", true));
        expect(result).toBe(false);
    });
});
