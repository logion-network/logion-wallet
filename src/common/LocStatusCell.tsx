import { LocRequestStatus } from '@logion/client';
import { ORANGE, GREEN, RED } from "./ColorTheme";
import StatusCell from "./StatusCell";

export interface Props {
    status: LocRequestStatus;
    voidLoc?: boolean;
}

export default function LocStatusCell(props: Props) {

    let icon;
    let text;
    let color;
    if(props.voidLoc !== undefined && props.voidLoc) {
        color = RED;
        icon = { id: "void" };
        text = "VOID";
    } else if(props.status === "REVIEW_PENDING") {
        color = ORANGE;
        icon = { id: "pending" };
        text = "Pending";
    } else if(props.status === "REVIEW_ACCEPTED") {
        color = ORANGE;
        text = "Accepted";
    } else if(props.status === "OPEN") {
        color = ORANGE;
        text = "Open";
    } else if(props.status === "REVIEW_REJECTED") {
        color = RED;
        icon = { id: "rejected" };
        text = "Rejected";
    } else if(props.status === "CLOSED") {
        color = GREEN;
        icon = { id: "activated" };
        text = "Closed";
    } else if(props.status === "DRAFT") {
        color = "white";
        icon = { id: "edit" };
        text = "Draft";
    } else {
        return null;
    }

    return (
        <StatusCell
            color={ color }
            text={ text }
            icon={ icon }
        />
    );
}
