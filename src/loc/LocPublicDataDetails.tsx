import { Col } from "../common/Grid";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'
import { LocItem } from "./LocItem";

export interface Props {
    item: LocItem
}

export default function LocPublicDataDetails(props: Props) {

    return (
        <Col className="LocItemDetails" style={{ width: "100%" }}>
            <div className="frame">
                <div className="frame-title">{ props.item.status === "DRAFT" ? "Data to be published" : "Published data" }</div>
                <LocItemDetail label="Submitter ID" copyButtonText={ props.item.submitter }>
                    { props.item.submitter || "-" }
                </LocItemDetail>
                <LocItemDetail label="Name">{ props.item.name || "-" }</LocItemDetail>
                <LocItemDetail label="Value"><pre>{ props.item.value || "-" }</pre></LocItemDetail>
            </div>
        </Col>
    )
}
