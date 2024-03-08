import { TokensRecord, LocData, UploadableItemFile } from "@logion/client";
import { ContributionMode } from "../types";
import { Viewer, useCommonContext } from "../../common/CommonContext";
import { tokensRecordDocumentClaimHistoryPath } from "../../legal-officer/LegalOfficerPaths";
import {
    tokensRecordDocumentClaimHistoryPath as requesterTokensRecordDocumentClaimHistoryPath,
    issuerTokensRecordDocumentClaimHistoryPath
} from "../../wallet-user/UserRouter";
import { useLocContext } from "../LocContext";
import ViewFileButton from "../../common/ViewFileButton";
import { getTokensRecordFileSource } from "../FileModel";
import Button from "../../common/Button";
import Icon from "../../common/Icon";
import { useNavigate } from "react-router-dom";
import ButtonGroup from "../../common/ButtonGroup";
import Col from "react-bootstrap/Col";
import { Row } from "../../common/Grid";

export interface Props {
    record: TokensRecord;
    contributionMode?: ContributionMode;
}

export default function TokensRecordFiles(props: Props) {

    const { record } = props;
    const { loc } = useLocContext();

    if (!loc) {
        return null;
    }

    return (<div className="TokensRecordFiles">
        { record.files.map(file => (
            <TokensRecordFileCell { ...props } loc={ loc } file={ file } />
        )) }
    </div>)
}

function TokensRecordFileCell(props: Props & { loc: LocData, file: UploadableItemFile }) {
    const { loc, record, file, contributionMode } = props;
    const { viewer } = useCommonContext();
    const navigate = useNavigate();

    return (
        <Row className="TokensRecordFile">
            <Col md={ 7 }>
                <Row><strong>{ file.name.validValue() }</strong></Row>
                <TRCell label="File type" value={ file.contentType.validValue() } />
                <TRCell label="File size" value={ `${ file.size.toString() } (bytes)`} />
                <TRCell label="Hash" value={ file.hash.toHex() } />
            </Col>
            <Col md={ 5 } className="ButtonContainer">
                <ButtonGroup>
                    <ViewFileButton
                        nodeOwner={ loc.ownerAddress }
                        fileName={ file.name.validValue() }
                        downloader={ (axios) => getTokensRecordFileSource(axios, {
                            locId: loc.id.toString(),
                            recordId: record.id,
                            hash: file.hash,
                        }) }
                    />
                    <Button
                        onClick={ () => navigate(documentClaimHistory(viewer, loc, record, file, contributionMode)) }
                    >
                        <Icon icon={ { id: "claim" } } /> View document claim history
                    </Button>
                </ButtonGroup>
            </Col>
        </Row>
    )
}

function TRCell(props: { label: string, value: string }) {
    const { label, value } = props;
    return (
        <Row className="TokensRecordFileAttribute">
            <div>
                <strong>{ label }</strong>
                <span className="value">: { value }</span>
            </div>
        </Row>
    )
}

function documentClaimHistory(viewer: Viewer, loc: LocData, record: TokensRecord, file: UploadableItemFile, contributionMode?: ContributionMode): string {
    if (viewer === "LegalOfficer") {
        return tokensRecordDocumentClaimHistoryPath(loc.id, record.id, file.hash);
    } else if (contributionMode === "Requester") {
        return requesterTokensRecordDocumentClaimHistoryPath(loc.id, record.id, file.hash);
    } else if (contributionMode === "VerifiedIssuer") {
        return issuerTokensRecordDocumentClaimHistoryPath(loc.id, record.id, file.hash);
    } else {
        return "";
    }
}

