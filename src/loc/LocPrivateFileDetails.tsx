import { useNavigate } from "react-router-dom";
import Button from "src/common/Button";
import Icon from "src/common/Icon";
import { Col } from "../common/Grid";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'
import { LocItem } from "./types";

export interface Props {
    item: LocItem;
    documentClaimHistory: string;
    fileName?: string;
    fileSize?: string;
    fileType?: string;
}

export default function LocPrivateFileDetails(props: Props) {
    const navigate = useNavigate();

    return (
        <>
            <Col className="LocItemDetails" style={{ width: "50%" }}>
                <div className="frame">
                    <div className="frame-title">{ props.item.status === "DRAFT" ? "Document related data to be published" : "Published document related data" }</div>
                    {
                        props.fileName !== undefined &&
                        <LocItemDetail label="File name">{ props.fileName }</LocItemDetail>
                    }
                    {
                        props.fileSize !== undefined &&
                        <LocItemDetail label="File size (bytes)">{ props.fileSize }</LocItemDetail>
                    }
                    {
                        props.fileName !== undefined &&
                        <LocItemDetail label="File type">{ props.fileType }</LocItemDetail>
                    }
                    <LocItemDetail label="Submitter ID" copyButtonText={ props.item.submitter }>
                        { props.item.submitter }
                    </LocItemDetail>
                    <LocItemDetail label="Document Hash" copyButtonText={ props.item.value }>{ props.item.value }</LocItemDetail>
                    <LocItemDetail label="Public Description">{ props.item.nature }</LocItemDetail>
                </div>
            </Col>
            <Col className="LocItemDetails claim" style={{width: "50%"}}>
                <div>
                    <Button
                        onClick={ () => navigate(props.documentClaimHistory) }
                    >
                        <Icon icon={{ id: "claim" }} /> View document claim history
                    </Button>
                </div>
            </Col>
        </>
    )
}
