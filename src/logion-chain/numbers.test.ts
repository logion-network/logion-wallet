import {
    balance,
    amount,
    PrefixedNumber,
    NONE,
    MILLI,
    KILO,
    ScientificNumber,
    MEGA,
} from './numbers';

test("Mint amount", () => {
    const result = balance("3", 4);
    expect(result.toString()).toBe("30000");
});

test("tokens from balance", () => {
    const result = amount("30000", 4);
    expect(result.toString()).toBe("3");
});

test("forPrefix one", () => {
    const result = new PrefixedNumber("42000", NONE).convertTo(NONE);
    expect(result.normalized).toBe("42000.");
});

test("forPrefix milli", () => {
    const result = new PrefixedNumber("42000", NONE).convertTo(MILLI);
    expect(result.normalized).toBe("42000000.");
});

test("forPrefix kilo", () => {
    const result = new PrefixedNumber("42000", NONE).convertTo(KILO);
    expect(result.normalized).toBe("42.");
});

test("convertPrefix kilo milli", () => {
    const prefixed = new PrefixedNumber("42", KILO);
    const result = prefixed.convertTo(MILLI);
    expect(result.normalized).toBe('42000000.');
    expect(result.prefix).toBe(MILLI);
});

test("convertPrefix milli kilo", () => {
    const prefixed = new PrefixedNumber("42000000", MILLI);
    const result = prefixed.convertTo(KILO);
    expect(result.normalized).toBe('42.');
    expect(result.prefix).toBe(KILO);
});

test("optimizeScale large", () => {
    const prefixed = new ScientificNumber("42000000", 0);
    const result = prefixed.optimizeScale(3);
    expect(result.normalized).toBe('420.');
    expect(result.tenExponent).toBe(5);
});

test("optimizeScale small", () => {
    const prefixed = new ScientificNumber("0.00042", 0);
    const result = prefixed.optimizeScale(3);
    expect(result.normalized).toBe('4.2');
    expect(result.tenExponent).toBe(-4);
});

test("optimizeScale large prefixed", () => {
    const prefixed = new PrefixedNumber("42000000", NONE);
    const result = prefixed.optimizeScale(3);
    expect(result.normalized).toBe('42.');
    expect(result.prefix).toBe(MEGA);
});

test("optimizeScale small prefixed", () => {
    const prefixed = new PrefixedNumber("0.00042", NONE);
    const result = prefixed.optimizeScale(3);
    expect(result.normalized).toBe('.42');
    expect(result.prefix).toBe(MILLI);
});
