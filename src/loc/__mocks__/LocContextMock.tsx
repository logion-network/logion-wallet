import { LocData } from "@logion/client";
import { UUID } from "@logion/node-api/dist/UUID";

import { mockSignAndSubmit } from "../../ExtrinsicSubmitterTestUtil";
import { LocItem } from "../types";

let locItems: LocItem[] = [];

export function setLocItems(items: LocItem[]) {
    locItems = items;
}

export let close = jest.fn();

export function setClose(fn: jest.Mock<any, any>) {
    close = fn;
}

export function closeExtrinsicSent(): boolean {
    return _closeExtrinsicSent;
}

let _closeExtrinsicSent = false;

export function resetCloseExtrinsicSent() {
    _closeExtrinsicSent = false;
}

let locId = new UUID("aed4c6e4-979e-48ad-be6e-4bd39fb94762");

export function setLocId(id: UUID) {
    locId = id;
}

let loc: Partial<LocData> = {
    requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
    userIdentity: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@logion.network",
        phoneNumber: "+1234",
    }
};

export function setLocRequest(request: LocData) {
    loc = request;
}

export let refresh = jest.fn();

export let requestSof = jest.fn();

export function setRequestSof(fn: jest.Mock) {
    requestSof = fn;
}

export let deleteMetadata = jest.fn();

export let deleteFile = jest.fn();

export let deleteLink = jest.fn();

export let addFile = jest.fn().mockResolvedValue(undefined);

export let addMetadata = jest.fn().mockResolvedValue(undefined);

export function useLocContext() {
    return {
        linkLoc: {

        },
        locId,
        loc,
        locItems,
        closeExtrinsic: () => mockSignAndSubmit(() => _closeExtrinsicSent = true),
        close,
        refresh,
        requestSof,
        deleteMetadata,
        deleteFile,
        deleteLink,
        addFile,
        addMetadata,
        checkResult: { result: "NONE" },
        locState: {
            isLogionIdentity: () => false,
            isLogionData: () => true,
        }
    };
}
