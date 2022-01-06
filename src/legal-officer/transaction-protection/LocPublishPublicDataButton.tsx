import { useLocContext } from "./LocContext";
import { LocItem } from "./types";
import LocPublishButton from "./LocPublishButton";

export interface Props {
    locItem: LocItem;
}

export default function LocPublishPublicDataButton(props: Props) {
    const { publishMetadata, confirmMetadata } = useLocContext();

    return (
        <LocPublishButton
            locItem={ props.locItem }
            confirm={ confirmMetadata }
            signAndSubmitFactory={ publishMetadata }
            itemType="Public Data"
        />
    )
}
