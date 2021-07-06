import React from 'react';

import Icon from "../component/Icon";
import { ORANGE, GREEN, RED } from "../component/ColorTheme";

import { LegalOfficerDecisionStatus } from './Types';
import './Decision.css';

export interface Props {
    decision: LegalOfficerDecisionStatus | null,
}

export default function Decision(props: Props) {

    let icon;
    let status;
    let statusColor: string | undefined = undefined;
    if(props.decision !== null) {
        if(props.decision === "PENDING") {
            statusColor = ORANGE;
            icon = (<Icon icon={{ id: "pending" }} />);
            status = <span style={{color: statusColor}}>Pending</span>;
        } else if(props.decision === "ACCEPTED") {
            statusColor = GREEN;
            icon = (<Icon icon={{ id: "accepted" }} />);
            status = <span style={{color: statusColor}}>Accepted</span>;
        } else if(props.decision === "REJECTED") {
            statusColor = RED;
            icon = (<Icon icon={{ id: "rejected" }} />);
            status = <span style={{color: statusColor}}>Rejected</span>;
        } else {
            icon = null;
            status = null;
        }
    }

    return (
        <span
            className="Decision"
            style={{
                borderColor: statusColor
            }}
        >
            { icon } { status }
        </span>
    );
}
