import { TokensRecord } from "@logion/client";
import { useMemo, useState } from "react";
import { useCommonContext } from "src/common/CommonContext";
import SubmitterName from "src/common/SubmitterName";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "src/common/Table";
import ViewFileButton from "src/common/ViewFileButton";
import PagedTable, { getPage, Page } from "src/components/pagedtable/PagedTable";
import { getTokensRecordFileSource } from "../FileModel";
import { useLocContext } from "../LocContext";
import LocPrivateFileDetails from "../LocPrivateFileDetails";

export interface Props {
    records: TokensRecord[];
}

export default function TokensRecordTable(props: Props) {
    const { records } = props;
    const { viewer } = useCommonContext();
    const { loc } = useLocContext();
    const [ currentPageNumber, setCurrentPageNumber ] = useState(0);

    const currentPage: Page<TokensRecord> = useMemo(() => {
        return getPage(records, currentPageNumber, 10);
    }, [ props.records, currentPageNumber ]);

    if(!loc) {
        return null;
    }

    return (
        <PagedTable
            columns={[
                {
                    header: "Name",
                    render: record => <Cell content={record.files[0].name}/>,
                    renderDetails: record => <LocPrivateFileDetails
                        item={{
                            name: record.files[0].name,
                            newItem: false,
                            status: "PUBLISHED",
                            submitter: record.issuer,
                            timestamp: record.addedOn,
                            type: "Document",
                            value: record.files[0].hash,
                            nature: record.description,
                        }}
                        viewer={viewer}
                    />,
                },
                {
                    header: "Timestamp",
                    render: record => <DateTimeCell dateTime={record.addedOn}/>
                },
                {
                    header: "Type",
                    render: record => <Cell content={record.files[0].contentType}/>
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
                            fileName={ record.files[0].name }
                            downloader={ (axios) => getTokensRecordFileSource(axios, {
                                locId: loc.id.toString(),
                                recordId: record.id,
                                hash: record.files[0].hash,
                            }) }
                        />
                    } />,
                    align: "left",
                }
            ]}
            currentPage={ currentPage }
            goToPage={ setCurrentPageNumber }
            fullSize={ records.length }
            renderEmpty={ () => <EmptyTableMessage>No records to display</EmptyTableMessage> }
        />
    );
}