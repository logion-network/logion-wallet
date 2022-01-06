import { Col, Row } from "../../common/Grid";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'
import { LocItem } from "./types";
import { transactionLocDetailsPath, identityLocDetailsPath } from "../LegalOfficerPaths";
import { UUID } from "../../logion-chain/UUID";
import NewTabLink from "../../common/NewTabLink";
import CopyPasteButton from "../../common/CopyPasteButton";
import { LocType } from "../../logion-chain/Types";

export interface Props {
    locType: LocType;
    item: LocItem;
}

export default function LocLinkDetails(props: Props) {
    const linkedLocId = UUID.fromDecimalString(props.item.value);
    const detailsPath = props.locType === 'Transaction' ? transactionLocDetailsPath(linkedLocId!.toString()) : identityLocDetailsPath(linkedLocId!.toString()) ;
    return (
        <Col className="LocItemDetails" style={ { width: "100%" } }>
            <div className="frame">
                <div className="frame-title">{ props.item.status === "DRAFT" ? "Data to be published" : "Published data" }</div>
                <LocItemDetail label="Submitter ID" copyButtonText={ props.item.submitter }>
                    { props.item.submitter }
                </LocItemDetail>
                <LocItemDetail label="Linked LOC" className="linked-loc">
                    <Row>
                    <NewTabLink href={ detailsPath } iconId="loc-link">{ props.item.value }</NewTabLink>
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
