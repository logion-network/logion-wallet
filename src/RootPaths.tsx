import { LocType } from "@logion/node-api/dist/Types";

export const LEGAL_OFFICER_PATH = "/legal-officer";
export const USER_PATH = "/user";

const LOC_REQUESTS_RELATIVE_PATH = '/loc/:locType';
export function locRequestsRelativePath(locType: LocType) {
    return LOC_REQUESTS_RELATIVE_PATH
        .replace(":locType", locType.toLowerCase())
}

const LOC_DETAILS_RELATIVE_PATH = LOC_REQUESTS_RELATIVE_PATH + '/:locId';
export function locDetailsRelativePath(locType: LocType) {
    return LOC_DETAILS_RELATIVE_PATH
        .replace(":locType", locType.toLowerCase())
}
