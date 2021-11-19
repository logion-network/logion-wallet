import "./LocItemDetail.css"
import { Children, customClassName } from "../../common/types/Helpers";
import { Col, Row } from "../../common/Grid";

interface DetailProps {
    label: string,
    children?: Children,
    className?: string
}

export default function LocItemDetail(props: DetailProps) {
    const className = customClassName("LocItemDetail", props.className)
    return (
        <Row className={ className }>
            <Col className="label">{ props.label }: </Col>
            <Col>
                <span className="value">{ props.children }</span>
            </Col>
        </Row>
    )
}
