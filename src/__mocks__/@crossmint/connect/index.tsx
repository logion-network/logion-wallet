export enum BlockchainTypes {
    ETHEREUM
};

export class CrossmintEVMWalletAdapter {

    async connect(): Promise<string> {
        return "0xb21edd3dc671484F34075B038a68A76F6362F980";
    }
}
