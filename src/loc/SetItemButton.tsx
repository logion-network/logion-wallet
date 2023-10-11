import { useLocContext } from "./LocContext";
import { LocItem } from "./LocItem";
import LocLinkButton from "./LocLinkButton";
import { LocPrivateFileButton } from "./LocPrivateFileButton";
import { LocPublicDataButton } from "./LocPublicDataButton";

export interface Props {
    item: LocItem;
}

export default function SetItemButton(props: Props) {
    const { loc } = useLocContext();

    if(!loc) {
        return null;
    } else if(props.item.type === "Data") {
        return <LocPublicDataButton text="Set" dataName={ props.item.title() } />;
    } else if(props.item.type === "Document") {
        return <LocPrivateFileButton text="Set" nature={ props.item.title() } />;
    } else if(props.item.type === "Linked LOC") {
        return <LocLinkButton text="Set" nature={ props.item.title() } />;
    } else {
        return null;
    }
}
