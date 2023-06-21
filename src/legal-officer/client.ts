import {
    Signer,
    SignCallback,
    LocRequestState,
    OpenLoc,
    ClosedLoc,
    ClosedCollectionLoc,
    VerifiedIssuer,
    LogionClient,
    LocData,
    VerifiedIssuerIdentity,
} from "@logion/client";
import {
    Adapters,
    UUID,
    LogionNodeApiClass,
} from "@logion/node-api";
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { AnyJson } from "@polkadot/types-codec/types/helpers.js";
import { AxiosInstance } from "axios";

function getCurrent<T extends LocRequestState>(locState: LocRequestState): T {
    const currentLocState = locState.getCurrentState() as T;
    if(!currentLocState) {
        throw new Error("No current LOC state available");
    }
    return currentLocState;
}

function inspectState(locState: LocRequestState): {
    api: LogionNodeApiClass,
    data: LocData,
    axios: AxiosInstance,
} {
    const client = locState.locsState().client;
    const api = client.logionApi;
    const data = locState.data();
    const axios = buildAxios(locState);
    return { api, data, axios };
}

function buildAxios(locState: LocRequestState) {
    const client = locState.locsState().client;
    const legalOfficer = client.getLegalOfficer(locState.data().ownerAddress);
    return legalOfficer.buildAxiosToNode();
}

export async function setVerifiedIssuer(params: {
    locState: ClosedLoc,
    isVerifiedIssuer: boolean,
    signer: Signer,
    callback: SignCallback,
}): Promise<ClosedLoc> {
    const { locState, isVerifiedIssuer, signer, callback } = params;
    const currentLocState = getCurrent(locState);
    const { data, api } = inspectState(currentLocState);

    if(!data.requesterAddress) {
        throw new Error("Identity LOC has no Polkadot requester");
    }

    let submittable: SubmittableExtrinsic;
    if(isVerifiedIssuer) {
        submittable = api.polkadot.tx.logionLoc.nominateIssuer(
            data.requesterAddress.address,
            api.adapters.toLocId(data.id)
        );
    } else {
        submittable = api.polkadot.tx.logionLoc.dismissIssuer(data.requesterAddress.address);
    }
    await signer.signAndSend({
        signerId: data.ownerAddress,
        submittable,
        callback
    });

    return await getCurrent(currentLocState).refresh() as ClosedLoc;
}

export type VerifiedIssuerWithSelect = VerifiedIssuer & { selected: boolean };

export type LocWithSelectableIssuers = OpenLoc | ClosedCollectionLoc;

export async function getVerifiedIssuerSelections(params: { locState: LocWithSelectableIssuers } ): Promise<VerifiedIssuerWithSelect[]> {
    const { locState } = params
    const currentLocState = getCurrent(locState);
    const { data, axios } = inspectState(currentLocState);

    const allVerifiedIssuers: VerifiedIssuerIdentity[] = (await axios.get("/api/issuers-identity")).data.issuers;
    const selectedParties = data.issuers;

    return allVerifiedIssuers
        .filter(issuer => issuer.address !== data.requesterAddress?.address)
        .map(issuer => {
            const selected = selectedParties.find(selectedIssuer => selectedIssuer.address === issuer.address);
            if(selected && selected.firstName && selected.lastName) {
                return {
                    firstName: selected.firstName,
                    lastName: selected.lastName,
                    identityLocId: selected.identityLocId,
                    address: selected.address,
                    selected: true,
                };
            } else {
                return {
                    firstName: issuer.identity.firstName,
                    lastName: issuer.identity.lastName,
                    identityLocId: issuer.identityLocId,
                    address: issuer.address,
                    selected: selected !== undefined,
                };
            }
        })
        .sort((issuer1, issuer2) => issuer1.lastName.localeCompare(issuer2.lastName));
}

export interface SelectIssuersParams {
    locState: LocWithSelectableIssuers;
    issuer: string;
    signer: Signer;
    callback: SignCallback;
}

export async function selectParties(params: SelectIssuersParams): Promise<void> {
    return setIssuerSelection({
        ...params,
        selected: true,
    });
}

async function setIssuerSelection(params: SelectIssuersParams & { selected: boolean }): Promise<void> {
    const { locState, issuer, signer, callback, selected } = params;
    const currentLocState = getCurrent(locState);
    const { data, api } = inspectState(currentLocState);
    const submittable = api.polkadot.tx.logionLoc.setIssuerSelection(
        api.adapters.toLocId(data.id),
        issuer,
        selected
    );
    await signer.signAndSend({
        signerId: data.ownerAddress,
        submittable,
        callback
    });
}

export async function unselectIssuers(params: SelectIssuersParams): Promise<void> {
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
    const submittable = api.polkadot.tx.vote.createVoteForAllLegalOfficers(api.adapters.toLocId(data.id));
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
    return Adapters.asString(voteCreatedData[0]);
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
    const axios = client.getLegalOfficer(currentAddress.address).buildAxiosToNode();
    const response = await axios.get(`/api/vote/${ currentAddress.address }`);
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
    const api = client.logionApi;
    const submittable = api.polkadot.tx.vote.vote(
        vote.voteId,
        myVote === "Yes"
    );
    const result = await signer.signAndSend({
        signerId: currentAddress.address,
        submittable,
        callback
    });
    const voteUpdated = result.events.find(event => event.name === "VoteUpdated" && event.section === "vote");
    if(!voteUpdated) {
        throw new Error("Unable to retrieve vote ID");
    }
    const ballots = vote.ballots;
    ballots[currentAddress.address] = myVote;
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
