import { OpenLoc } from "@logion/client";
import { UUID, Fees, Lgnt } from "@logion/node-api";

import { LinkItem } from "./LocItem";
import LocPublishButton from "./LocPublishButton";
import { useLogionChain } from "src/logion-chain";
import { useLocContext } from "./LocContext";
import { useCallback } from "react";

export interface Props {
    locId: UUID;
    locItem: LinkItem;
}

export default function LocPublishLinkButton(props: Props) {
    const { signer } = useLogionChain();
    const { locState } = useLocContext();
    const estimateFees = useCallback(async (target: UUID | undefined) => {
        if (target && locState instanceof OpenLoc) {
            return locState.estimateFeesPublishLink({ target });
        } else {
            return new Fees({ inclusionFee: Lgnt.zero() });
        }
    }, [ locState ]);

    return (
        <LocPublishButton
            locItem={ props.locItem }
            publishMutator={ async (current, callback) => {
                if(current instanceof OpenLoc) {
                    return current.publishLink({
                        payload: {
                            target: props.locItem.data().linkedLoc.id,
                        },
                        signer: signer!,
                        callback,
                    });
                } else {
                    return current;
                }
            }}
            feesEstimator={ () => estimateFees(props.locItem.data().linkedLoc.id) }
            itemType="Link"
        />
    )
}
