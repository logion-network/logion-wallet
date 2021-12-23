import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useCommonContext } from "../../common/CommonContext";
import { FullWidthPane } from "../../common/Dashboard";
import Tabs from "../../common/Tabs";
import { Col } from "react-bootstrap";
import { format } from "../../logion-chain/datetime";
import LocPublicDataButton from "./LocPublicDataButton";
import { useLocContext } from "./LocContext";
import LocItems from "./LocItems";
import LocItemDetail from "./LocItemDetail";
import { Row } from "../../common/Grid";
import TwoSideButtonGroup from "../../common/TwoSideButtonGroup";
import { POLKADOT, RED, BackgroundAndForegroundColors } from "../../common/ColorTheme";
import CloseLocButton from "./CloseLocButton";
import LocPrivateFileButton from "./LocPrivateFileButton";
import "./ContextualizedLocDetails.css";
import Icon from "../../common/Icon";
import LocLinkButton from "./LocLinkButton";
import { fullCertificateUrl } from "../../PublicPaths";
import { IDENTITIES_PATH, locDetailsPath, LOC_REQUESTS_PATH } from "../LegalOfficerPaths";
import CheckFileFrame, { CheckResult } from './CheckFileFrame';
import DangerFrame from "../../common/DangerFrame";
import ButtonGroup from "../../common/ButtonGroup";
import VoidLocButton from "./VoidLocButton";
import VoidLocReplaceNewButton from "./VoidLocReplaceNewButton";
import NewTabLink from "../../common/NewTabLink";
import VoidLocReplaceExistingButton from "./VoidLocReplaceExistingButton";
import CopyPasteButton from "../../common/CopyPasteButton";
import InlineDateTime from "../../common/InlineDateTime";
import IconTextRow from "../../common/IconTextRow";
import Button from "../../common/Button";
import LocCreationDialog from "./LocCreationDialog";

interface DocumentCheckResult {
    result: CheckResult;
    hash?: string;
}

export default function ContextualizedLocDetails() {
    const { colorTheme } = useCommonContext();
    const navigate = useNavigate();
    const { loc, locId, locRequest, locItems, supersededLocRequest } = useLocContext();
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
    const backPath = loc.locType === 'Transaction' ? LOC_REQUESTS_PATH : IDENTITIES_PATH;

    let locTabBorderColor = undefined;
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
        locTabTitle = "Logion Officer Case - Transaction";
    } else {
        locTabTitle = "Logion Officer Case - Identity";
    }
    if(loc.voidInfo !== undefined) {
        locTabTitle = "VOID " + locTabTitle;
    }

    return (
        <FullWidthPane
            mainTitle={ loc.locType === 'Transaction' ? "Transaction Protection Cases" : "Identity Case Management" }
            titleIcon={ {
                icon: {
                    id: loc.locType === 'Transaction' ? 'loc' : 'identity'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            onBack={ () => navigate(backPath) }
            className="ContextualizedLocDetails"
        >
            { <>
                <Tabs
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
                                            { locId.toDecimalString() }
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
                                            label="Requested by">{ locRequest.userIdentity?.firstName || "" } { locRequest.userIdentity?.lastName || "" }<br />
                                            { locRequest.requesterAddress || "-" }
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
                                <LocItems matchedHash={ checkResult.hash } />
                                {
                                    !loc.closed && loc.voidInfo === undefined &&
                                    <TwoSideButtonGroup
                                        left={
                                            <>
                                                <LocPublicDataButton />
                                                <LocPrivateFileButton />
                                                <LocLinkButton />
                                            </>
                                        }
                                        right={
                                            <CloseLocButton />
                                        }
                                    />
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
                                    href={ locDetailsPath(loc.voidInfo.replacer.toString()) }
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
                    {
                        (!loc.requesterAddress && !loc.requesterLocId && loc.closed) &&
                        <Button
                            onClick={ () => setCreateLoc(true) }
                        >
                            <Icon icon={{id: "add"}}/> Create Logion Transaction LOC
                        </Button>
                    }
                    <LocCreationDialog
                        show={ createLoc }
                        exit={ () => setCreateLoc(false) }
                        onSuccess={ request => navigate(locDetailsPath(request.id)) }
                        locRequest={{
                            requesterIdentityLoc: locRequest.id,
                            locType: 'Transaction'
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
                                            href={ locDetailsPath(loc.replacerOf.toString()) }
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
            </>
            }
        </FullWidthPane>
    );
}
