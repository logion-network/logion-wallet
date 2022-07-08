import { useEffect, useState, useMemo, useCallback } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";

import { UUID } from "@logion/node-api/dist/UUID";
import { getLegalOfficerCase, getCollectionItem } from "@logion/node-api/dist/LogionLoc";
import { LegalOfficerCase, VoidInfo } from "@logion/node-api/dist/Types";

import { useLogionChain } from "../logion-chain";
import Button from "../common/Button";
import MailtoButton from "../common/MailtoButton";
import Icon from "../common/Icon";
import { LocFile, LocLink, LocMetadataItem, LocRequest, MergedCollectionItem } from "../common/types/ModelTypes";
import { fetchPublicLoc, fetchPublicCollectionItem } from "../common/Model";
import CertificateDateTimeCell from "./CertificateDateTimeCell";
import { copyToClipBoard } from "../common/Tools";
import { anonymousAxiosFactory } from "../common/api";
import NewTabLink from "../common/NewTabLink";
import DangerDialog from "../common/DangerDialog";
import { LIGHT_MODE } from "../legal-officer/Types";
import { RED } from "../common/ColorTheme";
import InlineDateTime from "../common/InlineDateTime";
import IconTextRow from "../common/IconTextRow";
import { fullCertificateUrl } from "../PublicPaths";


import CertificateCell from "./CertificateCell";
import './Certificate.css'
import CheckFileFrame, { DocumentCheckResult } from "../loc/CheckFileFrame";
import CollectionItemCellRow from "./CollectionItemCellRow";
import IntroductionText from "./IntroductionText";
import LegalOfficerRow from "./LegalOfficerRow";
import { LegalOfficer } from "@logion/client";
import { Children } from "src/common/types/Helpers";

export default function Certificate() {

    const locIdParam = useParams<"locId">().locId!;
    const collectionItemIdParam = useParams<"collectionItemId">().collectionItemId;
    const [ searchParams ] = useSearchParams();
    const locId: UUID = useMemo(() => UUID.fromAnyString(locIdParam)!, [ locIdParam ]);
    const { api, client } = useLogionChain();
    const [ loc, setLoc ] = useState<LegalOfficerCase | undefined>(undefined)
    const [ supersededLoc, setSupersededLoc ] = useState<LegalOfficerCase | undefined>(undefined)
    const [ supersededLocRequest, setSupersededLocRequest ] = useState<LocRequest | undefined>(undefined)
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficer | null>(null)
    const [ publicLoc, setPublicLoc ] = useState<LocRequest>()
    const [ voidWarningVisible, setVoidWarningVisible ] = useState<boolean>(false);
    const [ nodeDown, setNodeDown ] = useState(false);
    const [ checkResult, setCheckResult ] = useState<DocumentCheckResult>({result: "NONE"});
    const [ collectionItem, setCollectionItem ] = useState<MergedCollectionItem | undefined | null>(null);

    const checkHash = useCallback((hash: string) => {
        if (loc) {
            for (let i = 0; i < loc.files!.length; ++i) {
                const file = loc.files[i]
                if (file?.hash === hash) {
                    setCheckResult({
                        result: "POSITIVE",
                        hash
                    });
                    return;
                }
            }

            for (let i = 0; i < loc.metadata!.length; ++i) {
                const item = loc.metadata[i]
                if (item?.value === hash) {
                    setCheckResult({
                        result: "POSITIVE",
                        hash
                    });
                    return;
                }
            }
        }

        if(collectionItem) {
            if (collectionItem?.id === hash) {
                setCheckResult({
                    result: "POSITIVE",
                    hash
                });
                return;
            }
            if (collectionItem?.description === hash) {
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
    }, [ loc, setCheckResult, collectionItem ]);

    useEffect(() => {
        if (api !== null && loc === undefined && locId !== undefined && client?.legalOfficers !== undefined) {
            (async function () {
                const legalOfficerCase = await getLegalOfficerCase({ api, locId });
                if (legalOfficerCase) {
                    if(legalOfficerCase.voidInfo?.replacer !== undefined && !searchParams.has("noredirect")) {
                        window.location.href = fullCertificateUrl(legalOfficerCase.voidInfo.replacer, false, true);
                    } else {
                        setLoc(legalOfficerCase)
                        const axiosFactory = anonymousAxiosFactory(client!.legalOfficers);
                        try {
                            setPublicLoc(await fetchPublicLoc(axiosFactory(legalOfficerCase.owner), locId.toString()));
                        } catch(error) {
                            setNodeDown(true);
                        }
                        if(legalOfficerCase.voidInfo !== undefined) {
                            setVoidWarningVisible(true);
                        }
                        if(legalOfficerCase.replacerOf !== undefined) {
                            const supersededLoc = await getLegalOfficerCase({ api, locId: legalOfficerCase.replacerOf });
                            setSupersededLoc(supersededLoc);
                            try {
                                setSupersededLocRequest(await fetchPublicLoc(axiosFactory(legalOfficerCase.owner), legalOfficerCase.replacerOf.toString()));
                            } catch(error) {
                                setNodeDown(true);
                            }
                        }
                        if (collectionItemIdParam) {
                            try {
                                const collectionItem = await getCollectionItem({
                                    api,
                                    locId,
                                    itemId: collectionItemIdParam
                                })
                                if (collectionItem) {
                                    let addedOn = undefined;
                                    try {
                                        const locCollectionItem = await fetchPublicCollectionItem(
                                            axiosFactory(legalOfficerCase.owner),
                                            locId.toString(),
                                            collectionItemIdParam);
                                        addedOn = locCollectionItem.addedOn;
                                    } catch (e) {
                                        // ignored
                                    }
                                    const mergedCollectionItem: MergedCollectionItem = {
                                        ...collectionItem,
                                        addedOn
                                    }
                                    setCollectionItem(mergedCollectionItem)
                                } else {
                                    setCollectionItem(undefined)
                                }
                            } catch (e) {
                                setCollectionItem(undefined)
                            }
                        }
                    }
                }
            })()
        }
    }, [ api, locId, loc, setLoc, setPublicLoc, client, searchParams, collectionItemIdParam ])

    useEffect(() => {
        if (client !== null && legalOfficer === null && loc !== undefined) {
            setLegalOfficer(client.legalOfficers.find(legalOfficer => legalOfficer.address === loc.owner)!);
        }
    }, [ client, legalOfficer, setLegalOfficer, loc ])

    if (api === null) {
        return (
            <div className="Certificate">
                <p>Connecting to node...</p>
            </div>
        )
    }

    if (loc === undefined) {
        return (
            <div className="CertificateBox">
                <Container>
                    <div className="Certificate">
                        <CertificateCell md={ 4 } label="LOC NOT FOUND">{ locIdParam }</CertificateCell>
                    </div>
                </Container>
            </div>
        )
    }

    if (collectionItemIdParam && collectionItem === undefined) {
        return (
            <div className="CertificateBox">
                <Container>
                    <Row>
                        <CertificateCell md={ 4 } label="LOC ID">{ locId.toDecimalString() }</CertificateCell>
                        <CertificateCell md={ 4 }
                                         label="COLLECTION ITEM NOT FOUND">{ collectionItemIdParam }</CertificateCell>
                    </Row>
                </Container>
            </div>
        )
    }

    if (legalOfficer === null) {
        return (
            <div className="Certificate">
                <CertificateCell md={ 4 } label="LOC ID">{ locId.toDecimalString() }</CertificateCell>
                <CertificateCell md={ 4 } label="UNKNOWN OFFICER">{ loc.owner }</CertificateCell>
            </div>
        )
    }

    function matrix<T>(elements: T[], cols: number): T[][] {
        let result: T[][] = new Array<T[]>();
        let row = -1;
        for (let i = 0; i < elements.length; i++) {
            const col = i % cols;
            if (col === 0) {
                result.push([])
                row++
            }
            result[row].push(elements[i])
        }
        return result;
    }

    let createdOn = undefined;
    let closedOn = undefined;
    let metadata: LocMetadataItem[] = loc.metadata.map(item => ({
        ...item,
        addedOn: "?"
    }));
    let files: LocFile[] = loc.files.map(file => ({
        ...file,
        name: "?",
        addedOn: "?"
    }));
    let links: LocLink[] = loc.links.map(link => ({
        ...link,
        target: link.id.toString(),
        addedOn: "?"
    }));
    if (publicLoc) {
        createdOn = publicLoc.createdOn;
        closedOn = publicLoc.closedOn;
        metadata = publicLoc.metadata;
        files = publicLoc.files;
        links = publicLoc.links;
    }

    let certificateBorderColor = "#3b6cf4";
    if(loc !== null && loc.voidInfo !== undefined) {
        certificateBorderColor = RED;
    }

    return (
        <div className="CertificateBox">
            {
                nodeDown &&
                <Container>
                    <div className="network-frame">
                        <IconTextRow
                            icon={ <Icon icon={{id: "ko"}} /> }
                            text={
                                <p>The logion network is partially unavailable. As a consequence, some data may be temporarily
                                unavailable.</p>
                            }
                        />
                    </div>
                </Container>
            }
            {
                loc.voidInfo !== undefined &&
                <Container>
                    <div className="void-frame">
                        <VoidMessage left={ true } locRequest={ publicLoc } voidInfo={ loc.voidInfo } />
                    </div>
                    <div className="void-stamp">
                        <Icon icon={{id: "void_certificate_background"}} />
                    </div>
                </Container>
            }
            {
                supersededLoc !== undefined && supersededLocRequest !== undefined &&
                <Container>
                    <div className="supersede-frame">
                        <SupersedeMessage loc={ supersededLoc } supersededLocId={ loc.replacerOf! } supersededLoc={ supersededLocRequest } redirected={ searchParams.has("redirected") } />
                    </div>
                </Container>
            }
            <Container
                className="Certificate"
                style={{borderColor: certificateBorderColor}}
            >
                <div className="background-icon">
                    <Icon icon={ { id: "background", category: "certificate" } } />
                </div>
                <div className="shield-icon">
                    {
                        loc.voidInfo === undefined &&
                        <Icon icon={ { id: "shield", category: "certificate" } } />
                    }
                    {
                        loc.voidInfo !== undefined &&
                        <Icon icon={ { id: "void_shield", category: "certificate" } } />
                    }
                </div>
                <div className="folder-icon">
                    <Icon icon={ { id: "folder", category: "certificate" } } />
                </div>
                <Row className="header">
                    <Col md={ 2 } className="logo-container">
                        <img className="logo" src={ process.env.PUBLIC_URL + "/logo_black.png" } alt="logo" />
                    </Col>
                    <Col md={ 8 }>
                        <h2>Legal Officer Case</h2>
                        <h1>CERTIFICATE</h1>
                        <IntroductionText locId={ locId } loc={ loc } />
                    </Col>
                </Row>
                <Row>
                    <CertificateCell md={ 5 } label="LOC ID">{ locId.toDecimalString() }</CertificateCell>
                    <CertificateDateTimeCell md={ 3 } label="Creation Date" dateTime={ createdOn } />
                    <CertificateDateTimeCell md={ 3 } label="Closing Date" dateTime={ closedOn } />
                </Row>
                <Row className="preamble-footer">
                    { loc.requesterAddress && <CertificateCell md={ 6 } label="Requester">
                        { loc.requesterAddress }
                    </CertificateCell> }
                    { loc.requesterLocId && <CertificateCell md={ 6 } label="Requester">
                        <NewTabLink href={ fullCertificateUrl(loc.requesterLocId) }
                                    iconId="loc-link">{ loc.requesterLocId.toDecimalString() }</NewTabLink>
                        <p>Important note: this requester ID is not a standard public key but a Logion Identity LOC
                            established by the same Logion Officer mentioned in this certificate.</p>
                    </CertificateCell> }

                </Row>
                { matrix(metadata, 2).map((items, index) => (
                    <MetadataItemCellRow key={ index } items={ items } checkResult={ checkResult } />
                )) }
                { matrix(files, 2).map((files, index) => (
                    <FileCellRow key={ index } files={ files } checkResult={ checkResult } />
                )) }
                { matrix(links, 2).map((links, index) => (
                    <LinkCellRow key={ index } links={ links } />
                )) }
                { collectionItem !== null &&
                    <CollectionItemCellRow item={ collectionItem! } checkResult={ checkResult } />
                }
                <LegalOfficerRow legalOfficer={ legalOfficer } loc={ loc } />
                <Row className="buttons">
                    <Col xl={ 2 } lg={4} md={4}>
                        <MailtoButton label="Contact" email={ legalOfficer.userIdentity.email } />
                    </Col>
                    <Col xl={ 2 } lg={4} md={4}>
                        <Button onClick={ () => copyToClipBoard(window.location.href) }>Copy URL</Button>
                    </Col>
                    <Col xl={ 2 } lg={4} md={4}>
                        <a href="https://logion.network" target="_blank" rel="noreferrer">logion.network</a>
                    </Col>
                </Row>
                <DangerDialog
                    show={ voidWarningVisible }
                    size="lg"
                    actions={[
                        {
                            id: "cancel",
                            buttonText: <span><Icon icon={{id: "view"}} /> View VOID LOC</span>,
                            buttonVariant: "danger",
                            callback: () => setVoidWarningVisible(false)
                        }
                    ]}
                    colors={ LIGHT_MODE.dialog }
                >
                    <VoidMessage left={ false } locRequest={ publicLoc } voidInfo={ loc.voidInfo! } />
                </DangerDialog>
            </Container>
            <Container className="CertificateCheck">
                <CheckFileFrame
                    checkHash={ checkHash }
                    checkResult={ checkResult.result }
                    colorTheme={ LIGHT_MODE }
                />
            </Container>
        </div>
    )
}

function MetadataItemCellRow(props: { items: LocMetadataItem[], checkResult: DocumentCheckResult }) {
    return (
        <Row>
            { props.items.map(
                item => <CertificateCell key={ item.name } md={ 6 } label={ <ItemCellTitle text={ item.name } timestamp={ item.addedOn } /> } matched={ props.checkResult.hash === item.value } >
                    <pre>{ item.value }</pre>
                </CertificateCell>)
            }
        </Row>
    )
}

function ItemCellTitle(props: { text: Children, timestamp: string }) {
    return (
        <span>
            <span>{ props.text }</span>
            <span className="separator">|</span>
            <span>Timestamp:</span><span className="timestamp"> <InlineDateTime dateTime={ props.timestamp } /></span>
        </span>
    );
}

function FileCellRow(props: { files: LocFile[], checkResult: DocumentCheckResult }) {
    return (
        <Row>
            { props.files.map(
                file => <CertificateCell key={ file.hash } md={ 6 } label={ <ItemCellTitle text={ <span>Document Hash <span className="file-nature">({ file.nature })</span></span> } timestamp={ file.addedOn } /> } matched={ props.checkResult.hash === file.hash } >
                    <p>{ file.hash }</p>
                </CertificateCell>)
            }
        </Row>
    )
}

function LinkCellRow(props: { links: LocLink[] }) {
    return (
        <Row>
            { props.links.map(
                link =>
                    <CertificateCell key={ link.id.toString() } md={ 6 } label={ <ItemCellTitle text={ <span>Linked LOC <span className="file-nature">({ link.nature })</span></span> } timestamp={ link.addedOn } /> }>
                        <NewTabLink href={ fullCertificateUrl(link.id) } iconId="loc-link">{ link.id.toDecimalString() }</NewTabLink>
                    </CertificateCell>)
            }
        </Row>
    )
}

function VoidMessage(props: { locRequest: LocRequest | undefined, voidInfo: VoidInfo, left: boolean }) {
    return (
        <div className={ "VoidMessage" + (props.left ? " left": "") }>
            <div className="content">
                <div className="icon">
                    <Icon icon={{id: 'void'}} height="64px" />
                </div>
                <div className="text">
                    <h2>This Logion Legal Officer Case (LOC) is VOID</h2>
                    <p><strong>This LOC and its content are VOID since the following date:</strong> <InlineDateTime dateTime={ props.locRequest?.voidInfo?.voidedOn } /></p>
                    {
                        props.voidInfo.replacer !== undefined &&
                        <p><strong>This VOID LOC has been replaced by the following LOC: </strong>
                        <NewTabLink
                            href={fullCertificateUrl(props.voidInfo.replacer, true)}
                            iconId="loc-link"
                            inline
                        >
                            { props.voidInfo.replacer.toDecimalString() }
                        </NewTabLink>
                        </p>
                    }
                </div>
            </div>
        </div>
    );
}

function SupersedeMessage(props: { loc: LegalOfficerCase, supersededLocId: UUID, supersededLoc: LocRequest, redirected: boolean }) {
    return (
        <div className="SupersedeMessage">
            <div className="content">
                <div className="icon">
                    <Icon icon={{id: 'void_supersede'}} width="80px" />
                </div>
                <div className="text">
                    {
                        props.redirected &&
                        <p><strong>IMPORTANT:</strong> The Logion Legal Officer Case (LOC) you try to reach has been voided
                        and superseded by the LOC below.</p>
                    }
                    {
                        !props.redirected &&
                        <p><strong>IMPORTANT:</strong> This Logion Legal Officer Case (LOC) supersedes a previous LOC (VOID).</p>
                    }
                    <p><strong>This LOC supersedes a previous LOC (VOID) since the following date:</strong> <InlineDateTime dateTime={ props.supersededLoc.voidInfo?.voidedOn } /></p>
                    <p><strong>For record purpose, the previous VOID LOC can be reached here: </strong>
                    <NewTabLink
                        href={fullCertificateUrl(props.supersededLocId, true)}
                        iconId="loc-link"
                        inline
                    >
                        { props.supersededLocId.toDecimalString() }
                    </NewTabLink>
                    </p>
                </div>
            </div>
        </div>
    );
}
