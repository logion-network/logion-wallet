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
import Button from "src/common/Button";
import Icon from "src/common/Icon";
import { useCallback, useState } from "react";
import WarningDialog from "src/common/WarningDialog";
import { useLocContext } from "./LocContext";
import { useNavigate } from "react-router-dom";

export interface Props {
    loc: LocData;
    locState: LocRequestState;
    viewer: Viewer;
    detailsPath: (locId: UUID, type: LocType) => string;
    legalOfficer?: LegalOfficer;
    checkResult: DocumentCheckResult;
    locItems: LocItem[];
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

    let suffix = "";
    if(loc.status === "DRAFT") {
        suffix = " Request";
    }

    let locTabTitle: string;
    if (loc.locType === 'Transaction') {
        locTabTitle = `Legal Officer Case (LOC) - Transaction${suffix}`;
    } else if (loc.locType === 'Collection') {
        locTabTitle = `Legal Officer Case (LOC) - Collection${suffix}`;
    } else {
        if (locState.isLogionIdentity()) {
            locTabTitle = `Legal Officer Case (LOC) - Logion Identity${suffix}`;
        } else {
            locTabTitle = `Legal Officer Case (LOC) - Polkadot Identity${suffix}`;
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
    viewer: Viewer;
    detailsPath: (locId: UUID, type: LocType) => string;
    legalOfficer?: LegalOfficer;
    checkResult: DocumentCheckResult;
    protectionRequest?: ProtectionRequest | null;
    locTabBorderColor: string;
}

export function LocDetailsTabContent(props: ContentProps) {
    const {
        viewer,
        detailsPath,
        legalOfficer,
        checkResult,
        protectionRequest,
        locTabBorderColor,
    } = props;
    const [ showCancelDialog, setShowCancelDialog ] = useState(false);
    const [ showSubmitDialog, setShowSubmitDialog ] = useState(false);
    const { loc, locState, cancelRequest, backPath, submitRequest } = useLocContext();
    const navigate = useNavigate();

    const confirmCancel = useCallback(() => {
        setShowCancelDialog(true);
    }, []);

    const cancelRequestCallback = useCallback(async () => {
        await cancelRequest();
        navigate(backPath);
    }, [ cancelRequest, navigate, backPath ]);

    const confirmSubmit = useCallback(() => {
        setShowSubmitDialog(true);
    }, []);

    const submitRequestCallback = useCallback(async () => {
        await submitRequest();
        navigate(backPath);
    }, [ submitRequest, navigate, backPath ]);

    if(!loc || !locState) {
        return null;
    }

    return (<>
        <Row>
            <Col md={ 4 }>
                {
                    loc.status !== "DRAFT" &&
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
                }
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
        />
        {
            !loc.closed && loc.voidInfo === undefined &&
            <Row>
                <Col xxl={ 5 } xl={ 4 }>
                    {
                        (
                            (viewer === "User" && (loc.status === "DRAFT" || loc.status === "OPEN"))
                            || (viewer === "LegalOfficer" && loc.status === "OPEN")
                        ) &&
                        <ButtonGroup align="left">
                            <LocPublicDataButton />
                            <LocPrivateFileButton />
                        </ButtonGroup>
                    }
                </Col>
                {
                    viewer === "LegalOfficer" && loc.status === "OPEN" &&
                    <>
                    <Col className="link-button-container" xxl={ 4 } xl={ 4 }>
                        <LocLinkButton />
                    </Col>
                    <Col className="close-button-container" xxl={ 3 } xl={ 4 }>
                        <CloseLocButton protectionRequest={ protectionRequest } />
                    </Col>
                    </>
                }
                {
                    viewer === "User" &&
                    <>
                    <Col xxl={ 7 } xl={ 8 }>
                        {
                            loc.status === "DRAFT" &&
                            <ButtonGroup
                                align="right"
                            >
                                <Button
                                    variant="danger"
                                    onClick={ confirmCancel }
                                >
                                    <Icon icon={{ id: "void_inv" }}/> Cancel request
                                </Button>
                                <Button
                                    onClick={ confirmSubmit }
                                >
                                    <Icon icon={{ id: "submit" }}/> Submit request
                                </Button>
                            </ButtonGroup>
                        }
                    </Col>
                    </>
                }
            </Row>
        }
        <WarningDialog
            show={ showCancelDialog }
            size="lg"
            actions={[
                {
                    id: "back",
                    buttonText: "Back",
                    buttonVariant: "secondary",
                    callback: () => setShowCancelDialog(false),
                },
                {
                    id: "cancel",
                    buttonText: <span><Icon icon={{ id: "void_inv" }}/> Cancel request</span>,
                    buttonVariant: "danger",
                    callback: cancelRequestCallback
                }
            ]}
        >
            <h3>{ loc.locType } LOC request</h3>
            <p>You are about to cancel your request:</p>
            <p>all content will be deleted.</p>
            <p>This action is irreversible.</p>
        </WarningDialog>
        <WarningDialog
            show={ showSubmitDialog }
            size="lg"
            actions={[
                {
                    id: "back",
                    buttonText: "Back",
                    buttonVariant: "secondary",
                    callback: () => setShowSubmitDialog(false),
                },
                {
                    id: "submit",
                    buttonText: <span><Icon icon={{ id: "submit" }}/> Submit request</span>,
                    buttonVariant: "primary",
                    callback: submitRequestCallback,
                }
            ]}
        >
            <h3>{ loc.locType } LOC request</h3>
            <p>You are about to send your request for review to your Legal Officer.</p>
        </WarningDialog>
    </>);
}
