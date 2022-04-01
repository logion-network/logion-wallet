import { LegalOfficerCase } from "logion-api/dist/Types";
import { UUID } from "logion-api/dist/UUID";

import { LocRequest } from "../../common/types/ModelTypes";
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

let locRequest: Partial<LocRequest> = {
    requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW",
    userIdentity: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@logion.network",
        phoneNumber: "+1234",
    }
};

export function setLocRequest(request: LocRequest) {
    locRequest = request;
}

let loc: Partial<LegalOfficerCase> = {
    requesterAddress: "5Ew3MyB15VprZrjQVkpQFj8okmc9xLDSEdNhqMMS5cXsqxoW"
};

export function setLoc(request: LegalOfficerCase) {
    loc = request;
}

export let refresh = jest.fn();

export function useLocContext() {
    return {
        linkLoc: {
            
        },
        locId,
        locRequest,
        locItems,
        closeExtrinsic: () => mockSignAndSubmit(() => _closeExtrinsicSent = true),
        close,
        loc,
        refresh
    };
}
