import { EditableRequest } from "@logion/client";

import { LocItem } from "./LocItem";
import LocPublishButton from "./LocPublishButton";
import { publishMetadata } from "src/legal-officer/client";
import { useLogionChain } from "src/logion-chain";

export interface Props {
    locItem: LocItem;
}

export default function LocPublishPublicDataButton(props: Props) {
    const { signer } = useLogionChain();

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
            itemType="Public Data"
        />
    )
}
