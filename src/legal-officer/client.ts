import {
    EditableRequest,
    Signer,
    SignCallback,
    LocRequestState,
    OpenLoc,
    ClosedLoc,
    ClosedCollectionLoc,
    VerifiedThirdParty,
    VoidedLoc,
    VoidedCollectionLoc,
    LogionClient,
    LegalOfficer,
} from "@logion/client";
import {
    UUID,
    addLink as nodeApiAddLink,
    addFile as nodeApiAddFile,
    addMetadata as nodeApiAddMetadata,
    MetadataItem,
    closeLoc as nodeApiCloseLoc,
    voidLoc as nodeApiVoidLoc,
    VoidInfo,
    asString,
} from "@logion/node-api";
import { AnyJson } from "@polkadot/types-codec/types/helpers.js";
import { fetchAllLocsParams } from "../loc/LegalOfficerLocContext";

export async function addLink(params: {
    locState: EditableRequest,
    target: UUID,
    nature: string,
}): Promise<EditableRequest> {
    const { locState, target, nature } = params;
    const axios = buildAxios(locState);
    await axios.post(`/api/loc-request/${ locState.data().id.toString() }/links`, { target: target.toString(), nature })
    return await locState.refresh() as EditableRequest;
}

export async function deleteLink(params: {
    locState: EditableRequest,
    target: UUID,
}): Promise<EditableRequest> {
    const { locState, target } = params;
    const axios = buildAxios(locState);
    await axios.delete(`/api/loc-request/${ locState.data().id.toString() }/links/${target}`);
    return await locState.refresh() as EditableRequest;
}

function buildAxios(locState: LocRequestState) {
    const client = locState.locsState().client;
    return client.buildAxios(getLegalOfficer(client, locState.data().ownerAddress));
}

function getLegalOfficer(client: LogionClient, address: string): LegalOfficer {
    return client.legalOfficers.find(legalOfficer => address === legalOfficer.address)!;
}

export async function publishLink(params: {
    locState: EditableRequest,
    target: UUID,
    nature: string,
    signer: Signer,
    callback: SignCallback,
}): Promise<EditableRequest> {
    const { locState, target, nature, signer, callback } = params;

    const client = locState.locsState().client;
    const api = client.nodeApi;
    const locId = locState.data().id;
    const submittable = nodeApiAddLink({
        locId,
        api,
        target,
        nature,
    });
    await signer.signAndSend({
        signerId: locState.data().ownerAddress,
        submittable,
        callback
    });

    const axios = buildAxios(locState);
    await axios.put(`/api/loc-request/${ locId.toString() }/links/${ target.toString() }/confirm`);

    return await locState.refresh() as EditableRequest;
}

export async function publishFile(params: {
    locState: EditableRequest,
    hash: string,
    nature: string,
    submitter: string,
    signer: Signer,
    callback: SignCallback,
}): Promise<EditableRequest> {
    const { locState, hash, nature, submitter, signer, callback } = params;

    const client = locState.locsState().client;
    const api = client.nodeApi;
    const locId = locState.data().id;
    const submittable = nodeApiAddFile({
        locId,
        api,
        hash,
        nature,
        submitter,
    });
    await signer.signAndSend({
        signerId: locState.data().ownerAddress,
        submittable,
        callback
    });

    const axios = buildAxios(locState);
    await axios.put(`/api/loc-request/${ locId.toString() }/files/${ hash }/confirm`);

    return await locState.refresh() as EditableRequest;
}

export async function publishMetadata(params: {
    locState: EditableRequest,
    item: MetadataItem,
    signer: Signer,
    callback: SignCallback,
}): Promise<EditableRequest> {
    const { locState, item, signer, callback } = params;

    const client = locState.locsState().client;
    const api = client.nodeApi;
    const locId = locState.data().id;
    const submittable = nodeApiAddMetadata({
        locId,
        api,
        item,
    });
    await signer.signAndSend({
        signerId: locState.data().ownerAddress,
        submittable,
        callback
    });

    const axios = buildAxios(locState);
    await axios.put(`/api/loc-request/${ locId.toString() }/metadata/${ encodeURIComponent(item.name) }/confirm`);

    return await locState.refresh() as EditableRequest;
}

export async function closeLoc(params: {
    locState: OpenLoc,
    signer: Signer,
    callback: SignCallback,
}): Promise<ClosedLoc | ClosedCollectionLoc> {
    const { locState, signer, callback } = params;

    const client = locState.locsState().client;
    const api = client.nodeApi;
    const locData = locState.data();
    const locId = locData.id;
    const seal = locData.seal;
    const submittable = nodeApiCloseLoc({
        locId,
        api,
        seal,
    });
    const signerId = locState.data().ownerAddress;
    await signer.signAndSend({
        signerId,
        submittable,
        callback
    });

    let refreshedLocState;
    if(locState.discarded) {
        refreshedLocState = (await client.locsState(fetchAllLocsParams(getLegalOfficer(client, signerId)))).findById(locId);
    } else {
        refreshedLocState = locState;
    }

    const axios = buildAxios(refreshedLocState);
    await axios.post(`/api/loc-request/${ locId.toString() }/close`);

    return await refreshedLocState.refresh() as ClosedLoc | ClosedCollectionLoc;
}

export interface FullVoidInfo extends VoidInfo {
    reason: string;
}

export async function voidLoc(params: {
    locState: LocRequestState,
    voidInfo: FullVoidInfo,
    signer: Signer,
    callback: SignCallback,
}): Promise<VoidedLoc | VoidedCollectionLoc> {
    const { locState, voidInfo, signer, callback } = params;

    const client = locState.locsState().client;
    const api = client.nodeApi;
    const locData = locState.data();
    const locId = locData.id;
    const submittable = nodeApiVoidLoc({
        locId,
        api,
        voidInfo,
    });
    await signer.signAndSend({
        signerId: locState.data().ownerAddress,
        submittable,
        callback
    });

    const axios = buildAxios(locState);
    const reason = voidInfo.reason;
    await axios.post(`/api/loc-request/${ locId.toString() }/void`, {
        reason
    });

    return await locState.refresh() as VoidedLoc | VoidedCollectionLoc;
}

export async function setVerifiedThirdParty(params: {
        locState: ClosedLoc,
        isVerifiedThirdParty: boolean;
    }
): Promise<ClosedLoc> {
    const { locState, isVerifiedThirdParty } = params;
    const axios = buildAxios(locState);
    await axios.put(`/api/loc-request/${locState.data().id.toString()}/verified-third-party`, {
        isVerifiedThirdParty
    });
    return await locState.refresh() as ClosedLoc;
}

export async function getVerifiedThirdPartySelections(params: { locState: OpenLoc } ): Promise<VerifiedThirdParty[]> {
    const { locState } = params
    const axios = buildAxios(locState);
    const response = await axios.get("/api/verified-third-parties");
    const allVerifiedThirdParties: VerifiedThirdParty[] = response.data.verifiedThirdParties;

    const selectedParties = locState.data().selectedParties;

    return allVerifiedThirdParties
        .filter(vtp => vtp.address !== locState.data().requesterAddress)
        .map(vtp => selectedParties.find(selectedParty => selectedParty.identityLocId === vtp.identityLocId && selectedParty.selected) ?
            { ...vtp, selected: true } :
            { ...vtp, selected: false }
        )
        .sort((vtp1, vtp2) => vtp1.lastName.localeCompare(vtp2.lastName));
}

export interface SelectPartiesParams {
    locState: OpenLoc;
    partyId: string;
}

export async function selectParties(params: SelectPartiesParams): Promise<void> {
    const { locState, partyId } = params;
    const axios = buildAxios(locState);
    await axios.post(`/api/loc-request/${locState.locId.toString()}/selected-parties`, {
        identityLocId: partyId
    })
}

export async function unselectParties(params: SelectPartiesParams): Promise<void> {
    const { locState, partyId } = params;
    const axios = buildAxios(locState);
    await axios.delete(`/api/loc-request/${ locState.locId.toString() }/selected-parties/${ partyId }`)
}

export async function requestVote(params: {
    locState: ClosedLoc | ClosedCollectionLoc,
    signer: Signer,
    callback: SignCallback,
}): Promise<string> {
    const { locState, signer, callback } = params;

    const client = locState.locsState().client;
    const api = client.nodeApi;
    const locData = locState.data();
    const locId = locData.id;
    const submittable = api.tx.vote.createVoteForAllLegalOfficers(locId.toDecimalString());
    const result = await signer.signAndSend({
        signerId: locState.data().ownerAddress,
        submittable,
        callback
    });
    const voteCreated = result.events.find(event => event.name === "VoteCreated" && event.section === "vote");
    if(!voteCreated) {
        throw new Error("Unable to retrieve vote ID");
    }
    const voteCreatedData = voteCreated.data as AnyJson[];
    return asString(voteCreatedData[0]);
}
