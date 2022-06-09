import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Col, OverlayTrigger } from "react-bootstrap";
import { LegalOfficer } from "@logion/client";
import { format } from "@logion/node-api/dist/datetime";
import { CollectionItem } from "@logion/node-api/dist/Types";
import Tooltip from 'react-bootstrap/Tooltip';

import { useCommonContext } from "../common/CommonContext";
import { FullWidthPane } from "../common/Dashboard";
import Tabs from "../common/Tabs";
import { UserLocPublicDataButton } from "./LocPublicDataButton";
import { UserLocItems } from "./LocItems";
import LocItemDetail from "./LocItemDetail";
import { Row } from "../common/Grid";
import { POLKADOT, RED, BackgroundAndForegroundColors, BLUE } from "../common/ColorTheme";
import { UserLocPrivateFileButton } from "./LocPrivateFileButton";
import Icon from "../common/Icon";
import CheckFileFrame, { DocumentCheckResult } from './CheckFileFrame';
import DangerFrame from "../common/DangerFrame";
import NewTabLink from "../common/NewTabLink";
import InlineDateTime from "../common/InlineDateTime";
import IconTextRow from "../common/IconTextRow";
import CertificateAndLimits from "./CertificateAndLimits";
import CollectionLocItemChecker from "./CollectionLocItemChecker";
import { useLogionChain } from "../logion-chain";
import ItemImporter from "./ItemImporter";
import "./ContextualizedLocDetails.css";
import { useUserLocContext } from "./UserLocContext";
import { VoidedLoc, ClosedCollectionLoc } from "@logion/client/dist/Loc";

export default function UserContextualizedLocDetails() {
    const { getOfficer } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const navigate = useNavigate();
    const { locState, loc, locId, locItems, backPath, detailsPath } = useUserLocContext();
    const [ checkResult, setCheckResult ] = useState<DocumentCheckResult>({result: "NONE"});
    const [ collectionItem, setCollectionItem ] = useState<CollectionItem>();
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficer | null>(null)
    const [ supersededLoc, setSupersededLoc ] = useState<VoidedLoc | undefined | null>(null)

    useEffect(() => {
        if (loc && loc.replacerOf && locState && supersededLoc === null) {
            locState.supersededLoc()
                .then(setSupersededLoc)
        }
    }, [ loc, locState, supersededLoc ])

    const checkHash = useCallback(async (hash: string) => {
        setCollectionItem(undefined);

        for(let i = 0; i < locItems!.length; ++i) {
            if(locItems[i].type === "Document" || locItems[i].type === "Data") {
                const file = locItems[i];
                if(file.value === hash) {
                    setCheckResult({
                        result: "POSITIVE",
                        hash
                    });
                    return;
                }
            }
        }

        if (locState instanceof ClosedCollectionLoc) {
            const collectionItem = await locState.getCollectionItem({itemId: hash})
            if (collectionItem) {
                setCollectionItem(collectionItem);
                setCheckResult({
                    result: "POSITIVE",
                    hash
                });
                return;
            }
        }

        setCheckResult({
            result: "NEGATIVE",
            hash
        });
        setCollectionItem(undefined);
    }, [ locItems, setCheckResult, setCollectionItem, locState ]);

    useEffect(() => {
        if (legalOfficer === null && loc) {
            const owner = getOfficer!(loc.ownerAddress);
            if(owner !== undefined) {
                setLegalOfficer(owner);
            }
        }
    }, [ legalOfficer, loc, getOfficer, setLegalOfficer ])

    if (loc === null) {
        return null;
    }

    let locTabBorderColor = BLUE;
    if(loc.voidInfo !== undefined) {
        locTabBorderColor = RED;
    } else if(loc.closed) {
        locTabBorderColor = POLKADOT;
    }

    let locTabBorderWidth: string | undefined = undefined;
    if(loc.voidInfo !== undefined) {
        locTabBorderWidth = "2px";
    }

    let tabColors: BackgroundAndForegroundColors | undefined = undefined;
    if(loc.voidInfo !== undefined) {
        tabColors = {
            foreground: "white",
            background: RED
        };
    }

    let paneTitle: string = "";
    let paneIcon: string = "";
    if(loc.locType === 'Transaction') {
        paneTitle = "Transaction Protection Case";
        paneIcon = 'loc';
    } else if(loc.locType === 'Identity') {
        paneTitle = "Identity Case";
        paneIcon = 'identity';
    } else if(loc.locType === 'Collection') {
        paneTitle = "Collection Protection Case";
        paneIcon = 'collection';
    }

    let locTabTitle: string;
    if(loc.locType === 'Transaction') {
        locTabTitle = "Legal Officer Case (LOC) - Transaction";
    } else if(loc.locType === 'Collection') {
        locTabTitle = "Legal Officer Case (LOC) - Collection";
    } else {
        if (locState?.isLogionIdentity()) {
            locTabTitle = "Legal Officer Case (LOC) - Logion Identity";
        } else {
            locTabTitle = "Legal Officer Case (LOC) - Polkadot Identity";
        }
    }
    if(loc.voidInfo !== undefined) {
        locTabTitle = "VOID " + locTabTitle;
    }

    return (
        <FullWidthPane
            mainTitle={ paneTitle }
            titleIcon={ {
                icon: {
                    id: paneIcon
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            onBack={ () => navigate(backPath) }
            className="ContextualizedLocDetails"
        >
            <Tabs
                id="loc-content"
                activeKey="details"
                onSelect={ () => {
                } }
                tabs={ [ {
                    key: "details",
                    title: locTabTitle,
                    render: () => {
                        const { date, time } = format(loc.createdOn);
                        let closingDate: string;
                        if (loc.closedOn !== undefined) {
                            const { date, time } = format(loc.closedOn);
                            closingDate = `${ date } / ${ time }`;
                        } else {
                            closingDate = "";
                        }
                        return <>
                            <Row>
                                <Col md={ 4 }>
                                    <LocItemDetail label="LOC ID" copyButtonText={ locId.toDecimalString() } >
                                        <OverlayTrigger
                                            placement="top"
                                            delay={ 500 }
                                            overlay={
                                                <Tooltip id={ locId.toDecimalString() }>{ locId.toDecimalString() }</Tooltip> }>
                                            <span>{ locId.toDecimalString() }</span>
                                        </OverlayTrigger>
                                    </LocItemDetail>
                                    <LocItemDetail label="Creation date">{ date } / { time }</LocItemDetail>
                                </Col>
                                <Col md={ 4 }>
                                    <LocItemDetail label="Description">{ loc?.description }</LocItemDetail>
                                    {
                                        loc.status === 'CLOSED' &&
                                        <LocItemDetail label="Closing date" spinner={ loc.closedOn === undefined }>{ closingDate }</LocItemDetail>
                                    }
                                </Col>

                                <Col md={ 4 } className="closed-icon-container">
                                        <LocItemDetail label="Legal Officer in charge">
                                            { legalOfficer?.name || "" }
                                            <OverlayTrigger
                                                placement="top"
                                                delay={ 500 }
                                                overlay={
                                                    <Tooltip
                                                        id={ loc?.ownerAddress }>{ loc?.ownerAddress }</Tooltip> }>
                                                <span><br /> { loc?.ownerAddress }</span>
                                            </OverlayTrigger>
                                        </LocItemDetail>
                                    {
                                        loc.closed && loc.voidInfo === undefined &&
                                        <div className="closed-icon">
                                            <Icon icon={ { id: "polkadot_shield" } } />
                                        </div>
                                    }
                                    {
                                        loc.voidInfo !== undefined &&
                                        <div className="closed-icon">
                                            <Icon icon={ { id: "void_shield" } } />
                                        </div>
                                    }
                                </Col>
                            </Row>
                            <div className="separator" style={{ backgroundColor: locTabBorderColor }} />
                            <UserLocItems matchedHash={ checkResult.hash } />
                            {
                                !loc.closed && loc.voidInfo === undefined &&
                                <Row>
                                    <Col className="add-buttons-container" xxl={5} xl={4}>
                                        <UserLocPublicDataButton/>
                                        <UserLocPrivateFileButton/>
                                    </Col>
                                    <Col className="link-button-container" xxl={4} xl={4}/>
                                    <Col className="close-button-container" xxl={3} xl={4}/>
                                </Row>
                            }
                        </>
                    }
                } ] }
                borderColor={ locTabBorderColor }
                borderWidth={ locTabBorderWidth }
                tabColors={ tabColors }
                flatBottom={ loc.voidInfo !== undefined }
            />
            {
                loc.voidInfo !== undefined && loc.locType !== 'Collection' &&
                <DangerFrame
                    className="loc-is-void"
                    title={ <span><Icon icon={ { id: 'void' } } width="45px" /> This LOC is VOID</span> }
                >
                    <p><strong>You have voided this LOC at the following date:</strong> <InlineDateTime dateTime={ loc.voidInfo?.voidedOn } /></p>
                    <p><strong>Reason:</strong> { loc.voidInfo?.reason || "-" }</p>
                    {
                        loc.voidInfo.replacer !== undefined &&
                        <p><strong>This VOID LOC has been replaced by the following LOC: </strong>
                            <NewTabLink
                                href={ detailsPath(loc.voidInfo.replacer, loc.locType) }
                                iconId="loc-link"
                                inline
                            >
                                { loc.voidInfo.replacer.toDecimalString() }
                            </NewTabLink>
                        </p>
                    }
                    {
                        loc.voidInfo.replacer === undefined &&
                        <p>Please note that its public certificate shows a "VOID" mention to warn people that the content of the LOC is not valid anymore.</p>
                    }
                    {
                        loc.voidInfo.replacer !== undefined &&
                        <p>Please note that its public certificate shows a "VOID" mention to warn people that the content of the LOC is not valid anymore.
                            People will be automatically redirected to the replacing LOC when accessing to the void LOC URL and a mention of the fact that
                            the replacing LOC supersedes the void LOC will be visible on both certificates.
                        </p>
                    }
                </DangerFrame>
            }
            {
                loc.voidInfo !== undefined && loc.locType === 'Collection' &&
                <DangerFrame
                    className="loc-is-void"
                    title={ <span><Icon icon={ { id: 'void' } } width="45px" /> This Collection LOC with all its related Collection Items are VOID</span> }
                >
                    <p><strong>You have voided this Collection LOC with all its related Collection Items at the following date:</strong> <InlineDateTime dateTime={ loc.voidInfo?.voidedOn } /></p>
                    <p><strong>Reason:</strong> { loc.voidInfo?.reason || "-" }</p>
                    <p>Please note that related public certificates show a "VOID" mention to warn people that the content of the Collection LOC as well as its related Collection Items are not valid anymore.</p>
                </DangerFrame>
            }
            <CertificateAndLimits
                locId={ locId }
                loc={ loc }
                viewer="User"
            />
            { loc.locType === 'Collection' && loc.closed &&
                <CollectionLocItemChecker
                    locId={ locId }
                    collectionItem={ collectionItem }
                    viewer="User"
                />
            }
            { loc.locType === 'Collection' && loc.closed && loc.voidInfo === undefined &&
                <ItemImporter
                    locId={ locId }
                    collectionItem={ collectionItem }
                />
            }
            {
                supersededLoc !== null && supersededLoc !== undefined &&
                <DangerFrame
                    className="loc-supersedes"
                >
                    <IconTextRow
                        icon={ <Icon icon={ { id: 'void_supersede' } } width="45px" /> }
                        text={
                            <>
                                <p className="frame-title">IMPORTANT: this logion Legal Officer Case (LOC) supersedes a previous LOC (VOID)</p>
                                <p><strong>This LOC supersedes a previous LOC (VOID) since the following date:</strong> <InlineDateTime dateTime={ supersededLoc.data().voidInfo?.voidedOn } /></p>
                                <p><strong>For record purpose, this LOC supersedes the following LOC: </strong>
                                    <NewTabLink
                                        href={ detailsPath(loc.replacerOf!, loc.locType) }
                                        iconId="loc-link"
                                        inline
                                    >
                                        { loc.replacerOf!.toDecimalString() }
                                    </NewTabLink>
                                </p>
                            </>
                        }
                    />
                </DangerFrame>
            }
            <CheckFileFrame
                checkHash={ checkHash }
                checkResult={ checkResult.result }
            />
        </FullWidthPane>
    );
}
