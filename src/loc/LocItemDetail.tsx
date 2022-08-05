import { Spinner } from "react-bootstrap";

import { Children, customClassName } from "../common/types/Helpers";
import { Col, Row } from "../common/Grid";
import CopyPasteButton from "../common/CopyPasteButton";

import "./LocItemDetail.css"

export interface DetailProps {
    label: string,
    children?: Children,
    className?: string,
    spinner?: boolean,
    copyButtonText?: string,
}

export default function LocItemDetail(props: DetailProps) {
    const className = customClassName("LocItemDetail", props.className)

    let value;
    if (props.spinner) {
        value = <Spinner animation="border" size="sm" />;
    } else {
        value = <span className="value">{ props.children }</span>;
    }

    return (
        <Row className={ className }>
            <Col className="label">{ props.label }: </Col>
            <Col className="value-container">
                { value }
            </Col>
            { props.copyButtonText !== undefined &&
                <Col className="copy-paste-container">
                    <CopyPasteButton value={ props.copyButtonText } className="small" />
                </Col> }
        </Row>
    )
}
