import { Col } from "../common/Grid";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'
import { LinkItem } from "./LocItem";
import NewTabLink from "../common/NewTabLink";
import CopyPasteButton from "../common/CopyPasteButton";
import LocItemEstimatedFees from "./LocItemEstimatedFees";

export interface Props {
    item: LinkItem;
}

export default function LocLinkDetails(props: Props) {
    return (
        <Col className="LocItemDetails" style={ { width: "100%" } }>
            <div className="frame">
                {
                    props.item.rejectReason &&
                    <>
                        <LocItemDetail label="Rejection reason">{ props.item.rejectReason || "-" }</LocItemDetail>
                        <div className="separator"></div>
                    </>
                }
                <div className="frame-title">{ props.item.isPublishedOrAcknowledged() ? "Published data" : "Data to be published" }</div>
                <LocItemDetail label="Public Description">{ props.item.hasData() ? props.item.data().nature.validValue() : "-" }</LocItemDetail>
                <LocItemDetail label="Submitter ID" copyButtonText={ props.item.submitter?.address }>
                    { props.item.submitter?.address || "-" }
                </LocItemDetail>
                <LocItemDetail label="Linked LOC" className="linked-loc">
                    <NewTabLink href={ props.item.hasData() ? props.item.data().linkDetailsPath : undefined } iconId="loc-link">{ props.item.hasData() ? props.item.data().linkedLoc.id.toDecimalString() : undefined }</NewTabLink>
                    {
                        props.item.hasData() &&
                        <CopyPasteButton value={ props.item.data().linkedLoc.id.toDecimalString() } className="medium"/>
                    }
                </LocItemDetail>
                {
                    props.item.fees &&
                    <>
                        <div className="separator"></div>
                        <LocItemDetail label="Paid fees (LGNT)">
                            <LocItemEstimatedFees
                                fees={ props.item.fees }
                                locItem={ props.item }
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
