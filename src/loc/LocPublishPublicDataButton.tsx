import { OpenLoc } from "@logion/client";
import { UUID, Hash } from "@logion/node-api";

import { LocItem } from "./LocItem";
import LocPublishButton from "./LocPublishButton";
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
                if(current instanceof OpenLoc
                    && props.locItem.name
                    && props.locItem.value
                    && props.locItem.submitter) {

                    return current.publishMetadata({
                        nameHash: props.locItem.hash!,
                        signer: signer!,
                        callback,
                    });
                } else {
                    return current;
                }
            }}
            feesEstimator={ () => client.public.fees.estimateWithoutStorage({
                origin: client.currentAddress?.address || "",
                submittable: client.logionApi.polkadot.tx.logionLoc.addMetadata(
                    client.logionApi.adapters.toLocId(props.locId),
                    client.logionApi.adapters.toPalletLogionLocMetadataItem({
                        name: props.locItem.hash!,
                        value: Hash.of(props.locItem.value || ""),
                        submitter: props.locItem.submitter!,
                    }),
                ),
            }) }
            itemType="Public Data"
        />
    )
}
