import { useLocContext } from "./LocContext";
import { FileItem, LinkItem, LocItem, MetadataItem } from "./LocItem";
import LocPublishLinkButton from "./LocPublishLinkButton";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";

export interface Props {
    item: LocItem;
}

export default function PublishItemButton(props: Props) {
    const { loc } = useLocContext();

    if(!loc) {
        return null;
    } else if(props.item.type === "Data") {
        return <LocPublishPublicDataButton locItem={ props.item as MetadataItem } locId={ loc.id } />;
    } else if(props.item.type === "Document") {
        return <LocPublishPrivateFileButton locItem={ props.item as FileItem } locId={ loc.id } />;
    } else if(props.item.type === "Linked LOC") {
        return <LocPublishLinkButton locItem={ props.item as LinkItem } locId={ loc.id } />;
    } else {
        return null;
    }
}
