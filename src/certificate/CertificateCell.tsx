import { Col } from "react-bootstrap";

import { customClassName } from "../common/types/Helpers";
import CertificateLabel from "./CertificateLabel";
import './CertificateCell.css'

export interface CertificateCellProps {
    label: React.ReactNode,
    children?: React.ReactNode,
    matched?: boolean,
    md?: number;
    xl?: number;
}

export default function CertificateCell(props: CertificateCellProps) {
    const className = customClassName("CertificateCell", props.matched ? "matched" : undefined)
    return (
        <Col md={ props.md } xl={ props.xl } className={ className }>
            <CertificateLabel>{ props.label }</CertificateLabel>
            <div className="value">{ props.children }</div>
        </Col>
    )
}
