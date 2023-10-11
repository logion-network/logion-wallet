import Button from "src/common/Button";
import InlineIconText from "src/common/InlineIconText";
import { useLocContext } from "./LocContext";
import { LocItem, useDeleteFileCallback, useDeleteLinkCallback, useDeleteMetadataCallback } from "./LocItem";
import { useCallback } from "react";

export interface Props {
    item: LocItem;
}

export default function ClearItemButton(props: Props) {
    const { mutateLocState } = useLocContext();
    const deleteMetadata = useDeleteMetadataCallback(mutateLocState);
    const deleteFile = useDeleteFileCallback(mutateLocState);
    const deleteLink = useDeleteLinkCallback(mutateLocState);

    const clearItem = useCallback(() => {
        if(props.item.type === "Data") {
            deleteMetadata(props.item);
        } else if(props.item.type === "Document") {
            deleteFile(props.item);
        } else if(props.item.type === "Linked LOC") {
            deleteLink(props.item);
        }
    }, [ deleteMetadata, deleteFile, deleteLink, props.item ]);

    return (
        <Button
            onClick={ clearItem }
        >
            <InlineIconText icon={ { id: "clear", hasVariants: true } } height="19px" colorThemeType="dark" text="Clear"/>
        </Button>
    );
}
