import { CheckHashResult, CollectionItem, Token } from "@logion/client";
import { UUID, ValidAccountId } from "@logion/node-api";

import CertificateCell from "./CertificateCell";
import { Row } from "../common/Grid";

import './CollectionItemCellRow.css';
import { Col } from "react-bootstrap";
import MenuIcon from "src/common/MenuIcon";
import ClaimAssetButton from "./ClaimAssetButton";
import { customClassName } from "src/common/types/Helpers";
import { CertificateItemDetails } from "src/components/certificateitemdetails/CertificateItemDetails";
import { validValueOrHex } from "src/components/inlinehashstring/InlineHashString";

export interface Props {
    locId: UUID,
    owner: ValidAccountId,
    item: CollectionItem;
    checkResult: CheckHashResult | undefined;
    isVoid: boolean;
    tokenForDownload: Token | undefined;
}

export default function CollectionItemCellRow(props: Props) {
    const { locId, owner, item, tokenForDownload } = props;
    const files = item.files;

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

            <CertificateItemDetails
                item={ props.item }
                checkResult={ props.checkResult }
                hideNonRestrictedDelivery={ true }
            />

            { files && files.length > 0 &&
                <Row>
                    <CertificateCell md={ 12 } label="Files">
                        <ul>
                            { files.map(file => (
                                <li className={ props.checkResult?.collectionItemFile?.hash === file.hash ? "matched" : ""}>
                                    <Row>
                                        <Col md={ 8 }>
                                            { validValueOrHex(file.name) } ({ validValueOrHex(file.contentType) }, { file.size.toString() } bytes)
                                        </Col>
                                        <Col md={ 3 }>
                                            {
                                                !props.isVoid && props.item.restrictedDelivery &&
                                                <ClaimAssetButton
                                                    locId={ locId }
                                                    owner={ owner }
                                                    item={ item }
                                                    file={{
                                                        hash: file.hash,
                                                        name: validValueOrHex(file.name),
                                                        type: "Item",
                                                    }}
                                                    tokenForDownload={ tokenForDownload }
                                                />
                                            }
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={ 7 }>{ file.hash.toHex() }</Col>
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
