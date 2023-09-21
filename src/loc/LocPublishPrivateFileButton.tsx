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

export default function LocPublishPrivateFileButton(props: Props) {
    const { signer, client } = useLogionChain();
    const { locState } = useLocContext();
    const estimateFees = useCallback((hash: Hash | undefined) => {
        if (hash && locState instanceof OpenLoc) {
            return locState.estimateFeesPublishFile({ hash });
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
                if(current instanceof OpenLoc) {

                    return current.publishFile({
                        hash: props.locItem.fileData().hash,
                        signer: signer!,
                        callback,
                    });
                } else {
                    return current;
                }
            }}
            feesEstimator={ () => estimateFees(props.locItem.fileData().hash) }
            itemType="Document"
        />
    )
}
