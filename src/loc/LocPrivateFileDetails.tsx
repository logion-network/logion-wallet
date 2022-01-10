import { Col } from "../common/Grid";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'
import { LocItem } from "./types";

export interface Props {
    item: LocItem
}

export default function LocPrivateFileDetails(props: Props) {

    return (
        <Col className="LocItemDetails" style={{ width: "100%" }}>
            <div className="frame">
                <div className="frame-title">{ props.item.status === "DRAFT" ? "Document related data to be published" : "Published document related data" }</div>
                <LocItemDetail label="Submitter ID" copyButtonText={ props.item.submitter }>
                    { props.item.submitter }
                </LocItemDetail>
                <LocItemDetail label="Document Hash">{ props.item.value }</LocItemDetail>
                <LocItemDetail label="Public Description">{ props.item.nature }</LocItemDetail>
            </div>
        </Col>
    )
}


