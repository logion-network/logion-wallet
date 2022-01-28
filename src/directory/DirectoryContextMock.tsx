import { ANOTHER_LEGAL_OFFICER, A_THIRD_LEGAL_OFFICER, DEFAULT_LEGAL_OFFICER } from "../common/TestData";
import { LegalOfficer } from "./DirectoryApi";

export const legalOfficers: LegalOfficer[] = [
    {
        name: "Patrick Gielen",
        address: DEFAULT_LEGAL_OFFICER,
        additionalDetails: "",
        userIdentity: {
            firstName: "Patrick",
            lastName: "Gielen",
            email: "patrick@logion.network",
            phoneNumber: "+32 498 237 107"
        },
        postalAddress: {
            company: "MODERO",
            line1: "Huissier de Justice Etterbeek",
            line2: "Rue Beckers 17",
            postalCode: "1040",
            city: "Etterbeek",
            country: "Belgique"
        },
        node: "http://logion.patrick.com"
    },
    {
        name: "Guillaume Grain",
        address: ANOTHER_LEGAL_OFFICER,
        additionalDetails: "",
        userIdentity: {
            firstName: "Patrick",
            lastName: "Gielen",
            email: "g.grain@adrastee-lyon.fr",
            phoneNumber: "+33 4 78 52 87 56"
        },
        postalAddress: {
            company: "SELARL ADRASTEE",
            line1: "Gare des Brotteaux",
            line2: "14, place Jules Ferry",
            postalCode: "69006",
            city: "LYON",
            country: "France"
        },
        node: "http://logion.guillaume.com"
    },
    {
        name: "Alain Barland",
        address: A_THIRD_LEGAL_OFFICER,
        additionalDetails: "",
        userIdentity: {
            firstName: "Patrick",
            lastName: "Gielen",
            email: "alain.barland@auxilia-conseils.com",
            phoneNumber: "+33 2 48 67 50 50"
        },
        postalAddress: {
            company: "AUXILIA CONSEILS 18",
            line1: "Huissiers de Justice associés",
            line2: "7 rue Jean Francois Champollion Parc Comitec",
            postalCode: "18000",
            city: "Bourges",
            country: "France"
        },
        node: "http://logion.alain.com"
    }
]

const getOfficer = (address: string | undefined): LegalOfficer | null => {
    return legalOfficers.find(officer => officer.address === address) || null;
}

const isLegalOfficer = (address: string): boolean => legalOfficers.map(officer => officer.address).includes(address);

export function useDirectoryContext() {
    return {
        legalOfficers,
        getOfficer,
        isLegalOfficer,
    };
}
