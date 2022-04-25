import shajs from "sha.js";

export async function sha256Hex(file: File): Promise<string> {
    const unknownStream: any = file.stream();
    const reader: ReadableStreamDefaultReader = unknownStream.getReader();
    const hasher = shajs('sha256');
    let chunk: {done: boolean, value?: Buffer} = await reader.read();
    while(!chunk.done) {
        hasher.update(chunk.value!);
        chunk = await reader.read();
    }
    return hasher.digest("hex");
}

export function sha256HexFromString(value: string): string {
    const hasher = shajs('sha256');
    hasher.update(Buffer.from(value, 'utf-8'));
    return hasher.digest("hex");
}
