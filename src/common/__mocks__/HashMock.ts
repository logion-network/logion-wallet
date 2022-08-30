export let sha256Hex: jest.Mock<any, any> = jest.fn();

export function setExpectedHash(expectedHash: string) {
    sha256Hex = jest.fn().mockResolvedValue(expectedHash)
}
