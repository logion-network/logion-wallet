import { EditableRequest } from "@logion/client";

import { LocItem } from "./LocItem";
import LocPublishButton from "./LocPublishButton";
import { publishFile } from "src/legal-officer/client";
import { useLogionChain } from "src/logion-chain";

export interface Props {
    locItem: LocItem;
}

export default function LocPublishPrivateFileButton(props: Props) {
    const { signer } = useLogionChain();

    return (
        <LocPublishButton
            locItem={ props.locItem }
            publishMutator={ async (current, callback) => {
                if(current instanceof EditableRequest) {
                    return await publishFile({
                        locState: current,
                        hash: props.locItem.value,
                        nature: props.locItem.nature!,
                        submitter: props.locItem.submitter,
                        signer: signer!,
                        callback,
                    });
                } else {
                    return current;
                }
            }}
            itemType="Document"
        />
    )
}
