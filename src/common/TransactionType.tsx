import { Transaction } from "@logion/client/dist/TransactionClient.js";

import { Cell } from "./Table";
import { WalletType } from "./Wallet";
import {
    PalletLogionLocCall,
    PalletLogionVaultCall,
    PalletVerifiedRecoveryCall,
    PalletRecoveryCall,
    PalletLoAuthorityListCall,
    PalletMultisigCall
} from "@polkadot/types/lookup";

export interface Props {
    transaction: Transaction;
    walletType: WalletType;
    vaultAddress?: string;
    address: string;
}

type FormerLogionLocMethod = "createLoc";
type LogionLocMethod = Uncapitalize<PalletLogionLocCall["type"]> | FormerLogionLocMethod
const palletLogionLocMethods: Record<LogionLocMethod, string> = {
    addCollectionItem: "Item added to Collection",
    addFile: "File added to LOC",
    addLink: "Link added to LOC",
    addMetadata: "Metadata added to LOC",
    close: "LOC closed",
    createLoc: "LOC created",
    createCollectionLoc: "Collection LOC created",
    createLogionIdentityLoc: "Logion Identity LOC created",
    createLogionTransactionLoc: "Logion Identity LOC created",
    createOtherIdentityLoc: "Other Identity LOC created",
    createPolkadotIdentityLoc: "Polkadot Identity LOC created",
    createPolkadotTransactionLoc: "Polkadot Transaction LOC created",
    makeVoid: "LOC voided",
    makeVoidAndReplace: "LOC voided and replaced",
    addTokensRecord: "Tokens record added",
    dismissIssuer: "Issuer dismissed",
    nominateIssuer: "Issuer nominated",
    setIssuerSelection: "Issuer selected or unselected",
    setInvitedContributorSelection: "Invited Contributor selected or unselected",
    sponsor: "Sponsorship created",
    withdrawSponsorship: "Sponsorship withdrawn",
    acknowledgeFile: "File acknowledged",
    acknowledgeMetadata: "Public data acknowledged",
    acknowledgeLink: "Link acknowledged",
}

const palletLogionVaultMethods: Record<Uncapitalize<PalletLogionVaultCall["type"]>, string> = {
    approveCall: "Vault operation approved",
    requestCall: "Vault operation requested"
}

const palletVerifiedRecoveryMethods: Record<Uncapitalize<PalletVerifiedRecoveryCall["type"]>, string> = {
    createRecovery: "Recovery created"
}

const palletRecoveryMethods: Record<Uncapitalize<PalletRecoveryCall["type"]>, string> = {
    asRecovered: "Recovery processed",
    cancelRecovered: "Recovery cancelled",
    claimRecovery: "Recovery claimed",
    closeRecovery: "Recovery closed",
    createRecovery: "Protection activated",
    initiateRecovery: "Recovery initiated",
    removeRecovery: "Recovery removed",
    setRecovered: "Recovery vouched by Root",
    vouchRecovery: "Recovery vouched"
}

const palletLoAuthorityListMethods: Record<Uncapitalize<PalletLoAuthorityListCall["type"]>, string> = {
    addLegalOfficer: "Legal Officer added",
    removeLegalOfficer: "Legal Officer removed",
    updateLegalOfficer: "Legal Officer settings updated"
}

// Partial use of multisig pallet
const palletMultisigMethods:Partial<Record<Uncapitalize<PalletMultisigCall["type"]>, string>> = {
    cancelAsMulti: "Vault operation cancelled",
}

const allMethods: Record<string, Record<string, string>> = {
    "logionLoc": palletLogionLocMethods,
    "vault": palletLogionVaultMethods,
    "verifiedRecovery": palletVerifiedRecoveryMethods,
    "recovery": palletRecoveryMethods,
    "loAuthorityList": palletLoAuthorityListMethods,
    "multisig": palletMultisigMethods,
}

export default function TransactionType(props: Props) {

    return (
        <Cell
            content={ buildTransactionType(props) }
            overflowing={ true }
            tooltipId={ `transaction-${props.transaction.id}` }
        />
    );
}

export function buildTransactionType(props: Props): string {
    let baseType;
    if(props.walletType === "Wallet") {
        baseType = enrichTransactionType(props.transaction, props.address, props.vaultAddress);
    } else {
        baseType = transactionType(props.transaction, props.address);
    }
    if(props.transaction.type === "EXTRINSIC" || props.transaction.type === "VAULT_OUT") {
        return baseType;
    } else if(props.transaction.type === "LEGAL_FEE") {
        return `${ baseType } (legal fee)`;
    } else if(props.transaction.type === "STORAGE_FEE") {
        return `${ baseType } (storage fee)`;
    } else {
        return `${ baseType } (fees)`;
    }
}

function enrichTransactionType(transaction: Transaction, address: string, vaultAddress?: string): string {
    if (transaction.transferDirection === 'Sent' && transaction.to === vaultAddress) {
        return "Sent to my vault"
    } else {
        return transactionType(transaction, address);
    }
}

export function transactionType(transaction: Transaction, address: string): string {
    const palletMethods = allMethods[transaction.pallet];
    if (palletMethods !== undefined && palletMethods[transaction.method] !== undefined) {
        return palletMethods[transaction.method]
    } else {
        if (transaction.pallet === "balances") {
            if (transaction.method.startsWith("transfer")) {
                if (transaction.from === address) {
                    return "Sent";
                } else {
                    return "Received";
                }
            } else {
                return other(transaction);
            }
        } else {
            return other(transaction);
        }
    }
}

function other(transaction: Transaction): string {
    return `Other (${ transaction.pallet }.${ transaction.method })`;
}
