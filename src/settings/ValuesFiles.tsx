import Table, { ActionCell } from "../common/Table";
import FileSelectorButton from "../common/FileSelectorButton";
import { useCallback } from "react";
import ViewFileButton from "../common/ViewFileButton";
import { useLogionChain } from "../logion-chain";
import { AxiosInstance } from "axios";
import { getLoFile, addLoFile, LO_FILE_DESCRIPTION, LO_FILE_IDS, LoFileId } from "../loc/FileModel";
import "./ValuesFiles.css";
import { SETTINGS_DESCRIPTION, SETTINGS_KEYS, useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";
import EditableCell from "src/common/EditableCell";
import Button from "src/common/Button";
import { useState } from "react";
import { Spinner } from "react-bootstrap";

export function ValuesFiles() {

    const { accounts, axiosFactory } = useLogionChain();
    const { settings, updateSetting } = useLegalOfficerContext();
    const [ newSettings, setNewSettings ] = useState<Record<string, string>>({});
    const [ uploading, setUploading ] = useState<Record<string, boolean>>({});

    const nodeOwner = accounts?.current?.address;
    const fileSelectedCallback = useCallback(async (file: File, fileId: LoFileId) => {
        setUploading({
            ...uploading,
            [fileId]: true,
        });
        try {
            await addLoFile(axiosFactory!(nodeOwner), {
                file,
                fileId
            });
        } finally {
            setUploading({
                ...uploading,
                [fileId]: false,
            });
        }
    }, [ axiosFactory, nodeOwner, uploading ]);

    if(!accounts || !settings) {
        return null;
    }

    return (
        <div className="ValuesFiles">
            <Table
                columns={ [
                    {
                        header: "",
                        render: fileId => SETTINGS_DESCRIPTION[fileId],
                        align: "left",
                    },
                    {
                        header: "",
                        render: id => <EditableCell value={ newSettings[id] || settings[id] || "" } onChange={ value => setNewSettings({ ...newSettings, [id]: value }) } />,
                        align: "left",
                    },
                    {
                        header: "",
                        render: id =>
                            <ActionCell>
                                <Button
                                    onClick={ () => updateSetting!(id, newSettings[id]! ) }
                                    disabled={ !( id in newSettings ) || !(newSettings[id]) || newSettings[id] === settings[id] || uploading[id] }
                                >
                                    {
                                        uploading[id] &&
                                        <Spinner animation="border" />
                                    }
                                    {
                                        !uploading[id] &&
                                        <>Update</>
                                    }
                                </Button>
                            </ActionCell>,
                        align: "center"
                    },
                ] }
                data={ SETTINGS_KEYS }
                renderEmpty={ () => null }
                constrainedRowHeight={ false }
            />

            <Table
                columns={ [
                    {
                        header: "",
                        render: fileId => LO_FILE_DESCRIPTION[fileId],
                        align: "left",
                    },
                    {
                        header: "",
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
