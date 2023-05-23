import { Cell } from "src/common/Table";
import { LocItem } from "./LocItem";
import Icon from "src/common/Icon";

export interface Props {
    locItem: LocItem;
}

export default function ReviewStatusCell(props: Props) {

    if(props.locItem.type === "Linked LOC" || props.locItem.status === "DRAFT") {
        return <Cell content="-" />;
    } else if(props.locItem.status === "REVIEW_PENDING") {
        return <Icon icon={{ id: "pending" }} height="40px" />;
    } else if(props.locItem.status === "REVIEW_ACCEPTED" || props.locItem.status === "PUBLISHED" || props.locItem.status === "ACKNOWLEDGED") {
        return <Icon icon={{ id: "ok" }} height="40px" />;
    } else { // props.locItem.status === "REVIEW_REJECTED"
        return <Icon icon={{ id: "ko" }} height="40px" />;
    }
}
