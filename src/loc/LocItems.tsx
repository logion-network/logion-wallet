import Table, { EmptyTableMessage, ActionCell, Column } from "../common/Table";
import ButtonGroup from "../common/ButtonGroup";
import Button from "../common/Button";
import { Child } from "../common/types/Helpers";
import Icon from "../common/Icon";
import { useResponsiveContext } from "../common/Responsive";
import { useLogionChain } from "../logion-chain";

import { ContributionMode } from "./types";
import LocPublishLinkButton from "./LocPublishLinkButton";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";

import './LocItems.css';
import { Viewer } from "src/common/CommonContext";
import { useLocContext } from "./LocContext";
import { buildItemTableColumns, LocItem, useDeleteMetadataCallback, useDeleteFileCallback, canDelete, canPublish, useDeleteLinkCallback } from "./LocItem";

export interface LocItemsProps {
    matchedHash?: string;
    viewer: Viewer;
    contributionMode?: ContributionMode;
    locItems: LocItem[];
    isEmpty: boolean;
    hideHeader?: boolean;
}

export function LocItems(props: LocItemsProps) {
    const { locItems } = props;
    const { mutateLocState, loc } = useLocContext();
    const { accounts } = useLogionChain();
    const { width } = useResponsiveContext();
    const deleteMetadata = useDeleteMetadataCallback(mutateLocState);
    const deleteFile = useDeleteFileCallback(mutateLocState);
    const deleteLinkCallback = useDeleteLinkCallback(mutateLocState);

    if(!loc) {
        return null;
    }

    interface DeleteButtonProps {
        locItem: LocItem
        action: (locItem: LocItem) => void
    }

    function DeleteButton(props: DeleteButtonProps) {
        const { locItem, action } = props
        return (
            <Button
                variant="danger-flat"
                onClick={ () => action(locItem) }
                data-testid={ `remove-${ locItem.type }-${ locItem.name }` }
            >
                <Icon icon={ { id: 'trash' } } />
            </Button>
        );
    }

    function renderActions(locItem: LocItem): Child {
        return (
            <ActionCell>
                { locItem.type === 'Data' && <ButtonGroup>
                    { canPublish(props.viewer, loc!) && <LocPublishPublicDataButton locItem={ locItem } /> }
                    { canDelete(accounts?.current?.address, locItem, props.viewer, loc!) &&
                        <DeleteButton locItem={ locItem } action={ deleteMetadata } /> }
                </ButtonGroup> }
                { locItem.type === 'Linked LOC' && <ButtonGroup>
                    { canPublish(props.viewer, loc!) && <LocPublishLinkButton locItem={ locItem } /> }
                    { canDelete(accounts?.current?.address, locItem, props.viewer, loc!) &&
                        <DeleteButton locItem={ locItem } action={ deleteLinkCallback } /> }
                </ButtonGroup> }
                { locItem.type === 'Document' && <ButtonGroup>
                    { canPublish(props.viewer, loc!) && <LocPublishPrivateFileButton locItem={ locItem } /> }
                    { canDelete(accounts?.current?.address, locItem, props.viewer, loc!) &&
                        <DeleteButton locItem={ locItem } action={ deleteFile } /> }
                </ButtonGroup> }
            </ActionCell>)
    }

    if (props.isEmpty && !loc.closed) {
        return (
            <div className="LocItems empty-loc">
                <img alt="empty loc" src={ process.env.PUBLIC_URL + "/assets/empty-loc.svg" } />
                <p className="primary">This LOC is empty.</p>
                <p className="secondary">You can add public data and/or confidential documents.</p>
            </div>
        );
    } else {
        let columns: Column<LocItem>[] = buildItemTableColumns({
            contributionMode: props.contributionMode,
            currentAddress: accounts?.current?.address,
            viewer: props.viewer,
            loc,
            renderActions,
            width,
        });
        return (
            <div className="LocItems">
                <Table
                    data={ locItems }
                    columns={ columns }
                    renderEmpty={ () => <EmptyTableMessage>No custom public data nor private documents</EmptyTableMessage> }
                    rowStyle={ item => (item.type === "Document" && item.value === props.matchedHash) ? "matched" : "" }
                    hideHeader={ props.hideHeader }
                />
            </div>
        );
    }
}
