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
    LocData,
    VerifiedIssuerIdentity,
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
    LogionNodeApi,
} from "@logion/node-api";
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { AnyJson } from "@polkadot/types-codec/types/helpers.js";
import { AxiosInstance } from "axios";

export async function addLink(params: {
    locState: EditableRequest,
    target: UUID,
    nature: string,
}): Promise<EditableRequest> {
    const { locState, target, nature } = params;
    const currentLocState = getCurrent(locState);
    const { axios, data } = inspectState(currentLocState);
    await axios.post(`/api/loc-request/${ data.id.toString() }/links`, { target: target.toString(), nature })
    return await getCurrent(currentLocState).refresh() as EditableRequest;
}

function getCurrent<T extends LocRequestState>(locState: LocRequestState): T {
    const currentLocState = locState.getCurrentState() as T;
    if(!currentLocState) {
        throw new Error("No current LOC state available");
    }
    return currentLocState;
}

function inspectState(locState: LocRequestState): {
    api: LogionNodeApi,
    data: LocData,
    axios: AxiosInstance,
} {
    const client = locState.locsState().client;
    const api = client.nodeApi;
    const data = locState.data();
    const axios = buildAxios(locState);
    return { api, data, axios };
}

export async function deleteLink(params: {
    locState: EditableRequest,
    target: UUID,
}): Promise<EditableRequest> {
    const { locState, target } = params;
    const currentLocState = getCurrent(locState);
    const { data, axios } = inspectState(currentLocState);
    await axios.delete(`/api/loc-request/${ data.id.toString() }/links/${target}`);
    return await getCurrent(currentLocState).refresh() as EditableRequest;
}

function buildAxios(locState: LocRequestState) {
    const client = locState.locsState().client;
    return buildAxiosWithClient(client, locState.data().ownerAddress);
}

function buildAxiosWithClient(client: LogionClient, legalOfficerAddress: string) {
    return client.buildAxios(getLegalOfficer(client, legalOfficerAddress));
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

    const currentLocState = getCurrent(locState);
    const { data, axios, api } = inspectState(currentLocState);
    const submittable = nodeApiAddLink({
        locId: data.id,
        api,
        target,
        nature,
    });
    await signer.signAndSend({
        signerId: data.ownerAddress,
        submittable,
        callback
    });

    await axios.put(`/api/loc-request/${ data.id.toString() }/links/${ target.toString() }/confirm`);

    return await getCurrent(currentLocState).refresh() as EditableRequest;
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

    const currentLocState = getCurrent(locState);
    const { data, axios, api } = inspectState(currentLocState);

    const submittable = nodeApiAddFile({
        locId: data.id,
        api,
        hash,
        nature,
        submitter,
    });
    await signer.signAndSend({
        signerId: data.ownerAddress,
        submittable,
        callback
    });
    await axios.put(`/api/loc-request/${ data.id.toString() }/files/${ hash }/confirm`);

    return await getCurrent(currentLocState).refresh() as EditableRequest;
}

export async function publishMetadata(params: {
    locState: EditableRequest,
    item: MetadataItem,
    signer: Signer,
    callback: SignCallback,
}): Promise<EditableRequest> {
    const { locState, item, signer, callback } = params;

    const currentLocState = getCurrent(locState);
    const { data, axios, api } = inspectState(currentLocState);
    const submittable = nodeApiAddMetadata({
        locId: data.id,
        api,
        item,
    });
    await signer.signAndSend({
        signerId: data.ownerAddress,
        submittable,
        callback
    });

    await axios.put(`/api/loc-request/${ data.id.toString() }/metadata/${ encodeURIComponent(item.name) }/confirm`);

    return await getCurrent(locState).refresh() as EditableRequest;
}

export async function closeLoc(params: {
    locState: OpenLoc,
    signer: Signer,
    callback: SignCallback,
}): Promise<ClosedLoc | ClosedCollectionLoc> {
    const { locState, signer, callback } = params;

    const currentLocState = getCurrent(locState);
    const { data, axios, api } = inspectState(currentLocState);

    const seal = data.seal;
    const submittable = nodeApiCloseLoc({
        locId: data.id,
        api,
        seal,
    });
    const signerId = data.ownerAddress;
    await signer.signAndSend({
        signerId,
        submittable,
        callback
    });

    await axios.post(`/api/loc-request/${ data.id.toString() }/close`);

    return await getCurrent(currentLocState).refresh() as ClosedLoc | ClosedCollectionLoc;
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

    const currentLocState = getCurrent(locState);
    const { data, axios, api } = inspectState(currentLocState);
    const submittable = nodeApiVoidLoc({
        locId: data.id,
        api,
        voidInfo,
    });
    await signer.signAndSend({
        signerId: data.ownerAddress,
        submittable,
        callback
    });

    const reason = voidInfo.reason;
    await axios.post(`/api/loc-request/${ data.id.toString() }/void`, {
        reason
    });

    return await getCurrent(currentLocState).refresh() as VoidedLoc | VoidedCollectionLoc;
}

export async function setVerifiedThirdParty(params: {
    locState: ClosedLoc,
    isVerifiedThirdParty: boolean,
    signer: Signer,
    callback: SignCallback,
}): Promise<ClosedLoc> {
    const { locState, isVerifiedThirdParty, signer, callback } = params;
    const currentLocState = getCurrent(locState);
    const { data, api } = inspectState(currentLocState);

    if(!data.requesterAddress) {
        throw new Error("Identity LOC has no Polkadot requester");
    }

    let submittable: SubmittableExtrinsic;
    if(isVerifiedThirdParty) {
        submittable = api.tx.logionLoc.nominateIssuer(data.requesterAddress, data.id.toDecimalString());
    } else {
        submittable = api.tx.logionLoc.dismissIssuer(data.requesterAddress);
    }
    await signer.signAndSend({
        signerId: data.ownerAddress,
        submittable,
        callback
    });

    return await getCurrent(currentLocState).refresh() as ClosedLoc;
}

export type VerifiedThirdPartyWithSelect = VerifiedThirdParty & { selected: boolean };

export async function getVerifiedThirdPartySelections(params: { locState: OpenLoc } ): Promise<VerifiedThirdPartyWithSelect[]> {
    const { locState } = params
    const currentLocState = getCurrent(locState);
    const { data, axios } = inspectState(currentLocState);

    const allVerifiedThirdParties: VerifiedIssuerIdentity[] = (await axios.get("/api/issuers-identity")).data.issuers;
    const selectedParties = data.selectedParties;

    return allVerifiedThirdParties
        .filter(vtp => vtp.address !== data.requesterAddress)
        .map(vtp => {
            const selected = selectedParties.find(selectedParty => selectedParty.address === vtp.address);
            if(selected) {
                return {
                    firstName: selected.firstName,
                    lastName: selected.lastName,
                    identityLocId: selected.identityLocId,
                    address: selected.address,
                    selected: true,
                };
            } else {
                return {
                    firstName: vtp.identity.firstName,
                    lastName: vtp.identity.lastName,
                    identityLocId: vtp.identityLocId,
                    address: vtp.address,
                    selected: false,
                };
            }
        })
        .sort((vtp1, vtp2) => vtp1.lastName.localeCompare(vtp2.lastName));
}

export interface SelectPartiesParams {
    locState: OpenLoc;
    issuer: string;
    signer: Signer;
    callback: SignCallback;
}

export async function selectParties(params: SelectPartiesParams): Promise<void> {
    return setIssuerSelection({
        ...params,
        selected: true,
    });
}

async function setIssuerSelection(params: SelectPartiesParams & { selected: boolean }): Promise<void> {
    const { locState, issuer, signer, callback, selected } = params;
    const currentLocState = getCurrent(locState);
    const { data, api } = inspectState(currentLocState);
    const submittable = api.tx.logionLoc.setIssuerSelection(data.id.toDecimalString(), issuer, selected);
    await signer.signAndSend({
        signerId: data.ownerAddress,
        submittable,
        callback
    });
}

export async function unselectParties(params: SelectPartiesParams): Promise<void> {
    return setIssuerSelection({
        ...params,
        selected: false,
    });
}

export async function requestVote(params: {
    locState: ClosedLoc | ClosedCollectionLoc,
    signer: Signer,
    callback: SignCallback,
}): Promise<string> {
    const { locState, signer, callback } = params;

    const currentLocState = getCurrent(locState);
    const { data, api } = inspectState(currentLocState);
    const submittable = api.tx.vote.createVoteForAllLegalOfficers(data.id.toDecimalString());
    const result = await signer.signAndSend({
        signerId: data.ownerAddress,
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

interface BackendVote {
    voteId: string;
    createdOn: string;
    locId: string;
    status?: "PENDING" | "APPROVED" | "REJECTED";
    ballots?: {
        [key: string]: ("Yes" | "No") | undefined;
    };
}

export type VoteResult = "Yes" | "No";

export interface Vote {
    voteId: string;
    createdOn: string;
    locId: UUID;
    status: "PENDING" | "APPROVED" | "REJECTED";
    ballots: {
        [key: string]: (VoteResult | undefined);
    };
}

export async function getVotes(client: LogionClient): Promise<Vote[]> {
    const currentAddress = client.currentAddress;
    if(!currentAddress) {
        throw new Error("Not authenticated");
    }
    const axios = buildAxiosWithClient(client, client.currentAddress);
    const response = await axios.get(`/api/vote/${ currentAddress }`);
    const votes: BackendVote[] = response.data.votes;
    return votes.map(backendVote => ({
        ...backendVote,
        locId: new UUID(backendVote.locId),
        status: backendVote.status || "PENDING",
        ballots: backendVote.ballots || {},
    })).sort((v1, v2) => v2.voteId.localeCompare(v1.voteId));
}

export async function vote(params: {
    client: LogionClient,
    vote: Vote,
    myVote: VoteResult,
    signer: Signer,
    callback: SignCallback,
}): Promise<Vote> {
    const { client, vote, myVote, signer, callback } = params;

    const currentAddress = client.currentAddress;
    if(!currentAddress) {
        throw Error("Not authenticated");
    }
    const api = client.nodeApi;
    const submittable = api.tx.vote.vote(vote.voteId, myVote === "Yes");
    const result = await signer.signAndSend({
        signerId: currentAddress,
        submittable,
        callback
    });
    const voteUpdated = result.events.find(event => event.name === "VoteUpdated" && event.section === "vote");
    if(!voteUpdated) {
        throw new Error("Unable to retrieve vote ID");
    }
    const ballots = vote.ballots;
    ballots[currentAddress] = myVote;
    return {
        ...vote,
        ballots
    };
}

export async function setCollectionFileRestrictedDelivery(params: {
    locState: LocRequestState,
    hash: string,
    restrictedDelivery: boolean,
}): Promise<LocRequestState> {
    const { locState, hash, restrictedDelivery } = params;

    const axios = buildAxios(locState);
    await axios.put(`/api/collection/${ locState.data().id.toString() }/files/${ hash }`, {
        restrictedDelivery
    });

    return locState.refresh();
}
