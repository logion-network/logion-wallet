import { LogionClient, EditableRequest } from "@logion/client";
import { UUID } from "@logion/node-api";

export async function addLink(params: {
    client: LogionClient,
    locState: EditableRequest,
    target: UUID,
    nature: string,
}): Promise<EditableRequest> {
    const { client, locState, target, nature } = params;
    const axios = client.buildAxios(client.legalOfficers.find(legalOfficer => locState.data().ownerAddress === legalOfficer.address)!);
    await axios.post(`/api/loc-request/${ locState.data().id.toString() }/links`, { target: target.toString(), nature })
    return await locState.refresh() as EditableRequest;
}
