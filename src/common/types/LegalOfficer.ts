export const DEFAULT_LEGAL_OFFICER = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Alice
export const ANOTHER_LEGAL_OFFICER = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; // Bob

const LEGAL_OFFICERS: string[] = [ DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER ];

export function isLegalOfficer(address: string): boolean {
    return LEGAL_OFFICERS.includes(address);
}

export interface LegalOfficer {
    name: string,
    address: string,
    details: string
}

function fakeAddress(i: number) {
    return "1234567890-abcd-" + i;
}

const defaultDetails = "Place de le République Française, 10";

export const legalOfficers: LegalOfficer[] = [
    {name: "Patrick Gielen", address: DEFAULT_LEGAL_OFFICER, details: "Modero Bruxelles\nCentral administration \nNijverheidslaan 1\nB - 1853 Grimbergen (Strombeek-Bever)\nBelgium"},
    {name: "Guillaume Grain", address: ANOTHER_LEGAL_OFFICER, details: "SELARL ADRASTEE\nGare des Brotteaux\n14, place Jules Ferry\n69006 LYON\nFrance"},
    {name: "Alain Barland", address: fakeAddress(5), details: defaultDetails},
    {name: "Ronald Vanswijgenhoven", address: fakeAddress(6), details: defaultDetails},
    {name: "Thibaut Barnier", address: fakeAddress(7), details: defaultDetails},
    {name: "Jona Van Leeuwen", address: fakeAddress(8), details: defaultDetails},
    {name: "Carlos Calvo", address: fakeAddress(9), details: defaultDetails},
    {name: "Ilias Tsipos", address: fakeAddress(10), details: defaultDetails},
    {name: "Pedroso Leal", address: fakeAddress(11), details: defaultDetails},
    {name: "Marc Schmitz", address: fakeAddress(12), details: defaultDetails},
];

export function getOfficer(address: string | undefined): LegalOfficer | null {
    if(address === null) {
        return null;
    }

    for(let i = 0; i < legalOfficers.length; ++i) {
        const legalOfficer = legalOfficers[i];
        if(legalOfficer.address === address) {
            return legalOfficer;
        }
    }
    return null;
}

export function legalOfficerByAddress(address: string): LegalOfficer {
    const legalOfficer = legalOfficers.find(legalOfficer => legalOfficer.address === address);
    if(legalOfficer !== undefined) {
        return legalOfficer;
    } else {
        throw new Error(`No legal officer with address ${address}`);
    }
}
