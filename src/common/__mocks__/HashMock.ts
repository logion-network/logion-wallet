import { Hash } from "@logion/node-api";

export let sha256Hex: jest.Mock<any, any> = jest.fn();

export function setExpectedHash(expectedHash: Hash) {
    sha256Hex = jest.fn().mockResolvedValue(expectedHash)
}
