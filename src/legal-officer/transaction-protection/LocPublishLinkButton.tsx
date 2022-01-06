import { useLocContext } from "./LocContext";
import { LocItem } from "./types";
import LocPublishButton from "./LocPublishButton";

export interface Props {
    locItem: LocItem;
}

export default function LocPublishLinkButton(props: Props) {
    const { publishLink, confirmLink } = useLocContext();

    return (
        <LocPublishButton
            locItem={ props.locItem }
            confirm={ confirmLink }
            signAndSubmitFactory={ publishLink }
            itemType="Link"
        />
    )
}
