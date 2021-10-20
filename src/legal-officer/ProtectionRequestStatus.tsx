import React from 'react';

import Icon from "../common/Icon";
import { ORANGE, GREEN, RED, YELLOW } from "../common/ColorTheme";

import { LegalOfficerDecisionStatus, ProtectionRequestStatus as ProtectionRequestStatusType } from '../common/types/ModelTypes';
import './ProtectionRequestStatus.css';

export interface Props {
    decision?: LegalOfficerDecisionStatus | null,
    status: ProtectionRequestStatusType,
}

export default function ProtectionRequestStatus(props: Props) {

    let icon;
    let status;
    let statusColor: string | undefined = undefined;
    if(props.decision !== null && props.decision !== undefined) {
        if(props.decision === "PENDING") {
            statusColor = ORANGE;
            icon = (<Icon icon={{ id: "pending" }} />);
            status = <span style={{color: statusColor}}>Pending</span>;
        } else if(props.decision === "ACCEPTED" && props.status === "PENDING") {
            statusColor = YELLOW;
            icon = (<Icon icon={{ id: "accepted" }} />);
            status = <span style={{color: statusColor, textTransform: "uppercase"}}>Accepted</span>;
        } else if(props.decision === "ACCEPTED" && props.status === "ACTIVATED") {
            statusColor = GREEN;
            icon = (<Icon icon={{ id: "activated" }} />);
            status = <span style={{color: statusColor, textTransform: "uppercase"}}>Accepted</span>;
        } else if(props.decision === "REJECTED") {
            statusColor = RED;
            icon = (<Icon icon={{ id: "rejected" }} />);
            status = <span style={{color: statusColor, textTransform: "uppercase"}}>Rejected</span>;
        } else {
            icon = null;
            status = null;
        }
    }

    return (
        <span
            className="ProtectionRequestStatus"
            style={{
                borderColor: statusColor
            }}
        >
            { icon } { status }
        </span>
    );
}
