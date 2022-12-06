import { HashOrContent } from "@logion/client";
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

    const legalOfficer = accounts?.current?.address;
    const fileSelectedCallback = useCallback(async (file: File, fileId: LoFileId) => {
        setUploading({
            ...uploading,
            [fileId]: true,
        });
        try {
            await addLoFile({
                axios: axiosFactory!(legalOfficer),
                legalOfficer: legalOfficer!,
                file: HashOrContent.fromContent(file),
                fileId
            });
        } finally {
            setUploading({
                ...uploading,
                [fileId]: false,
            });
        }
    }, [ axiosFactory, legalOfficer, uploading ]);

    if(!settings || !legalOfficer) {
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
                                    disabled={ !( id in newSettings ) || !(newSettings[id]) || newSettings[id] === settings[id] }
                                >
                                    Update
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
                                {
                                    uploading[fileId] &&
                                    <Spinner animation="border" />
                                }
                                {
                                    !uploading[fileId] &&
                                    <FileSelectorButton
                                        onFileSelected={ (file => fileSelectedCallback(file, fileId)) }
                                        onlyButton
                                        disabled={ uploading[fileId] }
                                    />
                                }
                                <ViewFileButton
                                    nodeOwner={ legalOfficer }
                                    fileName={ fileId }
                                    downloader={ (axios: AxiosInstance) => getLoFile({ axios, legalOfficer, fileId }) }
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
