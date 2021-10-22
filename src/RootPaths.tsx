import { UUID } from "./logion-chain/UUID";

export const LEGAL_OFFICER_PATH = "/legal-officer";
export const USER_PATH = "/user";
export const CERTIFICATE_PATH = "/certificate/:locId";

export function certificatePath(locId: UUID): string {
    return CERTIFICATE_PATH.replace(":locId", locId.toString())
}

export function fullCertificateUrl(locId: UUID): string {
    return `${window.location.protocol}//${window.location.host}${certificatePath(locId)}`
}
