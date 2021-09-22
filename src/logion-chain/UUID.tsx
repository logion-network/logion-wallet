import { v4, parse, stringify } from 'uuid';
import BN from 'bn.js';

export class UUID {

    constructor(value?: string | Array<number>) {
        if(value === undefined) {
            this.bytes = parse(v4())
        } else if(typeof value === 'string') {
            this.bytes = parse(value);
        } else {
            this.bytes = [ ...value ];
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
