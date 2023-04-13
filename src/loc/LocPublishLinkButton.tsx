import { EditableRequest } from "@logion/client";
import { addLink, UUID } from "@logion/node-api";

import { LocItem } from "./LocItem";
import LocPublishButton from "./LocPublishButton";
import { publishLink } from "src/legal-officer/client";
import { useLogionChain } from "src/logion-chain";

export interface Props {
    locId: UUID;
    locItem: LocItem;
}

export default function LocPublishLinkButton(props: Props) {
    const { signer, client } = useLogionChain();

    if(!client) {
        return null;
    }

    return (
        <LocPublishButton
            locItem={ props.locItem }
            publishMutator={ async (current, callback) => {
                if(current instanceof EditableRequest) {
                    return await publishLink({
                        locState: current,
                        target: props.locItem.target!,
                        nature: props.locItem.nature!,
                        signer: signer!,
                        callback,
                    });
                } else {
                    return current;
                }
            }}
            feesEstimator={ () => client.public.fees.estimateWithoutStorage({
                origin: client.currentAddress?.address || "",
                submittable: addLink({
                    api: client.nodeApi,
                    locId: props.locId,
                    nature: props.locItem.nature || "",
                    target: props.locItem.target || new UUID(),
                })
            }) }
            itemType="Link"
        />
    )
}
