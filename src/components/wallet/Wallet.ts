import { TokenType, isTokenCompatibleWith } from "@logion/client";

export type WalletType = "METAMASK" | "CROSSMINT" | "POLKADOT" | "MULTIVERSX_DEFI_WALLET";

export default class Wallet {

    static readonly all: Wallet [] = [
        new Wallet("METAMASK", "Metamask", "svg"),
        new Wallet("CROSSMINT", "Crossmint", "png"),
        new Wallet("POLKADOT", "Polkadot", "svg"),
        new Wallet("MULTIVERSX_DEFI_WALLET", "MultiversX DeFi Wallet", "png"),
    ]

    readonly type: WalletType;
    readonly name: string;
    readonly iconType:  "svg" | "png";

    constructor(type: WalletType, name: string, iconType: "svg" | "png") {
        this.type = type;
        this.name = name;
        this.iconType = iconType;
    }

    get iconId(): string {
        return this.type.toLowerCase();
    }

    isCompatibleWithItemType(token?: TokenType): boolean {
        if (!token) {
            return false;
        }
        if ([ "METAMASK", "CROSSMINT" ].includes(this.type)) {
            return isTokenCompatibleWith(token, 'ETHEREUM');
        } else if (this.type === 'MULTIVERSX_DEFI_WALLET') {
            return isTokenCompatibleWith(token, 'MULTIVERSX');
        } else { // wallet POLKADOT
            return isTokenCompatibleWith(token, 'POLKADOT');
        }
    }

    static findByType(type: string | null): Wallet | undefined {
        return this.all.find(wallet => wallet.type === type);
    }
}
