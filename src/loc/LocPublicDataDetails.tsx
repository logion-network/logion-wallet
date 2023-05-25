import { Col } from "../common/Grid";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'
import { LocItem } from "./LocItem";
import LocItemEstimatedFees from "./LocItemEstimatedFees";

export interface Props {
    item: LocItem
}

export default function LocPublicDataDetails(props: Props) {

    return (
        <Col className="LocItemDetails" style={{ width: "100%" }}>
            <div className="frame">
                {
                    props.item.rejectReason &&
                    <>
                        <LocItemDetail label="Rejection reason">{ props.item.rejectReason || "-" }</LocItemDetail>
                        <div className="separator"></div>
                    </>
                }
                <div className="frame-title">{ props.item.status === "DRAFT" ? "Data to be published" : "Published data" }</div>
                <LocItemDetail label="Public name">{ props.item.name || "-" }</LocItemDetail>
                <LocItemDetail label="Submitter ID" copyButtonText={ props.item.submitter?.address }>
                    { props.item.submitter?.address || "-" }
                </LocItemDetail>
                <LocItemDetail label="Public data"><pre>{ props.item.value || "-" }</pre></LocItemDetail>
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
