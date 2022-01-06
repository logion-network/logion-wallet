import { useLocContext } from "./LocContext";
import { LocItem } from "./types";
import LocPublishButton from "./LocPublishButton";

export interface Props {
    locItem: LocItem;
}

export default function LocPublishPrivateFileButton(props: Props) {
    const { publishFile, confirmFile } = useLocContext();

    return (
        <LocPublishButton
            locItem={ props.locItem }
            confirm={ confirmFile }
            signAndSubmitFactory={ publishFile }
            itemType="Document"
        />
    )
}
