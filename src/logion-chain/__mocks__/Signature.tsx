export let signAndSend = (parameters: any) => 42;

export function setSignAndSend(fn: any) {
    signAndSend = fn;
}
