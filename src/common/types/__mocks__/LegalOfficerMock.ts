import { LegalOfficer } from "../../../config";
import { DEFAULT_LEGAL_OFFICER, A_THIRD_LEGAL_OFFICER, ANOTHER_LEGAL_OFFICER } from "../../TestData";

export const legalOfficers: LegalOfficer[] = [
    {
        name: "Patrick Gielen",
        address: DEFAULT_LEGAL_OFFICER,
        details: "MODERO\nHuissier de Justice Etterbeek\nRue Beckers 17\n1040 Etterbeek\nBelgique\nTel: +32 498 237 107",
        email: "patrick@logion.network"
    },
    {
        name: "Guillaume Grain",
        address: ANOTHER_LEGAL_OFFICER,
        details: "SELARL ADRASTEE\nGare des Brotteaux\n14, place Jules Ferry\n69006 LYON\nFrance\nTel: +33 4 78 52 87 56",
        email: "g.grain@adrastee-lyon.fr"
    },
    {
        name: "Alain Barland",
        address: A_THIRD_LEGAL_OFFICER,
        details: "AUXILIA CONSEILS 18\nHuissiers de Justice associés\n7 rue Jean Francois Champollion Parc Comitec\n18000 Bourges\nFrance\nTel: +33 2 48 67 50 50",
        email: "alain.barland@auxilia-conseils.com"
    },

]

export function legalOfficerByAddress(address: string): LegalOfficer {
    const legalOfficer = legalOfficers.find(legalOfficer => legalOfficer.address === address);
    if(legalOfficer !== undefined) {
        return legalOfficer;
    } else {
        throw new Error(`No legal officer with address ${address}`);
    }
}

export function isLegalOfficer(address: string | undefined): boolean {
    if(address === undefined) {
        return false;
    } else {
        return legalOfficers.map(lo => lo.address).includes(address);
    }
}


