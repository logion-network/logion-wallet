import { useState, useCallback, useEffect } from "react";
import { Form } from "react-bootstrap";
import { CollectionItem } from "@logion/node-api/dist/Types";
import { UUID } from "@logion/node-api/dist/UUID";
import { getCollectionItem, getCollectionSize } from "@logion/node-api/dist/LogionLoc";

import { useLogionChain } from "../logion-chain";
import PolkadotFrame from "../common/PolkadotFrame";
import { useCommonContext } from "../common/CommonContext";
import Icon from "../common/Icon";
import IconTextRow from "../common/IconTextRow";
import FormGroup from "../common/FormGroup";
import Button from "../common/Button";
import { Row, Col } from "../common/Grid";
import CopyPasteButton from "../common/CopyPasteButton";
import { fullCollectionItemCertificate } from "../PublicPaths";

import "./CollectionLocItemChecker.css"
import StatementOfFactsButton from "./statement/StatementOfFactsButton";
import { toItemId, Viewer } from './types';
import StatementOfFactsRequestButton from "./statement/StatementOfFactsRequestButton";
import { useUserLocContext } from "./UserLocContext";
import { ClosedCollectionLoc } from "@logion/client";

export interface Props {
    locId: UUID;
    collectionItem?: CollectionItem;
}

export type CheckResult = 'NONE' | 'POSITIVE' | 'NEGATIVE';

export function UserCollectionLocItemChecker(props: Props) {

    const { locId, collectionItem } = props;
    const { locState } = useUserLocContext();
    const collection: ClosedCollectionLoc = locState as ClosedCollectionLoc;

    async function collectionItemFunction(actualId: string): Promise<CollectionItem | undefined> {
        const result = await collection.checkHash(actualId)
        return result.collectionItem;
    }

    return (
        <CollectionLocItemChecker
            viewer="User"
            locId={ locId }
            collectionItem={ collectionItem }
            collectionSizeFunction={ () => collection.size() }
            collectionItemFunction={ collectionItemFunction }
        />)
}

export function LOCollectionLocItemChecker(props: Props) {

    const { locId, collectionItem } = props;
    const { api } = useLogionChain();

    if (api === null) {
        return null;
    }

    return (
        <CollectionLocItemChecker
            viewer="LegalOfficer"
            locId={ locId }
            collectionItem={ collectionItem }
            collectionSizeFunction={ () => getCollectionSize({ api, locId }) }
            collectionItemFunction={ (actualId: string) => getCollectionItem({ api, locId, itemId: actualId }) }
        />)
}

interface LocalProps extends Props {
    viewer: Viewer;
    collectionSizeFunction: () => Promise<number | undefined>
    collectionItemFunction: (actualId: string) => Promise<CollectionItem | undefined>
}

function CollectionLocItemChecker(props: LocalProps) {

    const { colorTheme } = useCommonContext();
    const { locId, collectionSizeFunction, collectionItemFunction } = props;
    const { accounts } = useLogionChain();
    const [ state, setState ] = useState<CheckResult>('NONE');
    const [ collectionSize, setCollectionSize ] = useState<number | undefined | null>(null);
    const [ itemId, setItemId ] = useState<string>("");
    const [ item, setItem ] = useState<CollectionItem>();
    const [ managedCheck, setManagedCheck ] = useState<{ itemId: string, active: boolean }>();

    useEffect(() => {
        if (collectionSize === null) {
            collectionSizeFunction()
                .then(setCollectionSize)
        }
    }, [ collectionSizeFunction, collectionSize ])

    const checkData = useCallback(async () => {
        if (itemId) {
            const actualId = toItemId(itemId);
            if (actualId === undefined) {
                setState('NEGATIVE');
            } else {
                try {
                    const collectionItem = await collectionItemFunction(actualId);
                    if (collectionItem) {
                        setItem(collectionItem);
                        setState('POSITIVE');
                    } else {
                        setState('NEGATIVE');
                    }
                } catch (e) {
                    setState('NEGATIVE');
                }
            }
        }
    }, [ itemId, collectionItemFunction ]);

    useEffect(() => {
        if (props.collectionItem && (
            !managedCheck
            || managedCheck.itemId !== props.collectionItem.id)) {

            setManagedCheck({
                itemId: props.collectionItem.id,
                active: true
            });
            setItemId(props.collectionItem.id);
            setItem(props.collectionItem);
            setState('POSITIVE');
        } else if (!props.collectionItem && managedCheck) {
            setManagedCheck(undefined);
            setItemId("");
            setState('NONE');
        }
    }, [ managedCheck, setManagedCheck, props.collectionItem ]);

    if (accounts?.current?.address === undefined) {
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
                    <p>To check if a Collection Item is covered by this Collection LOC and get its online public
                        certificate, just submit the related Collection Item ID in the input field below:</p>
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
                                            if (managedCheck) {
                                                setManagedCheck({
                                                    itemId: managedCheck.itemId,
                                                    active: false
                                                });
                                            }
                                            setItemId(value.target.value);
                                        } }
                                    />
                                </Col>
                                <Col className="buttons">
                                    <Button onClick={ checkData } disabled={ !itemId }><Icon
                                        icon={ { id: "search" } } /> Check Item ID</Button>
                                    {
                                        state === "POSITIVE" && item !== undefined &&
                                        (
                                            (props.viewer === 'LegalOfficer' &&
                                                <StatementOfFactsButton itemId={ toItemId(itemId) }
                                                                        itemDescription={ item.description } />) ||
                                            (props.viewer === 'User' &&
                                                <StatementOfFactsRequestButton itemId={ toItemId(itemId) } />)
                                        )
                                    }
                                </Col>
                            </Row>
                        }
                        colors={ colorTheme.frame }
                    />
                    <CheckResultFeedback locId={ locId } itemId={ toItemId(itemId) } state={ state } />
                </>
                } />
        </PolkadotFrame>)
}

interface CheckResultProps {
    locId: UUID,
    itemId?: string,
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
                            The Collection Item - defined by the ID you submitted - is covered by the current Collection
                            LOC.
                        </p>
                    </Col>
                    <Col>
                        <Icon icon={ { id: "ok" } } height='45px' />
                    </Col>
                    <Col>
                        <p>
                            <div id="url-header" className="url-header">Certificate Public web address (URL) for the
                                data covered by this Collection LOC:
                            </div>
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
                            The Collection Item - defined by the ID you submitted - has no match and is NOT covered by
                            the current<br />
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
