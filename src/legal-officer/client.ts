import {
    Signer,
    SignCallback,
    LocRequestState,
    ClosedLoc,
    ClosedCollectionLoc,
    LogionClient,
    LocData,
} from "@logion/client";
import {
    Adapters,
    UUID,
    LogionNodeApiClass,
} from "@logion/node-api";
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
