import { LocType } from "./logion-chain/Types";

export const LEGAL_OFFICER_PATH = "/legal-officer";
export const USER_PATH = "/user";

const LOC_REQUESTS_RELATIVE_PATH = '/loc/:locType';
export function locRequestsRelativePath(locType: LocType) {
    return LOC_REQUESTS_RELATIVE_PATH
        .replace(":locType", locType.toLowerCase())
}

const DATA_LOC_DETAILS_RELATIVE_PATH = LOC_REQUESTS_RELATIVE_PATH + '/:locId';
export function dataLocDetailsRelativePath(locType: LocType) {
    return DATA_LOC_DETAILS_RELATIVE_PATH
        .replace(":locType", locType.toLowerCase())
}
