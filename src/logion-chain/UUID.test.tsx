import { v4, parse } from 'uuid';
import { UUID } from "./UUID";

describe("UUID", () => {
    const uuidString = v4();
    const uuidBytes = parse(uuidString);

    it("can be created from valid string", () => {
        const uuid = new UUID(uuidString);
        expect(uuid.toString()).toBe(uuidString);
    });

    it("can be created from bytes", () => {
        const uuid = new UUID(uuidBytes);
        expect(uuid.toString()).toBe(uuidString);
    });

    it("can be created from undefined", () => {
        const uuid = new UUID();
        expect(uuid.toString()).toBeDefined();
    });

    it("produces expected hex string", () => {
        const uuid = new UUID('6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b');
        expect(uuid.toHexString()).toBe("0x6ec0bd7f11c043da975e2a8ad9ebae0b");
    });
});
