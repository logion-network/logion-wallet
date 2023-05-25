import { OpenLoc } from "@logion/client";
import { UUID } from "@logion/node-api";

import { LocItem } from "./LocItem";
import LocPublishButton from "./LocPublishButton";
import { useLogionChain } from "src/logion-chain";

export interface Props {
    locId: UUID;
    locItem: LocItem;
}

export default function LocPublishPrivateFileButton(props: Props) {
    const { signer, client } = useLogionChain();

    if(!client) {
        return null;
    }

    return (
        <LocPublishButton
            locItem={ props.locItem }
            publishMutator={ async (current, callback) => {
                if(current instanceof OpenLoc
                    && props.locItem.value
                    && props.locItem.submitter) {

                    return current.publishFile({
                        hash: props.locItem.value,
                        signer: signer!,
                        callback,
                    });
                } else {
                    return current;
                }
            }}
            feesEstimator={ () => client.public.fees.estimateAddFile({
                locId: props.locId,
                hash: props.locItem.value || "",
                nature: props.locItem.nature || "",
                submitter: props.locItem.submitter!,
                size: props.locItem.size!,
                origin: client.currentAddress?.address || "",
            }) }
            itemType="Document"
        />
    )
}
