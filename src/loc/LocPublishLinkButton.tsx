import { EditableRequest } from "@logion/client";

import { LocItem } from "./LocItem";
import LocPublishButton from "./LocPublishButton";
import { publishLink } from "src/legal-officer/client";
import { useLogionChain } from "src/logion-chain";

export interface Props {
    locItem: LocItem;
}

export default function LocPublishLinkButton(props: Props) {
    const { signer } = useLogionChain();

    return (
        <LocPublishButton
            locItem={ props.locItem }
            publishMutator={ async (current, callback) => {
                if(current instanceof EditableRequest) {
                    return await publishLink({
                        locState: current,
                        target: props.locItem.target!,
                        nature: props.locItem.nature!,
                        signer: signer!,
                        callback,
                    });
                } else {
                    return current;
                }
            }}
            itemType="Link"
        />
    )
}
