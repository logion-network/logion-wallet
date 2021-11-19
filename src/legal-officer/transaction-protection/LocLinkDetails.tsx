import { Col } from "../../common/Grid";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'
import { LocItem } from "./types";
import { locDetailsPath } from "../LegalOfficerPaths";
import { UUID } from "../../logion-chain/UUID";
import NewTabLink from "../../common/NewTabLink";

export interface Props {
    item: LocItem
}

export default function LocLinkDetails(props: Props) {
    const linkedLocId = UUID.fromDecimalString(props.item.value);
    return (
        <Col className="LocItemDetails" style={ { width: "100%" } }>
            <div className="frame">
                <div className="frame-title">{ props.item.status === "DRAFT" ? "Data to be published" : "Published data" }</div>
                <LocItemDetail label="Submitter ID">{ props.item.submitter }</LocItemDetail>
                <LocItemDetail label="Linked LOC" className="linked-loc">
                    <NewTabLink href={locDetailsPath(linkedLocId!.toString())} iconId="loc-link">{ props.item.value }</NewTabLink>
                </LocItemDetail>
                {
                    props.item.nature !== undefined &&
                    <LocItemDetail label="Public Description">{ props.item.nature }</LocItemDetail>
                }
            </div>
        </Col>
    )
}
