import { LocData } from "@logion/client";
import { Row, Col } from "react-bootstrap";

import Detail from "../common/Detail";

import "./TransactionInfo.css";
import LegalFeeAmount from "./LegalFeeAmount";

export interface Props {
    loc: LocData;
}

export function TransactionInfo(props: Props) {

    return (
        <div className="TransactionInfo">
            <p className="title">Transaction parameters</p>
            <Row>
                <Col>
                    <Detail label="Legal fee" value={ <LegalFeeAmount loc={ props.loc } />} />
                </Col>
            </Row>
        </div>
    )
}
