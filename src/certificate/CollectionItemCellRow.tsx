import CertificateCell from "./CertificateCell";
import { Row } from "../common/Grid";

import './CollectionItemCellRow.css';
import { Col } from "react-bootstrap";
import MenuIcon from "../common/MenuIcon";
import { LIGHT_MODE } from "../legal-officer/Types";
import CertificateDateTimeCell from "./CertificateDateTimeCell";
import { MergedCollectionItem } from "../common/types/ModelTypes";
import { DocumentCheckResult } from "../loc/CheckFileFrame";

export interface Props {
    item: MergedCollectionItem;
    checkResult: DocumentCheckResult;
}

export default function CollectionItemCellRow(props: Props) {
    const { id, description, addedOn } = props.item
    return (
        <div className="CollectionItemCellRow">
            <Row>
                <Col>
                    <h2><MenuIcon icon={{id:"collection"}} background={ LIGHT_MODE.topMenuItems.iconGradient }/> Collection Item</h2>
                    <p>This collection item identified hereafter with the
                        following data benefits from the present Collection LOC scope:</p>
                </Col>
            </Row>
            <Row>
                <CertificateDateTimeCell md={ 12 } label="Collection item timestamp:" dateTime={ addedOn } />
            </Row>
            <Row>
                <CertificateCell md={ 12 } label="Collection item identification:" matched={ props.checkResult.hash === id } >
                    { id }
                </CertificateCell>
            </Row>
            <Row>
                <CertificateCell md={ 12 } label="Collection item description:">
                    <pre>{ description }</pre>
                </CertificateCell>
            </Row>
        </div>
    )
}
