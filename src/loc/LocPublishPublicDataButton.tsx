import { OpenLoc } from "@logion/client";
import { UUID, Hash, Fees, Lgnt } from "@logion/node-api";

import { MetadataItem } from "./LocItem";
import LocPublishButton from "./LocPublishButton";
import { useLogionChain } from "src/logion-chain";
import { useLocContext } from "./LocContext";
import { useCallback } from "react";

export interface Props {
    locId: UUID;
    locItem: MetadataItem;
}

export default function LocPublishPublicDataButton(props: Props) {
    const { signer } = useLogionChain();
    const { locState } = useLocContext();
    const estimateFees = useCallback(async (nameHash: Hash | undefined) => {
        if (nameHash && locState instanceof OpenLoc) {
            return locState.estimateFeesPublishMetadata({ nameHash });
        } else {
            return new Fees({ inclusionFee: Lgnt.zero() });
        }
    }, [ locState ]);

    return (
        <LocPublishButton
            locItem={ props.locItem }
            publishMutator={ async (current, callback) => {
                if(current instanceof OpenLoc
                    && props.locItem.submitter) {

                    return current.publishMetadata({
                        payload: {
                            nameHash: props.locItem.data().name.hash,
                        },
                        signer: signer!,
                        callback,
                    });
                } else {
                    return current;
                }
            }}
            feesEstimator={ () => estimateFees(props.locItem.data().name.hash) }
            itemType="Public Data"
        />
    )
}
