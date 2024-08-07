import { AxiosInstance } from "axios";
import { CheckResultType } from "@logion/client/dist/Deliveries.js";
import { DefaultSignAndSendStrategy } from "@logion/client/dist/Signer.js";
import { MimeType } from "@logion/client/dist/Mime.js";
import { HashString } from "@logion/client/dist/Hash.js";
import {
    LogionClient,
    AccountTokens,
    toIsoString,
    fromIsoString,
    ClosedCollectionLoc,
    DraftRequest,
    EditableRequest,
    OpenLoc,
    LocRequestState,
    LocsState,
    HashOrContent,
    ClosedLoc,
    ClosedIdentityLoc,
    ReadOnlyLocState,
    PendingRequest,
} from '../LogionClientMock';
import { isTokenCompatibleWith } from "@logion/client/dist/Token.js";
import { LegalOfficerClass } from "@logion/client/dist/Types.js";
export { PendingVote, Votes } from "@logion/client/dist/Votes.js";
export { toFeesClass } from "@logion/client/dist/Fees.js";

export {
    LogionClient,
    AccountTokens,
    toIsoString,
    fromIsoString,
    CheckResultType,
    ClosedCollectionLoc,
    DraftRequest,
    EditableRequest,
    OpenLoc,
    DefaultSignAndSendStrategy,
    LocRequestState,
    LocsState,
    HashOrContent,
    ClosedLoc,
    ClosedIdentityLoc,
    ReadOnlyLocState,
    isTokenCompatibleWith,
    LegalOfficerClass,
    PendingRequest,
    HashString,
}

export { MimeType } from "@logion/client/dist/Mime.js";

export function downloadFile(axios: AxiosInstance, url: string) {
    const data = axios.get(url, { responseType: "blob" });
    return {
        data,
        mimeType: MimeType.from("image/jpeg"),
    };
}
