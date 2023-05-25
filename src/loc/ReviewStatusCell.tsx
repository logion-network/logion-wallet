import { Cell } from "src/common/Table";
import { LocItem } from "./LocItem";
import Icon from "src/common/Icon";
import InlineDateTime from "src/common/InlineDateTime";
import InlineTooltip from "src/components/inlinetooltip/InlineTooltip";

export interface Props {
    locItem: LocItem;
}

export default function ReviewStatusCell(props: Props) {

    if(props.locItem.type === "Linked LOC" || props.locItem.status === "DRAFT") {
        return <Cell content="-" />;
    } else if(props.locItem.status === "REVIEW_PENDING") {
        return <Icon icon={{ id: "pending" }} height="40px" />;
    } else {
        const iconId = props.locItem.status === "REVIEW_REJECTED" ? "ko" : "ok";
        return (
            <InlineTooltip
                id={ `${ props.locItem.type }-${ props.locItem.name }` }
                text={ <>Reviewed by the legal officer: <InlineDateTime dateTime={ props.locItem.reviewedOn } /></> }
                inline={ <Icon icon={{ id: iconId }} height="40px" /> }
            />
        );
    }
}
