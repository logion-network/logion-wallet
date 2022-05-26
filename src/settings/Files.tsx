import Table, { ActionCell } from "../common/Table";
import FileSelectorButton from "../common/FileSelectorButton";
import { useCallback } from "react";
import ViewFileButton from "../common/ViewFileButton";
import { useLogionChain } from "../logion-chain";
import { AxiosInstance } from "axios";
import { getLoFile, addLoFile, LO_FILE_DESCRIPTION, LO_FILE_IDS, LoFileId } from "../loc/FileModel";
import "./Files.css";
import { useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";
import EditableCell from "src/common/EditableCell";
import Button from "src/common/Button";
import { useState } from "react";

export function Files() {

    const { accounts, axiosFactory } = useLogionChain();
    const { settings, allSettingsKeys, updateSetting } = useLegalOfficerContext();
    const [ newSettings, setNewSettings ] = useState<Record<string, string>>({});

    const nodeOwner = accounts?.current?.address;
    const fileSelectedCallback = useCallback(async (file: File, fileId: LoFileId) => {
        await addLoFile(axiosFactory!(nodeOwner), {
            file,
            fileId
        })
    }, [ axiosFactory, nodeOwner ]);

    if(!accounts || !settings) {
        return null;
    }

    return (
        <div className="Files">
            <h3>Values</h3>
            <Table
                columns={ [
                    {
                        header: "ID",
                        render: id => id
                    },
                    {
                        header: "Value",
                        render: id => <EditableCell value={ newSettings[id] || settings[id] || "" } onChange={ value => setNewSettings({ ...newSettings, [id]: value }) } />
                    },
                    {
                        header: "Actions",
                        render: id =>
                            <ActionCell>
                                <Button
                                    onClick={ () => updateSetting!(id, newSettings[id]! ) }
                                    disabled={ !( id in newSettings ) || !(newSettings[id]) || newSettings[id] === settings[id] }
                                >
                                    Update
                                </Button>
                            </ActionCell>,
                        align: "center"
                    },
                ] }
                data={ allSettingsKeys }
                renderEmpty={ () => null }
            />

            <h3>Files</h3>
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
