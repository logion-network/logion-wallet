import { TokensRecord, UploadableItemFile, Token, CollectionItem } from "@logion/client";
import MenuIcon from "../common/MenuIcon";
import InlineDateTime from "../common/InlineDateTime";
import "./TokensRecords.css";
import { UUID } from "@logion/node-api";
import ClaimAssetButton from "./ClaimAssetButton";
import { useState, useEffect } from "react";
import { useLogionChain } from "../logion-chain";
import { Row } from "../common/Grid";
import { Col } from "react-bootstrap";

export interface TokensRecordsProps {
    locId: UUID,
    owner: string,
    collectionItem: CollectionItem,
    tokenForDownload: Token,
}

export default function TokensRecords(props: TokensRecordsProps) {
    const { locId, tokenForDownload } = props;
    const { client } = useLogionChain();
    const [ tokensRecords, setTokensRecords ] = useState<TokensRecord[] | null>(null);

    useEffect(() => {
        if (client && tokensRecords === null) {
            client.public.getTokensRecords({ locId, jwtToken: tokenForDownload })
                .then(setTokensRecords)
        }
    }, [ client, locId, tokensRecords, tokenForDownload ]);

    if (tokensRecords === null || tokensRecords.length === 0) {
        return null;
    }
    return (
        <div className="TokensRecords">
            <Row>
                <Col>
                    <h2><MenuIcon icon={ { id: "records_polka" } } height="40px" width="70px" /> Tokens record(s)</h2>
                    <p>The following Tokens Records, shared with all the owners of tokens declared in this LOC, are
                        signed by logion Verified Issuers.</p>
                </Col>
            </Row>
            { tokensRecords.map((tokensRecord, index) => (
                <>
                    { index > 0 && <hr /> }
                    <TokensRecordCell { ...props } tokensRecord={ tokensRecord } />
                </>
            )) }
        </div>
    )
}

interface TokensRecordCellProps extends TokensRecordsProps {
    tokensRecord: TokensRecord
}

function TokensRecordCell(props: TokensRecordCellProps) {
    const { tokensRecord } = props;
    return (
        <div className="TokensRecordCell">
            <TRCell label="Description">{ tokensRecord.description }</TRCell>
            <TRCell label="Timestamp">
                <InlineDateTime dateTime={ tokensRecord.addedOn } />
            </TRCell>
            <TRCell label="Issuer">{ tokensRecord.issuer }</TRCell>
            <ul>
                { tokensRecord.files.map(tokensRecordFile => (
                    <li>
                        <TokensRecordFileCell { ...props } tokensRecordFile={ tokensRecordFile } />
                    </li>
                )) }
            </ul>
        </div>
    )
}

interface TokensRecordFileCellProps extends TokensRecordCellProps {
    tokensRecordFile: UploadableItemFile
}

function TokensRecordFileCell(props: TokensRecordFileCellProps) {
    const { locId, owner, tokensRecord, tokensRecordFile, collectionItem, tokenForDownload } = props;
    return (
        <Row className="TokensRecordFileCell">
            <Col md={ 8 }>
                <strong>{ tokensRecordFile.name }</strong>
                <TRCell label="File type">{ tokensRecordFile.contentType }</TRCell>
                <TRCell label="File size">{ tokensRecordFile.size.toString() } (bytes)</TRCell>
                <TRCell label="Hash">{ tokensRecordFile.hash }</TRCell>
            </Col>
            <Col>
                <ClaimAssetButton
                    locId={ locId }
                    owner={ owner }
                    item={ collectionItem }
                    record={ tokensRecord }
                    file={ {
                        hash: tokensRecordFile.hash,
                        name: tokensRecordFile.name,
                        type: "TokensRecord",
                    } }
                    tokenForDownload={ tokenForDownload }
                />
            </Col>
        </Row>
    )
}

function TRCell(props: { label: string, children: React.ReactNode }) {
    const { label, children } = props;
    return (
        <Row>
            <div>
                <strong>{ label }</strong>
                <span>: { children }</span>
            </div>
        </Row>
    )
}
