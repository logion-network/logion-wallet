import { OpenLoc } from "@logion/client";
import { UUID, Hash } from "@logion/node-api";

import { LocItem } from "./LocItem";
import LocPublishButton from "./LocPublishButton";
import { useLogionChain } from "src/logion-chain";
import { useLocContext } from "./LocContext";
import { useCallback } from "react";

export interface Props {
    locId: UUID;
    locItem: LocItem;
}

export default function LocPublishPublicDataButton(props: Props) {
    const { signer, client } = useLogionChain();
    const { locState } = useLocContext();
    const estimateFees = useCallback((nameHash: Hash | undefined) => {
        if (nameHash && locState instanceof OpenLoc) {
            return locState.estimateFeesPublishMetadata({ nameHash });
        } else {
            throw Error("Invalid type");
        }
    }, [ locState ])

    if(!client) {
        return null;
    }

    return (
        <LocPublishButton
            locItem={ props.locItem }
            publishMutator={ async (current, callback) => {
                if(current instanceof OpenLoc
                    && props.locItem.submitter) {

                    return current.publishMetadata({
                        nameHash: props.locItem.metadataData().nameHash,
                        signer: signer!,
                        callback,
                    });
                } else {
                    return current;
                }
            }}
            feesEstimator={ () => estimateFees(props.locItem.metadataData().nameHash) }
            itemType="Public Data"
        />
    )
}
