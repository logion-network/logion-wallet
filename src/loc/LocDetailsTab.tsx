import { LocData, LegalOfficer, LocRequestState } from "@logion/client";
import { ProtectionRequest } from "@logion/client/dist/RecoveryClient";
import { LocType, UUID } from "@logion/node-api";
import { Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import ButtonGroup from "src/common/ButtonGroup";
import { BackgroundAndForegroundColors, BLUE, POLKADOT, RED } from "src/common/ColorTheme";
import InlineDateTime from "src/common/InlineDateTime";
import Tabs from "src/common/Tabs";
import { DocumentCheckResult } from "src/components/checkfileframe/CheckFileFrame";
import { PersonalInfo } from "src/components/identity/PersonalInfo";
import CloseLocButton from "./CloseLocButton";
import LocItemDetail from "./LocItemDetail";
import { LocItems } from "./LocItems";
import LocLinkButton from "./LocLinkButton";
import { LocPrivateFileButton } from "./LocPrivateFileButton";
import { LocPublicDataButton } from "./LocPublicDataButton";
import RequesterOrLegalOfficer from "./RequesterOrLegalOfficer";
import { LocItem } from "./types";

import "./LocDetailsTab.css";
import { Row } from "src/common/Grid";
import { Viewer } from "src/common/CommonContext";

export interface Props {
    loc: LocData;
    locState: LocRequestState;
    viewer: Viewer;
    detailsPath: (locId: UUID, type: LocType) => string;
    legalOfficer?: LegalOfficer;
    checkResult: DocumentCheckResult;
    locItems: LocItem[];
    addMetadata: ((name: string, value: string) => void) | null;
    addFile: ((name: string, file: File, nature: string) => Promise<void>) | null;
    deleteFile: ((locItem: LocItem) => void) | null;
    deleteMetadata: ((locItem: LocItem) => void) | null;
    deleteLink: ((locItem: LocItem) => void) | null;
    protectionRequest?: ProtectionRequest | null;
}

export default function LocDetailsTab(props: Props) {
    const {
        loc,
        locState,
    } = props;

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

    let locTabTitle: string;
    if (loc.locType === 'Transaction') {
        locTabTitle = "Legal Officer Case (LOC) - Transaction";
    } else if (loc.locType === 'Collection') {
        locTabTitle = "Legal Officer Case (LOC) - Collection";
    } else {
        if (locState.isLogionIdentity()) {
            locTabTitle = "Legal Officer Case (LOC) - Logion Identity";
        } else {
            locTabTitle = "Legal Officer Case (LOC) - Polkadot Identity";
        }
    }
    if (loc.voidInfo !== undefined) {
        locTabTitle = "VOID " + locTabTitle;
    }

    return (
        <Tabs
            id="loc-content"
            className="LocDetailsTab"
            activeKey="details"
            onSelect={ () => {
            } }
            tabs={ [ {
                key: "details",
                title: locTabTitle,
                render: () => <LocDetailsTabContent { ...props } locTabBorderColor={ locTabBorderColor } />
            } ] }
            borderColor={ locTabBorderColor }
            borderWidth={ locTabBorderWidth }
            tabColors={ tabColors }
            flatBottom={ loc.voidInfo !== undefined }
        />
    );
}

export interface ContentProps {
    loc: LocData;
    locState: LocRequestState;
    viewer: Viewer;
    detailsPath: (locId: UUID, type: LocType) => string;
    legalOfficer?: LegalOfficer;
    checkResult: DocumentCheckResult;
    locItems: LocItem[];
    addMetadata: ((name: string, value: string) => void) | null;
    addFile: ((name: string, file: File, nature: string) => Promise<void>) | null;
    deleteFile: ((locItem: LocItem) => void) | null;
    deleteMetadata: ((locItem: LocItem) => void) | null;
    deleteLink: ((locItem: LocItem) => void) | null;
    protectionRequest?: ProtectionRequest | null;
    locTabBorderColor: string;
}

export function LocDetailsTabContent(props: ContentProps) {
    const {
        loc,
        locState,
        viewer,
        detailsPath,
        legalOfficer,
        checkResult,
        locItems,
        addMetadata,
        addFile,
        deleteFile,
        deleteMetadata,
        deleteLink,
        protectionRequest,
        locTabBorderColor,
    } = props;

    return (<>
        <Row>
            <Col md={ 4 }>
                <LocItemDetail label="LOC ID" copyButtonText={ loc.id.toDecimalString() }>
                    <OverlayTrigger
                        placement="top"
                        delay={ 500 }
                        overlay={
                            <Tooltip
                                id={ loc.id.toDecimalString() }>{ loc.id.toDecimalString() }</Tooltip> }>
                        <span>{ loc.id.toDecimalString() }</span>
                    </OverlayTrigger>
                </LocItemDetail>
                <LocItemDetail label="Creation date">
                    <InlineDateTime dateTime={ loc.createdOn } />
                </LocItemDetail>
            </Col>

            <Col md={ 4 }>
                <LocItemDetail label="Description">{ loc.description }</LocItemDetail>
                {
                    loc.status === 'CLOSED' &&
                    <LocItemDetail label="Closing date" spinner={ loc.closedOn === undefined }>
                        <InlineDateTime dateTime={ loc.closedOn } />
                    </LocItemDetail>
                }
            </Col>

            <RequesterOrLegalOfficer
                loc={ loc }
                viewer={ viewer }
                detailsPath={ detailsPath }
                legalOfficer={ legalOfficer }
            />
        </Row>
        <div className="separator" style={ { backgroundColor: locTabBorderColor } } />
        { loc.locType === "Identity" && <>
            <PersonalInfo personalAndStatusInfo={ loc } />
            <div className="separator" style={ { backgroundColor: locTabBorderColor } } />
        </> }
        <LocItems
            matchedHash={ checkResult.hash }
            viewer={ props.viewer }
            locId={ loc.id }
            locItems={ locItems }
            deleteMetadata={ deleteMetadata }
            deleteFile={ deleteFile }
            deleteLink={ deleteLink }
            loc={ loc }
        />
        {
            !loc.closed && loc.voidInfo === undefined &&
            <Row>
                <Col xxl={ 5 } xl={ 4 }>
                    <ButtonGroup align="left">
                        <LocPublicDataButton
                            locItems={ locItems }
                            addMetadata={ addMetadata }
                        />
                        <LocPrivateFileButton
                            locItems={ locItems }
                            addFile={ addFile }
                        />
                    </ButtonGroup>
                </Col>
                <Col className="link-button-container" xxl={ 4 } xl={ 4 }>
                    {
                        viewer === "LegalOfficer" &&
                        <LocLinkButton excludeNewIdentity={ locState.isLogionData() } />
                    }
                </Col>
                <Col className="close-button-container" xxl={ 3 } xl={ 4 }>
                    {
                        viewer === "LegalOfficer" &&
                        <CloseLocButton protectionRequest={ protectionRequest } loc={ loc } />
                    }
                </Col>
            </Row>
        }
    </>);
}
