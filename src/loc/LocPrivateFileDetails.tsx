import { useNavigate } from "react-router-dom";
import Button from "src/common/Button";
import Icon from "src/common/Icon";
import { Col } from "../common/Grid";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'
import { LocItem } from "./LocItem";

export interface Props {
    item: LocItem;
    documentClaimHistory?: string;
    fileName?: string;
    fileType?: string;
}

export default function LocPrivateFileDetails(props: Props) {
    const { documentClaimHistory } = props;
    const navigate = useNavigate();
    const fileSize = props.item.size === undefined || props.item.size === 0n ? "N/A" : props.item.size.toString();

    const leftPaneWidth = documentClaimHistory !== undefined ? "50%" : "100%";
    return (
        <>
            <Col className="LocItemDetails" style={{ width: leftPaneWidth }}>
                <div className="frame">
                    <div className="frame-title">{ props.item.status === "DRAFT" ? "Document related data to be published" : "Published document related data" }</div>
                    <LocItemDetail label="Public Description">{ props.item.nature }</LocItemDetail>
                    {
                        props.fileName !== undefined &&
                        <LocItemDetail label="File name">{ props.fileName }</LocItemDetail>
                    }
                    <LocItemDetail label="File size (bytes)">{ fileSize }</LocItemDetail>
                    {
                        props.fileName !== undefined &&
                        <LocItemDetail label="File type">{ props.fileType }</LocItemDetail>
                    }
                    <LocItemDetail label="Submitter ID" copyButtonText={ props.item.submitter }>
                        { props.item.submitter || "-" }
                    </LocItemDetail>
                    <LocItemDetail label="Document Hash" copyButtonText={ props.item.value }>{ props.item.value || "-" }</LocItemDetail>
                </div>
            </Col>
            {
                documentClaimHistory !== undefined &&
                <Col className="LocItemDetails claim" style={{width: "50%"}}>
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
