import { AxiosInstance } from "axios";
import { useState, useCallback, useEffect } from "react";
import { Form } from "react-bootstrap";
import { ClosedCollectionLoc, CollectionItem } from "@logion/client";
import { UUID } from "@logion/node-api/dist/UUID";
import { getCollectionSize } from "@logion/node-api/dist/LogionLoc";

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
import { useLocContext } from "./LocContext";
import ItemFiles from "src/components/itemfiles/ItemFiles";
import { getAllDeliveries, ItemDeliveriesResponse } from "./FileModel";
import { useLegalOfficerContext } from "src/legal-officer/LegalOfficerContext";
import PagedTable, { getPage } from "src/components/pagedtable/PagedTable";
import { ActionCell, DateTimeCell } from "src/common/Table";
import ButtonGroup from "src/common/ButtonGroup";
import { useNavigate } from "react-router-dom";
import { dashboardCertificateRelativePath } from "src/RootPaths";
import CellWithCopyPaste from "src/components/table/CellWithCopyPaste";

export interface Props {
    locId: UUID;
    locOwner: string;
    collectionItem?: CollectionItem;
}

export type CheckResult = 'NONE' | 'POSITIVE' | 'NEGATIVE';

export function UserCollectionLocItemChecker(props: Props) {

    const { locId, collectionItem, locOwner } = props;
    const { locState, collectionItems } = useUserLocContext();
    const { client } = useLogionChain();
    const collection: ClosedCollectionLoc = locState as ClosedCollectionLoc;

    async function collectionItemFunction(actualId: string): Promise<CollectionItem | undefined> {
        const result = await collection.checkHash(actualId)
        return result.collectionItem;
    }

    if(!client) {
        return null;
    }

    return (
        <CollectionLocItemChecker
            viewer="User"
            locId={ locId }
            locOwner={ locOwner }
            collectionItem={ collectionItem }
            collectionSizeFunction={ () => collection.size() }
            collectionItemFunction={ collectionItemFunction }
            axiosFactory={ () => client.buildAxios(client.legalOfficers.find(legalOfficer => legalOfficer.address === locOwner)!) }
            collectionItems={ collectionItems }
        />)
}

export function LOCollectionLocItemChecker(props: Props) {

    const { locId, collectionItem, locOwner } = props;
    const { api } = useLogionChain();
    const { locState, collectionItems } = useLocContext();
    const { axios } = useLegalOfficerContext();
    const collection: ClosedCollectionLoc = locState as ClosedCollectionLoc;

    if (!api || !axios) {
        return null;
    }

    return (
        <CollectionLocItemChecker
            viewer="LegalOfficer"
            locId={ locId }
            locOwner={ locOwner }
            collectionItem={ collectionItem }
            collectionSizeFunction={ () => getCollectionSize({ api, locId }) }
            collectionItemFunction={ (actualId: string) => collection.getCollectionItem({ itemId: actualId }) }
            axiosFactory={ () => axios }
            collectionItems={ collectionItems }
        />)
}

interface LocalProps extends Props {
    viewer: Viewer;
    collectionSizeFunction: () => Promise<number | undefined>
    collectionItemFunction: (actualId: string) => Promise<CollectionItem | undefined>
    axiosFactory: () => AxiosInstance
    collectionItems: CollectionItem[]
}

function CollectionLocItemChecker(props: LocalProps) {

    const { locId, collectionSizeFunction, collectionItemFunction, locOwner, collectionItems } = props;
    const navigate = useNavigate();
    const { colorTheme } = useCommonContext();
    const { accounts, axiosFactory } = useLogionChain();
    const [ state, setState ] = useState<CheckResult>('NONE');
    const [ collectionSize, setCollectionSize ] = useState<number | undefined | null>(null);
    const [ itemId, setItemId ] = useState<string>("");
    const [ item, setItem ] = useState<CollectionItem>();
    const [ deliveries, setDeliveries ] = useState<ItemDeliveriesResponse>();
    const [ managedCheck, setManagedCheck ] = useState<{ itemId: string, active: boolean }>();
    const [ currentPageNumber, setCurrentPageNumber ] = useState(0);

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
                        const deliveries = await getAllDeliveries(axiosFactory!(locOwner), { locId: locId.toString(), collectionItemId: itemId });
                        setDeliveries(deliveries);
                        setState('POSITIVE');
                    } else {
                        setState('NEGATIVE');
                    }
                } catch (e) {
                    console.log(e)
                    setState('NEGATIVE');
                }
            }
        }
    }, [ itemId, collectionItemFunction, axiosFactory, locId, locOwner ]);

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
                    <p className="text-title">Collection Item(s) recorded on logion blockchain</p>
                    <p>The Collection LOC content listed above shall cover all related Collection Items created using the logion import
                        tool and/or through the logion API by an external application approved between the Legal Officer and its client
                        under a process validated by the Legal Officer of the present Collection LOC.</p>
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
                                        data-testid="item-id"
                                    />
                                </Col>
                                <Col className="buttons">
                                    <Button onClick={ checkData } disabled={ !itemId }><Icon
                                        icon={ { id: "search" } } /> Check Item ID</Button>
                                    {
                                        state === "POSITIVE" && item !== undefined &&
                                        (
                                            (props.viewer === 'LegalOfficer' &&
                                                <StatementOfFactsButton
                                                    item={ item }
                                                />
                                            ) ||
                                            (props.viewer === 'User' &&
                                                <StatementOfFactsRequestButton
                                                    itemId={ toItemId(itemId) }
                                                />
                                            )
                                        )
                                    }
                                </Col>
                            </Row>
                        }
                        colors={ colorTheme.frame }
                    />
                    <CheckResultFeedback
                        locId={ locId }
                        itemId={ toItemId(itemId) }
                        state={ state }
                        item={ item }
                        deliveries={ deliveries }
                        viewer={ props.viewer }
                        locOwner={ props.locOwner }
                        axiosFactory={ props.axiosFactory }
                    />
                </>
                }
            />
            <PagedTable
                fullSize={ collectionItems.length }
                currentPage={ getPage(collectionItems, currentPageNumber, 10) }
                columns={[
                    {
                        header: "Collection Item ID",
                        render: item => <CellWithCopyPaste content={ item.id } />,
                        align: "left",
                    },
                    {
                        header: "Timestamp",
                        render: item => <DateTimeCell dateTime={ item.addedOn } />,
                    },
                    {
                        header: "Certificate",
                        render: item => (
                            <ActionCell>
                                <ButtonGroup
                                    narrow={ true }
                                >
                                    <ViewCertificateButton
                                        url={ fullCollectionItemCertificate(locId, item.id) }
                                    />
                                    <CopyPasteButton
                                        className="medium"
                                        value={ fullCollectionItemCertificate(locId, item.id) }
                                    />
                                </ButtonGroup>
                            </ActionCell>
                        ),
                        width: "300px",
                    },
                    {
                        header: "Details",
                        render: item => (
                            <ActionCell>
                                <ButtonGroup>
                                    <Button
                                        onClick={ () => navigate(dashboardCertificateRelativePath("Collection", locId, item.id, props.viewer)) }
                                    >View</Button>
                                </ButtonGroup>
                            </ActionCell>
                        ),
                        width: "100px",
                    },
                ]}
                goToPage={ setCurrentPageNumber }
            />
        </PolkadotFrame>)
}

interface CheckResultProps {
    locId: UUID,
    itemId?: string,
    state: CheckResult,
    item?: CollectionItem,
    deliveries?: ItemDeliveriesResponse,
    viewer: Viewer,
    locOwner: string,
    axiosFactory: () => AxiosInstance,
}

function CheckResultFeedback(props: CheckResultProps) {
    const { locId, itemId, state, item, deliveries } = props;
    const { client } = useLogionChain();

    if(!client) {
        return null;
    }

    switch (state) {
        case "POSITIVE":
            const certificateUrl = fullCollectionItemCertificate(locId, itemId)
            return (
                <>
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
                            <div id="url-header" className="url-header">Certificate Public web address (URL) for the
                                data covered by this Collection LOC:
                            </div>
                            <div className="url-copy-paste-container">
                                <div className="url-container">
                                    <a href={ certificateUrl } target="_blank" rel="noreferrer">{ certificateUrl }</a>
                                </div>
                                <CopyPasteButton value={ certificateUrl } />
                            </div>
                        </Col>
                    </Row>
                    {
                        item !== undefined && item.files.length > 0 &&
                        <ItemFiles
                            item={ item }
                            deliveries={ deliveries }
                            withCheck={ props.viewer === "LegalOfficer" }
                        />
                    }
                </>
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

function ViewCertificateButton(props: { url: string }) {
    return (
        <Button className="ViewCertificateButton" onClick={ () => window.open(props.url, "_blank") }>
            <Icon icon={{ id:"view-certificate" }} width="16px" />
        </Button>
    );
}
