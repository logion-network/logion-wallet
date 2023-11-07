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
                            props.collection.fees.valueFee ? toPrefixedLgnt(props.collection.fees.valueFee.toString()) : Currency.nLgnt(0n)
                        }/> { Currency.SYMBOL }</span> } />
                    <Detail label="Collection item fee" value={ <span>
                        <AmountFormat amount={
                            props.collection.fees.collectionItemFee ? toPrefixedLgnt(props.collection.fees.collectionItemFee.toString()) : Currency.nLgnt(0n)
                        }/> { Currency.SYMBOL }</span> } />
                    <Detail label="Tokens record fee" value={ <span>
                        <AmountFormat amount={
                            props.collection.fees.tokensRecordFee ? toPrefixedLgnt(props.collection.fees.tokensRecordFee.toString()) : Currency.nLgnt(0n)
                        }/> { Currency.SYMBOL }</span> } />
                </Col>
                <Col>
                    <Detail label="Legal fee" value={ <LegalFeeAmount loc={ props.collection } />} />
                </Col>
            </Row>
        </div>
    )
}
