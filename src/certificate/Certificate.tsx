import { UUID } from "../logion-chain/UUID";
import { useParams } from "react-router";
import { useLogionChain } from "../logion-chain";
import { useEffect, useState, useMemo } from "react";
import { getLegalOfficerCase } from "../logion-chain/LogionLoc";
import { LegalOfficerCase, MetadataItem } from "../logion-chain/Types";
import { Row } from "../common/Grid";
import CertificateCell from "./CertificateCell";
import { LegalOfficer, getOfficer } from "../common/types/LegalOfficer";
import Button from "../common/Button";
import { Col } from "react-bootstrap";
import { Link } from 'react-router-dom';
import MailtoButton from "../common/MailtoButton";
import { displayName } from "../legal-officer/transaction-protection/LocItemFactory";
import './Certificate.css'
import Icon from "../common/Icon";
import { LocRequest } from "../common/types/ModelTypes";
import { fetchPublicLoc } from "../common/Model";
import CertificateDateTimeCell from "./CertificateDateTimeCell";
import { copyToClipBoard } from "../common/Tools";
import { anonymousAxiosFactory } from "../common/api";

export default function Certificate() {

    const locIdParam = useParams<{ locId: string }>().locId;
    const locId: UUID = useMemo(() => new UUID(locIdParam), [ locIdParam ]);
    const { api, apiState } = useLogionChain();
    const [ loc, setLoc ] = useState<LegalOfficerCase | undefined>(undefined)
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficer | null>(null)
    const axiosFactory = anonymousAxiosFactory();
    const [ publicLoc, setPublicLoc ] = useState<LocRequest>()

    useEffect(() => {
        if (api !== null && apiState === 'READY' && axiosFactory !== undefined && loc === undefined) {
            (async function () {
                const legalOfficerCase = await getLegalOfficerCase({ api, locId });
                if (legalOfficerCase) {
                    setLoc(legalOfficerCase)
                    setLegalOfficer(getOfficer(legalOfficerCase.owner))
                    fetchPublicLoc(axiosFactory(legalOfficerCase.owner), locId.toString())
                        .then(setPublicLoc)
                }
            })()
        }
    }, [ api, apiState, locId, loc, setLoc, setLegalOfficer, setPublicLoc, axiosFactory ])

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

    return (
        <div className="Certificate">
            <div className="shield-icon">
                <Icon icon={ { id: "shield", category: "certificate" } } />
            </div>
            <div className="background-icon">
                <Icon icon={ { id: "background", category: "certificate" } } />
            </div>
            <div className="folder-icon">
                <Icon icon={ { id: "folder", category: "certificate" } } />
            </div>
            <Row className="header">
                <Col md={ 2 }>
                    <img className="logo" src={ process.env.PUBLIC_URL + "/logo_black.png" } alt="logo" />
                </Col>
                <Col md={ 8 }>
                    <h2>Legal Officer Case</h2>
                    <h1>CERTIFICATE</h1>
                </Col>
            </Row>
            <Row>
                <CertificateCell md={ 5 } label="LOC ID">{ locId.toDecimalString() }</CertificateCell>
                <CertificateDateTimeCell md={ 2 } label="Creation Date" dateTime={ createdOn } />
                <CertificateDateTimeCell md={ 2 } label="Closing Date" dateTime={ closedOn } />
            </Row>
            <Row>
                <CertificateCell md={ 6 } label="Owner">{ loc.owner }</CertificateCell>
                <CertificateCell md={ 6 } label="Requester">{ loc.requester }</CertificateCell>
            </Row>
            { matrix(loc.metadata, 2).map((items) => (
                <MetadataItemCellRow items={ items } />
            )) }
            { matrix(loc.hashes, 2).map((hashes) => (
                <HashCellRow hashes={ hashes } />
            )) }
            <LegalOfficerRow legalOfficer={ legalOfficer } />
            <Row>
                <Col md={ 2 }>
                    <MailtoButton label="Contact" email={ legalOfficer.email } />
                </Col>
                <Col md={ 2 }>
                    <Button onClick={ () => copyToClipBoard(window.location.href) }>Copy URL</Button>
                </Col>
                <Col md={ 2 }>
                    <Link to="https://logion.network">logion.network</Link>
                </Col>
            </Row>
        </div>
    )
}

function LegalOfficerRow(props: { legalOfficer: LegalOfficer }) {
    return (
        <Row>
            <CertificateCell md={ 2 } label="Legal Officer">{ props.legalOfficer.name }</CertificateCell>
            <CertificateCell md={ 4 } label="Address">
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
                item => <CertificateCell md={ 6 } label={ displayName(item) }>{ item.value }</CertificateCell>) }
        </Row>
    )
}

function HashCellRow(props: { hashes: string[] }) {
    return (
        <Row>
            { props.hashes.map(
                hash => <CertificateCell md={ 6 } label="Document Hash">{ hash }</CertificateCell>) }
        </Row>
    )
}
