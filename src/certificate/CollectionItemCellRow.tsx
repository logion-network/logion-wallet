import CertificateCell from "./CertificateCell";
import { Row } from "../common/Grid";

import './CollectionItemCellRow.css';
import { Col } from "react-bootstrap";
import MenuIcon from "../common/MenuIcon";
import { LIGHT_MODE } from "../legal-officer/Types";
import CertificateDateTimeCell from "./CertificateDateTimeCell";
import { MergedCollectionItem } from "../common/types/ModelTypes";
import { DocumentCheckResult } from "../loc/CheckFileFrame";
import MetaMaskClaimButton from "./MetaMaskClaimButton";
import { UUID } from "@logion/node-api/dist/UUID";

export interface Props {
    locId: UUID,
    owner: string,
    item: MergedCollectionItem;
    checkResult: DocumentCheckResult;
}

export default function CollectionItemCellRow(props: Props) {
    const { locId, owner, item } = props
    const { id, description, addedOn, files } = item
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
            { files && files.length > 0 &&
                <Row>
                    <CertificateCell md={ 12 } label="Files">
                        <ul>
                            { files.map(file => (
                                <li>
                                    <Row>
                                        <Col md={ 7 }>
                                            { file.name } ({ file.contentType }, { file.size.toString() } bytes)
                                        </Col>
                                        <Col md={ 3 }>
                                            <MetaMaskClaimButton locId={ locId } owner={ owner } item={ item }
                                                                 file={ file } />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={ 7 }>{ file.hash }</Col>
                                    </Row>
                                </li>
                            )) }
                        </ul>
                    </CertificateCell>
                </Row>
            }
        </div>
    )
}
