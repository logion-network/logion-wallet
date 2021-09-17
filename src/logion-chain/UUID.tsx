import { v4, parse, stringify } from 'uuid';

export class UUID {

    constructor(value?: string | Uint8Array[16]) {
        if(value === undefined) {
            this.bytes = parse(v4())
        } else if(typeof value === 'string') {
            this.bytes = parse(value);
        } else {
            this.bytes = value.slice(0);
        }
    }

    private bytes: Uint8Array[16];

    toString(): string {
        return stringify(this.bytes);
    }

    toHexString(): string {
        return "0x" + this.toString().replace(/-/g, "");
    }
}
