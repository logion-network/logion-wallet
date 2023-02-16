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
}

export default function LocPrivateFileDetails(props: Props) {
    const navigate = useNavigate();

    return (
        <>
            <Col className="LocItemDetails" style={{ width: "50%" }}>
                <div className="frame">
                    <div className="frame-title">{ props.item.status === "DRAFT" ? "Document related data to be published" : "Published document related data" }</div>
                    <LocItemDetail label="Submitter ID" copyButtonText={ props.item.submitter }>
                        { props.item.submitter }
                    </LocItemDetail>
                    <LocItemDetail label="Document Hash">{ props.item.value }</LocItemDetail>
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
