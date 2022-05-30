import { LocRequestStatus } from './types/ModelTypes';
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
    } else if(props.status === "REQUESTED") {
        color = ORANGE;
        icon = { id: "pending" };
        text = "Pending";
    } else if(props.status === "OPEN") {
        color = ORANGE;
        text = "Open";
    } else if(props.status === "REJECTED") {
        color = RED;
        icon = { id: "rejected" };
        text = "Rejected";
    } else if(props.status === "CLOSED") {
        color = GREEN;
        icon = { id: "activated" };
        text = "Closed";
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
