import { LocData } from "@logion/client";
import { Lgnt } from "@logion/node-api";
import { Row, Col } from "react-bootstrap";

import Detail from "../../common/Detail";

import "./CollectionInfo.css";
import AmountFormat from "src/common/AmountFormat";
import LegalFeeAmount from "src/loc/LegalFeeAmount";

export interface Props {
    collection: LocData;
}

export function CollectionInfo(props: Props) {
    const { valueFee, collectionItemFee, tokensRecordFee } = props.collection.fees;
    return (
        <div className="CollectionInfo">
            <p className="title">Collection parameters</p>
            <Row>
                <Col>
                    <Detail label="Value fee" value={ <span>
                        <AmountFormat amount={ valueFee ? valueFee : Lgnt.zero() } /> { Lgnt.CODE }</span> } />
                    <Detail label="Collection item fee" value={ <span>
                        <AmountFormat amount={ collectionItemFee ? collectionItemFee : Lgnt.zero() }/> { Lgnt.CODE }</span> } />
                    <Detail label="Tokens record fee" value={ <span>
                        <AmountFormat amount={ tokensRecordFee ? tokensRecordFee : Lgnt.zero() }/> { Lgnt.CODE }</span> } />
                </Col>
                <Col>
                    <Detail label="Legal fee" value={ <LegalFeeAmount loc={ props.collection } />} />
                </Col>
            </Row>
        </div>
    )
}
