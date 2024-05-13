import { OpenLoc } from "@logion/client";
import { UUID, Hash, Fees, Lgnt } from "@logion/node-api";

import { FileItem } from "./LocItem";
import LocPublishButton from "./LocPublishButton";
import { useLogionChain } from "src/logion-chain";
import { useLocContext } from "./LocContext";
import { useCallback } from "react";

export interface Props {
    locId: UUID;
    locItem: FileItem;
}

export default function LocPublishPrivateFileButton(props: Props) {
    const { signer, client } = useLogionChain();
    const { locState } = useLocContext();
    const estimateFees = useCallback(async (hash: Hash | undefined) => {
        if (hash && locState instanceof OpenLoc) {
            return locState.estimateFeesPublishFile({ hash });
        } else {
            return new Fees({ inclusionFee: Lgnt.zero() });
        }
    }, [ locState ])

    if(!client) {
        return null;
    }

    return (
        <LocPublishButton
            locItem={ props.locItem }
            publishMutator={ async (current, callback) => {
                if(current instanceof OpenLoc) {

                    return current.publishFile({
                        payload: {
                            hash: props.locItem.data().hash,
                        },
                        signer: signer!,
                        callback,
                    });
                } else {
                    return current;
                }
            }}
            feesEstimator={ () => estimateFees(props.locItem.data().hash) }
            itemType="Document"
        />
    )
}
