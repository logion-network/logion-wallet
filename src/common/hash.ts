import shajs from "sha.js";
import { Hash } from "@logion/node-api";

export async function sha256Hex(file: File): Promise<Hash> {
    const unknownStream: any = file.stream();
    const reader: ReadableStreamDefaultReader = unknownStream.getReader();
    const hasher = shajs('sha256');
    let chunk: {done: boolean, value?: Buffer} = await reader.read();
    while(!chunk.done) {
        hasher.update(chunk.value!);
        chunk = await reader.read();
    }
    return Hash.fromHex(`0x${ hasher.digest("hex") }`);
}
