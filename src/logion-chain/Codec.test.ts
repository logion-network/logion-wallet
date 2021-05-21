import { toHex, fromHex} from './Codec';

test("toHex", () => {
    const data = "test";
    const hex = toHex(data);
    expect(hex).toBe("0x74657374");
});

test("fromHex", () => {
    const hex = "0x74657374";
    const data = fromHex(hex);
    expect(data).toBe("test");
});

test("fromHex and toHex are compatible", () => {
    const data = "test";
    const newData = fromHex(toHex(data));
    expect(newData).toBe(data);
});

test("fromHex without prefix fails", () => {
    const hex = "74657374";
    expect(() => fromHex(hex)).toThrow();
});
