import { Children } from "../common/types/Helpers";
import './CertificateCell.css'
import { Col } from "react-bootstrap";
import { ColProps } from "react-bootstrap/Col";

export interface CertificateCellProps extends ColProps {
    label: string,
    children?: Children,
}

export default function CertificateCell(props: CertificateCellProps) {
    return (
        <Col {...props} className="CertificateCell">
            <div className="label">{ props.label }</div>
            <div className="value">{ props.children }</div>
        </Col>
    )
}
