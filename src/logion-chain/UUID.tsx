import { v4, parse, stringify, validate } from 'uuid';
import BN from 'bn.js';

export class UUID {

    constructor(value?: string | Array<number>) {
        if (value === undefined) {
            this.bytes = parse(v4())
        } else if (typeof value === 'string') {
            this.bytes = parse(value);
        } else {
            this.bytes = [ ...value ];
            stringify(this.bytes);
        }
    }

    static fromAnyString(value: string): UUID | undefined {
        if (validate(value)) {
            return new UUID(value);
        } else {
            return this.fromDecimalString(value)
        }
    }

    static fromDecimalString(value: string): UUID | undefined {
        if (!/^\d+$/.test(value)) {
            return undefined;
        }
        try {
            const numbers = new BN(value, 10).toArray();
            return new UUID(numbers);
        } catch (error) {
            return undefined
        }
    }

    private bytes: ArrayLike<number>;

    toString(): string {
        return stringify(this.bytes);
    }

    toHexString(): string {
        return "0x" + this.toString().replace(/-/g, "");
    }

    toDecimalString(): string {
        const hexString = this.toString().replace(/-/g, "");
        return new BN(hexString, 16).toString(10);
    }
}

export function toDecimalString(value: string): string {
    return new UUID(value).toDecimalString();
}
