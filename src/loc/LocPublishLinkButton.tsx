import { OpenLoc } from "@logion/client";
import { UUID } from "@logion/node-api";

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
    const { signer, client } = useLogionChain();
    const { locState } = useLocContext();
    const estimateFees = useCallback((target: UUID | undefined) => {
        if (target && locState instanceof OpenLoc) {
            return locState.legalOfficer.estimateFeesPublishLink({ target });
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
                    return current.legalOfficer.publishLink({
                        target: props.locItem.data().linkedLoc.id,
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
