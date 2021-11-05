import { Col } from "../../common/Grid";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'
import { LocItem } from "./types";

export interface Props {
    item: LocItem
    label: string
}

export default function LocPublicDataDetails(props: Props) {

    return (
        <Col className="LocItemDetails" style={{ width: "100%" }}>
            <div className="frame">
                <div className="frame-title">{ props.item.status === "DRAFT" ? "Data to be published" : "Published data" }</div>
                <LocItemDetail label="Submitter ID">{ props.item.submitter }</LocItemDetail>
                <LocItemDetail label={ props.label }>{ props.item.value }</LocItemDetail>
                {
                    props.item.nature !== undefined &&
                    <LocItemDetail label="Public Description">{ props.item.nature }</LocItemDetail>
                }
            </div>
        </Col>
    )
}
