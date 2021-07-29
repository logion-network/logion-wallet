import {
    balance,
    amount,
    NormalizedNumber,
    PrefixedNumber,
    NONE,
    MILLI,
    KILO,
    ScientificNumber,
    MEGA,
    ATTO,
} from './numbers';

test("amount given balance", () => {
    const result = balance("3", 4);
    expect(result.toString()).toBe("30000");
});

test("balance given amount", () => {
    const result = amount("30000", 4);
    expect(result.toString()).toBe("3");
});

test("NormalizedNumber toInteger", () => {
    const number = new NormalizedNumber("42.5678");
    expect(number.toInteger()).toBe("42");
});

test("negative NormalizedNumber toInteger", () => {
    const number = new NormalizedNumber("-42.5678");
    expect(number.toInteger()).toBe("-42");
});

test("NormalizedNumber toFixedPrecision", () => {
    const number = new NormalizedNumber("42.5678");
    expect(number.toFixedPrecision(2)).toBe("42.56");
});

test("negative NormalizedNumber toFixedPrecision", () => {
    const number = new NormalizedNumber("-42.5678");
    expect(number.toFixedPrecision(2)).toBe("-42.56");
});

test("NormalizedNumber toFixedPrecisionDecimals", () => {
    const number = new NormalizedNumber("42.5678");
    expect(number.toFixedPrecisionDecimals(2)).toBe("56");
});

test("negative NormalizedNumber toFixedPrecisionDecimals", () => {
    const number = new NormalizedNumber("-42.5678");
    expect(number.toFixedPrecisionDecimals(2)).toBe("56");
});

test("forPrefix none", () => {
    const result = new PrefixedNumber("42000", NONE).convertTo(NONE);
    expect(result.coefficient.toString()).toBe("42000.");
});

test("forPrefix negative none", () => {
    const result = new PrefixedNumber("-42000", NONE).convertTo(NONE);
    expect(result.coefficient.toString()).toBe("-42000.");
});

test("forPrefix milli", () => {
    const result = new PrefixedNumber("42000", NONE).convertTo(MILLI);
    expect(result.coefficient.toString()).toBe("42000000.");
});

test("forPrefix negative milli", () => {
    const result = new PrefixedNumber("-42000", NONE).convertTo(MILLI);
    expect(result.coefficient.toString()).toBe("-42000000.");
});

test("forPrefix kilo", () => {
    const result = new PrefixedNumber("42000", NONE).convertTo(KILO);
    expect(result.coefficient.toString()).toBe("42.");
});

test("forPrefix negative kilo", () => {
    const result = new PrefixedNumber("-42000", NONE).convertTo(KILO);
    expect(result.coefficient.toString()).toBe("-42.");
});

test("convertPrefix kilo milli", () => {
    const prefixed = new PrefixedNumber("42", KILO);
    const result = prefixed.convertTo(MILLI);
    expect(result.coefficient.toString()).toBe('42000000.');
    expect(result.prefix).toBe(MILLI);
});

test("convertPrefix negative kilo milli", () => {
    const prefixed = new PrefixedNumber("-42", KILO);
    const result = prefixed.convertTo(MILLI);
    expect(result.coefficient.toString()).toBe('-42000000.');
    expect(result.prefix).toBe(MILLI);
});

test("convertPrefix milli kilo", () => {
    const prefixed = new PrefixedNumber("42000000", MILLI);
    const result = prefixed.convertTo(KILO);
    expect(result.coefficient.toString()).toBe('42.');
    expect(result.prefix).toBe(KILO);
});

test("convertPrefix negative milli kilo", () => {
    const prefixed = new PrefixedNumber("-42000000", MILLI);
    const result = prefixed.convertTo(KILO);
    expect(result.coefficient.toString()).toBe('-42.');
    expect(result.prefix).toBe(KILO);
});

test("optimizeScale large", () => {
    const prefixed = new ScientificNumber("42000000", 0);
    const result = prefixed.optimizeScale(3);
    expect(result.normalized.toString()).toBe('420.');
    expect(result.tenExponent).toBe(5);
});

test("optimizeScale large negative", () => {
    const prefixed = new ScientificNumber("-42000000", 0);
    const result = prefixed.optimizeScale(3);
    expect(result.normalized.toString()).toBe('-420.');
    expect(result.tenExponent).toBe(5);
});

test("optimizeScale small", () => {
    const prefixed = new ScientificNumber("0.00042", 0);
    const result = prefixed.optimizeScale(3);
    expect(result.normalized.toString()).toBe('4.2');
    expect(result.tenExponent).toBe(-4);
});

test("optimizeScale small negative", () => {
    const prefixed = new ScientificNumber("-0.00042", 0);
    const result = prefixed.optimizeScale(3);
    expect(result.normalized.toString()).toBe('-4.2');
    expect(result.tenExponent).toBe(-4);
});

test("optimizeScale large prefixed", () => {
    const prefixed = new PrefixedNumber("42000000", NONE);
    const result = prefixed.optimizeScale(3);
    expect(result.coefficient.toString()).toBe('42.');
    expect(result.prefix).toBe(MEGA);
});

test("optimizeScale negative large prefixed", () => {
    const prefixed = new PrefixedNumber("-42000000", NONE);
    const result = prefixed.optimizeScale(3);
    expect(result.coefficient.toString()).toBe('-42.');
    expect(result.prefix).toBe(MEGA);
});

test("optimizeScale small prefixed", () => {
    const prefixed = new PrefixedNumber("0.00042", NONE);
    const result = prefixed.optimizeScale(3);
    expect(result.coefficient.toString()).toBe('.42');
    expect(result.prefix).toBe(MILLI);
});

test("optimizeScale small negative prefixed", () => {
    const prefixed = new PrefixedNumber("-0.00042", NONE);
    const result = prefixed.optimizeScale(3);
    expect(result.coefficient.toString()).toBe('-.42');
    expect(result.prefix).toBe(MILLI);
});

test("divide", () => {
    const a = new ScientificNumber("50.00", 0);
    const b = new ScientificNumber("1.00", 2);
    const result = a.divideBy(b);
    expect(result.toNumber()).toBe(0.5);
});

test("divide negative", () => {
    const a = new ScientificNumber("-50.00", 0);
    const b = new ScientificNumber("1.00", 2);
    const result = a.divideBy(b);
    expect(result.toNumber()).toBe(-0.5);
});

test("negate negative NormalizedNumber", () => {
    const a = new NormalizedNumber("-50.00");
    const result = a.negate();
    expect(result.toNumber()).toBe(50);
});

test("negate positive NormalizedNumber", () => {
    const a = new NormalizedNumber("50.00");
    const result = a.negate();
    expect(result.toNumber()).toBe(-50);
});

test("negate negative PrefixedNumber", () => {
    const a = new PrefixedNumber("-50.00", NONE);
    const result = a.negate();
    expect(result.toNumber()).toBe(50);
});

test("negate positive PrefixedNumber", () => {
    const a = new PrefixedNumber("50.00", NONE);
    const result = a.negate();
    expect(result.toNumber()).toBe(-50);
});

test("negated zero remains zero", () => {
    const a = new PrefixedNumber("0", ATTO);
    const result = a.negate();
    expect(result.isNegative()).toBe(false);
});
