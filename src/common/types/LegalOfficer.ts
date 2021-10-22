export const DEFAULT_LEGAL_OFFICER = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Alice
export const ANOTHER_LEGAL_OFFICER = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"; // Bob
export const A_THIRD_LEGAL_OFFICER = "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y"; // Charlie

const LEGAL_OFFICERS: string[] = [ DEFAULT_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER, A_THIRD_LEGAL_OFFICER ];

export function isLegalOfficer(address: string | undefined): boolean {
    if(address === undefined) {
        return false;
    } else {
        return LEGAL_OFFICERS.includes(address);
    }
}

export interface LegalOfficer {
    name: string,
    address: string,
    details: string
}

export const legalOfficers: LegalOfficer[] = [
    {name: "Patrick Gielen", address: DEFAULT_LEGAL_OFFICER, details: "MODERO\nHuissier de Justice Etterbeek\nRue Beckers 17\n1040 Etterbeek\nBelgique\nTel: +32 498 237 107\nmail: patrick@logion.network"},
    {name: "Guillaume Grain", address: ANOTHER_LEGAL_OFFICER, details: "SELARL ADRASTEE\nGare des Brotteaux\n14, place Jules Ferry\n69006 LYON\nFrance\nTel: +33 4 78 52 87 56\nmail: g.grain@adrastee-lyon.fr"},
    {name: "Alain Barland", address: A_THIRD_LEGAL_OFFICER, details: "AUXILIA CONSEILS 18\nHuissiers de Justice associés\n7 rue Jean Francois Champollion Parc Comitec\n18000 Bourges\nFrance\nTel: +33 2 48 67 50 50\nmail: alain.barland@auxilia-conseils.com"},
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
