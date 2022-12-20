import { VaultTransferRequestStatus } from "@logion/client/dist/VaultClient.js";
import { GREEN, ORANGE, RED } from "./ColorTheme";
import StatusCell from "./StatusCell";

export interface Props {
    status: VaultTransferRequestStatus;
    viewer: "Legal Officer" | "Wallet User";
}

export default function VaultTransferRequestStatusCell(props: Props) {

    let icon;
    let text;
    let color;
    if(props.status === "REJECTED" || props.status === "REJECTED_CANCELLED") {
        color = RED;
        icon = { id: "rejected" };
        text = "Rejected";
    } else if(props.status === "PENDING") {
        color = ORANGE;
        icon = { id: "pending" };
        text = "Pending";
    } else if(props.status === "CANCELLED") {
        color = RED;
        icon = { id: "void" };
        if(props.viewer === 'Wallet User') {
            text = "Cancelled";
        } else {
            text = "Cancelled by user";
        }
    } else if(props.status === "ACCEPTED") {
        color = GREEN;
        icon = {id: "activated"}
        text = "Accepted";
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
