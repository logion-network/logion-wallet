import Table, { ActionCell } from "../common/Table";
import FileSelectorButton from "../common/FileSelectorButton";
import { useCallback } from "react";
import ViewFileButton from "../common/ViewFileButton";
import { useLogionChain } from "../logion-chain";
import { AxiosInstance } from "axios";
import { getLoFile, addLoFile, LO_FILE_DESCRIPTION, LO_FILE_IDS, LoFileId } from "../loc/FileModel";
import "./Files.css";

export function Files() {

    const { accounts, axiosFactory } = useLogionChain()
    const nodeOwner = accounts?.current?.address;
    const fileSelectedCallback = useCallback(async (file: File, fileId: LoFileId) => {
        await addLoFile(axiosFactory!(nodeOwner), {
            file,
            fileId
        })
    }, [ axiosFactory, nodeOwner ]);

    return (
        <div className="Files">
            <Table
                columns={ [
                    {
                        header: "ID",
                        render: fileId => fileId
                    },
                    {
                        header: "Description",
                        render: fileId => LO_FILE_DESCRIPTION[fileId]
                    },
                    {
                        header: "Actions",
                        render: fileId =>
                            <ActionCell>
                                <FileSelectorButton
                                    onFileSelected={ (file => fileSelectedCallback(file, fileId)) }
                                    onlyButton
                                />
                                <ViewFileButton
                                    nodeOwner={ nodeOwner! }
                                    fileName={ fileId }
                                    downloader={ (axios: AxiosInstance) => getLoFile(axios, { fileId }) }
                                />
                            </ActionCell>,
                        align: "center"
                    },
                ] }
                data={ LO_FILE_IDS }
                renderEmpty={ () => <p>No files</p> }
            />
        </div>
    )
}
