import { LocData } from "@logion/client";
import { Lgnt } from "@logion/node-api";
import { Row, Col } from "react-bootstrap";

import Detail from "../common/Detail";

import "./CollectionInfo.css";
import AmountFormat from "src/common/AmountFormat";
import LegalFeeAmount from "src/loc/LegalFeeAmount";
import { CollectionLimits, DEFAULT_LIMITS } from "./CollectionLimitsForm";
import { useState, useEffect } from "react";
import { useLogionChain } from "../logion-chain";
import InlineDateTime from "../common/InlineDateTime";

export interface Props {
    collection: LocData;
}

export function CollectionInfo(props: Props) {
    const [ limits, setLimits ] = useState<CollectionLimits>();
    const { valueFee, collectionItemFee, tokensRecordFee } = props.collection.fees;
    const { api } = useLogionChain();

    useEffect(() => {
        if (api && limits === undefined) {
            CollectionLimits.fromCollectionParams(api, props.collection.collectionParams)
                .then(limits => setLimits(limits || DEFAULT_LIMITS))
        }
    }, [ api, limits, props.collection.collectionParams ]);

    if (limits === undefined) {
        return null;
    }

    const { dateLimit, dataNumberLimit, canUpload } = limits;
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
                    <Detail label="Legal fee" value={ <LegalFeeAmount loc={ props.collection } />} />
                </Col>
                <Col>
                    <Detail label="Collection Date Limit" value={ <InlineDateTime dateTime={ dateLimit?.toISOString() } dateOnly={ true } />} />
                    <Detail label="Collection Item Limit" value={ dataNumberLimit } />
                    <Detail label="Collection Upload Accepted" value={ canUpload ? "Yes" : "No" } />
                </Col>
            </Row>
        </div>
    )
}
