import BN from "bn.js";

export function amount(balance: string, decimals: number): string {
    const prefixed = new ScientificNumber(balance, 0);
    const converted = prefixed.convertTo(decimals);
    return converted.coefficient.unnormalize();
}

export function balance(amount: string, decimals: number): string {
    const prefixed = new ScientificNumber(amount, decimals);
    const converted = prefixed.convertTo(0);
    return converted.coefficient.unnormalize();
}

export class NormalizedNumber {
    private readonly _normalized: string;
    private readonly _integerPart: string;
    private readonly _decimalPart: string;
    private readonly _negative: boolean;

    constructor(num: string) {
        this._normalized = this.normalize(num);
        const { negative, integerPart, decimalPart } = this._split();
        this._negative = negative;
        this._integerPart = integerPart;
        this._decimalPart = decimalPart;
    }

    private _split() {
        const dotPosition = this._normalized.indexOf('.');
        let integerPart;
        let negative;
        if(this._normalized.startsWith("-")) {
            negative = true;
            integerPart = this._normalized.substring(1, dotPosition);
        } else {
            negative = false;
            integerPart = this._normalized.substring(0, dotPosition);
        }
        const decimalPart = this._normalized.substring(dotPosition + 1);
        return {
            negative,
            integerPart,
            decimalPart
        };
    }

    private normalize(num: string): string {
        let sanitized = NormalizedNumber.zeroStripLeft(num);
        if(sanitized.indexOf('.') === -1) {
            sanitized = sanitized + ".";
        } else {
            sanitized = NormalizedNumber.zeroStripRight(sanitized);
        }
        if(sanitized === '-.') {
            sanitized = '.';
        }
        return sanitized;
    }

    static zeroStripLeft(num: string): string {
        if(num.startsWith("-")) {
            return num.replace(/^-0*/, '-');
        } else {
            return num.replace(/^0*/, '');
        }
    }

    static zeroStripRight(num: string): string {
        return num.replace(/0*$/, '');
    }

    toString() {
        return this._normalized;
    }

    split() {
        return {
            negative: this._negative,
            integerPart: this._integerPart,
            decimalPart: this._decimalPart,
        };
    }

    unnormalize(): string {
        if(this._normalized === ".") {
            return "0";
        } else if(this._normalized.startsWith(".")) {
            return "0" + this._normalized;
        } else if(this._normalized.endsWith(".")) {
            return this._normalized.substring(0, this._normalized.length - 1);
        } else {
            return this._normalized;
        }
    }

    toInteger() {
        let integer = this._integerPart;
        if(integer.length === 0) {
            integer = "0";
        }
        if(this._negative) {
            return "-" + integer;
        } else {
            return integer;
        }
    }

    toFixedPrecision(decimals: number) {
        return this.toInteger() + "." + this.toFixedPrecisionDecimals(decimals);
    }

    toFixedPrecisionDecimals(decimals: number) {
        return this._decimalPart.padEnd(decimals, "0").substring(0, decimals);
    }

    toNumber() {
        return Number(this._normalized);
    }

    isZero() {
        return this._normalized === '.';
    }

    negate() {
        if(this.isZero()) {
            return this;
        }

        if(this._normalized.startsWith("-")) {
            return new NormalizedNumber(this._normalized.substring(1));
        } else {
            return new NormalizedNumber("-" + this._normalized);
        }
    }

    isNegative() {
        return this._negative;
    }
}

export class ScientificNumber {
    private readonly _normalized: NormalizedNumber;
    private readonly _tenExponent: number;

    constructor(coefficient: string | NormalizedNumber, tenExponent: number) {
        if(coefficient instanceof NormalizedNumber) {
            this._normalized = coefficient;
        } else {
            this._normalized = new NormalizedNumber(coefficient);
        }
        this._tenExponent = tenExponent;
    }

    convertTo(newTenExponent: number): ScientificNumber {
        const offset = this._tenExponent - newTenExponent;
        return new ScientificNumber(this.shiftDecimalSeparator(offset), newTenExponent);
    }

    private shiftDecimalSeparator(positions: number): string {
        if(positions === 0) {
            return this._normalized.toString();
        } else {
            const { negative, integerPart, decimalPart } = this._normalized.split();
            if(positions > 0) {
                let rightWithDot;
                if(decimalPart.length <= positions) {
                    rightWithDot = decimalPart.padEnd(positions, "0");
                    rightWithDot = rightWithDot + ".";
                } else  { // rightPart.length > positions
                    const pivot = positions;
                    rightWithDot = decimalPart.substring(0, pivot) + "." + decimalPart.substring(pivot);
                }

                const absolute = integerPart + rightWithDot;
                if(negative) {
                    return "-" + absolute;
                } else {
                    return absolute;
                }
            } else { // positions < 0
                let leftWithDot;
                if(integerPart.length <= -positions) {
                    leftWithDot = integerPart.padStart(integerPart.length - positions - 1, "0");
                    leftWithDot = "." + leftWithDot;
                } else  { // leftPart.length > -positions
                    const pivot = integerPart.length + positions;
                    leftWithDot = integerPart.substring(0, pivot) + "." + integerPart.substring(pivot);
                }

                const absolute = NormalizedNumber.zeroStripRight(leftWithDot + decimalPart);
                if(negative) {
                    return "-" + absolute;
                } else {
                    return absolute;
                }
            }
        }
    }

    get normalized(): NormalizedNumber {
        return this._normalized;
    }

    get tenExponent(): number {
        return this._tenExponent;
    }

    optimizeScale(maxDigits: number): ScientificNumber {
        const { integerPart, decimalPart } = this._normalized.split();
        if(integerPart.length > maxDigits) {
            return this.limitIntegerDigits(integerPart, maxDigits);
        } else {
            const relevantDecimalPart = NormalizedNumber.zeroStripLeft(decimalPart);
            if(decimalPart.length > relevantDecimalPart.length) {
                return this.limitDecimalDigits(decimalPart, relevantDecimalPart);
            } else {
                return this;
            }
        }
    }

    limitIntegerDigits(integerPart: string, maxDigits: number): ScientificNumber {
        const delta = integerPart.length - maxDigits;
        return this.convertTo(this._tenExponent + delta);
    }

    limitDecimalDigits(decimalPart: string, relevantDecimalPart: string): ScientificNumber {
        const delta = relevantDecimalPart.length - decimalPart.length - 1;
        return this.convertTo(this._tenExponent + delta);
    }

    get coefficient(): NormalizedNumber {
        return this._normalized;
    }

    divideBy(other: ScientificNumber): ScientificNumber {
        let optimalThis = this.optimizeScale(1);
        let optimalOther = other.optimizeScale(1);
        if(optimalThis._tenExponent < optimalOther._tenExponent) {
            optimalOther = optimalOther.convertTo(optimalThis._tenExponent);
        } else {
            optimalThis = optimalThis.convertTo(optimalOther._tenExponent);
        }
        const resultCoefficient = optimalThis.coefficient.toNumber() / optimalOther.coefficient.toNumber();
        return new ScientificNumber(String(resultCoefficient), 0);
    }

    toNumber() {
        const optimalThis = this.optimizeScale(1);
        return Number(optimalThis.coefficient) * Math.pow(10, optimalThis._tenExponent);
    }

    negate() {
        return new ScientificNumber(this.coefficient.negate(), this._tenExponent);
    }
}

export const NONE: UnitPrefix = {
    symbol: '',
    tenExponent: 0,
};

export class PrefixedNumber {
    static ZERO: PrefixedNumber = new PrefixedNumber("0", NONE);

    private readonly _scientificNumber: ScientificNumber;
    private readonly _prefix: UnitPrefix;

    constructor(num: string | NormalizedNumber, prefix: UnitPrefix) {
        this._scientificNumber = new ScientificNumber(num, prefix.tenExponent);
        this._prefix = prefix;
    }

    convertTo(prefix: UnitPrefix): PrefixedNumber {
        const newScaled = this._scientificNumber.convertTo(prefix.tenExponent);
        return new PrefixedNumber(newScaled.coefficient, prefix);
    }

    get prefix(): UnitPrefix {
        return this._prefix;
    }

    optimizeScale(maxDigits: number): PrefixedNumber {
        const optimized = this._scientificNumber.optimizeScale(maxDigits);
        const optimalPrefix = closestPrefix(optimized.tenExponent);
        return this.convertTo(optimalPrefix);
    }

    get coefficient(): NormalizedNumber {
        return this._scientificNumber.coefficient;
    }

    toNumber() {
        return this._scientificNumber.toNumber();
    }

    negate() {
        return new PrefixedNumber(this._scientificNumber.coefficient.negate(), this._prefix);
    }

    isNegative() {
        return this.coefficient.isNegative();
    }

    add(other: PrefixedNumber): PrefixedNumber {
        const left = this.convertTo(ATTO);
        const right = other.convertTo(ATTO);
        const sum = new BN(left._scientificNumber.normalized.unnormalize()).add(new BN(right._scientificNumber.normalized.unnormalize()))
        return new PrefixedNumber(sum.toString(), ATTO).convertTo(this.prefix)
    }

    subtract(other: PrefixedNumber): PrefixedNumber {
        return this.add(other.negate());
    }
}

export const EXA: UnitPrefix = {
    symbol: 'E',
    tenExponent: 18,
};

export const PETA: UnitPrefix = {
    symbol: 'P',
    tenExponent: 15,
};

export const TERA: UnitPrefix = {
    symbol: 'T',
    tenExponent: 12,
};

export const GIGA: UnitPrefix = {
    symbol: 'G',
    tenExponent: 9,
};

export const MEGA: UnitPrefix = {
    symbol: 'M',
    tenExponent: 6,
};

export const KILO: UnitPrefix = {
    symbol: 'k',
    tenExponent: 3,
};

export const MILLI: UnitPrefix = {
    symbol: 'm',
    tenExponent: -3,
};

export const MICRO: UnitPrefix = {
    symbol: 'µ',
    tenExponent: -6,
};

export const NANO: UnitPrefix = {
    symbol: 'n',
    tenExponent: -9,
};

export const PICO: UnitPrefix = {
    symbol: 'p',
    tenExponent: -12,
};

export const FEMTO: UnitPrefix = {
    symbol: 'f',
    tenExponent: -15,
};

export const ATTO: UnitPrefix = {
    symbol: 'a',
    tenExponent: -18,
};

export interface UnitPrefix {
    symbol: string,
    tenExponent: number,
}

const SORTED_UNITS: UnitPrefix[] = [
    EXA,
    PETA,
    TERA,
    GIGA,
    MEGA,
    KILO,
    NONE,
    MILLI,
    MICRO,
    NANO,
    PICO,
    FEMTO,
    ATTO
].sort((a, b) => a.tenExponent - b.tenExponent);

function closestPrefix(tenExponent: number): UnitPrefix {
    let from: number = 0;
    let to: number = SORTED_UNITS.length;
    let candidate: number = -1;
    while((to - from) > 1) {
        const next = Math.floor(from + (to - from) / 2);
        if(SORTED_UNITS[next].tenExponent > tenExponent) {
            to = next;
        } else if(SORTED_UNITS[next].tenExponent < tenExponent) {
            from = next;
        } else {
            candidate = next;
            break;
        }
    }
    if((to - from) <= 1) {
        candidate = from;
    }
    if(candidate >= SORTED_UNITS.length - 1) {
        return SORTED_UNITS[SORTED_UNITS.length - 1];
    } else if(SORTED_UNITS[candidate].tenExponent === tenExponent) {
        return SORTED_UNITS[candidate];
    } else {
        return SORTED_UNITS[candidate + 1];
    }
}

export function convertToPrefixed(num: ScientificNumber): PrefixedNumber {
    const prefix = closestPrefix(num.tenExponent);
    const converted = num.convertTo(prefix.tenExponent);
    return new PrefixedNumber(converted.normalized, prefix);
}
