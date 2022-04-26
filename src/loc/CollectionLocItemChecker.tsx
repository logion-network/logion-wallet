import { useState, useCallback, useEffect } from "react";

import { UUID } from "../logion-chain/UUID";
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
import { CollectionItem } from "../logion-chain/Types";
import StatementOfFactsButton from "./statement/StatementOfFactsButton";
import { useDirectoryContext } from "../directory/DirectoryContext";

export interface Props {
    locId: UUID;
    collectionItem?: CollectionItem;
}

export type CheckResult = 'NONE' | 'POSITIVE' | 'NEGATIVE';

export default function CollectionLocItemChecker(props: Props) {

    const { colorTheme } = useCommonContext();
    const { locId } = props;
    const { isLegalOfficer } = useDirectoryContext();
    const { accounts } = useCommonContext();
    const { api } = useLogionChain();

    const [ state, setState ] = useState<CheckResult>('NONE');
    const [ collectionSize, setCollectionSize ] = useState<number | undefined | null>(null);
    const [ itemId, setItemId ] = useState<string>("");
    const [ managedCheck, setManagedCheck ] = useState<{itemId: string, active: boolean}>();

    useEffect(() => {
        if (api && collectionSize === null) {
            getCollectionSize({ api, locId })
                .then(setCollectionSize)
        }
    }, [ api, locId, collectionSize ])

    const checkData = useCallback(async () => {
        if (api && itemId) {
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

    useEffect(() => {
        if(props.collectionItem && (
                !managedCheck
                || managedCheck.itemId !== props.collectionItem.id)) {

            setManagedCheck({
                itemId: props.collectionItem.id,
                active: true
            });
            setItemId(props.collectionItem.id);
            setState('POSITIVE');
        } else if(!props.collectionItem && managedCheck) {
            setManagedCheck(undefined);
            setItemId("");
            setState('NONE');
        }
    }, [ managedCheck, setManagedCheck, props.collectionItem ]);

    if(accounts?.current?.address === undefined) {
        return null;
    }

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
                    <p>To check if a Collection Item is covered by this Collection LOC and get its online public certificate, just submit the related Collection Item ID in the input field below:</p>
                    <FormGroup
                        id="itemId"
                        noFeedback={ true }
                        control={
                            <Row>
                                <Col className={ managedCheck?.active ? "matched" : undefined }>
                                    <Form.Control
                                        type="text"
                                        value={ itemId }
                                        onChange={ value => {
                                            setState('NONE');
                                            if(managedCheck) {
                                                setManagedCheck({
                                                    itemId: managedCheck.itemId,
                                                    active: false
                                                });
                                            }
                                            setItemId(value.target.value);
                                        }}
                                    />
                                </Col>
                                <Col className="buttons">
                                    <Button onClick={ checkData } disabled={ itemId ? false : true }><Icon icon={{id: "search"}} /> Check Item ID</Button>
                                    {
                                        state === "POSITIVE" && isLegalOfficer(accounts.current.address) &&
                                        <StatementOfFactsButton />
                                    }
                                </Col>
                            </Row>
                        }
                        colors={ colorTheme.frame }
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
                <Row className="CheckResultFeedback result-positive" id={ `feedback-${ state }` }>
                    <Col>
                        <p>
                            Check result: <span className="label-positive">positive</span><br />
                            The Collection Item - defined by the ID you submitted - is covered by the current Collection LOC.
                        </p>
                    </Col>
                    <Col>
                        <Icon icon={ { id: "ok" } } height='45px' />
                    </Col>
                    <Col>
                        <p>
                            <div id="url-header" className="url-header">Certificate Public web address (URL) for the data covered by this Collection LOC:</div>
                            <div className="url-copy-paste-container">
                                <div className="url-container">
                                    <a href={ certificateUrl } target="_blank" rel="noreferrer">{ certificateUrl }</a>
                                </div>
                                <CopyPasteButton value={ certificateUrl } />
                            </div>
                        </p>
                    </Col>
                </Row>
            )
        case "NEGATIVE":
            return (
                <Row className="CheckResultFeedback result-negative" id={ `feedback-${ state }` }>
                    <Col>
                        <p>
                            Check result: <span className="label-negative">negative</span><br />
                            The Collection Item - defined by the ID you submitted - has no match and is NOT covered by the current<br />
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
                <Row className="CheckResultFeedback result-none" children="" id={ `feedback-${ state }` } />
            )
    }
}
