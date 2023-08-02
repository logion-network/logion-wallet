import { LocType, UUID, Hash } from "@logion/node-api";
import { Viewer } from "./common/CommonContext";

export const LEGAL_OFFICER_PATH = "/legal-officer";
export const USER_PATH = "/user";

export const LOC_REQUESTS_RELATIVE_PATH = '/loc/:locType';
export function locRequestsRelativePath(locType: LocType) {
    return LOC_REQUESTS_RELATIVE_PATH
        .replace(":locType", locType.toLowerCase())
}

export const LOC_DETAILS_RELATIVE_PATH = LOC_REQUESTS_RELATIVE_PATH + '/:locId';
export function locDetailsRelativePath(locType: LocType) {
    return LOC_DETAILS_RELATIVE_PATH
        .replace(":locType", locType.toLowerCase())
}

const DASHBOARD_CERTIFICATE_RELATIVE_PATH = LOC_REQUESTS_RELATIVE_PATH + '/:locId/certificate/:itemId';
export function relativeDashboardCertificateRelativePath(locType: LocType) {
    return DASHBOARD_CERTIFICATE_RELATIVE_PATH
        .replace(":locType", locType.toLowerCase())
}

export function dashboardCertificateRelativePath(locType: LocType, locId: UUID, itemId: Hash, viewer: Viewer): string {
    const relativePath = relativeDashboardCertificateRelativePath(locType)
        .replace(":locId", locId.toString())
        .replace(":itemId", itemId.toHex());
    if(viewer === "LegalOfficer") {
        return LEGAL_OFFICER_PATH + relativePath;
    } else {
        return USER_PATH + relativePath;
    }
}
