import { UUID } from "@logion/node-api";
import { LocData } from "@logion/client";

import { LocItem } from "../LocItem";

let locState: any;

export function setLocState(value: any) {
    locState = value;
}

export let refresh = jest.fn();

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

async function mutateLocState(mutator: (state: any) => Promise<any>): Promise<void> {
    await mutator(locState);
}

export function useUserLocContext() {

    return {
        refresh,
        locState,
        locId,
        loc,
        deleteMetadata,
        deleteFile,
        locItems,
        addFile,
        addMetadata,
        checkResult: { result: "NONE" },
        collectionItems: [],
        mutateLocState,
    }
}
