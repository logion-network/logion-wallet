import { LocData, CollectionItem } from "@logion/client";
import { UUID } from "@logion/node-api/dist/UUID";

import { mockSignAndSubmit } from "../../ExtrinsicSubmitterTestUtil";
import { LocItem } from "../types";

let locState: any = {
    isLogionIdentity: () => false,
    isLogionData: () => true,
};

export function setLocState(value: any) {
    locState = value;
}

let locItems: LocItem[] = [];

export function setLocItems(items: LocItem[]) {
    locItems = items;
}

let locId = new UUID("aed4c6e4-979e-48ad-be6e-4bd39fb94762");

export function setLocId(id: UUID) {
    locId = id;
}

let loc: Partial<LocData> | null = {
    id: locId,
    locType: "Identity",
    requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
    userIdentity: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@logion.network",
        phoneNumber: "+1234",
    }
};

export function setLocRequest(request: LocData | null) {
    loc = request;
}

export let refresh = jest.fn();

export let requestSof = jest.fn();

export function setRequestSof(fn: jest.Mock) {
    requestSof = fn;
}

export let deleteMetadata = jest.fn();

export let deleteLink = jest.fn();

export let voidLoc = jest.fn();

let collectionItems: CollectionItem[] = [];

export function setCollectionItems(items: CollectionItem[]) {
    collectionItems = items;
}

async function mutateLocState(mutator: (state: any) => Promise<any>): Promise<void> {
    await mutator(locState);
}

export function useLocContext() {
    return {
        linkLoc: {

        },
        locId,
        loc,
        locItems,
        refresh,
        requestSof,
        deleteMetadata,
        deleteLink,
        checkResult: { result: "NONE" },
        locState,
        voidLoc,
        voidLocExtrinsic: () => mockSignAndSubmit(() => {}),
        collectionItems,
        mutateLocState,
    };
}
