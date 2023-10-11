import Button from "src/common/Button";
import { LocItem, useDeleteFileCallback, useDeleteLinkCallback, useDeleteMetadataCallback } from "./LocItem";
import Icon from "src/common/Icon";
import { useCallback } from "react";
import { useLocContext } from "./LocContext";

export interface Props {
    locItem: LocItem;
}

export default function DeleteButton(props: Props) {
    const { locItem } = props;
    const { mutateLocState } = useLocContext();
    const deleteMetadata = useDeleteMetadataCallback(mutateLocState);
    const deleteFile = useDeleteFileCallback(mutateLocState);
    const deleteLink = useDeleteLinkCallback(mutateLocState);

    const deleteItem = useCallback(() => {
        if(props.locItem.type === "Data") {
            deleteMetadata(props.locItem);
        } else if(props.locItem.type === "Document") {
            deleteFile(props.locItem);
        } else if(props.locItem.type === "Linked LOC") {
            deleteLink(props.locItem);
        }
    }, [ deleteMetadata, deleteFile, deleteLink, props.locItem ]);

    return (
        <Button
            variant="danger-flat"
            onClick={ deleteItem }
            data-testid={ `remove-${ locItem.type }-${ locItem.title() }` }
        >
            <Icon icon={ { id: 'trash' } } />
        </Button>
    );
}
