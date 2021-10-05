import "./LocItemDetail.css"
import { Children } from "../../common/types/Helpers";
import { Col, Row } from "../../common/Grid";

interface DetailProps {
    label: string,
    children?: Children,
}

export default function LocItemDetail(props: DetailProps) {
    return (
        <Row className="LocItemDetail">
            <Col className="label">{ props.label }: </Col>
            <Col>
                <span className="value">{ props.children }</span>
            </Col>
        </Row>
    )
}
