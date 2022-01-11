import { Col, Row } from "../common/Grid";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'
import { LocItem } from "./types";
import NewTabLink from "../common/NewTabLink";
import CopyPasteButton from "../common/CopyPasteButton";

export interface Props {
    item: LocItem;
}

export default function LocLinkDetails(props: Props) {
    return (
        <Col className="LocItemDetails" style={ { width: "100%" } }>
            <div className="frame">
                <div className="frame-title">{ props.item.status === "DRAFT" ? "Data to be published" : "Published data" }</div>
                <LocItemDetail label="Submitter ID" copyButtonText={ props.item.submitter }>
                    { props.item.submitter }
                </LocItemDetail>
                <LocItemDetail label="Linked LOC" className="linked-loc">
                    <Row>
                    <NewTabLink href={ props.item.linkDetailsPath! } iconId="loc-link">{ props.item.value }</NewTabLink>
                    <CopyPasteButton value={ props.item.value } className="medium"/>
                    </Row>
                </LocItemDetail>
                {
                    props.item.nature !== undefined &&
                    <LocItemDetail label="Public Description">{ props.item.nature }</LocItemDetail>
                }
            </div>
        </Col>
    )
}
