import { LocData } from "@logion/client";
import { useNavigate } from "react-router-dom";
import Button from "src/common/Button";
import { Viewer } from "src/common/CommonContext";
import Icon from "src/common/Icon";
import { documentClaimHistoryPath } from "src/legal-officer/LegalOfficerPaths";
import { documentClaimHistoryPath as userDocumentClaimHistoryPath } from "src/wallet-user/UserRouter";
import { Col } from "../common/Grid";
import { useLocContext } from "./LocContext";
import LocItemDetail from "./LocItemDetail";

import './LocItemDetails.css'
import { LocItem } from "./types";

export interface Props {
    item: LocItem;
    viewer: Viewer;
}

export default function LocPrivateFileDetails(props: Props) {
    const { loc } = useLocContext();
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
                        onClick={ () => navigate(documentClaimHistory(props.viewer, loc, props.item.value)) }
                    >
                        <Icon icon={{ id: "claim" }} /> View document claim history
                    </Button>
                </div>
            </Col>
        </>
    )
}

function documentClaimHistory(viewer: Viewer, loc: LocData | null, hash: string) {
    if(!loc) {
        return "";
    } else if(viewer === "LegalOfficer") {
        return documentClaimHistoryPath(loc.id, hash);
    } else {
        return userDocumentClaimHistoryPath(loc.id, hash);
    }
}
