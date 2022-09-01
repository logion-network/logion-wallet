import Button from "../../common/Button";
import "./ArchiveButton.css";
import { useState } from "react";
import { useLocContext } from "../LocContext";
import { FileInfo, openFiles } from "../../common/ViewFileButton";
import { LocItem } from "../types";
import { AxiosInstance } from "axios";
import { getFile, getCsvLoc, GetCsvParameters } from "../FileModel";
import { UUID } from "@logion/node-api/dist/UUID";
import Dialog from "../../common/Dialog";
import Table, { EmptyTableMessage } from "../../common/Table";
import Checkbox from "../../common/Checkbox";
import { useLogionChain } from "../../logion-chain";
import Icon from "../../common/Icon";

interface TypedFileInfo extends FileInfo {
    type: string
}

const typeDescription: Record<GetCsvParameters['type'], string> = {
    files: "Confidential Document(s)",
    metadata: "Public Data",
    links: "Linked LOC(s)"
}

function csvToTypedFileInfo(locId: UUID, type: GetCsvParameters['type']): TypedFileInfo {
    return {
        fileName: `${ locId.toString() }-${ type }`,
        downloader: (axios: AxiosInstance) => getCsvLoc(axios, {
            locId: locId.toString(),
            type
        }),
        type: `CSV file (${ typeDescription[type] })`
    }
}

function documentToTypedFileInfo(locId: UUID, locItem: LocItem): TypedFileInfo {
    return {
        fileName: locItem.name,
        downloader: (axios: AxiosInstance) => getFile(axios, {
            locId: locId.toString(),
            hash: locItem.value
        }),
        type: "Document file"
    }
}

export default function ArchiveButton() {

    type Status = 'Idle' | 'Selected' | 'Checked';
    const [ status, setStatus ] = useState<Status>('Idle');
    const { locItems, loc, locId } = useLocContext();
    const { axiosFactory } = useLogionChain();

    const types: GetCsvParameters['type'][] = [ 'metadata', 'files', 'links' ];

    const csvFiles: TypedFileInfo[] = types
        .map(type => csvToTypedFileInfo(locId, type))

    const files: TypedFileInfo[] = csvFiles.concat(
        locItems
            .filter(locItem => locItem.type === 'Document')
            .map(locItem => documentToTypedFileInfo(locId, locItem)))

    if (!loc || !axiosFactory) {
        return null;
    }

    return (
        <div className="ArchiveButton">
            <Button onClick={ () => setStatus('Selected') }>
                <Icon icon={{ id: "backup" }} />
                Local Backup
            </Button>
            <Dialog
                show={ status !== 'Idle' }
                size="lg"
                actions={ [
                    {
                        id: "cancel",
                        callback: () => setStatus('Idle'),
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    },
                    {
                        id: "submit",
                        callback: () => openFiles({
                            files,
                            nodeOwner: loc.owner,
                            axiosFactory
                        }),
                        buttonText: 'Submit',
                        buttonVariant: 'primary',
                        disabled: status !== 'Checked'
                    }
                ] }
            >
                <h3>LOC Local Backup Tool</h3>
                <p>The LOC Local Backup Tool allows to download through CSV files, all LOC data (on-chain and off-chain
                    ones), its Public Data and Confidential Document Data as well as a copy of all related files
                    existing in the LOC at the time of the request.</p>
                <p><strong>Please use with extreme caution</strong><br />
                    By clicking on the "download" button below, you acknowledge the fact that a copy of all LOC data and
                    files will be out of the logion infrastructure to be downloaded on your computer, thus under your
                    entire responsibility. Any leak of the related material could severely harm your client, your own
                    Legal Officer reputation as well as the logion project. It could also lead to judicial claims with
                    regards to the leak-resulting damages.</p>
                <Table
                    columns={ [
                        {
                            header: "Name",
                            render: file => file.fileName,
                            width: "450px"
                        }, {
                            header: "Type",
                            render: file => file.type
                        }
                    ] }
                    data={ files }
                    renderEmpty={ () => <EmptyTableMessage>No files</EmptyTableMessage> }
                />
                <div className="check-risk">
                    <Checkbox checked={ status === 'Checked' } setChecked={ checked => setStatus(checked ? 'Checked' : 'Selected')} />
                    <span>I understand the risks and consequences and would like to proceed.</span>
                </div>
            </Dialog>
        </div>
    )
}
