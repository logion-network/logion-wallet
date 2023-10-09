import { useEffect, useState, useMemo, useCallback } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import {
    LegalOfficer,
    PublicLoc,
    CollectionItem,
    CheckHashResult,
    MergedMetadataItem,
    MergedFile,
    MergedLink,
    LocData,
    CheckResultType,
    Token,
    CheckCertifiedCopyResult,
    TokensRecord,
} from "@logion/client";
import { UUID, Hash } from "@logion/node-api";

import { useLogionChain } from "../logion-chain";
import Button from "../common/Button";
import MailtoButton from "../common/MailtoButton";
import Icon from "../common/Icon";
import CertificateDateTimeCell from "./CertificateDateTimeCell";
import { copyToClipBoard } from "../common/Tools";
import NewTabLink from "../common/NewTabLink";
import DangerDialog from "../common/DangerDialog";
import { LIGHT_MODE } from "../legal-officer/Types";
import { RED } from "../common/ColorTheme";
import InlineDateTime from "../common/InlineDateTime";
import IconTextRow from "../common/IconTextRow";
import { fullCertificateUrl } from "../PublicPaths";

import CertificateCell from "./CertificateCell";
import CheckFileFrame from "src/components/checkfileframe/CheckFileFrame";
import CollectionItemCellRow from "./CollectionItemCellRow";
import IntroductionText from "./IntroductionText";
import LegalOfficerRow from "./LegalOfficerRow";
import { Children } from "src/common/types/Helpers";
import CheckDeliveredFrame from "src/components/deliverycheck/CheckDeliveredFrame";
import ClaimAssetButton from "./ClaimAssetButton";
import Authenticate from "./Authenticate";
import TokensRecords from "./TokensRecords";
import './Certificate.css'
import CertificateTitle from "./CertificateTitle";
import InlineHashString, { validValueOrHex } from "src/components/inlinehashstring/InlineHashString";

export default function Certificate() {

    const locIdParam = useParams<"locId">().locId!;
    const collectionItemIdParam = useParams<"collectionItemId">().collectionItemId;
    const [ searchParams ] = useSearchParams();
    const locId: UUID = useMemo(() => UUID.fromAnyString(locIdParam)!, [ locIdParam ]);
    const { client } = useLogionChain();
    const [ loc, setLoc ] = useState<PublicLoc | undefined | null>(undefined);
    const [ supersededLoc, setSupersededLoc ] = useState<PublicLoc | undefined>(undefined)
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficer | null>(null)
    const [ voidWarningVisible, setVoidWarningVisible ] = useState<boolean>(false);
    const [ nodeDown, setNodeDown ] = useState(false);
    const [ checkResult, setCheckResult ] = useState<CheckHashResult>();
    const [ collectionItem, setCollectionItem ] = useState<CollectionItem | undefined | null>(null);
    const [ tokenForDownload, setTokenForDownload ] = useState<Token | undefined>(undefined);
    const [ tokensRecords, setTokensRecords ] = useState<TokensRecord[] | null>(null);

    const checkHash = useCallback(async (hash: Hash) => {
        if (loc) {
            const result = await loc.checkHash(hash, collectionItem?.id);
            setCheckResult(result);
        }
    }, [ loc, setCheckResult, collectionItem?.id ]);

    useEffect(() => {
        if (loc === undefined && locId !== undefined && client?.legalOfficers !== undefined) {
            (async function () {
                try {
                    const publicLoc = await client.public.findLocById({ locId });
                    if (publicLoc) {
                        const data = publicLoc.data;
                        if(data.voidInfo?.replacer !== undefined && !searchParams.has("noredirect")) {
                            window.location.href = fullCertificateUrl(data.voidInfo.replacer, false, true);
                        } else {
                            setLoc(publicLoc);

                            if(publicLoc.data.voidInfo !== undefined) {
                                setVoidWarningVisible(true);
                            }
                            if(publicLoc.data.replacerOf !== undefined) {
                                const supersededLoc = await client.public.findLocById({ locId: publicLoc.data.replacerOf });
                                setSupersededLoc(supersededLoc);
                            }
                            if (collectionItemIdParam) {
                                const collectionItem = await client.public.findCollectionLocItemById({
                                    locId,
                                    itemId: Hash.fromHex(collectionItemIdParam),
                                });
                                setCollectionItem(collectionItem);
                            }
                        }
                    } else {
                        setLoc(null);
                    }
                } catch(e) {
                    setLoc(null);
                    setNodeDown(true);
                }
            })()
        }
    }, [ locId, loc, setLoc, client, searchParams, collectionItemIdParam ]);

    useEffect(() => {
        if (client !== null && legalOfficer === null && loc) {
            setLegalOfficer(client.legalOfficers.find(legalOfficer => legalOfficer.address === loc.data.ownerAddress) || null);
        }
    }, [ client, legalOfficer, setLegalOfficer, loc ]);

    useEffect(() => {
        if (client && tokenForDownload && tokensRecords === null) {
            client.public.getTokensRecords({ locId, jwtToken: tokenForDownload })
                .then(setTokensRecords)
        }
    }, [ client, locId, tokensRecords, tokenForDownload ]);

    if (!client || loc === undefined) {
        return (
            <div className="Certificate">
                <p>Connecting to node...</p>
            </div>
        )
    }

    if (loc === null) {
        return (
            <div className="CertificateBox">
                <Container>
                    <div className="Certificate">
                        <CertificateCell md={ 4 } label="LOC NOT FOUND">{ locId.toDecimalString() }</CertificateCell>
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
                <CertificateCell md={ 4 } label="UNKNOWN OFFICER">{ loc.data.ownerAddress }</CertificateCell>
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

    function hasRestrictedDeliveryCheckTool(loc: PublicLoc, collectionItem: CollectionItem | null | undefined): boolean {
        const isCollectionFileDelivery = loc.data.locType === "Collection" && (loc.data.files.length > 0);
        return isCollectionFileDelivery || isItemFileDelivery(collectionItem);
    }

    function isItemFileDelivery(collectionItem: CollectionItem | null | undefined): boolean {
        return collectionItem !== undefined && collectionItem !== null && collectionItem.restrictedDelivery;
    }

    async function checkCertifiedCopy(hash: Hash): Promise<CheckCertifiedCopyResult> {
        setCheckResult(undefined);
        if (isItemFileDelivery(collectionItem)) {
            const result = await collectionItem!.checkCertifiedCopy(hash);
            if (result.summary === CheckResultType.POSITIVE) {
                const collectionItemFile = collectionItem?.files.find(file => file.hash === result.match?.originalFileHash);
                setCheckResult({ collectionItemFile });
                return result;
            }
        }
        if(loc) {
            const result = await loc.checkCertifiedCopy(hash);
            if (result.summary === CheckResultType.POSITIVE) {
                const file = loc.data.files.find(file => file.hash === result.match?.originalFileHash);
                setCheckResult({ file })
                return result;
            }
        }
        if(tokensRecords) {
            for(const record of tokensRecords) {
                const result = await record.checkCertifiedCopy(hash);
                if (result.summary === CheckResultType.POSITIVE) {
                    const recordFile = record.files.find(file => file.hash === result.match?.originalFileHash);
                    setCheckResult({ recordFile });
                    return result;
                }
            }
        }
        return {
            summary: CheckResultType.NEGATIVE,
            latest: CheckResultType.NEGATIVE,
            logionOrigin: CheckResultType.NEGATIVE,
            nftOwnership: CheckResultType.NEGATIVE,
        };
    }

    let certificateBorderColor = "#3b6cf4";
    if (loc !== null && loc.data.voidInfo !== undefined) {
        certificateBorderColor = RED;
    }

    const tokenGated: boolean = collectionItem?.token?.type !== undefined;

    return (
        <div className="CertificateBox">
            {
                nodeDown &&
                <Container>
                    <div className="network-frame">
                        <IconTextRow
                            icon={ <Icon icon={ { id: "ko" } } /> }
                            text={
                                <p>The logion network is partially unavailable. As a consequence, some data may be temporarily
                                unavailable.</p>
                            }
                        />
                    </div>
                </Container>
            }
            {
                loc.data.voidInfo !== undefined &&
                <Container>
                    <div className="void-frame">
                        <VoidMessage left={ true } loc={ loc } />
                    </div>
                    <div className="void-stamp">
                        <Icon icon={{id: "void_certificate_background"}} />
                    </div>
                </Container>
            }
            {
                supersededLoc !== undefined &&
                <Container>
                    <div className="supersede-frame">
                        <SupersedeMessage loc={ supersededLoc } redirected={ searchParams.has("redirected") } />
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
                        loc.data.voidInfo === undefined &&
                        <Icon icon={ { id: "shield", category: "certificate" } } />
                    }
                    {
                        loc.data.voidInfo !== undefined &&
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
                        <CertificateTitle loc={ loc }/>
                    </Col>
                </Row>
                { tokenGated &&
                    <Row>
                        <Col md={ 5 }>
                            <Authenticate
                                walletType={ searchParams.get("wallet") }
                                locId={ loc.data.id }
                                item={ collectionItem! }
                                setTokenForDownload={ setTokenForDownload }
                            />
                        </Col>
                        <Col md={ 7 }>
                            <IntroductionText loc={ loc } tokenGated={ true } />
                        </Col>
                    </Row>
                }
                { !tokenGated &&
                    <Row>
                        <Col md={ 2 }/>
                        <Col md={ 8 }>
                            <IntroductionText loc={ loc } tokenGated={ false } />
                        </Col>
                    </Row>
                }
                <Row>
                    <CertificateCell md={ 5 } label="LOC ID">{ locId.toDecimalString() }</CertificateCell>
                    <CertificateDateTimeCell md={ 3 } label="Creation Date" dateTime={ loc.data.createdOn } />
                    <CertificateDateTimeCell md={ 3 } label="Closing Date" dateTime={ loc.data.closedOn } />
                </Row>
                <Row className="preamble-footer">
                    { loc.data.requesterAddress &&
                        <CertificateCell md={ 6 } label="Requester">
                            { loc.data.requesterAddress.address }
                        </CertificateCell>
                    }
                    { loc.data.requesterLocId &&
                        <CertificateCell md={ 6 } label="Requester">
                            <NewTabLink href={ fullCertificateUrl(loc.data.requesterLocId) }
                                        iconId="loc-link">{ loc.data.requesterLocId.toDecimalString() }</NewTabLink>
                            <p>Important note: this requester ID is not a standard public key but a Logion Identity LOC
                                established by the same Logion Officer mentioned in this certificate.</p>
                        </CertificateCell>
                    }
                </Row>
                {
                    loc.data.closed && loc.data.locType === "Identity" &&
                    <Row>
                        <CertificateCell md={ 6 } label="Related identity records existence proof">
                            { loc.data.seal }
                        </CertificateCell>
                    </Row>
                }
                { matrix(loc.data.metadata, 2).map((items, index) => (
                    <MetadataItemCellRow key={ index } items={ items } checkResult={ checkResult } />
                )) }
                { matrix(loc.data.files, 2).map((files, index) => (
                    <FileCellRow key={ index } files={ files } checkResult={ checkResult } loc={ loc.data }
                                 item={ collectionItem } tokenForDownload={ tokenForDownload } />
                )) }
                { matrix(loc.data.links, 2).map((links, index) => (
                    <LinkCellRow key={ index } links={ links } />
                )) }
                { collectionItem !== null &&
                    <CollectionItemCellRow
                        locId={ locId }
                        owner={ legalOfficer.address }
                        item={ collectionItem! }
                        checkResult={ checkResult }
                        isVoid={ loc.data.voidInfo !== undefined }
                        tokenForDownload={ tokenForDownload }
                    />
                }
                { collectionItem !== null && tokenForDownload !== undefined &&
                    <TokensRecords
                        locId={ locId }
                        owner={ legalOfficer.address }
                        collectionItem={ collectionItem! }
                        tokenForDownload={ tokenForDownload }
                        tokensRecords={ tokensRecords || [] }
                        checkResult={ checkResult }
                    />
                }
                <LegalOfficerRow legalOfficer={ legalOfficer } />
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
                    <VoidMessage left={ false } loc={ loc } />
                </DangerDialog>
            </Container>
            <Container className="CertificateCheck">
                <CheckFileFrame
                    checkHash={ checkHash }
                    checkResult={ checkResult === undefined ? "NONE" : ( checkResult.file || checkResult.collectionItem || checkResult.metadataItem || checkResult.collectionItemFile ? "POSITIVE" : "NEGATIVE") }
                    colorTheme={ LIGHT_MODE }
                    context="LOC"
                    checkedItem="confidential document"
                />
            </Container>
            {
                client && hasRestrictedDeliveryCheckTool(loc, collectionItem) &&
                <Container className="CopyCheck">
                    <CheckDeliveredFrame
                        checkCertifiedCopy={ checkCertifiedCopy }
                        colorTheme={ LIGHT_MODE }
                        detailedError={ false }
                        icon="polkadot_check_asset"
                        title="Restricted Download Check Tool"
                        buttonText="Check NFT Asset"
                    />
                </Container>
            }
        </div>
    )
}

function MetadataItemCellRow(props: { items: MergedMetadataItem[], checkResult: CheckHashResult | undefined }) {
    return (
        <Row>
            { props.items.map(
                item => <CertificateCell key={ item.name.hash.toHex() } md={ 6 } label={ <ItemCellTitle text={ validValueOrHex(item.name) } timestamp={ item.addedOn } /> } matched={ props.checkResult?.metadataItem?.value === item.value } >
                    <pre>{ validValueOrHex(item.value) }</pre>
                </CertificateCell>)
            }
        </Row>
    )
}

function ItemCellTitle(props: { text: Children, timestamp: string | undefined }) {
    return (
        <span>
            <span>{ props.text }</span>
            <span className="separator">|</span>
            <span>Timestamp:</span><span className="timestamp"> <InlineDateTime dateTime={ props.timestamp } /></span>
        </span>
    );
}

function FileCellRow(props: { loc: LocData, files: MergedFile[], checkResult: CheckHashResult | undefined, item?: CollectionItem | null, tokenForDownload: Token | undefined }) {
    return (
        <Row>
            { props.files.map(
                file => <CertificateCell key={ file.hash.toHex() } md={ 6 } label={ <ItemCellTitle
                    text={ <span>Document Hash <span className="file-nature">(<InlineHashString value={file.nature}/>)</span></span> }
                    timestamp={ file.addedOn } /> } matched={ props.checkResult?.file?.hash === file.hash }>
                    <p>{ file.hash.toHex() }</p>
                    {
                        file.restrictedDelivery && props.item &&
                        <div className="collection-claim-container">
                            <ClaimAssetButton
                                locId={ props.loc.id }
                                item={ props.item }
                                file={{
                                    hash: file.hash,
                                    name: validValueOrHex(file.nature),
                                    type: "Collection",
                                }}
                                owner={ props.loc.ownerAddress }
                                tokenForDownload={ props.tokenForDownload }
                            />
                        </div>
                    }
                </CertificateCell>)
            }
        </Row>
    )
}

function LinkCellRow(props: { links: MergedLink[] }) {
    return (
        <Row>
            { props.links.map(
                link =>
                    <CertificateCell key={ link.target } md={ 6 } label={ <ItemCellTitle text={ <span>Linked LOC <span className="file-nature">(<InlineHashString value={link.nature}/>)</span></span> } timestamp={ link.addedOn } /> }>
                        <NewTabLink href={ fullCertificateUrl(new UUID(link.target)) } iconId="loc-link">{ new UUID(link.target).toDecimalString() }</NewTabLink>
                    </CertificateCell>)
            }
        </Row>
    )
}

function VoidMessage(props: { loc: PublicLoc | undefined, left: boolean }) {
    return (
        <div className={ "VoidMessage" + (props.left ? " left": "") }>
            <div className="content">
                <div className="icon">
                    <Icon icon={{id: 'void'}} height="64px" />
                </div>
                <div className="text">
                    <h2>This Logion Legal Officer Case (LOC) is VOID</h2>
                    <p><strong>This LOC and its content are VOID since the following date:</strong> <InlineDateTime dateTime={ props.loc?.data.voidInfo?.voidedOn } /></p>
                    {
                        props.loc?.data.voidInfo?.replacer !== undefined &&
                        <p><strong>This VOID LOC has been replaced by the following LOC: </strong>
                        <NewTabLink
                            href={fullCertificateUrl(props.loc?.data.voidInfo?.replacer, true)}
                            iconId="loc-link"
                            inline
                        >
                            { props.loc?.data.voidInfo?.replacer.toDecimalString() }
                        </NewTabLink>
                        </p>
                    }
                </div>
            </div>
        </div>
    );
}

function SupersedeMessage(props: { loc: PublicLoc, redirected: boolean }) {
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
                    <p><strong>This LOC supersedes a previous LOC (VOID) since the following date:</strong> <InlineDateTime dateTime={ props.loc.data.voidInfo?.voidedOn } /></p>
                    <p><strong>For record purpose, the previous VOID LOC can be reached here: </strong>
                    <NewTabLink
                        href={ fullCertificateUrl(props.loc.data.id, true) }
                        iconId="loc-link"
                        inline
                    >
                        { props.loc.data.id.toDecimalString() }
                    </NewTabLink>
                    </p>
                </div>
            </div>
        </div>
    );
}
