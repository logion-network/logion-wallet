import { Children, customClassName } from "../common/types/Helpers";
import './CertificateCell.css'
import { Col } from "react-bootstrap";
import { ColProps } from "react-bootstrap/Col";

export interface CertificateCellProps extends ColProps {
    label: string,
    children?: Children,
    matched?: boolean
}

export default function CertificateCell(props: CertificateCellProps) {
    const className = customClassName("CertificateCell", props.matched ? "matched" : undefined)
    return (
        <Col { ...props } className={ className }>
            <div className="label">{ props.label }</div>
            <div className="value">{ props.children }</div>
        </Col>
    )
}
