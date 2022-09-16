import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Col, OverlayTrigger } from "react-bootstrap";
import queryString from 'query-string';
import { CollectionItem } from "@logion/client";
import { ProtectionRequest } from "@logion/client/dist/RecoveryClient";
import { UUID } from "@logion/node-api/dist/UUID";
import { isLogionIdentityLoc, isLogionDataLoc } from "@logion/node-api/dist/Types";
import Tooltip from 'react-bootstrap/Tooltip';

import { useCommonContext } from "../common/CommonContext";
import { FullWidthPane } from "../common/Dashboard";
import Tabs from "../common/Tabs";
import { LOLocPublicDataButton } from "./LocPublicDataButton";
import { useLocContext } from "./LocContext";
import { LOLocItems } from "./LocItems";
import LocItemDetail from "./LocItemDetail";
import { Row } from "../common/Grid";
import { POLKADOT, RED, BackgroundAndForegroundColors, BLUE } from "../common/ColorTheme";
import CloseLocButton from "./CloseLocButton";
import { LOLocPrivateFileButton } from "./LocPrivateFileButton";
import Icon from "../common/Icon";
import LocLinkButton from "./LocLinkButton";
import CheckFileFrame, { DocumentCheckResult } from 'src/components/checkfileframe/CheckFileFrame';
import DangerFrame from "../common/DangerFrame";
import ButtonGroup from "../common/ButtonGroup";
import VoidLocButton from "./VoidLocButton";
import VoidLocReplaceNewButton from "./VoidLocReplaceNewButton";
import NewTabLink from "../common/NewTabLink";
import VoidLocReplaceExistingButton from "./VoidLocReplaceExistingButton";
import InlineDateTime from "../common/InlineDateTime";
import IconTextRow from "../common/IconTextRow";
import Button from "../common/Button";
import LocCreationDialog from "./LocCreationDialog";
import Ellipsis from "../common/Ellipsis";
import CertificateAndLimits from "./CertificateAndLimits";
import { LOCollectionLocItemChecker } from "./CollectionLocItemChecker";
import { useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";
import { format } from "../common/DateTimeFormat";
import { PersonalInfo } from "./PersonalInfo";
import "./ContextualizedLocDetails.css";

export default function ContextualizedLocDetails() {
    const { colorTheme } = useCommonContext();
    const { pendingProtectionRequests, pendingRecoveryRequests } = useLegalOfficerContext();
    const navigate = useNavigate();
    const location = useLocation();
    const { loc, locId, locRequest, supersededLocRequest, backPath, detailsPath, locState } = useLocContext();
    const [ checkResult, setCheckResult ] = useState<DocumentCheckResult>({ result: "NONE" });
    const [ createLoc, setCreateLoc ] = useState(false);
    const [ protectionRequest, setProtectionRequest ] = useState<ProtectionRequest | null | undefined>();
    const [ collectionItem, setCollectionItem ] = useState<CollectionItem>();

    const checkHash = useCallback(async (hash: string) => {
        const result = await locState?.checkHash(hash);

        if (result?.collectionItem || result?.file || result?.metadataItem) {
            setCheckResult({
                result: "POSITIVE",
                hash
            });
            setCollectionItem(result?.collectionItem);
        } else {
            setCheckResult({
                result: "NEGATIVE",
                hash
            });
            setCollectionItem(undefined);
        }
    }, [ setCheckResult, setCollectionItem, locState ]);

    useEffect(() => {
        if (location.search) {
            const params = queryString.parse(location.search);
            let requestId: string;
            let requests: ProtectionRequest[];
            if ('protection-request' in params) {
                requestId = params['protection-request'] as string;
                requests = pendingProtectionRequests!;
            } else if ('recovery-request' in params) {
                requestId = params['recovery-request'] as string;
                requests = pendingRecoveryRequests!;
            } else {
                requestId = "";
                requests = [];
            }

            if (protectionRequest === undefined || (protectionRequest !== null && requestId !== protectionRequest.id)) {
                const request = requests.find(request => request.id === requestId);
                if (request !== undefined) {
                    setProtectionRequest(request);
                } else {
                    setProtectionRequest(null);
                }
            }
        }
    }, [ location, pendingProtectionRequests, protectionRequest, setProtectionRequest, pendingRecoveryRequests ]);

    if (loc === null || locRequest === null) {
        return null;
    }

    let locTabBorderColor = BLUE;
    if (loc.voidInfo !== undefined) {
        locTabBorderColor = RED;
    } else if (loc.closed) {
        locTabBorderColor = POLKADOT;
    }

    let locTabBorderWidth: string | undefined = undefined;
    if (loc.voidInfo !== undefined) {
        locTabBorderWidth = "2px";
    }

    let tabColors: BackgroundAndForegroundColors | undefined = undefined;
    if (loc.voidInfo !== undefined) {
        tabColors = {
            foreground: "white",
            background: RED
        };
    }

    let paneTitle: string = "";
    let paneIcon: string = "";
    if (loc.locType === 'Transaction') {
        paneTitle = "Transaction Protection Case";
        paneIcon = 'loc';
    } else if (loc.locType === 'Identity') {
        paneTitle = "Identity Case";
        paneIcon = 'identity';
    } else if (loc.locType === 'Collection') {
        paneTitle = "Collection Protection Case";
        paneIcon = 'collection';
    }

    let locTabTitle: string;
    if (loc.locType === 'Transaction') {
        locTabTitle = "Legal Officer Case (LOC) - Transaction";
    } else if (loc.locType === 'Collection') {
        locTabTitle = "Legal Officer Case (LOC) - Collection";
    } else {
        if (isLogionIdentityLoc(loc)) {
            locTabTitle = "Legal Officer Case (LOC) - Logion Identity";
        } else {
            locTabTitle = "Legal Officer Case (LOC) - Polkadot Identity";
        }
    }
    if (loc.voidInfo !== undefined) {
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
            {
                isLogionIdentityLoc(loc) &&
                <Row className="logion-loc-tip-container">
                    <IconTextRow
                        icon={ <Icon icon={ { id: "tip" } } width="45px" /> }
                        text={
                            <p><strong>Identity Case:</strong> must be used when your client cannot have a
                                Polkadot account to request your services. Once closed after a proper identity
                                check,
                                you are able to initiate legal services requests ON BEHALF of this Logion Identity
                                LOC,
                                representing - on the blockchain-, by extension, the client it refers.</p>
                        }
                        className="logion-loc-tip"
                    />
                    <div className="upper-action-bar">
                        { loc.closed && loc.voidInfo === undefined &&
                            <Button
                                onClick={ () => setCreateLoc(true) }
                                slim={ true }
                                className="create-logion-transaction-loc-button"
                            >
                                <Icon icon={ { id: "loc" } } /> Create a Transaction LOC
                            </Button>
                        }
                    </div>
                </Row>
            }
            {
                protectionRequest !== undefined && protectionRequest !== null && !protectionRequest.isRecovery &&
                <Row className="logion-loc-tip-container">
                    <IconTextRow
                        icon={ <Icon icon={ { id: "tip" } } width="45px" /> }
                        text={
                            <p><strong>Protection request context:</strong> you are currently verifying the identity
                                of
                                a given person by collecting the
                                required documentation. This verification must follow proper due diligence using
                                tools
                                and processes defined by you and under
                                your Legal Officer responsibility. After this verification, you will be able to
                                confirm
                                the fact you agree to be the
                                Legal Officer of the related person and, thus, be requested to execute protection
                                services such as recovery or multi-signature actions.</p>
                        }
                        className="logion-loc-tip"
                    />
                </Row>
            }
            {
                protectionRequest !== undefined && protectionRequest !== null && protectionRequest.isRecovery &&
                <Row className="logion-loc-tip-container">
                    <IconTextRow
                        icon={ <Icon icon={ { id: "tip" } } width="45px" /> }
                        text={
                            <p><strong>Recovery request context:</strong> you are currently verifying the identity
                                of a
                                given person by collecting the required documentation.
                                This verification must follow proper due diligence using tools and processes defined
                                by
                                you and under your Legal Officer responsibility. After this
                                verification, within this present page, you will be able to confirm the fact you are
                                the
                                Legal Officer of the related person and, thus, authorize the
                                transfer of all the assets to the new account this person opened to replace his/her
                                lost
                                one.</p>
                        }
                        className="logion-loc-tip"
                    />
                </Row>
            }
            <Tabs
                id="loc-content"
                activeKey="details"
                onSelect={ () => {
                } }
                tabs={ [ {
                    key: "details",
                    title: locTabTitle,
                    render: () => {
                        const { date, time } = format(locRequest.createdOn);
                        let closingDate: string;
                        if (locRequest.closedOn !== undefined) {
                            const { date, time } = format(locRequest.closedOn);
                            closingDate = `${ date } / ${ time }`;
                        } else {
                            closingDate = "";
                        }
                        return <>
                            <Row>
                                <Col md={ 4 }>
                                    <LocItemDetail label="LOC ID" copyButtonText={ locId.toDecimalString() }>
                                        <OverlayTrigger
                                            placement="top"
                                            delay={ 500 }
                                            overlay={
                                                <Tooltip
                                                    id={ locId.toDecimalString() }>{ locId.toDecimalString() }</Tooltip> }>
                                            <span>{ locId.toDecimalString() }</span>
                                        </OverlayTrigger>
                                    </LocItemDetail>
                                    <LocItemDetail label="Creation date">{ date } / { time }</LocItemDetail>
                                </Col>
                                <Col md={ 4 }>
                                    <LocItemDetail label="Description">{ locRequest?.description }</LocItemDetail>
                                    {
                                        locRequest.status === 'CLOSED' &&
                                        <LocItemDetail label="Closing date"
                                                       spinner={ locRequest.closedOn === undefined }>{ closingDate }</LocItemDetail>
                                    }
                                </Col>

                                <Col md={ 4 } className="closed-icon-container">
                                    <LocItemDetail
                                        label="Requested by"
                                    >
                                        { locRequest.userIdentity?.firstName || "" } { locRequest.userIdentity?.lastName || "" }
                                        {
                                            locRequest.requesterAddress !== null && locRequest.requesterAddress !== undefined &&
                                            <>
                                                <OverlayTrigger
                                                    placement="top"
                                                    delay={ 500 }
                                                    overlay={
                                                        <Tooltip
                                                            id={ locRequest.requesterAddress }>{ locRequest.requesterAddress }</Tooltip> }>
                                                    <span><br /> { locRequest.requesterAddress }</span>
                                                </OverlayTrigger>
                                            </>
                                        }
                                        {
                                            locRequest.requesterIdentityLoc !== null && locRequest.requesterIdentityLoc !== undefined &&
                                            <span><br />
                                            <NewTabLink
                                                href={ detailsPath(new UUID(locRequest.requesterIdentityLoc), 'Identity') }
                                                iconId="loc-link"
                                                inline
                                            >
                                                <Ellipsis
                                                    maxWidth="250px">{ new UUID(locRequest.requesterIdentityLoc).toDecimalString() }</Ellipsis>
                                            </NewTabLink>
                                        </span>
                                        }
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
                            <div className="separator" style={ { backgroundColor: locTabBorderColor } } />
                            { loc?.locType === "Identity" && <>
                                <PersonalInfo
                                    requesterAddress={ locRequest.requesterAddress || "" }
                                    userIdentity={ locRequest.userIdentity }
                                    userPostalAddress={ locRequest.userPostalAddress }
                                />
                                <div className="separator" style={ { backgroundColor: locTabBorderColor } } />
                            </> }
                            <LOLocItems matchedHash={ checkResult.hash } />
                            {
                                !loc.closed && loc.voidInfo === undefined &&
                                <Row>
                                    <Col className="add-buttons-container" xxl={ 5 } xl={ 4 }>
                                        <LOLocPublicDataButton />
                                        <LOLocPrivateFileButton />
                                    </Col>
                                    <Col className="link-button-container" xxl={ 4 } xl={ 4 }>
                                        <LocLinkButton excludeNewIdentity={ isLogionDataLoc(loc) } />
                                    </Col>
                                    <Col className="close-button-container" xxl={ 3 } xl={ 4 }>
                                        <CloseLocButton protectionRequest={ protectionRequest }
                                                        locRequest={ locRequest } />
                                    </Col>
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
                    <p><strong>You have voided this LOC at the following date:</strong> <InlineDateTime
                        dateTime={ locRequest?.voidInfo?.voidedOn } /></p>
                    <p><strong>Reason:</strong> { locRequest.voidInfo?.reason || "-" }</p>
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
                        <p>Please note that its public certificate shows a "VOID" mention to warn people that the
                            content of the LOC is not valid anymore.</p>
                    }
                    {
                        loc.voidInfo.replacer !== undefined &&
                        <p>Please note that its public certificate shows a "VOID" mention to warn people that the
                            content of the LOC is not valid anymore.
                            People will be automatically redirected to the replacing LOC when accessing to the void
                            LOC
                            URL and a mention of the fact that
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
                    <p><strong>You have voided this Collection LOC with all its related Collection Items at the
                        following date:</strong> <InlineDateTime dateTime={ locRequest?.voidInfo?.voidedOn } /></p>
                    <p><strong>Reason:</strong> { locRequest.voidInfo?.reason || "-" }</p>
                    <p>Please note that related public certificates show a "VOID" mention to warn people that the
                        content of the Collection LOC as well as its related Collection Items are not valid
                        anymore.</p>
                </DangerFrame>
            }
            <CertificateAndLimits
                locId={ locId }
                loc={ { ...loc, isVoid: loc.voidInfo !== undefined } }
                viewer="LegalOfficer"
            />
            { loc.locType === 'Collection' && loc.closed &&
                <LOCollectionLocItemChecker
                    locId={ locId }
                    locOwner={ loc.owner }
                    collectionItem={ collectionItem }
                />
            }
            {
                loc.replacerOf !== undefined &&
                <DangerFrame
                    className="loc-supersedes"
                >
                    <IconTextRow
                        icon={ <Icon icon={ { id: 'void_supersede' } } width="45px" /> }
                        text={
                            <>
                                <p className="frame-title">IMPORTANT: this logion Legal Officer Case (LOC)
                                    supersedes a
                                    previous LOC (VOID)</p>
                                <p><strong>This LOC supersedes a previous LOC (VOID) since the following
                                    date:</strong>
                                    <InlineDateTime dateTime={ supersededLocRequest?.voidInfo?.voidedOn } /></p>
                                <p><strong>For record purpose, this LOC supersedes the following LOC: </strong>
                                    <NewTabLink
                                        href={ detailsPath(loc.replacerOf, loc.locType) }
                                        iconId="loc-link"
                                        inline
                                    >
                                        { loc.replacerOf.toDecimalString() }
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
            {
                loc.voidInfo === undefined &&
                <DangerFrame
                    className="void-loc"
                >
                    <IconTextRow
                        icon={ <Icon icon={ { id: 'void' } } width="31px" /> }
                        text={
                            <>
                                <p className="frame-title"> Void this LOC</p>
                                {
                                    loc.locType !== 'Collection' &&
                                    <p>
                                        This action will invalidate the present LOC: the LOC status, its public
                                        certificate will show a "VOID" mention to warn people that
                                        the content of the LOC is not valid anymore. If another replacing LOC is
                                        set,
                                        people will be automatically redirected to
                                        the replacing LOC when accessing the void LOC URL and a mention of the fact
                                        that
                                        the replacing LOC <strong>supersedes</strong> the void
                                        LOC will be shared on both public certificates. <strong>PLEASE USE
                                        CAREFULLY.</strong>
                                    </p>
                                }
                                {
                                    loc.locType === 'Collection' &&
                                    <p>
                                        This action will invalidate the present Collection LOC and all its related
                                        Collection Items: the Collection LOC and all
                                        related Collection Items status / public certificates will show a "VOID"
                                        mention
                                        to warn people that the content of the
                                        Collection LOC and all its related Collection Items are not valid
                                        anymore. <strong>PLEASE USE CAREFULLY.</strong>
                                    </p>
                                }
                                <ButtonGroup
                                    align="left"
                                    className="void-buttons-container"
                                >
                                    <VoidLocButton />
                                    { loc.locType !== 'Collection' && <VoidLocReplaceNewButton /> }
                                    { loc.locType !== 'Collection' && <VoidLocReplaceExistingButton /> }
                                </ButtonGroup>
                            </>
                        }
                    />
                </DangerFrame>
            }

            <LocCreationDialog
                show={ createLoc }
                exit={ () => setCreateLoc(false) }
                onSuccess={ request => navigate(detailsPath(UUID.fromAnyString(request.id)!, 'Transaction')) }
                locRequest={ {
                    requesterIdentityLoc: locRequest.id,
                    locType: 'Transaction',
                    userIdentity: locRequest.userIdentity,
                } }
                hasLinkNature={ false }
            />
        </FullWidthPane>
    );
}
