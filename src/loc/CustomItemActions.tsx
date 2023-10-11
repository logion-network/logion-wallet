import { ReactNode } from "react";
import ButtonGroup from "src/common/ButtonGroup";
import { FileItem, LinkItem, LocItem, MetadataItem, canAcknowledge, canDelete, canPublish, canRequestReview, canReview, useDeleteFileCallback, useDeleteLinkCallback, useDeleteMetadataCallback, useRequestReviewCallback } from "./LocItem";
import { useCommonContext } from "src/common/CommonContext";
import { useLocContext } from "./LocContext";
import StatusCell from "src/common/StatusCell";
import { POLKADOT } from "src/common/ColorTheme";
import AcknowledgeButton from "./AcknowledgeButton";
import Button from "src/common/Button";
import ReviewItemButtons from "./ReviewItemButtons";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";
import { ContributionMode } from "./types";
import { useLogionChain } from "src/logion-chain";
import LocPublishLinkButton from "./LocPublishLinkButton";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";
import DeleteButton from "./DeleteButton";

export interface Props {
    locItem: LocItem;
    contributionMode?: ContributionMode;
}

export default function CustomItemActions(props: Props) {
    const { locItem } = props;
    const { mutateLocState, loc } = useLocContext();
    const deleteMetadata = useDeleteMetadataCallback(mutateLocState);
    const deleteFile = useDeleteFileCallback(mutateLocState);
    const deleteLinkCallback = useDeleteLinkCallback(mutateLocState);
    const requestReview = useRequestReviewCallback(mutateLocState);
    const { accounts } = useLogionChain();
    const { viewer } = useCommonContext();

    if(!loc) {
        return null;
    }

    const buttons: ReactNode[] = [];
    let key = 0;

    if(canRequestReview(viewer, loc, locItem)) {
        buttons.push(<Button key={++key} onClick={ () => requestReview(locItem) }>Request review</Button>);
    }

    if(canReview(viewer, loc, locItem)) {
        buttons.push(<ReviewItemButtons key={++key} locItem={ locItem }/>);
    }

    if(locItem.type === 'Data') {
        if(canPublish(viewer, loc!, locItem, props.contributionMode)) {
            buttons.push(<LocPublishPublicDataButton key={++key} locItem={ locItem as MetadataItem } locId={ loc.id } />);
        }
        if(canDelete(accounts?.current?.accountId, locItem, viewer, loc)) {
            buttons.push(<DeleteButton key={++key} locItem={ locItem } action={ deleteMetadata } />);
        }
    } else if(locItem.type === 'Linked LOC') {
        if(canPublish(viewer, loc!, locItem, props.contributionMode)) {
            buttons.push(<LocPublishLinkButton key={++key} locItem={ locItem as LinkItem } locId={ loc.id } />);
        }
        if(canDelete(accounts?.current?.accountId, locItem, viewer, loc)) {
            buttons.push(<DeleteButton key={++key} locItem={ locItem } action={ deleteLinkCallback } />);
        }
    } else if(locItem.type === 'Document') {
        if(canPublish(viewer, loc!, locItem, props.contributionMode)) {
            buttons.push(<LocPublishPrivateFileButton key={++key} locItem={ locItem as FileItem } locId={ loc.id } />);
        }
        if(canDelete(accounts?.current?.accountId, locItem, viewer, loc)) {
            buttons.push(<DeleteButton key={++key} locItem={ locItem } action={ deleteFile } />);
        }
    }

    const acknowledge = canAcknowledge(viewer, loc, locItem, props.contributionMode);

    if (locItem.status === "PUBLISHED" && !acknowledge) {
        buttons.push(<StatusCell
            key={ ++key }
            icon={ { id: 'published' } }
            text="Published"
            color={ POLKADOT }
            tooltip="This content is published but needs to be acknowledged by the Legal Officer in charge to be recorded as evidence and thus, visible on the logion public certificate. You will be notified when this action is executed by the Legal Officer."
            tooltipId={ `published-${ locItem.type }-${ locItem.title() }` }
        />);
    }

    if (acknowledge && loc?.id) {
        buttons.push(<AcknowledgeButton key={++key} locItem={ locItem } locId={ loc.id } />);
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
