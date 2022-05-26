import { Transaction } from "@logion/client/dist/TransactionClient";

import { Cell } from "./Table";
import { WalletType } from "./Wallet";

export interface Props {
    transaction: Transaction;
    walletType: WalletType;
    vaultAddress?: string;
    address: string;
}

export default function TransactionType(props: Props) {

    return (
        <Cell
            content={ buildTransactionType(props) }
        />
    );
}

export function buildTransactionType(props: Props): string {
    if(props.walletType === "Wallet") {
        return enrichTransactionType(props.transaction, props.address, props.vaultAddress);
    } else {
        return transactionType(props.transaction, props.address);
    }
}

function enrichTransactionType(transaction: Transaction, address: string, vaultAddress?: string): string {
    if (transaction.transferDirection === 'Sent' && transaction.to === vaultAddress) {
        return "Sent to my vault"
    } else {
        return transactionType(transaction, address);
    }
}

function transactionType(transaction: Transaction, address: string): string {
    if(transaction.pallet === "verifiedRecovery") {
        if (transaction.method === "createRecovery") {
            return "Recovery created";
        } else {
            return "Other";
        }
    } else if(transaction.pallet === "recovery") {
        if(transaction.method === "createRecovery") {
            return "Protection activated";
        } else if(transaction.method === "vouchRecovery") {
            return "Recovery vouched";
        } else if(transaction.method === "initiateRecovery") {
            return "Recovery initiated";
        } else if(transaction.method === "claimRecovery") {
            return "Recovery claimed";
        } else if(transaction.method === "asRecovered") {
            return "Recovery process";
        } else {
            return "Other";
        }
    } else if(transaction.pallet === "balances") {
        if(transaction.method.startsWith("transfer")) {
            if(transaction.from === address) {
                return "Sent";
            } else {
                return "Received";
            }
        } else {
            return "Other";
        }
    } else if(transaction.pallet === "assets") {
        if(transaction.method === "mint") {
            return "Asset tokens minted";
        } else if(transaction.method === "create") {
            return "Asset created";
        } else if(transaction.method === "setMetadata") {
            return "Asset metadata set";
        } else {
            return "Other";
        }
    } else if(transaction.pallet === "logionLoc") {
        if(transaction.method === "addFile") {
            return "File added to LOC";
        } else if(transaction.method === "addLink") {
            return "Link added to LOC";
        } else if(transaction.method === "addMetadata") {
            return "Metadata added to LOC";
        } else if(transaction.method === "close") {
            return "LOC closed";
        } else if(transaction.method === "createLoc") {
            return "LOC created";
        } else if(transaction.method === "makeVoid") {
            return "LOC voided";
        } else if(transaction.method === "makeVoidAndReplace") {
            return "LOC voided and replaced";
        } else if(transaction.method === "addCollectionItem") {
            return "Item added to Collection";
        } else {
            return "Other";
        }
    } else if(transaction.pallet === "vault") {
        if(transaction.method === "requestCall") {
            return "Vault operation requested";
        } else if(transaction.method === "approveCall") {
            return "Vault operation approved";
        } else {
            return "Other";
        }
    } else if(transaction.pallet === "multisig") {
        if(transaction.method === "cancelAsMulti") {
            return "Vault operation cancelled";
        } else {
            return "Other";
        }
    } else {
        return 'Other';
    }
}
