import { useMemo } from "react";
import ButtonGroup from "src/common/ButtonGroup";
import { LocItem, canAcknowledge, canDelete, canPublish, canRequestReview, canReview, useRequestReviewCallback } from "./LocItem";
import { useCommonContext } from "src/common/CommonContext";
import { useLocContext } from "./LocContext";
import StatusCell from "src/common/StatusCell";
import { POLKADOT } from "src/common/ColorTheme";
import AcknowledgeButton from "./AcknowledgeButton";
import Button from "src/common/Button";
import ReviewItemButtons from "./ReviewItemButtons";
import { ContributionMode } from "./types";
import { useLogionChain } from "src/logion-chain";
import DeleteButton from "./DeleteButton";
import PublishItemButton from "./PublishItemButton";
import BlockNone from "src/components/blocknone/BlockNone";

export interface Props {
    locItem: LocItem;
    contributionMode?: ContributionMode;
}

export default function CustomItemActions(props: Props) {
    const { locItem } = props;
    const { mutateLocState, loc } = useLocContext();
    const requestReview = useRequestReviewCallback(mutateLocState);
    const { accounts } = useLogionChain();
    const { viewer } = useCommonContext();

    const canRequestReviewMemo = useMemo(() => loc ? canRequestReview(viewer, loc, locItem) : false, [ loc, viewer, locItem ]);
    const canReviewMemo = useMemo(() => loc ? canReview(viewer, loc, locItem) : false, [ loc, viewer, locItem ]);
    const canPublishMemo = useMemo(() => loc ? canPublish(viewer, loc, locItem, props.contributionMode) : false, [ viewer, loc, locItem, props.contributionMode ]);
    const canDeleteMemo = useMemo(() => loc ? canDelete(accounts?.current?.accountId, locItem, viewer, loc) : false, [ accounts, locItem, viewer, loc ]);
    const canAcknowledgeMemo = useMemo(() => loc ? canAcknowledge(viewer, loc, locItem, props.contributionMode) : false, [ viewer, loc, locItem, props.contributionMode ]);

    return (
        <ButtonGroup>
            { canRequestReviewMemo && <Button onClick={ () => requestReview(locItem) }>Request review</Button> }
            { canReviewMemo && <ReviewItemButtons locItem={ locItem }/> }
            <BlockNone show={ canPublishMemo }><PublishItemButton item={ locItem }/></BlockNone>
            { canDeleteMemo && <DeleteButton locItem={ locItem } /> }
            <BlockNone show={ canAcknowledgeMemo }><AcknowledgeButton locItem={ locItem } /></BlockNone>
            { locItem.status === "PUBLISHED" && !canAcknowledgeMemo && <StatusCell
                icon={ { id: 'published' } }
                text="Published"
                color={ POLKADOT }
                tooltip="This content is published but needs to be acknowledged by the Legal Officer in charge to be recorded as evidence and thus, visible on the logion public certificate. You will be notified when this action is executed by the Legal Officer."
                tooltipId={ `published-${ locItem.type }-${ locItem.title() }` }
            /> }
            { locItem.status === "ACKNOWLEDGED" && <StatusCell icon={ { id: 'published' } } text="Recorded" color={ POLKADOT } /> }
        </ButtonGroup>
    );
}
