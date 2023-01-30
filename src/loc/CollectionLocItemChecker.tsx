import { AxiosInstance } from "axios";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Form } from "react-bootstrap";
import { ClosedCollectionLoc, CollectionItem, LocData } from "@logion/client";
import { getCollectionSize } from "@logion/node-api/dist/LogionLoc.js";

import { useLogionChain } from "../logion-chain";
import PolkadotFrame from "../common/PolkadotFrame";
import { useCommonContext, Viewer } from "../common/CommonContext";
import Icon from "../common/Icon";
import IconTextRow from "../common/IconTextRow";
import FormGroup from "../common/FormGroup";
import Button from "../common/Button";
import { Row, Col } from "../common/Grid";
import CopyPasteButton from "../common/CopyPasteButton";
import { fullCollectionItemCertificate } from "../PublicPaths";

import "./CollectionLocItemChecker.css"
import StatementOfFactsButton from "./statement/StatementOfFactsButton";
import { toItemId } from './types';
import StatementOfFactsRequestButton from "./statement/StatementOfFactsRequestButton";
import { useUserLocContext } from "./UserLocContext";
import { useLocContext } from "./LocContext";
import { useLegalOfficerContext } from "src/legal-officer/LegalOfficerContext";
import PagedTable, { getPage, Page } from "src/components/pagedtable/PagedTable";
import { ActionCell, DateTimeCell } from "src/common/Table";
import ButtonGroup from "src/common/ButtonGroup";
import { useNavigate } from "react-router-dom";
import { dashboardCertificateRelativePath } from "src/RootPaths";
import CellWithCopyPaste from "src/components/table/CellWithCopyPaste";
import { useResponsiveContext } from "src/common/Responsive";

export interface Props {
    collectionLoc: LocData;
    collectionItem?: CollectionItem;
}

export type CheckResult = 'NONE' | 'POSITIVE' | 'NEGATIVE';

export function UserCollectionLocItemChecker(props: Props) {

    const { collectionLoc, collectionItem } = props;
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
            collectionLoc={ collectionLoc }
            collectionItem={ collectionItem }
            collectionSizeFunction={ () => collection.size() }
            collectionItemFunction={ collectionItemFunction }
            axiosFactory={ () => client.buildAxios(client.legalOfficers.find(legalOfficer => legalOfficer.address === collectionLoc.ownerAddress)!) }
            collectionItems={ collectionItems }
        />)
}

export function LOCollectionLocItemChecker(props: Props) {

    const { collectionLoc, collectionItem } = props;
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
            collectionLoc={ collectionLoc }
            collectionItem={ collectionItem }
            collectionSizeFunction={ () => getCollectionSize({ api, locId: collectionLoc.id }) }
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

    const { collectionLoc, collectionSizeFunction, collectionItemFunction, collectionItems } = props;
    const navigate = useNavigate();
    const { colorTheme } = useCommonContext();
    const { accounts } = useLogionChain();
    const [ state, setState ] = useState<CheckResult>('NONE');
    const [ collectionSize, setCollectionSize ] = useState<number | undefined | null>(null);
    const [ itemId, setItemId ] = useState<string>("");
    const [ item, setItem ] = useState<CollectionItem>();
    const [ managedCheck, setManagedCheck ] = useState<{ itemId: string, active: boolean }>();
    const [ currentPageNumber, setCurrentPageNumber ] = useState(0);
    const { width } = useResponsiveContext();

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
                    console.log(e)
                    setState('NEGATIVE');
                }
            }
        }
    }, [ itemId, collectionItemFunction ]);

    const currentPage: Page<CollectionItem> = useMemo(() => {
        if(item) {
            return {
                pageNumber: 1,
                offset: 0,
                data: [ item ],
                isFirst: true,
                isLast: true
            };
        } else {
            return getPage(collectionItems, currentPageNumber, 10);
        }
    }, [ collectionItems, currentPageNumber, item ]);

    const resetCheck = useCallback(() => {
        setManagedCheck(undefined);
        setItemId("");
        setState('NONE');
        setItem(undefined);
    }, []);

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
            resetCheck();
        }
    }, [ managedCheck, setManagedCheck, props.collectionItem, resetCheck ]);

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
                                        className="item-id-input"
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
                                    {
                                        state !== "NONE" &&
                                        <span className="clear-button" onClick={ resetCheck }><Icon icon={{ id:"clear", hasVariants: true }} height="24px" /></span>
                                    }
                                </Col>
                                <Col className="buttons">
                                    <Button onClick={ checkData } disabled={ !itemId }>
                                        <Icon icon={ { id: "search" } } /> Check Item ID
                                    </Button>
                                </Col>
                            </Row>
                        }
                        colors={ colorTheme.frame }
                    />
                    <CheckResultFeedback
                        state={ state }
                    />
                </>
                }
            />
            <PagedTable
                fullSize={ collectionItems.length }
                currentPage={ currentPage }
                constrainedRowHeight={ false }
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
                                        url={ fullCollectionItemCertificate(collectionLoc.id, item.id) }
                                    />
                                    <CopyPasteButton
                                        value={ fullCollectionItemCertificate(collectionLoc.id, item.id) }
                                    />
                                </ButtonGroup>
                            </ActionCell>
                        ),
                        width: width({
                            onSmallScreen: "100px",
                            otherwise: "300px",
                        }),
                    },
                    {
                        header: "",
                        render: item => (
                            <ActionCell>
                                <ButtonGroup>
                                    <Button
                                        onClick={ () => navigate(dashboardCertificateRelativePath("Collection", collectionLoc.id, item.id, props.viewer)) }
                                    >
                                        View
                                    </Button>
                                    {
                                        (props.viewer === 'LegalOfficer' &&
                                            <StatementOfFactsButton
                                                item={ item }
                                            />
                                        ) ||
                                        (props.viewer === 'User' &&
                                            <StatementOfFactsRequestButton
                                                itemId={ item.id }
                                            />
                                        )
                                    }
                                </ButtonGroup>
                            </ActionCell>
                        ),
                        width: width({
                            onSmallScreen: "360px",
                            otherwise: "400px",
                        }),
                    },
                ]}
                goToPage={ setCurrentPageNumber }
            />
        </PolkadotFrame>)
}

interface CheckResultProps {
    state: CheckResult,
}

function CheckResultFeedback(props: CheckResultProps) {
    const { state } = props;
    const { client } = useLogionChain();

    if(!client) {
        return null;
    }

    switch (state) {
        case "POSITIVE":
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
                    </Row>
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
            <Icon icon={{ id:"view-certificate" }} width="20px" />
        </Button>
    );
}
