import { UUID } from "./logion-chain/UUID";

export const PUBLIC_PATH = "/public";
export const CERTIFICATE_PATH = PUBLIC_PATH + "/certificate/:locId";

function certificatePath(locId: UUID): string {
    return CERTIFICATE_PATH.replace(":locId", locId.toString())
}

export function fullCertificateUrl(locId: UUID): string {
    return `${window.location.protocol}//${window.location.host}${certificatePath(locId)}`
}
