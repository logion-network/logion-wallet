import { LocData } from "@logion/client";

import { Row } from "../../common/Grid";
import { Col } from "react-bootstrap";
import Detail from "../../common/Detail";

import "./CollectionInfo.css";

export interface Props {
    collection: LocData;
}

export function CollectionInfo(props: Props) {
    return (
        <div className="CollectionInfo">
            <p className="title">Collection parameters</p>
            <Row>
                <Col>
                    <Detail label="Value fee" value={ props.collection.valueFee?.toString() || "0" } />
                </Col>
            </Row>
        </div>
    )
}
