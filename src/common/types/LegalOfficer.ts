import config, { LegalOfficer } from "../../config";

export function isLegalOfficer(address: string | undefined): boolean {
    if(address === undefined) {
        return false;
    } else {
        return config.legalOfficers.map(lo => lo.address).includes(address);
    }
}

export type { LegalOfficer } from "../../config"

export const legalOfficers: LegalOfficer[] = config.legalOfficers;

export function getOfficer(address: string | undefined): LegalOfficer | null {
    if(address === null) {
        return null;
    }

    for(let i = 0; i < config.legalOfficers.length; ++i) {
        const legalOfficer = config.legalOfficers[i];
        if(legalOfficer.address === address) {
            return legalOfficer;
        }
    }
    return null;
}

export function legalOfficerByAddress(address: string): LegalOfficer {
    const legalOfficer = config.legalOfficers.find(legalOfficer => legalOfficer.address === address);
    if(legalOfficer !== undefined) {
        return legalOfficer;
    } else {
        throw new Error(`No legal officer with address ${address}`);
    }
}
