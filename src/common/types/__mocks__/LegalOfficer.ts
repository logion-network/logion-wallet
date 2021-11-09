import {
    legalOfficers as legalOfficersMock,
    legalOfficerByAddress as legalOfficerByAddressMock,
    isLegalOfficer as isLegalOfficerMock
} from "./LegalOfficerMock";
import { LegalOfficer } from "../../../config";

export const legalOfficers = legalOfficersMock

export function legalOfficerByAddress(address: string): LegalOfficer {
    return legalOfficerByAddressMock(address);
}

export function isLegalOfficer(address: string | undefined): boolean {
    return isLegalOfficerMock(address)
}

