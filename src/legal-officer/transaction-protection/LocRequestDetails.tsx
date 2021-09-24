import React from "react";

import { Col } from '../../common/Grid';
import Detail from "../../common/Detail";
import { LocRequest } from "../../common/types/ModelTypes";

export interface LocRequestDetailsProps {
    request : LocRequest,
}

export default function LocRequestDetails(props: LocRequestDetailsProps) {

    return (
        <>
            <Col
                style={{flexGrow: 1}}
            >
                <Detail
                    label="Address"
                    value={ props.request.requesterAddress }
                />
            </Col>
            <Col
                style={{flexGrow: 1}}
            >
                <Detail
                    label="E-mail"
                    value={ props.request.userIdentity?.email || "" }
                />
            </Col>
            <Col
                style={{flexGrow: 1}}
            >
                <Detail
                    label="Phone number"
                    value={ props.request.userIdentity?.phoneNumber || "" }
                />
            </Col>
        </>
    );
}
