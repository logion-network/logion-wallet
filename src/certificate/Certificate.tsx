import { UUID } from "../logion-chain/UUID";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { useLogionChain } from "../logion-chain";
import { useEffect, useState, useMemo } from "react";
import { getLegalOfficerCase } from "../logion-chain/LogionLoc";
import { File, LegalOfficerCase, Link, MetadataItem, VoidInfo } from "../logion-chain/Types";
import CertificateCell from "./CertificateCell";
import { LegalOfficer, getOfficer } from "../common/types/LegalOfficer";
import Button from "../common/Button";
import { Row, Col, Container } from "react-bootstrap";
import MailtoButton from "../common/MailtoButton";
import './Certificate.css'
import Icon from "../common/Icon";
import { LocRequest } from "../common/types/ModelTypes";
import { fetchPublicLoc } from "../common/Model";
import CertificateDateTimeCell from "./CertificateDateTimeCell";
import { copyToClipBoard } from "../common/Tools";
import { anonymousAxiosFactory } from "../common/api";
import { fullCertificateUrl } from "../PublicPaths";
import NewTabLink from "../common/NewTabLink";
import DangerDialog from "../common/DangerDialog";
import { LIGHT_MODE } from "../legal-officer/Types";
import { RED } from "../common/ColorTheme";
import InlineDateTime from "../common/InlineDateTime";

export default function Certificate() {

    const locIdParam = useParams<"locId">().locId!;
    const [ searchParams ] = useSearchParams();
    const locId: UUID = useMemo(() => UUID.fromAnyString(locIdParam)!, [ locIdParam ]);
    const { api, apiState } = useLogionChain();
    const [ loc, setLoc ] = useState<LegalOfficerCase | undefined>(undefined)
    const [ supersededLoc, setSupersededLoc ] = useState<LegalOfficerCase | undefined>(undefined)
    const [ supersededLocRequest, setSupersededLocRequest ] = useState<LocRequest | undefined>(undefined)
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficer | null>(null)
    const axiosFactory = anonymousAxiosFactory();
    const [ publicLoc, setPublicLoc ] = useState<LocRequest>()
    const [ voidWarningVisible, setVoidWarningVisible ] = useState<boolean>(false);

    useEffect(() => {
        if (api !== null && apiState === 'READY' && axiosFactory !== undefined && loc === undefined) {
            (async function () {
                const legalOfficerCase = await getLegalOfficerCase({ api, locId });
                if (legalOfficerCase) {
                    if(legalOfficerCase.voidInfo?.replacer !== undefined && !searchParams.has("noredirect")) {
                        window.location.href = fullCertificateUrl(legalOfficerCase.voidInfo.replacer, false, true);
                    } else {
                        setLoc(legalOfficerCase)
                        setLegalOfficer(getOfficer(legalOfficerCase.owner))
                        setPublicLoc(await fetchPublicLoc(axiosFactory(legalOfficerCase.owner), locId.toString()));
                        if(legalOfficerCase.voidInfo !== undefined) {
                            setVoidWarningVisible(true);
                        }
                        if(legalOfficerCase.replacerOf !== undefined) {
                            const supersededLoc = await getLegalOfficerCase({ api, locId: legalOfficerCase.replacerOf });
                            setSupersededLoc(supersededLoc);
                            setSupersededLocRequest(await fetchPublicLoc(axiosFactory(legalOfficerCase.owner), legalOfficerCase.replacerOf.toString()));
                        }
                    }
                }
            })()
        }
    }, [ api, apiState, locId, loc, setLoc, setLegalOfficer, setPublicLoc, axiosFactory, searchParams ])

    if (apiState !== 'READY') {
        return (
            <div className="Certificate">
                <p>Connecting to node... [{apiState}]</p>
            </div>
        )
    }

    if (loc === undefined) {
        return (
            <div className="Certificate">
                <CertificateCell md={ 4 } label="LOC NOT FOUND">{ locId.toDecimalString() }</CertificateCell>
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
    if (publicLoc) {
        createdOn = publicLoc.createdOn;
        closedOn = publicLoc.closedOn;
    }

    let certificateBorderColor = "#3b6cf4";
    if(loc !== null && loc.voidInfo !== undefined) {
        certificateBorderColor = RED;
    }

    return (
        <>
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
                        <p className="description">This Logion Legal Officer Case (LOC) certificate constitutes proof that a Logion Legal Officer, owner of that LOC and mentioned on this document, executed a verification process according to his/her professional standards at the requester demand with regards to data and document(s) listed below.</p>
                    </Col>
                </Row>
                <Row>
                    <CertificateCell md={ 5 } label="LOC ID">{ locId.toDecimalString() }</CertificateCell>
                    <CertificateDateTimeCell md={ 3 } label="Creation Date" dateTime={ createdOn } />
                    <CertificateDateTimeCell md={ 3 } label="Closing Date" dateTime={ closedOn } />
                </Row>
                <Row className="preamble-footer">
                    <CertificateCell md={ 6 } label="Owner">{ loc.owner }</CertificateCell>
                    <CertificateCell md={ 6 } label="Requester">{ loc.requester }</CertificateCell>
                </Row>
                { matrix(loc.metadata, 2).map((items) => (
                    <MetadataItemCellRow items={ items } />
                )) }
                { matrix(loc.files, 2).map((files) => (
                    <FileCellRow files={ files } />
                )) }
                { matrix(loc.links, 2).map((links) => (
                    <LinkCellRow links={ links } />
                )) }
                <LegalOfficerRow legalOfficer={ legalOfficer } />
                <Row className="buttons">
                    <Col xl={ 2 } lg={4} md={4}>
                        <MailtoButton label="Contact" email={ legalOfficer.email } />
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
        </>
    )
}

function LegalOfficerRow(props: { legalOfficer: LegalOfficer }) {
    return (
        <Row className="legal-officer-row">
            <CertificateCell xl={ 2 } md={ 6 } label="Legal Officer">{ props.legalOfficer.name }</CertificateCell>
            <CertificateCell xl={ 4 } md={ 6 } label="Address">
                { props.legalOfficer.details.split(/\n/).map((line, index) => (
                    <span key={ index }>{ line }<br /></span>)) }
            </CertificateCell>
        </Row>
    )
}

function MetadataItemCellRow(props: { items: MetadataItem[] }) {
    return (
        <Row>
            { props.items.map(
                item => <CertificateCell md={ 6 } label={ item.name }><pre>{ item.value }</pre></CertificateCell>) }
        </Row>
    )
}

function FileCellRow(props: { files: File[] }) {
    return (
        <Row>
            { props.files.map(
                file => <CertificateCell md={ 6 } label={ `Document Hash (${file.nature})` }>{ file.hash }</CertificateCell>) }
        </Row>
    )
}

function LinkCellRow(props: { links: Link[] }) {
    return (
        <Row>
            { props.links.map(
                link =>
                    <CertificateCell md={ 6 } label={ `Linked LOC (${ link.nature })` }>
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
                    <p><strong>This LOC and its content is VOID since the following date:</strong> <InlineDateTime dateTime={ props.locRequest?.voidInfo?.voidedOn } /></p>
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
