import { TokensRecord, UploadableItemFile, Token, CollectionItem, CheckHashResult } from "@logion/client";
import MenuIcon from "../common/MenuIcon";
import InlineDateTime from "../common/InlineDateTime";
import "./TokensRecords.css";
import { UUID } from "@logion/node-api";
import ClaimAssetButton from "./ClaimAssetButton";
import { Row } from "../common/Grid";
import { Col } from "react-bootstrap";
import { customClassName } from "src/common/types/Helpers";

export interface TokensRecordsProps {
    locId: UUID,
    owner: string,
    collectionItem: CollectionItem,
    tokenForDownload: Token | undefined,
    tokensRecords: TokensRecord[];
    checkResult?: CheckHashResult;
}

export default function TokensRecords(props: TokensRecordsProps) {
    const { tokensRecords } = props;

    if (tokensRecords.length === 0) {
        return null;
    }
    const title = tokensRecords.length === 1 ?
        "Tokens record" :
        "Tokens records";
    const introduction = tokensRecords.length === 1 ?
        "The following Tokens Record is signed by the issuer." :
        "The following Tokens Records, shared with all the owners of tokens declared in this LOC, are signed by issuers."
    return (
        <div className="TokensRecords">
            <Row>
                <Col>
                    <h2><MenuIcon icon={ { id: "records_polka" } } height="40px" width="70px" /> { title }</h2>
                    <p>{ introduction }</p>
                </Col>
            </Row>
            { tokensRecords.map((tokensRecord, index) => (
                <>
                    { index > 0 && <hr /> }
                    <TokensRecordCell key={ index } { ...props } tokensRecord={ tokensRecord }/>
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
            <TRCell label="Description">{ tokensRecord.description.validValue() }</TRCell>
            <TRCell label="Timestamp">
                <InlineDateTime dateTime={ tokensRecord.addedOn } />
            </TRCell>
            <TRCell label="Issuer">{ tokensRecord.issuer }</TRCell>
            { tokensRecord.files.map(tokensRecordFile => (
                <TokensRecordFileCell { ...props } tokensRecordFile={ tokensRecordFile }/>
            )) }
        </div>
    )
}

interface TokensRecordFileCellProps extends TokensRecordCellProps {
    tokensRecordFile: UploadableItemFile
}

function TokensRecordFileCell(props: TokensRecordFileCellProps) {
    const { locId, owner, tokensRecord, tokensRecordFile, collectionItem, tokenForDownload, checkResult } = props;
    const className = customClassName("TokensRecordFileCell", checkResult?.recordFile?.hash === tokensRecordFile.hash ? "matched" : undefined);
    return (
        <Row className={className}>
            <Col md={ 8 }>
                <strong>{ tokensRecordFile.name.validValue() }</strong>
                <TRCell label="File type">{ tokensRecordFile.contentType.validValue() }</TRCell>
                <TRCell label="File size">{ tokensRecordFile.size.toString() } (bytes)</TRCell>
                <TRCell label="Hash">{ tokensRecordFile.hash.toHex() }</TRCell>
            </Col>
            <Col>
                <ClaimAssetButton
                    locId={ locId }
                    owner={ owner }
                    item={ collectionItem }
                    record={ tokensRecord }
                    file={ {
                        hash: tokensRecordFile.hash,
                        name: tokensRecordFile.name.validValue(),
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
