import { Transaction } from "@logion/client";

import Icon from "./Icon";
import Detail from "./Detail";
import './TransactionStatusCell.css';
import { Row, Col } from "./Grid";
import Alert from "./Alert";
import EstimatedFees from "../loc/fees/EstimatedFees";
import { toFeesClass } from "src/loc/LocItemFactory";

export interface StatusCellProps {
    transaction: Transaction
}

export function TransactionStatusCell(props: StatusCellProps) {
    const iconId = props.transaction.successful ? "ok" : "ko";
    return (
        <div className="TransactionStatusCell">
            <Icon icon={ { id: iconId } } />
        </div>);
}

export function TransactionStatusCellDetails(props: StatusCellProps) {
    if (props.transaction.successful) {
        return (
            <>
                <Col style={{width: "50%"}}>
                    <Detail label="Description" value="This transaction has been executed." />
                </Col>
                <Col style={{width: "50%"}}>
                    <Detail label="Fees (LGNT)" value={ <EstimatedFees fees={ toFeesClass(props.transaction.fees) } hideTitle={ true } /> } />
                </Col>
            </>
        );
    }
    const error = props.transaction.error;
    const errorCode = error ? `${ error.section }.${ error.name }` : "unknown"
    const description = error ? error.details : "An unknown error occurred"
    return (
        <div className="TransactionStatusCellDetails">
            <Alert variant="warning">Warning, this transaction has NOT been executed for the following reason:</Alert>
            <Row>
                <Col>
                    <Detail label="Error code" value={ errorCode } />
                </Col>
                <Col>
                    <Detail label="Description" value={ description } />
                </Col>
            </Row>
        </div>
    );
}


