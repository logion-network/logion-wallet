import { Col } from "../../common/Grid";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'

export interface Props {
    item: LocItem
}

export default function LocPublicDataDetails(props: Props) {

    return (
        <Col className="LocItemDetails" style={{ width: "100%" }}>
            <div className="frame">
                <div className="frame-title">{ props.item.status === "DRAFT" ? "Data to be published" : "Published data" }</div>
                <LocItemDetail label="Submitter ID">{ props.item.submitter }</LocItemDetail>
                <LocItemDetail label={ props.item.name }>{ props.item.value }</LocItemDetail>
            </div>
        </Col>
    )
}


