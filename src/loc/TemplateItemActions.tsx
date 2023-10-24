import { useMemo } from "react";
import { useCommonContext } from "src/common/CommonContext";
import { useLocContext } from "./LocContext";
import { useLogionChain } from "src/logion-chain";
import { LocItem, canAcknowledge, canAdd, canDelete, canPublish, canRequestReview, canReview, useRequestReviewCallback } from "./LocItem";
import Button from "src/common/Button";
import ReviewItemButtons from "./ReviewItemButtons";
import { ContributionMode } from "./types";
import StatusCell from "src/common/StatusCell";
import { POLKADOT } from "src/common/ColorTheme";
import AcknowledgeButton from "./AcknowledgeButton";
import ButtonGroup from "src/common/ButtonGroup";
import ClearItemButton from "./ClearItemButton";
import PublishItemButton from "./PublishItemButton";
import SetItemButton from "./SetItemButton";
import BlockNone from "src/components/blocknone/BlockNone";

export interface Props {
    item: LocItem;
    contributionMode?: ContributionMode;
}

export default function TemplateItemActions(props: Props) {
    const { item } = props;
    const { viewer } = useCommonContext();
    const { loc, mutateLocState } = useLocContext();
    const { accounts } = useLogionChain();
    const requestReview = useRequestReviewCallback(mutateLocState);

    const canRequestReviewMemo = useMemo(() => loc ? canRequestReview(viewer, loc, item) : false, [ loc, viewer, item ]);
    const canReviewMemo = useMemo(() => loc ? canReview(viewer, loc, item) : false, [ loc, viewer, item ]);
    const canPublishMemo = useMemo(() => loc ? canPublish(viewer, loc, item, props.contributionMode) : false, [ viewer, loc, item, props.contributionMode ]);
    const canDeleteMemo = useMemo(() => loc ? canDelete(accounts?.current?.accountId, item, viewer, loc) : false, [ accounts, item, viewer, loc ]);
    const canAcknowledgeMemo = useMemo(() => loc ? canAcknowledge(viewer, loc, item, props.contributionMode) : false, [ viewer, loc, item, props.contributionMode ]);
    const canAddMemo = useMemo(() => loc ? canAdd(viewer, loc) : false, [ viewer, loc ]);

    return (
        <ButtonGroup
            className="actions"
        >
            { !item.isSet && canAddMemo && <SetItemButton item={ item } /> }
            { item.isSet && canRequestReviewMemo && <Button onClick={ () => requestReview(item) }>Request review</Button> }
            { item.isSet && canReviewMemo && <ReviewItemButtons locItem={ item }/> }            
            <BlockNone show={ (item.isSet || false) && canPublishMemo }><PublishItemButton item={ item } /></BlockNone>
            { item.isSet && canDeleteMemo && <ClearItemButton item={ item } /> }
            <BlockNone show={ (item.isSet || false) && canAcknowledgeMemo }><AcknowledgeButton locItem={ item } /></BlockNone>
            { item.isSet && item.status === "PUBLISHED" && !canAcknowledgeMemo && <StatusCell
                icon={ { id: 'published' } }
                text="Published"
                color={ POLKADOT }
                tooltip="This content is published but needs to be acknowledged by the Legal Officer in charge to be recorded as evidence and thus, visible on the logion public certificate. You will be notified when this action is executed by the Legal Officer."
                tooltipId={ `published-${ item.type }-${ item.title() }` }
            /> }
            { item.isSet && item.status === "ACKNOWLEDGED" && <StatusCell icon={ { id: 'published' } } text="Recorded" color={ POLKADOT } /> }
        </ButtonGroup>
    );
}
