import { Col } from "../common/Grid";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'
import { LocItem } from "./LocItem";
import NewTabLink from "../common/NewTabLink";
import CopyPasteButton from "../common/CopyPasteButton";
import EstimatedFees from "./EstimatedFees";

export interface Props {
    item: LocItem;
}

export default function LocLinkDetails(props: Props) {
    return (
        <Col className="LocItemDetails" style={ { width: "100%" } }>
            <div className="frame">
                <div className="frame-title">{ props.item.status === "DRAFT" ? "Data to be published" : "Published data" }</div>
                <LocItemDetail label="Public Description">{ props.item.nature }</LocItemDetail>
                <LocItemDetail label="Submitter ID" copyButtonText={ props.item.submitter?.address }>
                    { props.item.submitter?.address || "-" }
                </LocItemDetail>
                <LocItemDetail label="Linked LOC" className="linked-loc">
                    <NewTabLink href={ props.item.linkDetailsPath } iconId="loc-link">{ props.item.value }</NewTabLink>
                    <CopyPasteButton value={ props.item.value } className="medium"/>
                </LocItemDetail>
                {
                    props.item.fees &&
                    <>
                        <div className="separator"></div>
                        <LocItemDetail label="Paid fees (LGNT)">
                            <EstimatedFees
                                fees={ props.item.fees }
                                centered={ false }
                                hideTitle={ true }
                            />
                        </LocItemDetail>
                    </>
                }
            </div>
        </Col>
    )
}
