import { LocRequestState } from "@logion/client";
import Button from "../../common/Button";
import "./ArchiveButton.css";
import { useState } from "react";
import { useLocContext } from "../LocContext";
import { FileInfo, openFiles } from "../../common/ViewFileButton";
import { FileItem } from "../LocItem";
import { AxiosInstance } from "axios";
import { getJsonLoc } from "../FileModel";
import Dialog from "../../common/Dialog";
import Table, { EmptyTableMessage } from "../../common/Table";
import Checkbox from "../../components/toggle/Checkbox";
import { useLogionChain } from "../../logion-chain";
import Icon from "../../common/Icon";

interface TypedFileInfo extends FileInfo {
    type: string
}

function documentToTypedFileInfo(locItem: FileItem, locState: LocRequestState): TypedFileInfo {
    const fileData = locItem.fileData();
    return {
        fileName: fileData.fileName,
        downloader: () => locState.getFile(fileData.hash),
        type: "Document file"
    }
}

export default function ArchiveButton() {

    type Status = 'Idle' | 'Selected' | 'Checked';
    const [ status, setStatus ] = useState<Status>('Idle');
    const { locItems, loc: locData, locState } = useLocContext();
    const { axiosFactory } = useLogionChain();

    if (!locData || !locState || !axiosFactory) {
        return null;
    }

    const backup: TypedFileInfo = {
        fileName: `${ locData.id.toString() }`,
        downloader: (axios: AxiosInstance) => getJsonLoc(axios, { locId: locData.id.toString() }),
        type: "JSON Backup file"
    };

    const files: TypedFileInfo[] = [ backup ].concat(
        locItems
            .filter(locItem => locItem.type === 'Document')
            .filter(locItem => locItem.hasData())
            .map(locItem => documentToTypedFileInfo(locItem, locState)));

    return (
        <>
            <Button className="ArchiveButton" onClick={ () => setStatus('Selected') }>
                <Icon icon={ { id: "backup" } } height="23px" />
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
                            nodeOwner: locData.ownerAddress,
                            axiosFactory
                        }),
                        buttonText: 'Download',
                        buttonVariant: 'primary',
                        disabled: status !== 'Checked'
                    }
                ] }
            >
                <h3>LOC Local Backup Tool</h3>
                <p>The LOC Local Backup Tool allows to download through a JSON file, all LOC data (on-chain and
                    off-chain ones), its Public Data, its Confidential Document data and its Linked LOC data, as well as
                    a copy of all related files existing in the LOC at the time of the request.</p>
                <p>
                    <Icon type="png" icon={ { id: "big-warning" } } width="105px"/>
                </p>
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
                    <Checkbox checked={ status === 'Checked' }
                              setChecked={ checked => setStatus(checked ? 'Checked' : 'Selected') } />
                    <span>I understand the risks and consequences and would like to proceed.</span>
                </div>
            </Dialog>
        </>
    )
}
