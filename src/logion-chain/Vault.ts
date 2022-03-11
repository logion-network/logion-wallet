import { RecoveryConfig } from "./Recovery";
import { keyring } from "@polkadot/ui-keyring";

const THRESHOLD = 2;

export function getVaultAddress(requesterAddress: string, recoveryConfig: RecoveryConfig): string {
    checkKeyringLoaded()
    const signatories: string[] = [ requesterAddress, ...recoveryConfig.friends.map(accountId => accountId.toString()) ].sort()
    const result = keyring.addMultisig(signatories, THRESHOLD);
    const vaultAddress = result.pair.address;
    console.log("Vault address is %s for signatories: %s", vaultAddress, signatories)
    return vaultAddress
}

function checkKeyringLoaded() {
    isKeyringLoaded() || keyring.loadAll({})
}

function isKeyringLoaded () {
    try {
        return !!keyring.keyring;
    } catch {
        return false;
    }
}

