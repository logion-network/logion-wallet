import { UUID, Hash } from "@logion/node-api";
import Table, { EmptyTableMessage, Column } from "../common/Table";
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
import { Viewer, useCommonContext } from "src/common/CommonContext";
import { useLocContext } from "./LocContext";
import { buildItemTableColumns, LocItem, useDeleteMetadataCallback, useDeleteFileCallback, canDelete, canPublish, useDeleteLinkCallback, useRequestReviewCallback, canReview, canRequestReview } from "./LocItem";
import StatusCell from "src/common/StatusCell";
import { POLKADOT } from "src/common/ColorTheme";
import AcknowledgeButton from "./AcknowledgeButton";
import ReviewItemButtons from "./ReviewItemButtons";

export interface LocItemsProps {
    matchedHash?: Hash;
    viewer: Viewer;
    contributionMode?: ContributionMode;
    locItems: LocItem[];
    isEmpty: boolean;
    hideHeader?: boolean;
}

export function LocItems(props: LocItemsProps) {
    const { locItems } = props;
    const { mutateLocState, loc, locState } = useLocContext();
    const { accounts } = useLogionChain();
    const { width } = useResponsiveContext();
    const deleteMetadata = useDeleteMetadataCallback(mutateLocState);
    const deleteFile = useDeleteFileCallback(mutateLocState);
    const deleteLinkCallback = useDeleteLinkCallback(mutateLocState);
    const requestReview = useRequestReviewCallback(mutateLocState);
    const { viewer } = useCommonContext();

    if(!loc || !locState) {
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

    function renderActions(locItem: LocItem, locId: UUID) {
        if(!loc) {
            return null;
        }

        const buttons: Child[] = [];
        let key = 0;

        if(canRequestReview(viewer, loc, locItem)) {
            buttons.push(<Button key={++key} onClick={ () => requestReview(locItem) }>Request review</Button>);
        }

        if(canReview(viewer, loc, locItem)) {
            buttons.push(<ReviewItemButtons key={++key} locItem={ locItem }/>);
        }

        if(locItem.type === 'Data') {
            if(canPublish(viewer, accounts?.current?.accountId, loc!, locItem)) {
                buttons.push(<LocPublishPublicDataButton key={++key} locItem={ locItem } locId={ locId } />);
            }
            if(canDelete(accounts?.current?.accountId, locItem, props.viewer, loc!)) {
                buttons.push(<DeleteButton key={++key} locItem={ locItem } action={ deleteMetadata } />);
            }
        } else if(locItem.type === 'Linked LOC') {
            if(canPublish(viewer, accounts?.current?.accountId, loc!, locItem)) {
                buttons.push(<LocPublishLinkButton  key={++key}locItem={ locItem } locId={ locId } />);
            }
            if(canDelete(accounts?.current?.accountId, locItem, props.viewer, loc!)) {
                buttons.push(<DeleteButton key={++key} locItem={ locItem } action={ deleteLinkCallback } />);
            }
        } else if(locItem.type === 'Document') {
            if(canPublish(viewer, accounts?.current?.accountId, loc!, locItem)) {
                buttons.push(<LocPublishPrivateFileButton key={++key} locItem={ locItem } locId={ locId } />);
            }
            if(canDelete(accounts?.current?.accountId, locItem, props.viewer, loc!)) {
                buttons.push(<DeleteButton key={++key} locItem={ locItem } action={ deleteFile } />);
            }
        }

        if(locItem.status === "PUBLISHED" && locItem.type !== "Linked LOC") {
            if(viewer === "User") {
                buttons.push(<StatusCell
                    key={++key}
                    icon={ { id: 'published' } }
                    text="Published"
                    color={ POLKADOT }
                    tooltip="This content is published but needs to be acknowledged by the Legal Officer in charge to be recorded as evidence and thus, visible on the logion public certificate. You will be notified when this action is executed by the Legal Officer."
                    tooltipId={ `published-${locItem.type}-${locItem.name}` }
                />);
            } else {
                buttons.push(<AcknowledgeButton key={++key} locItem={ locItem } locId={ locId } />);
            }
        }

        if(locItem.status === "ACKNOWLEDGED") {
            buttons.push(<StatusCell key={++key} icon={ { id: 'published' } } text="Recorded" color={ POLKADOT } />);
        }

        return (
            <ButtonGroup>
                { buttons }
            </ButtonGroup>
        );
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
            currentAddress: accounts?.current?.accountId.address,
            viewer: props.viewer,
            loc,
            locState,
            renderActions,
            width,
        });
        return (
            <div className="LocItems">
                <Table
                    data={ locItems }
                    columns={ columns }
                    renderEmpty={ () => <EmptyTableMessage>No custom public data nor private documents</EmptyTableMessage> }
                    rowStyle={ item => (item.type === "Document" && item.value === props.matchedHash?.toHex()) ? "matched" : "" }
                    hideHeader={ props.hideHeader }
                />
            </div>
        );
    }
}
