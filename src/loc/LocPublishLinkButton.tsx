import { OpenLoc, hashString } from "@logion/client";
import { UUID, Adapters } from "@logion/node-api";

import { LocItem } from "./LocItem";
import LocPublishButton from "./LocPublishButton";
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
                if(current instanceof OpenLoc) {
                    return current.legalOfficer.publishLink({
                        target: props.locItem.target!,
                        signer: signer!,
                        callback,
                    });
                } else {
                    return current;
                }
            }}
            feesEstimator={ () => client.public.fees.estimateWithoutStorage({
                origin: client.currentAddress?.address || "",
                submittable: client.logionApi.polkadot.tx.logionLoc.addLink(
                    client.logionApi.adapters.toLocId(props.locId),
                    Adapters.toLocLink({
                        nature: hashString(props.locItem.nature || ""),
                        target: props.locItem.target || new UUID(),
                    }),
                ),
            }) }
            itemType="Link"
        />
    )
}
