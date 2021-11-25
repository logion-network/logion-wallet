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
import Button from "../../common/Button";
import { copyToClipBoard } from "../../common/Tools";
import { fullCertificateUrl, certificatePath } from "../../PublicPaths";
import { IDENTITIES_PATH, locDetailsPath, LOC_REQUESTS_PATH } from "../LegalOfficerPaths";
import CheckFileFrame, { CheckResult } from './CheckFileFrame';
import PolkadotFrame from "../../common/PolkadotFrame";
import DangerFrame from "../../common/DangerFrame";
import ButtonGroup from "../../common/ButtonGroup";
import VoidLocButton from "./VoidLocButton";
import { NavLink } from "react-router-dom";
import VoidLocReplaceNewButton from "./VoidLocReplaceNewButton";
import NewTabLink from "../../common/NewTabLink";
import VoidLocReplaceExistingButton from "./VoidLocReplaceExistingButton";

interface DocumentCheckResult {
    result: CheckResult;
    hash?: string;
}

export default function ContextualizedLocDetails() {
    const { colorTheme } = useCommonContext();
    const navigate = useNavigate();
    const { loc, locId, locRequest, locItems, voidInfo } = useLocContext();
    const [ checkResult, setCheckResult ] = useState<DocumentCheckResult>({result: "NONE"});

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

    if (loc === null || locRequest === null || voidInfo === undefined) {
        return null;
    }

    const certificateUrl = fullCertificateUrl(locId);
    const backPath = loc.locType === 'Transaction' ? LOC_REQUESTS_PATH : IDENTITIES_PATH;

    let locTabBorderColor = undefined;
    if(loc.closed) {
        locTabBorderColor = POLKADOT;
    } else if(voidInfo !== null) {
        locTabBorderColor = RED;
    }

    let locTabBorderWidth: string | undefined = undefined;
    if(voidInfo !== null) {
        locTabBorderWidth = "2px";
    }

    let tabColors: BackgroundAndForegroundColors | undefined = undefined;
    if(voidInfo !== null) {
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
    if(voidInfo !== null) {
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
            { loc !== undefined &&
            <>
                <Tabs
                    activeKey="details"
                    onSelect={ () => {
                    } }
                    tabs={ [ {
                        key: "details",
                        title: locTabTitle,
                        render: () => {
                            const { date, time } = format(locRequest.createdOn)
                            return <>
                                <Row>
                                    <Col md={ 4 }>
                                        <LocItemDetail label="LOC ID">{ locId.toDecimalString() }</LocItemDetail>
                                        <LocItemDetail label="Creation date">{ date } / { time }</LocItemDetail>
                                    </Col>
                                    <Col md={ 4 }>
                                        <LocItemDetail label="Description">{ locRequest?.description }</LocItemDetail>
                                    </Col>

                                    <Col md={ 4 } className="closed-icon-container">
                                        <LocItemDetail
                                            label="Requested by">{ locRequest.userIdentity?.firstName || "" } { locRequest.userIdentity?.lastName || "" }<br />{ locRequest.requesterAddress }
                                        </LocItemDetail>
                                        {
                                            loc.closed &&
                                            <div className="closed-icon">
                                                <Icon icon={ { id: "polkadot_shield" } } />
                                            </div>
                                        }
                                        {
                                            voidInfo !== null &&
                                            <div className="closed-icon">
                                                <Icon icon={ { id: "void_shield" } } />
                                            </div>
                                        }
                                    </Col>
                                </Row>
                                <LocItems matchedHash={ checkResult.hash } />
                            </>
                        }
                    } ] }
                    borderColor={ locTabBorderColor }
                    borderWidth={ locTabBorderWidth }
                    tabColors={ tabColors }
                />
                {
                    !loc.closed && voidInfo === null &&
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
                {
                    voidInfo !== null &&
                    <DangerFrame
                        className="loc-is-void"
                        title={ <span><Icon icon={{id: 'void'}} height="64px" /> This LOC is VOID</span> }
                    >
                        <p><strong>You have voided this LOC at the following date:</strong> { locRequest.voidedOn || "-" }</p>
                        <p><strong>Reason:</strong> { voidInfo.reason }</p>
                        {
                            voidInfo.replacerLocId !== undefined &&
                            <p><strong>This VOID LOC has been replaced by the following LOC: </strong>
                            <NewTabLink
                                href={locDetailsPath(voidInfo.replacerLocId.toString())}
                                iconId="loc-link"
                                inline
                            >
                                { voidInfo.replacerLocId.toDecimalString() }
                            </NewTabLink>
                            </p>
                        }
                        {
                            voidInfo.replacerLocId === undefined &&
                            <p>Please note that its public certificate shows a "VOID" mention to warn people that the content of the LOC is not valid anymore.</p>
                        }
                        {
                            voidInfo.replacerLocId !== undefined &&
                            <p>Please note that its public certificate shows a "VOID" mention to warn people that the content of the LOC is not valid anymore.
                                People will be automatically redirected to the replacing LOC when accessing to the void LOC URL and a mention of the fact that
                                the replacing LOC supersedes the void LOC will be visible on both certificates.
                            </p>
                        }
                    </DangerFrame>
                }
                <PolkadotFrame
                    className="certificate-link"
                    title="Public web address (URL) of this Legal Officer Case related Certificate:"
                >
                    <p className="link">
                        <a href={ certificateUrl } target="_blank" rel="noreferrer">{ certificateUrl }</a><br/>
                        <NavLink to={ certificatePath(locId) }>{ certificateUrl }</NavLink>
                    </p>
                    <Button onClick={ () => copyToClipBoard(certificateUrl) }>Copy LOC Certificate URL to
                        Clipboard</Button>
                </PolkadotFrame>
                <CheckFileFrame
                    checkHash={ checkHash }
                    checkResult={ checkResult.result }
                />
                {
                    voidInfo === null &&
                    <DangerFrame
                        className="void-loc"
                        title={ <span><Icon icon={{id: 'void'}} height="64px" /> Void this LOC</span> }
                    >
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
                    </DangerFrame>
                }
            </>
            }
            { loc === undefined && <p>LOC not found on chain</p> }
        </FullWidthPane>
    );
}
