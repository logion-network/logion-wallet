import { UUID } from "../logion-chain/UUID";
import React, { useState, useCallback, useEffect } from "react";
import { useLogionChain } from "../logion-chain";
import { getCollectionItem, getCollectionSize } from "../logion-chain/LogionLoc";
import PolkadotFrame from "../common/PolkadotFrame";
import { useCommonContext } from "../common/CommonContext";
import Icon from "../common/Icon";
import IconTextRow from "../common/IconTextRow";
import FormGroup from "../common/FormGroup";
import { Form } from "react-bootstrap";
import Button from "../common/Button";
import { Row, Col } from "../common/Grid";
import CopyPasteButton from "../common/CopyPasteButton";
import { fullCollectionItemCertificate } from "../PublicPaths";
import "./CollectionLocItemChecker.css"

export interface Props {
    locId: UUID,
}

export type CheckResult = 'NONE' | 'POSITIVE' | 'NEGATIVE';

export default function CollectionLocItemChecker(props: Props) {

    const { colorTheme } = useCommonContext();
    const { locId } = props;
    const [ state, setState ] = useState<CheckResult>('NONE')
    const [ collectionSize, setCollectionSize ] = useState<number | undefined | null>(null);
    const [ itemId, setItemId ] = useState<string>("")
    const { api } = useLogionChain();

    useEffect(() => {
        if (api && collectionSize === null) {
            getCollectionSize({ api, locId })
                .then(setCollectionSize)
        }
    }, [ api, locId, collectionSize ])

    const checkData = useCallback(async () => {
        if (api) {
            try {
                const collectionItem = await getCollectionItem({ api, locId, itemId })
                if (collectionItem) {
                    setState('POSITIVE')
                } else {
                    setState('NEGATIVE')
                }
            } catch (e) {
                setState('NEGATIVE')
            }
        }
    }, [ api, locId, itemId ]);

    return (
        <PolkadotFrame className="CollectionLocItemChecker" colorTheme={ colorTheme }>
            <IconTextRow
                icon={ <Icon icon={ { id: "polkadot_collection" } } width="45px" /> }
                text={ <>
                    <p className="text-title">Number of Collection-related data recorded on logion
                        blockchain: { collectionSize }</p>
                    <p>The Collection LOC material listed above benefits all data imported through the logion API by an
                        external application approved between the Legal Officer and its client under a process validated
                        by the Legal Officer of the present LOC.</p>
                    <p>To check if a data is covered by this Collection LOC and get its online public certificate, just
                        submit the related data in the input field below:</p>
                    <FormGroup
                        id="itemId"
                        noFeedback={ true }
                        control={
                            <Row>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={ itemId }
                                        onChange={ value => {
                                            setState('NONE')
                                            setItemId(value.target.value);
                                        }}
                                    />
                                </Col>
                                <Col>
                                    <Button onClick={ checkData }>Check data</Button>
                                </Col>
                            </Row>
                        }
                        colors={ colorTheme.dialog }
                    />
                    <CheckResultFeedback locId={ locId } itemId={ itemId } state={ state } />
                </>
                } />
        </PolkadotFrame>)
}

interface CheckResultProps {
    locId: UUID,
    itemId: string,
    state: CheckResult,
}

function CheckResultFeedback(props: CheckResultProps) {
    const { locId, itemId, state } = props
    switch (state) {
        case "POSITIVE":
            const certificateUrl = fullCollectionItemCertificate(locId, itemId)
            return (
                <Row className="CheckResultFeedback result-positive" dataTestId={ `feedback-${ state }` }>
                    <Col>
                        <p>
                            Check result: <span className="label-positive">positive</span><br />
                            The data you uploaded is covered by the current Collection LOC.
                        </p>
                    </Col>
                    <Col>
                        <Icon icon={ { id: "ok" } } height='45px' />
                    </Col>
                    <Col>
                        <p>
                            <span className="url-header">Certificate Public web address (URL) for the data covered by this Collection LOC:</span><br />
                            <a href={ certificateUrl } target="_blank" rel="noreferrer">{ certificateUrl }</a>
                            <CopyPasteButton value={ certificateUrl } />
                        </p>
                    </Col>
                </Row>
            )
        case "NEGATIVE":
            return (
                <Row className="CheckResultFeedback result-negative" dataTestId={ `feedback-${ state }` }>
                    <Col>
                        <p>
                            Check result: <span className="label-negative">negative</span><br />
                            The data you uploaded has no match and is NOT covered by the current<br />
                            Collection LOC. Please be careful and execute a deeper due diligence.
                        </p>
                    </Col>
                    <Col>
                        <Icon icon={ { id: "ko" } } height='45px' />
                    </Col>
                </Row>
            )
        case "NONE":
            return (
                <Row className="CheckResultFeedback result-none" children="" dataTestId={ `feedback-${ state }` } />
            )
    }
}
