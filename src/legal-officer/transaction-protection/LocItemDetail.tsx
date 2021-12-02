import "./LocItemDetail.css"
import { Children, customClassName } from "../../common/types/Helpers";
import { Col, Row } from "../../common/Grid";
import { Spinner } from "react-bootstrap";

interface DetailProps {
    label: string,
    children?: Children,
    className?: string,
    spinner?: boolean,
}

export default function LocItemDetail(props: DetailProps) {
    const className = customClassName("LocItemDetail", props.className)

    let value;
    if(props.spinner) {
        value = <Spinner animation="border" size="sm" />;
    } else {
        value = <span className="value">{ props.children }</span>;
    }

    return (
        <Row className={ className }>
            <Col className="label">{ props.label }: </Col>
            <Col>
                { value }
            </Col>
        </Row>
    )
}
