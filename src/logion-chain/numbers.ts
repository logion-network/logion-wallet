export function amount(balance: string, decimals: number): string {
    const prefixed = new ScientificNumber(balance, 0);
    const converted = prefixed.convertTo(decimals);
    return converted.unnormalize();
}

export function balance(amount: string, decimals: number): string {
    const prefixed = new ScientificNumber(amount, decimals);
    const converted = prefixed.convertTo(0);
    return converted.unnormalize();
}

export class ScientificNumber {
    private readonly _normalized: string;
    private readonly _tenExponent: number;

    constructor(coefficient: string, tenExponent: number) {
        this._normalized = this.normalize(coefficient);
        this._tenExponent = tenExponent;
    }

    private shiftDecimalSeparator(positions: number): string {
        if(positions === 0) {
            return this._normalized;
        } else {
            const { integerPart, decimalPart } = this.split();
            if(positions > 0) {
                let rightWithDot;
                if(decimalPart.length <= positions) {
                    rightWithDot = decimalPart.padEnd(decimalPart.length + positions, "0");
                    rightWithDot = rightWithDot + ".";
                } else  { // rightPart.length > positions
                    const pivot = positions;
                    rightWithDot = decimalPart.substring(0, pivot) + "." + decimalPart.substring(pivot);
                }
                return integerPart + rightWithDot;
            } else { // positions < 0
                let leftWithDot;
                if(integerPart.length <= -positions) {
                    leftWithDot = integerPart.padStart(integerPart.length - positions - 1, "0");
                    leftWithDot = "." + leftWithDot;
                } else  { // leftPart.length > -positions
                    const pivot = integerPart.length + positions;
                    leftWithDot = integerPart.substring(0, pivot) + "." + integerPart.substring(pivot);
                }
                return this.zeroStripRight(leftWithDot + decimalPart);
            }
        }
    }

    private split() {
        const dotPosition = this._normalized.indexOf('.');
        const integerPart = this._normalized.substring(0, dotPosition);
        const decimalPart = this._normalized.substring(dotPosition + 1);
        return {
            integerPart,
            decimalPart
        };
    }

    private normalize(num: string): string {
        let sanitized = this.zeroStripLeft(num);
        if(sanitized.indexOf('.') === -1) {
            return sanitized + ".";
        } else {
            return this.zeroStripRight(sanitized);
        }
    }

    zeroStripLeft(num: string): string {
        return num.replace(/^0*/, '');
    }

    zeroStripRight(num: string): string {
        return num.replace(/0*$/, '');
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

    convertTo(newTenExponent: number): ScientificNumber {
        const offset = this._tenExponent - newTenExponent;
        return new ScientificNumber(this.shiftDecimalSeparator(offset), newTenExponent);
    }

    get normalized(): string {
        return this._normalized;
    }

    get tenExponent(): number {
        return this._tenExponent;
    }

    optimizeScale(maxDigits: number): ScientificNumber {
        const { integerPart, decimalPart } = this.split();
        if(integerPart.length > maxDigits) {
            return this.limitIntegerDigits(integerPart, maxDigits);
        } else {
            const relevantDecimalPart = this.zeroStripLeft(decimalPart);
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
}

export class PrefixedNumber {
    private readonly _scientificNumber: ScientificNumber;
    private readonly _prefix: UnitPrefix;

    constructor(num: string, prefix: UnitPrefix) {
        this._scientificNumber = new ScientificNumber(num, prefix.tenExponent);
        this._prefix = prefix;
    }

    convertTo(prefix: UnitPrefix): PrefixedNumber {
        const newScaled = this._scientificNumber.convertTo(prefix.tenExponent);
        return new PrefixedNumber(newScaled.normalized, prefix);
    }

    get normalized(): string {
        return this._scientificNumber.normalized;
    }

    get prefix(): UnitPrefix {
        return this._prefix;
    }

    optimizeScale(maxDigits: number): PrefixedNumber {
        const optimized = this._scientificNumber.optimizeScale(maxDigits);
        const optimalPrefix = closestPrefix(optimized.tenExponent);
        return this.convertTo(optimalPrefix);
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

export const NONE: UnitPrefix = {
    symbol: '',
    tenExponent: 0,
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
    if(candidate === 0) {
        const candidateDistance = Math.abs(SORTED_UNITS[candidate].tenExponent - tenExponent);
        const nextDistance = Math.abs(SORTED_UNITS[candidate + 1].tenExponent - tenExponent);
        if(nextDistance < candidateDistance) {
            return SORTED_UNITS[candidate + 1];
        } else {
            return SORTED_UNITS[candidate];
        }
    } else if(candidate === SORTED_UNITS.length - 1) {
        const candidateDistance = Math.abs(SORTED_UNITS[candidate].tenExponent - tenExponent);
        const previousDistance = Math.abs(SORTED_UNITS[candidate - 1].tenExponent - tenExponent);
        if(previousDistance < candidateDistance) {
            return SORTED_UNITS[candidate - 1];
        } else {
            return SORTED_UNITS[candidate];
        }
    } else {
        const candidateDistance = Math.abs(SORTED_UNITS[candidate].tenExponent - tenExponent);
        const previousDistance = Math.abs(SORTED_UNITS[candidate - 1].tenExponent - tenExponent);
        const nextDistance = Math.abs(SORTED_UNITS[candidate + 1].tenExponent - tenExponent);
        if(previousDistance < candidateDistance && previousDistance < nextDistance) {
            return SORTED_UNITS[candidate - 1];
        } else if(nextDistance < candidateDistance && nextDistance < previousDistance) {
            return SORTED_UNITS[candidate + 1];
        } else {
            return SORTED_UNITS[candidate];
        }
    }
}