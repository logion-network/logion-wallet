import config, { LegalOfficer, Node } from "../../config";

export function isLegalOfficer(address: string | undefined): boolean {
    if(address === undefined) {
        return false;
    } else {
        return config.legalOfficers.map(lo => lo.address).includes(address);
    }
}

export type { LegalOfficer } from "../../config"

const allLegalOfficers: LegalOfficer[] = config.legalOfficers;

export function legalOfficers(nodesDown: Node[]): LegalOfficer[] {
    const unavailableLegalOfficers = new Set(nodesDown.map(node => node.owner));
    return allLegalOfficers.filter(legalOfficer => !unavailableLegalOfficers.has(legalOfficer.address));
}

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
