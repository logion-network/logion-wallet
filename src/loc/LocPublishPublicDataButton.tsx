import { EditableRequest } from "@logion/client";
import { addMetadata, UUID } from "@logion/node-api";

import { LocItem } from "./LocItem";
import LocPublishButton from "./LocPublishButton";
import { publishMetadata } from "src/legal-officer/client";
import { useLogionChain } from "src/logion-chain";

export interface Props {
    locId: UUID;
    locItem: LocItem;
}

export default function LocPublishPublicDataButton(props: Props) {
    const { signer, client } = useLogionChain();

    if(!client) {
        return null;
    }

    return (
        <LocPublishButton
            locItem={ props.locItem }
            publishMutator={ async (current, callback) => {
                if(current instanceof EditableRequest
                    && props.locItem.name
                    && props.locItem.value
                    && props.locItem.submitter) {

                    return await publishMetadata({
                        locState: current,
                        item: {
                            name: props.locItem.name,
                            value: props.locItem.value,
                            submitter: props.locItem.submitter,
                        },
                        signer: signer!,
                        callback,
                    });
                } else {
                    return current;
                }
            }}
            feesEstimator={ () => client.public.fees.estimateWithoutStorage({
                origin: client.currentAddress?.address || "",
                submittable: addMetadata({
                    api: client.nodeApi,
                    locId: props.locId,
                    item: {
                        name: props.locItem.name || "",
                        value: props.locItem.value || "",
                        submitter: props.locItem.submitter!,
                    },
                })
            }) }
            itemType="Public Data"
        />
    )
}
