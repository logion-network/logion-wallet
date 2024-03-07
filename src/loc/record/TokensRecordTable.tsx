import { LocData, TokensRecord, fromIsoString } from "@logion/client";
import { useMemo, useState } from "react";
import { useCommonContext, Viewer } from "src/common/CommonContext";
import SubmitterName from "src/common/SubmitterName";
import { Cell, DateTimeCell, EmptyTableMessage } from "src/common/Table";
import ViewFileButton from "src/common/ViewFileButton";
import PagedTable, { getPage, Page } from "src/components/pagedtable/PagedTable";
import { tokensRecordDocumentClaimHistoryPath } from "src/legal-officer/LegalOfficerPaths";
import { getTokensRecordFileSource } from "../FileModel";
import { useLocContext } from "../LocContext";
import LocPrivateFileDetails from "../LocPrivateFileDetails";
import { ContributionMode } from "../types";
import { tokensRecordDocumentClaimHistoryPath as requesterTokensRecordDocumentClaimHistoryPath, issuerTokensRecordDocumentClaimHistoryPath } from "src/wallet-user/UserRouter";
import { useLogionChain } from "src/logion-chain";
import { FileItem } from "../LocItem";
import ViewCertificateButton from "../ViewCertificateButton";
import { fullTokensRecordsCertificate } from "../../PublicPaths";
import "./TokensRecordTable.css";

export interface Props {
    records: TokensRecord[];
    contributionMode?: ContributionMode;
}

export default function TokensRecordTable(props: Props) {
    const { records } = props;
    const { viewer } = useCommonContext();
    const { loc } = useLocContext();
    const [ currentPageNumber, setCurrentPageNumber ] = useState(0);
    const { api } = useLogionChain();

    const currentPage: Page<TokensRecord> = useMemo(() => {
        return getPage(records, currentPageNumber, 10);
    }, [ records, currentPageNumber ]);

    if(!api || !loc) {
        return null;
    }

    return ( <div className="TokensRecordTable">
        <PagedTable
            columns={[
                {
                    header: "Name",
                    render: record => <Cell
                        content={ record.files[0].name.validValue() }
                        tooltipId={`record-${record.id}-filename`}
                        overflowing
                    />,
                    renderDetails: record => <LocPrivateFileDetails
                        item={new FileItem(
                            {

                                newItem: false,
                                status: "PUBLISHED",
                                submitter: api.queries.getValidAccountId(record.issuer, "Polkadot"),
                                timestamp: fromIsoString(record.addedOn),
                                type: "Document",
                                template: false,
                            },
                            {
                                fileName: record.files[0].name.validValue(),
                                hash: record.files[0].hash,
                                nature: record.description,
                                size: record.files[0].size,
                                storageFeePaidBy: "Requester",
                            }
                        )}
                        documentClaimHistory={ documentClaimHistory(viewer, loc, record, props.contributionMode) }
                        fileName={record.files[0].name.validValue()}
                        fileType={record.files[0].contentType.validValue()}
                        otherFeesPaidByRequester={ false }
                    />,
                },
                {
                    header: "Timestamp",
                    render: record => <DateTimeCell dateTime={ record.addedOn }/>
                },
                {
                    header: "Type",
                    render: record => <Cell content={ record.files[0].contentType.validValue() }/>
                },
                {
                    header: "Size (bytes)",
                    render: record => <Cell content={record.files[0].size.toString()}/>
                },
                {
                    header: "Submitted by",
                    render: record => <SubmitterName loc={ loc } submitter={ record.issuer } />
                },
                {
                    header: "Source",
                    render: record => <Cell content={
                        <ViewFileButton
                            nodeOwner={ loc.ownerAddress }
                            fileName={ record.files[0].name.validValue() }
                            downloader={ (axios) => getTokensRecordFileSource(axios, {
                                locId: loc.id.toString(),
                                recordId: record.id,
                                hash: record.files[0].hash,
                            }) }
                        />
                    } />,
                    align: "center",
                    width: "100px",
                },
                {
                    header: "Certificate",
                    render: record => <Cell content={
                        <ViewCertificateButton url={ fullTokensRecordsCertificate(loc.id, record.id) } />
                    } />,
                    align: "center",
                    width: "100px",
                }
            ]}
            currentPage={ currentPage }
            goToPage={ setCurrentPageNumber }
            fullSize={ records.length }
            renderEmpty={ () => <EmptyTableMessage>No records to display</EmptyTableMessage> }
        />
    </div>);
}

function documentClaimHistory(viewer: Viewer, loc: LocData, record: TokensRecord, contributionMode?: ContributionMode): string {
    if(viewer === "LegalOfficer") {
        return tokensRecordDocumentClaimHistoryPath(loc.id, record.id, record.files[0].hash);
    } else if(contributionMode === "Requester") {
        return requesterTokensRecordDocumentClaimHistoryPath(loc.id, record.id, record.files[0].hash);
    } else if(contributionMode === "VerifiedIssuer") {
        return issuerTokensRecordDocumentClaimHistoryPath(loc.id, record.id, record.files[0].hash);
    } else {
        return "";
    }
}
