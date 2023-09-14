import { LocData } from "@logion/client";
import { Currency } from "@logion/node-api";
import { Row, Col } from "react-bootstrap";

import Detail from "../../common/Detail";

import "./CollectionInfo.css";
import AmountFormat from "src/common/AmountFormat";
import { toPrefixedLgnt } from "src/common/AmountCell";
import LegalFeeAmount from "src/loc/LegalFeeAmount";

export interface Props {
    collection: LocData;
}

export function CollectionInfo(props: Props) {
    return (
        <div className="CollectionInfo">
            <p className="title">Collection parameters</p>
            <Row>
                <Col>
                    <Detail label="Value fee" value={ <span>
                        <AmountFormat amount={
                            props.collection.valueFee ? toPrefixedLgnt(props.collection.valueFee.toString()) : Currency.nLgnt(0n)
                        }/> { Currency.SYMBOL }</span> } />
                </Col>
                <Col>
                    <Detail label="Legal fee" value={ <LegalFeeAmount loc={ props.collection } />} />
                </Col>
            </Row>
        </div>
    )
}
