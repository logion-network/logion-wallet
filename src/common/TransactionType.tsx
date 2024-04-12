import { Transaction } from "@logion/client";
import { ValidAccountId } from "@logion/node-api";

import { Cell } from "./Table";
import {
    PalletLogionLocCall,
    PalletLogionVaultCall,
    PalletVerifiedRecoveryCall,
    PalletRecoveryCall,
    PalletLoAuthorityListCall,
    PalletMultisigCall
} from "@polkadot/types/lookup";
import { WalletType } from "./Transactions";

export interface Props {
    transaction: Transaction;
    walletType: WalletType;
    vaultAccount?: ValidAccountId;
    account?: ValidAccountId;
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
    importLoc: "LOC imported",
    importCollectionItem: "Collection Item imported",
    importTokensRecord: "Tokens Record imported",
    importInvitedContributorSelection: "Invited Contributor Selection imported",
    importVerifiedIssuer: "Verified Issuer imported",
    importVerifiedIssuerSelection: "Verified Issuer Selection imported",
    importSponsorship: "Sponsorship imported",
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
    updateLegalOfficer: "Legal Officer settings updated",
    importHostLegalOfficer: "Legal Officer (Host) imported",
    importGuestLegalOfficer: "Legal Officer (Guest) imported",
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
        baseType = enrichTransactionType(props.transaction, props.account, props.vaultAccount);
    } else {
        baseType = transactionType(props.transaction, props.account);
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

function enrichTransactionType(transaction: Transaction, account?: ValidAccountId, vaultAccount?: ValidAccountId): string {
    if (transaction.transferDirection === 'Sent' && transaction.to === vaultAccount?.address) {
        return "Sent to my vault"
    } else {
        return transactionType(transaction, account);
    }
}

export function transactionType(transaction: Transaction, account?: ValidAccountId): string {
    const palletMethods = allMethods[transaction.pallet];
    if (palletMethods !== undefined && palletMethods[transaction.method] !== undefined) {
        return palletMethods[transaction.method]
    } else {
        if (transaction.pallet === "balances") {
            if (transaction.method.startsWith("transfer")) {
                if (transaction.from.equals(account)) {
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
