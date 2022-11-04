import { EditableRequest, Signer, SignCallback, LocRequestState, OpenLoc, ClosedLoc, ClosedCollectionLoc } from "@logion/client";
import { UUID, addLink as nodeApiAddLink, addFile as nodeApiAddFile, addMetadata as nodeApiAddMetadata, MetadataItem, closeLoc as nodeApiCloseLoc } from "@logion/node-api";

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

function buildAxios(locState: LocRequestState) {
    const client = locState.locsState().client;
    return client.buildAxios(client.legalOfficers.find(legalOfficer => locState.data().ownerAddress === legalOfficer.address)!);
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
    await signer.signAndSend({
        signerId: locState.data().ownerAddress,
        submittable,
        callback
    });

    const axios = buildAxios(locState);
    await axios.post(`/api/loc-request/${ locId.toString() }/close`);

    return await locState.refresh() as ClosedLoc | ClosedCollectionLoc;
}
