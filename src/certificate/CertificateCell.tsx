import { Children, customClassName } from "../common/types/Helpers";
import './CertificateCell.css'
import { Col } from "react-bootstrap";

export interface CertificateCellProps {
    label: string,
    children?: Children,
    matched?: boolean,
    md?: number;
    xl?: number;
}

export default function CertificateCell(props: CertificateCellProps) {
    const className = customClassName("CertificateCell", props.matched ? "matched" : undefined)
    return (
        <Col md={ props.md } xl={ props.xl } className={ className }>
            <div className="label">{ props.label }</div>
            <div className="value">{ props.children }</div>
        </Col>
    )
}
