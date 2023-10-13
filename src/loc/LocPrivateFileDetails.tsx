import { useNavigate } from "react-router-dom";
import Button from "src/common/Button";
import Icon from "src/common/Icon";
import { Col } from "../common/Grid";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'
import { FileItem } from "./LocItem";
import LocItemEstimatedFees from "./LocItemEstimatedFees";

export interface Props {
    item: FileItem;
    documentClaimHistory?: string;
    fileName?: string;
    fileType?: string;
    otherFeesPaidByRequester: boolean;
}

export default function LocPrivateFileDetails(props: Props) {
    const { documentClaimHistory } = props;
    const navigate = useNavigate();
    const fileSize = (!props.item.hasData() || props.item.data().size === 0n) ? "N/A" : props.item.data().size.toString();

    const leftPaneWidth = documentClaimHistory !== undefined ? "60%" : "100%";
    return (
        <>
            <Col className="LocItemDetails" style={{ width: leftPaneWidth }}>
                <div className="frame">
                    {
                        props.item.rejectReason &&
                        <>
                            <LocItemDetail label="Rejection reason">{ props.item.rejectReason || "-" }</LocItemDetail>
                            <div className="separator"></div>
                        </>
                    }
                    <div className="frame-title">{ props.item.isPublishedOrAcknowledged() ? "Published document related data" : "Document related data to be published" }</div>
                    <LocItemDetail label="Public Description">{ props.item.hasData() ? props.item.data().nature.validValue() : null }</LocItemDetail>
                    {
                        props.fileName !== undefined &&
                        <LocItemDetail label="File name">{ props.fileName }</LocItemDetail>
                    }
                    <LocItemDetail label="File size (bytes)">{ fileSize }</LocItemDetail>
                    {
                        props.fileName !== undefined &&
                        <LocItemDetail label="File type">{ props.fileType }</LocItemDetail>
                    }
                    <LocItemDetail label="Submitter ID" copyButtonText={ props.item.submitter?.address }>
                        { props.item.submitter?.address || "-" }
                    </LocItemDetail>
                    <LocItemDetail label="Document Hash" copyButtonText={ props.item.hasData() ? props.item.data().hash.toHex() : undefined }>{ props.item.hasData() ? props.item.data().hash.toHex() : "-" }</LocItemDetail>
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
            {
                documentClaimHistory !== undefined &&
                <Col className="LocItemDetails claim" style={{width: "40%"}}>
                    <div>
                        <Button
                            onClick={ () => navigate(documentClaimHistory) }
                        >
                            <Icon icon={{ id: "claim" }} /> View document claim history
                        </Button>
                    </div>
                </Col>
            }
        </>
    )
}
