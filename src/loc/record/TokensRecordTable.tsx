import { TokensRecord } from "@logion/client";
import { useMemo, useState } from "react";
import SubmitterName from "src/common/SubmitterName";
import { Cell, DateTimeCell, EmptyTableMessage, ActionCell } from "src/common/Table";
import PagedTable, { getPage, Page } from "src/components/pagedtable/PagedTable";
import { useLocContext } from "../LocContext";
import { ContributionMode } from "../types";
import { useLogionChain } from "src/logion-chain";
import ViewCertificateButton from "../ViewCertificateButton";
import { fullTokensRecordsCertificate } from "../../PublicPaths";
import "./TokensRecordTable.css";
import CellWithCopyPaste from "../../components/table/CellWithCopyPaste";
import TokensRecordFiles from "./TokensRecordFiles";
import ButtonGroup from "../../common/ButtonGroup";
import CopyPasteButton from "../../common/CopyPasteButton";
import ViewQrCodeButton from "../ViewQrCodeButton";
import { useResponsiveContext } from "../../common/Responsive";

export interface Props {
    records: TokensRecord[];
    contributionMode?: ContributionMode;
}

export default function TokensRecordTable(props: Props) {
    const { records } = props;
    const { loc } = useLocContext();
    const [ currentPageNumber, setCurrentPageNumber ] = useState(0);
    const { api } = useLogionChain();
    const { width } = useResponsiveContext();

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
                    header: "ID",
                    render: record => <CellWithCopyPaste content={ record.id.toHex() } />,
                    align: "left",
                    width: "40%"
                },
                {
                    header: "Description",
                    render: record => <Cell content={ record.description.validValue() } />,
                    align: "left",
                },
                {
                    header: "Files",
                    render: record => <Cell content={ record.files.length.toString() } />,
                    renderDetails: record => <TokensRecordFiles record={ record } contributionMode={ props.contributionMode }/>,
                    width: "100px"
                },
                {
                    header: "Timestamp",
                    render: record => <DateTimeCell dateTime={ record.addedOn }/>
                },
                {
                    header: "Submitted by",
                    render: record => <SubmitterName loc={ loc } submitter={ record.issuer } />
                },
                {
                    header: "Certificate",
                    render: item => (
                        <ActionCell>
                            <ButtonGroup
                                narrow={ true }
                            >
                                <ViewCertificateButton url={ fullTokensRecordsCertificate(loc.id, item.id) } />
                                <CopyPasteButton value={ fullTokensRecordsCertificate(loc.id, item.id) } tooltip="Copy certificate URL to clipboard" />
                                <ViewQrCodeButton certificateUrl={ fullTokensRecordsCertificate(loc.id, item.id) } />
                            </ButtonGroup>
                        </ActionCell>
                    ),
                    width: width({
                        onSmallScreen: "140px",
                        otherwise: "160px",
                    }),
                },
            ]}
            currentPage={ currentPage }
            goToPage={ setCurrentPageNumber }
            fullSize={ records.length }
            renderEmpty={ () => <EmptyTableMessage>No records to display</EmptyTableMessage> }
        />
    </div>);
}
