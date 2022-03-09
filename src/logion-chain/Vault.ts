import { keyring } from "@polkadot/ui-keyring";
import { RecoveryConfig } from "./Recovery";

const THRESHOLD = 2;
const NAME = "LogionVault";

export function getVault(address: string, recoveryConfig: RecoveryConfig): string {
    checkKeyringLoaded()
    const vaultAddress = findVault();
    return vaultAddress ? vaultAddress : createVault(address, recoveryConfig)
}

function createVault(address: string, recoveryConfig: RecoveryConfig): string {
    const signatories: (string | Uint8Array)[] = [ address, ...recoveryConfig.friends.sort() ]
    const result = keyring.addMultisig(signatories, THRESHOLD, { name: NAME })
    console.log("New Vault created: %s", result.pair.address)
    keyring.saveAddress(result.pair.address, { name: NAME }, "address")
    return result.pair.address
}

function findVault(): string | undefined {
    const keyringAddress = keyring.getAddresses()
        .find(keyringAddress => keyringAddress.meta.name === NAME)
    if (keyringAddress) {
        console.log("Vault found: %s", keyringAddress.address)
        return keyringAddress.address
    }
    return undefined
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

