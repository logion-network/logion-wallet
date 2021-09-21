import { signAndSend } from './SignatureMock';

export function createLoc(parameters: any) {
    signAndSend(parameters);
    return Promise.resolve();
}
