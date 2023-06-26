import { LocRequestState } from "@logion/client";

function buildAxios(locState: LocRequestState) {
    const client = locState.locsState().client;
    const legalOfficer = client.getLegalOfficer(locState.data().ownerAddress);
    return legalOfficer.buildAxiosToNode();
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
