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
import { POLKADOT } from "../../common/ColorTheme";
import CloseLocButton from "./CloseLocButton";
import LocPrivateFileButton from "./LocPrivateFileButton";
import "./ContextualizedLocDetails.css";
import Icon from "../../common/Icon";
import LocLinkButton from "./LocLinkButton";
import Button from "../../common/Button";
import { copyToClipBoard } from "../../common/Tools";
import { fullCertificateUrl } from "../../PublicPaths";
import { IDENTITIES_PATH, LOC_REQUESTS_PATH } from "../LegalOfficerPaths";
import CheckFileFrame, { CheckResult } from './CheckFileFrame';
import PolkadotFrame from "../../common/PolkadotFrame";

interface DocumentCheckResult {
    result: CheckResult;
    hash?: string;
}

export default function ContextualizedLocDetails() {
    const { colorTheme } = useCommonContext();
    const navigate = useNavigate();
    const { loc, locId, locRequest, locItems } = useLocContext();
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

    if (loc === null || locRequest === null) {
        return null;
    }

    const certificateUrl = fullCertificateUrl(locId);
    const backPath = loc.locType === 'Transaction' ? LOC_REQUESTS_PATH : IDENTITIES_PATH;

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
                        title: loc.locType === 'Transaction' ? "Logion Officer Case - Transaction" : "Logion Officer Case - Identity",
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
                                    </Col>
                                </Row>
                                <LocItems matchedHash={ checkResult.hash } />
                            </>
                        }
                    } ] }
                    borderColor={ loc.closed ? POLKADOT : undefined }
                />
                {
                    !loc.closed &&
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
                <PolkadotFrame className="certificate-link">
                    <p className="title">Public web address (URL) of this Legal Officer Case related Certificate:</p>
                    <p className="link">
                        <a href={ certificateUrl } target="_blank" rel="noreferrer">{ certificateUrl }</a>
                    </p>
                    <Button onClick={ () => copyToClipBoard(certificateUrl) }>Copy LOC Certificate URL to
                        Clipboard</Button>
                </PolkadotFrame>
                <CheckFileFrame
                    checkHash={ checkHash }
                    checkResult={ checkResult.result }
                />
            </>
            }
            { loc === undefined && <p>LOC not found on chain</p> }
        </FullWidthPane>
    );
}
