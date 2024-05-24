import { ProtectionRequestStatus as ProtectionRequestStatusType } from '@logion/client/dist/RecoveryClient.js';

import Icon from "../../common/Icon";
import { ORANGE, GREEN, RED, YELLOW } from "../../common/ColorTheme";

import './RecoveryRequestStatus.css';
import { RecoveryRequestType } from "@logion/client";

export interface Props {
    status: ProtectionRequestStatusType;
    type: RecoveryRequestType;
}

export default function RecoveryRequestStatus(props: Props) {

    let icon;
    let status;
    let statusColor: string | undefined = undefined;
    if(props.status === "PENDING") {
        statusColor = ORANGE;
        icon = (<Icon icon={{ id: "pending" }} />);
        status = <span style={{color: statusColor}}>Pending</span>;
    } else if(props.status === "ACCEPTED" && props.type === "ACCOUNT") {
        statusColor = YELLOW;
        icon = (<Icon icon={{ id: "accepted" }} />);
        status = <span style={{color: statusColor, textTransform: "uppercase"}}>Accepted</span>;
    } else if(props.status === "ACTIVATED" || (props.status === "ACCEPTED" && props.type === "SECRET")) {
        statusColor = GREEN;
        icon = (<Icon icon={{ id: "activated" }} />);
        status = <span style={{color: statusColor, textTransform: "uppercase"}}>Accepted</span>;
    } else if(props.status === "REJECTED") {
        statusColor = RED;
        icon = (<Icon icon={{ id: "rejected" }} />);
        status = <span style={{color: statusColor, textTransform: "uppercase"}}>Rejected</span>;
    } else if(props.status === "CANCELLED" || props.status === "ACCEPTED_CANCELLED" || props.status === "REJECTED_CANCELLED") {
        statusColor = RED;
        icon = (<Icon icon={{ id: "void_label" }} />);
        status = <span style={{color: statusColor, textTransform: "uppercase"}}>Cancelled</span>;
    } else {
        icon = null;
        status = null;
    }

    return (
        <span
            className="RecoveryRequestStatus"
            style={{
                borderColor: statusColor
            }}
        >
            { icon } { status }
        </span>
    );
}
