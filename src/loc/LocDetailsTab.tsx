import { LocData, LegalOfficer, LocRequestState, DraftRequest, RejectedRequest, AcceptedRequest } from "@logion/client";
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
import { ContributionMode } from "./types";

import "./LocDetailsTab.css";
import { Row } from "src/common/Grid";
import { Viewer } from "src/common/CommonContext";
import Button from "src/common/Button";
import Icon from "src/common/Icon";
import { useCallback, useEffect, useState } from "react";
import WarningDialog from "src/common/WarningDialog";
import { useLocContext } from "./LocContext";
import { useNavigate } from "react-router-dom";
import { getTemplate, LocTemplate } from "./Template";
import LocTemplateItems from "./LocTemplateItems";
import { canAdd, getLinkData, LinkData, LocItem, MetadataData, FileData } from "./LocItem";
import { createDocumentTemplateItem, createLinkTemplateItem, createMetadataTemplateItem } from "./LocItemFactory";
import { useLogionChain } from "src/logion-chain";
import { CollectionInfo } from "./CollectionInfo";
import { TransactionInfo } from "./TransactionInfo";

export interface Props {
    loc: LocData;
    locState: LocRequestState;
    viewer: Viewer;
    contributionMode?: ContributionMode;
    detailsPath: (locId: UUID, type: LocType) => string;
    legalOfficer?: LegalOfficer;
    checkResult: DocumentCheckResult;
    locItems: LocItem[];
}

export default function LocDetailsTab(props: Props) {
    const {
        loc,
        locState,
    } = props;

    let locTabBorderColor = BLUE;
    if (loc.voidInfo !== undefined) {
        locTabBorderColor = RED;
    } else if (loc.status === "CLOSED") {
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
        if (!locState.discarded && locState.isLogionIdentity()) {
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
    contributionMode?: ContributionMode;
    detailsPath: (locId: UUID, type: LocType) => string;
    legalOfficer?: LegalOfficer;
    checkResult: DocumentCheckResult;
    locTabBorderColor: string;
}

export function LocDetailsTabContent(props: ContentProps) {
    const {
        viewer,
        detailsPath,
        legalOfficer,
        checkResult,
        locTabBorderColor,
    } = props;
    const [ showCancelDialog, setShowCancelDialog ] = useState(false);
    const [ showSubmitDialog, setShowSubmitDialog ] = useState(false);
    const { loc, backPath, mutateLocState, locItems, locState } = useLocContext();
    const navigate = useNavigate();
    const [ template, setTemplate ] = useState<LocTemplate>();
    const [ templateItems, setTemplateItems ] = useState<LocItem[]>([]);
    const [ customItems, setCustomItems ] = useState<LocItem[]>([]);
    const { api, accounts, client } = useLogionChain();

    useEffect(() => {
        if(api && client && loc && locState) {
            const theTemplate = getTemplate(loc.locType, loc.template);
            if(theTemplate) {
                setTemplate(theTemplate);
                (async function() {
                    const items: LocItem[] = [];

                    const templateDocuments = new Set<string>();
                    const templateItems = new Set<string>();
                    const templateLinks = new Set<string>();
                    if(loc.status !== "CLOSED") {
                        for(const documentTemplate of theTemplate.documents) {
                            const file = loc.files.find(item => item.nature.validValue() === documentTemplate.publicDescription);
                            if(file) {
                                templateDocuments.add(file.nature.validValue());
                            }
                            items.push(createDocumentTemplateItem(documentTemplate, file));
                        }

                        for(const dataTemplate of theTemplate.metadata) {
                            const data = loc.metadata.find(item => item.name.validValue() === dataTemplate.name);
                            if(data) {
                                templateItems.add(data.name.validValue());
                            }
                            items.push(createMetadataTemplateItem(dataTemplate, data));
                        }

                        for(const linkTemplate of theTemplate.links) {
                            const link = loc.links.find(item => item.nature.validValue() === linkTemplate.publicDescription);
                            let linkData: LinkData | undefined;
                            if(link) {
                                templateLinks.add(link.nature.validValue());
                                linkData = await getLinkData(accounts?.current?.accountId.address, locState.locsState(), link, detailsPath, client);
                            }
                            items.push(createLinkTemplateItem(linkTemplate, link, linkData));
                        }
                    }

                    setTemplateItems(items);

                    const customItems = locItems.filter(item =>
                        (item.type === "Linked LOC" && !templateLinks.has(item.as<LinkData>().nature.validValue()))
                        || (item.type === "Data" && !templateItems.has(item.as<MetadataData>().name.validValue()))
                        || (item.type === "Document" && !templateDocuments.has(item.as<FileData>().nature.validValue()))
                    );
                    setCustomItems(customItems);
                })();
            } else {
                setTemplate(undefined);
                setTemplateItems([]);
                setCustomItems(locItems);
            }
        } else {
            setTemplate(undefined);
            setTemplateItems([]);
            setCustomItems(locItems);
        }
    }, [ api, loc, template, locItems, accounts, detailsPath, locState, client ]);

    const confirmCancel = useCallback(() => {
        setShowCancelDialog(true);
    }, []);

    const cancelRequestCallback = useCallback(async () => {
        await mutateLocState(async current => {
            if(current instanceof DraftRequest || current instanceof AcceptedRequest) {
                const newLocs = await current.cancel();
                navigate(backPath);
                return newLocs;
            } else {
                return current;
            }
        });
    }, [ mutateLocState, navigate, backPath ]);

    const confirmSubmit = useCallback(() => {
        setShowSubmitDialog(true);
    }, []);

    const submitRequestCallback = useCallback(async () => {
        await mutateLocState(async current => {
            if(current instanceof DraftRequest) {
                const next = await current.submit();
                navigate(backPath);
                return next;
            } else {
                return current;
            }
        });
    }, [ mutateLocState, navigate, backPath ]);

    const resubmitRequestCallback = useCallback(async (request: LocData) => {
        await mutateLocState(async current => {
            if(current instanceof RejectedRequest) {
                const next = await current.rework();
                navigate(backPath);
                return next.locsState();
            } else {
                return current;
            }
        });
    }, [ mutateLocState, navigate, backPath ]);

    if(!loc) {
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
                {
                    viewer === "LegalOfficer" && loc.status === 'CLOSED' && template &&
                    <LocItemDetail label="Closing date" spinner={ loc.closedOn === undefined }>
                        <InlineDateTime dateTime={ loc.closedOn } />
                    </LocItemDetail>
                }
            </Col>

            <Col md={ 4 }>
                <LocItemDetail label="Description">{ loc.description }</LocItemDetail>
                {
                    viewer === "LegalOfficer" && template &&
                    <div>
                        <LocItemDetail label="Project type">{ template.name }</LocItemDetail>
                        <Icon icon={ template.icon } width="64px"/>
                    </div>
                }
                {
                    viewer === "User" && loc.sponsorshipId &&
                    <LocItemDetail label="Sponsorship ID" copyButtonText={ loc.sponsorshipId.toDecimalString() }>{ loc.sponsorshipId.toDecimalString() }</LocItemDetail>
                }
                {
                    loc.status === 'CLOSED' && (viewer !== "LegalOfficer" || !template) &&
                    <LocItemDetail label="Closing date" spinner={ loc.closedOn === undefined }>
                        <InlineDateTime dateTime={ loc.closedOn } />
                    </LocItemDetail>
                }
            </Col>

            <Col md={ 4 }>
                <RequesterOrLegalOfficer
                    loc={ loc }
                    viewer={ viewer }
                    detailsPath={ detailsPath }
                    legalOfficer={ legalOfficer }
                />
                {
                    viewer === "LegalOfficer" && loc.sponsorshipId &&
                    <LocItemDetail label="Sponsorship ID" copyButtonText={ loc.sponsorshipId.toDecimalString() }>{ loc.sponsorshipId.toDecimalString() }</LocItemDetail>
                }
            </Col>
        </Row>
        {
            loc.locType === "Identity" &&
            <>
            <div className="separator" style={ { backgroundColor: locTabBorderColor } } />
            <PersonalInfo personalAndStatusInfo={ loc } />
            </>
        }
        {
            loc.locType === "Collection" &&
            <>
            <div className="separator" style={ { backgroundColor: locTabBorderColor } } />
            <CollectionInfo collection={ loc } />
            </>
        }
        {
            loc.locType === "Transaction" &&
            <>
            <div className="separator" style={ { backgroundColor: locTabBorderColor } } />
            <TransactionInfo loc={ loc } />
            </>
        }
        <div className="separator" style={ { backgroundColor: locTabBorderColor } } />
        {
            templateItems.length > 0 &&
            <>
            <LocTemplateItems
                contributionMode={ props.contributionMode }
                templateItems={ templateItems }
            />
            <div className="separator" style={ { backgroundColor: locTabBorderColor } } />
            </>
        }
        <LocItems
            matchedHash={ checkResult.hash }
            viewer={ props.viewer }
            contributionMode={ props.contributionMode }
            locItems={ customItems }
            isEmpty={ locItems.length === 0 }
            hideHeader={ templateItems.length > 0 }
        />
        <Row>
            <Col xxl={ 7 } xl={ 6 }>
                {
                    canAdd(viewer, loc) &&
                    <ButtonGroup align="left">
                        <LocPublicDataButton
                            text="Add public data"
                        />
                        <LocPrivateFileButton
                            text="Add a private document"
                        />
                        <LocLinkButton
                            text="Link to an existing LOC"
                        />
                    </ButtonGroup>
                }
            </Col>
            {
                viewer === "LegalOfficer" &&
                <>
                <Col className="close-button-container" xxl={ 5 } xl={ 6 }>
                    {
                        !loc.voidInfo &&
                        <CloseLocButton />
                    }
                </Col>
                </>
            }
            {
                viewer === "User" &&
                <>
                <Col xxl={ 5 } xl={ 6 }>
                    {
                        loc.iDenfy?.status !== "PENDING" &&
                        <ButtonGroup
                            align="right"
                        >
                            {
                                (loc.status === "DRAFT" || loc.status === "REVIEW_REJECTED" || loc.status === "REVIEW_ACCEPTED") &&
                                <Button
                                    variant="danger"
                                    onClick={ confirmCancel }
                                >
                                    <Icon icon={{ id: "void_inv" }}/> Cancel request
                                </Button>
                            }
                            {
                                loc.status === "DRAFT" &&
                                <Button
                                    onClick={ confirmSubmit }
                                >
                                    <Icon icon={{ id: "submit" }}/> Submit request
                                </Button>
                            }
                            {
                                loc.status === "REVIEW_REJECTED" &&
                                <Button
                                    onClick={ resubmitRequestCallback }
                                >
                                    <Icon icon={{ id: "edit" }}/> Re-edit as draft
                                </Button>
                            }
                        </ButtonGroup>
                    }
                </Col>
                </>
            }
        </Row>
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
