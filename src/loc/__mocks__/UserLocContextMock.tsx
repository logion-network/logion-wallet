import { UUID } from "@logion/node-api/dist/UUID";
import { LocData } from "@logion/client/dist/Loc";

import { LocRequest } from "../../common/types/ModelTypes";
import { LocItem } from "../types";

let locState: any;

export function setLocState(value: any) {
    locState = value;
}

export let refresh = jest.fn();

let requestSof = jest.fn();

export function setRequestSof(fn: jest.Mock) {
    requestSof = fn;
}

let requestSofOnCollection = jest.fn();

export function setRequestSofOnCollection(fn: jest.Mock) {
    requestSofOnCollection = fn;
}

let locId: UUID;

export function setLocId(id: UUID) {
    locId = id;
}

let loc: LocData | null = null;

export function setLoc(request: LocData | null) {
    loc = request;
}

let locItems: LocItem[] = [];

export function setLocItems(items: LocItem[]) {
    locItems = items;
}

export let deleteMetadata = jest.fn();

export let deleteFile = jest.fn();

export let addFile = jest.fn().mockResolvedValue(undefined);

export let addMetadata = jest.fn().mockResolvedValue(undefined);

export function useUserLocContext() {

    return {
        refresh,
        locState,
        requestSof,
        requestSofOnCollection,
        locId,
        loc,
        deleteMetadata,
        deleteFile,
        locItems,
        addFile,
        addMetadata,
    }
}
