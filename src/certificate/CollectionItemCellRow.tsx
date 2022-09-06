import { CheckHashResult } from "@logion/client";

import CertificateCell from "./CertificateCell";
import { Row } from "../common/Grid";

import './CollectionItemCellRow.css';
import { Col } from "react-bootstrap";
import MenuIcon from "../common/MenuIcon";
import CertificateDateTimeCell from "./CertificateDateTimeCell";
import { MergedCollectionItem } from "../common/types/ModelTypes";
import MetaMaskClaimButton from "./MetaMaskClaimButton";
import { UUID } from "@logion/node-api/dist/UUID";
import { customClassName } from "src/common/types/Helpers";

export interface Props {
    locId: UUID,
    owner: string,
    item: MergedCollectionItem;
    checkResult: CheckHashResult | undefined;
    isVoid: boolean;
}

export default function CollectionItemCellRow(props: Props) {
    const { locId, owner, item } = props
    const { id, description, addedOn, files, restrictedDelivery, token } = item

    const className = customClassName("CollectionItemCellRow", props.isVoid ? "is-void" : undefined);

    return (
        <div className={ className }>
            <Row>
                <Col>
                    <h2><MenuIcon icon={{id:"collection"}} /> Collection Item</h2>
                    <p>This collection item identified hereafter with the
                        following data benefits from the present Collection LOC scope:</p>
                </Col>
            </Row>
            <Row>
                <CertificateDateTimeCell md={ 12 } label="Collection item timestamp:" dateTime={ addedOn } />
            </Row>
            <Row>
                <CertificateCell md={ 12 } label="Collection item identification:" matched={ props.checkResult?.collectionItem?.id === id } >
                    { id }
                </CertificateCell>
            </Row>
            <Row>
                <CertificateCell md={ 12 } label="Collection item description:">
                    <pre>{ description }</pre>
                </CertificateCell>
            </Row>
            <Row>
                <CertificateCell md={ 12 } label="Restricted delivery:">
                    { restrictedDelivery ? "Yes": "No" }
                </CertificateCell>
            </Row>
            {
                token !== undefined &&
                <Row>
                    <CertificateCell md={ 4 } label="Underlying Token Type:">
                        { token.type }
                    </CertificateCell>
                    <CertificateCell md={ 8 } label="Underlying Token ID:">
                        <pre>{ token.id }</pre>
                    </CertificateCell>
                </Row>
            }
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
                                            {
                                                !props.isVoid &&
                                                <MetaMaskClaimButton
                                                    locId={ locId }
                                                    owner={ owner }
                                                    item={ item }
                                                    file={ file }
                                                />
                                            }
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
