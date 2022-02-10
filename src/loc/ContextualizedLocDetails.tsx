import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useCommonContext } from "../common/CommonContext";
import { FullWidthPane } from "../common/Dashboard";
import Tabs from "../common/Tabs";
import { Col, OverlayTrigger } from "react-bootstrap";
import { format } from "../logion-chain/datetime";
import LocPublicDataButton from "./LocPublicDataButton";
import { useLocContext } from "./LocContext";
import LocItems from "./LocItems";
import LocItemDetail from "./LocItemDetail";
import { Row } from "../common/Grid";
import { POLKADOT, RED, BackgroundAndForegroundColors, BLUE } from "../common/ColorTheme";
import CloseLocButton from "./CloseLocButton";
import LocPrivateFileButton from "./LocPrivateFileButton";
import "./ContextualizedLocDetails.css";
import Icon from "../common/Icon";
import LocLinkButton from "./LocLinkButton";
import { fullCertificateUrl } from "../PublicPaths";
import CheckFileFrame, { DocumentCheckResult } from './CheckFileFrame';
import DangerFrame from "../common/DangerFrame";
import ButtonGroup from "../common/ButtonGroup";
import VoidLocButton from "./VoidLocButton";
import VoidLocReplaceNewButton from "./VoidLocReplaceNewButton";
import NewTabLink from "../common/NewTabLink";
import VoidLocReplaceExistingButton from "./VoidLocReplaceExistingButton";
import CopyPasteButton from "../common/CopyPasteButton";
import InlineDateTime from "../common/InlineDateTime";
import IconTextRow from "../common/IconTextRow";
import Button from "../common/Button";
import LocCreationDialog from "./LocCreationDialog";
import { isLogionIdentityLoc, isLogionDataLoc } from "../logion-chain/Types";
import { UUID } from "../logion-chain/UUID";
import Ellipsis from "../common/Ellipsis";
import { Viewer } from "./types";
import Tooltip from 'react-bootstrap/Tooltip';

export interface Props {
    viewer: Viewer;
}

export default function ContextualizedLocDetails(props: Props) {
    const { colorTheme } = useCommonContext();
    const navigate = useNavigate();
    const { loc, locId, locRequest, locItems, supersededLocRequest, backPath, detailsPath } = useLocContext();
    const [ checkResult, setCheckResult ] = useState<DocumentCheckResult>({result: "NONE"});
    const [ createLoc, setCreateLoc ] = useState(false);

    const checkHash = useCallback((hash: string) => {
        for(let i = 0; i < locItems!.length; ++i) {
            if(locItems[i].type === "Document") {
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
        setCheckResult({
            result: "NEGATIVE",
            hash
        });
    }, [ locItems, setCheckResult ]);

    if (loc === null || locRequest === null) {
        return null;
    }

    const certificateUrl = fullCertificateUrl(locId);

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

    let locTabTitle: string;
    if(loc.locType === 'Transaction') {
        locTabTitle = "Legal Officer Case (LOC) - Transaction";
    } else if(loc.locType === 'Collection') {
        locTabTitle = "Legal Officer Case (LOC) - Collection";
    } else {
        if (isLogionIdentityLoc(loc)) {
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
            mainTitle={ loc.locType === 'Transaction' ? "Transaction Protection Case" : "Identity Case" }
            titleIcon={ {
                icon: {
                    id: loc.locType === 'Transaction' ? 'loc' : 'identity'
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
                                Polkadot account to request your services. Once closed after a proper identity check,
                                you are able to initiate legal services requests ON BEHALF of this Logion Identity LOC,
                                representing - on the blockchain-, by extension, the client it refers.</p>
                        }
                        className="logion-loc-tip"
                    />
                    <div className="upper-action-bar" >
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
                                    <LocItemDetail label="Description">{ locRequest?.description }</LocItemDetail>
                                    {
                                        locRequest.status === 'CLOSED' &&
                                        <LocItemDetail label="Closing date" spinner={ locRequest.closedOn === undefined }>{ closingDate }</LocItemDetail>
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
                                                        <Tooltip id={ locRequest.requesterAddress }>{ locRequest.requesterAddress }</Tooltip> }>
                                                    <span><br /> { locRequest.requesterAddress }</span>
                                                </OverlayTrigger>
                                            </>
                                        }
                                        {
                                            locRequest.requesterIdentityLoc !== null && locRequest.requesterIdentityLoc !== undefined &&
                                            <span><br />
                                            <NewTabLink
                                                href={detailsPath(new UUID(locRequest.requesterIdentityLoc), 'Identity')}
                                                iconId="loc-link"
                                                inline
                                            >
                                                <Ellipsis maxWidth="250px">{ new UUID(locRequest.requesterIdentityLoc).toDecimalString() }</Ellipsis>
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
                            <div className="separator" style={{ backgroundColor: locTabBorderColor }} />
                            <LocItems matchedHash={ checkResult.hash } viewer={ props.viewer } />
                            {
                                !loc.closed && loc.voidInfo === undefined &&
                                <Row>
                                    <Col className="add-buttons-container" xxl={5} xl={4}>
                                        <LocPublicDataButton />
                                        <LocPrivateFileButton />
                                    </Col>
                                    <Col className="link-button-container" xxl={4} xl={4}>
                                        { props.viewer === 'LegalOfficer' && <LocLinkButton excludeNewIdentity={ isLogionDataLoc(loc) } /> }
                                    </Col>
                                    <Col className="close-button-container" xxl={3} xl={4}>
                                        { props.viewer === 'LegalOfficer' && <CloseLocButton /> }
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
                loc.voidInfo !== undefined &&
                <DangerFrame
                    className="loc-is-void"
                    title={ <span><Icon icon={ { id: 'void' } } width="45px" /> This LOC is VOID</span> }
                >
                    <p><strong>You have voided this LOC at the following date:</strong> <InlineDateTime dateTime={ locRequest?.voidInfo?.voidedOn } /></p>
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
            <div
                className="certificate-link"
            >
                <h2>Public web address (URL) of this Legal Officer Case related Certificate:</h2>
                <p className="link">
                    <a href={ certificateUrl } target="_blank" rel="noreferrer">{ certificateUrl }</a> <CopyPasteButton value={ certificateUrl } />
                </p>
                <LocCreationDialog
                    show={ createLoc }
                    exit={ () => setCreateLoc(false) }
                    onSuccess={ request => navigate(detailsPath(UUID.fromAnyString(request.id)!, 'Transaction')) }
                    locRequest={{
                        requesterIdentityLoc: locRequest.id,
                        locType: 'Transaction',
                        userIdentity: locRequest.userIdentity,
                    }}
                    hasLinkNature={ false }
                />
            </div>
            {
                loc.replacerOf !== undefined &&
                <DangerFrame
                    className="loc-supersedes"
                >
                    <IconTextRow
                        icon={ <Icon icon={ { id: 'void_supersede' } } width="45px" /> }
                        text={
                            <>
                                <p className="frame-title">IMPORTANT: this logion Legal Officer Case (LOC) supersedes a previous LOC (VOID)</p>
                                <p><strong>This LOC supersedes a previous LOC (VOID) since the following date:</strong> <InlineDateTime dateTime={ supersededLocRequest?.voidInfo?.voidedOn } /></p>
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
                props.viewer === 'LegalOfficer' && loc.voidInfo === undefined &&
                <DangerFrame
                    className="void-loc"
                >
                    <IconTextRow
                        icon={ <Icon icon={ { id: 'void' } } width="31px" /> }
                        text={
                            <>
                                <p className="frame-title"> Void this LOC</p>
                                <p>
                                    This action will invalidate the present LOC: the LOC status, its public certificate will show a "VOID" mention to warn people that
                                    the content of the LOC is not valid anymore. If another replacing LOC is set, people will be automatically redirected to
                                    the replacing LOC when accessing the void LOC URL and a mention of the fact that the replacing LOC <strong>supersedes</strong> the void
                                    LOC will be shared on both public certificates. <strong>PLEASE USE CAREFULLY.</strong>
                                </p>
                                <ButtonGroup
                                    align="left"
                                >
                                    <VoidLocButton />
                                    <VoidLocReplaceNewButton />
                                    <VoidLocReplaceExistingButton />
                                </ButtonGroup>
                            </>
                        }
                    />
                </DangerFrame>
            }
        </FullWidthPane>
    );
}
