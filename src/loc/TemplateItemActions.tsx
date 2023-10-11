import { ReactNode, useCallback } from "react";
import { useCommonContext } from "src/common/CommonContext";
import { useLocContext } from "./LocContext";
import { useLogionChain } from "src/logion-chain";
import { FileItem, LinkItem, LocItem, MetadataItem, canAcknowledge, canAdd, canDelete, canPublish, canRequestReview, canReview, useDeleteFileCallback, useDeleteLinkCallback, useDeleteMetadataCallback, useRequestReviewCallback } from "./LocItem";
import Button from "src/common/Button";
import ReviewItemButtons from "./ReviewItemButtons";
import { ContributionMode } from "./types";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";
import LocPublishLinkButton from "./LocPublishLinkButton";
import StatusCell from "src/common/StatusCell";
import { POLKADOT } from "src/common/ColorTheme";
import AcknowledgeButton from "./AcknowledgeButton";
import { LocPublicDataButton } from "./LocPublicDataButton";
import { LocPrivateFileButton } from "./LocPrivateFileButton";
import LocLinkButton from "./LocLinkButton";
import ButtonGroup from "src/common/ButtonGroup";
import ClearItemButton from "./ClearItemButton";

export interface Props {
    item: LocItem;
    contributionMode?: ContributionMode;
}

export default function TemplateItemActions(props: Props) {
    const { item } = props;
    const { viewer } = useCommonContext();
    const { loc, mutateLocState } = useLocContext();
    const { accounts } = useLogionChain();
    const deleteMetadata = useDeleteMetadataCallback(mutateLocState);
    const deleteFile = useDeleteFileCallback(mutateLocState);
    const deleteLink = useDeleteLinkCallback(mutateLocState);
    const requestReview = useRequestReviewCallback(mutateLocState);

    const clearItem = useCallback((item: LocItem) => {
        if(item.type === "Data") {
            deleteMetadata(item);
        } else if(item.type === "Document") {
            deleteFile(item);
        } else if(item.type === "Linked LOC") {
            deleteLink(item);
        }
    }, [ deleteMetadata, deleteFile, deleteLink ]);

    const buttons: ReactNode[] = [];
    let key = 0;
    if(!loc) {
        return null;
    }

    if(item.isSet) {
        if(canRequestReview(viewer, loc, item)) {
            buttons.push(<Button key={++key} onClick={ () => requestReview(item) }>Request review</Button>);
        }

        if(canReview(viewer, loc, item)) {
            buttons.push(<ReviewItemButtons key={++key} locItem={ item }/>);
        }

        if(canPublish(viewer, loc, item, props.contributionMode)) {
            if(item.type === "Data") {
                buttons.push(<LocPublishPublicDataButton key={++key} locItem={ item as MetadataItem } locId={ loc.id } />);
            } else if(item.type === "Document") {
                buttons.push(<LocPublishPrivateFileButton key={++key} locItem={ item as FileItem } locId={ loc.id } />);
            } else if(item.type === "Linked LOC") {
                buttons.push(<LocPublishLinkButton key={++key} locItem={ item as LinkItem } locId={ loc.id } />);
            }
        }

        if(canDelete(accounts?.current?.accountId, item, viewer, loc)) {
            buttons.push(
                <ClearItemButton
                    key={++key}
                    onClick={() => clearItem(item)}
                />
            );
        }

        const acknowledge = canAcknowledge(viewer, loc, item, props.contributionMode);

        if(item.status === "PUBLISHED" && !acknowledge) {
            buttons.push(<StatusCell
                key={++key}
                icon={ { id: 'published' } }
                text="Published"
                color={ POLKADOT }
                tooltip="This content is published but needs to be acknowledged by the Legal Officer in charge to be recorded as evidence and thus, visible on the logion public certificate. You will be notified when this action is executed by the Legal Officer."
                tooltipId={ `published-${item.type}-${item.title()}` }
            />);
        }

        if (acknowledge) {
            buttons.push(<AcknowledgeButton key={++key} locItem={ item } locId={ loc.id } />);
        }

        if(item.status === "ACKNOWLEDGED") {
            buttons.push(<StatusCell icon={ { id: 'published' } } text="Recorded" color={ POLKADOT } />);
        }
    } else if(canAdd(viewer, loc)) {
        if(item.type === "Data") {
            buttons.push(<LocPublicDataButton
                key={++key}
                text="Set"
                dataName={ item.title() }
            />);
        } else if(item.type === "Document") {
            buttons.push(<LocPrivateFileButton
                key={++key}
                text="Set"
                nature={ item.title() }
            />);
        } else if(item.type === "Linked LOC") {
            buttons.push(<LocLinkButton
                key={++key}
                text="Set"
                nature={ item.title() }
            />);
        }
    }

    return (
        <ButtonGroup
            className="actions"
        >
            { buttons }
        </ButtonGroup>
    );
}
