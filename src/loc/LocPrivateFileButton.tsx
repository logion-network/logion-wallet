import { useState, useCallback } from "react";
import { Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";

import Button from "../common/Button";
import Dialog from "../common/Dialog";
import LocPrivateFileForm, { FormValues } from "./LocPrivateFileForm";
import { useCommonContext } from "../common/CommonContext";
import { sha256Hex } from "../common/hash";
import { LocItem } from "./types";
import Icon from "../common/Icon";
import { Row } from "../common/Grid";

type Status = 'Idle' | 'UploadDialog' | 'Uploading';

export interface Props {
    locItems: LocItem[]
    addFile: ((name: string, file: File, nature: string) => Promise<void>) | null
}

export function LocPrivateFileButton(props: Props) {

    const { addFile, locItems } = props;
    const { colorTheme } = useCommonContext();
    const [ status, setStatus ] = useState<Status>('Idle');
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();
    const [ file, setFile ] = useState<File | null>(null);
    const [ existingItem, setExistingItem ] = useState<LocItem | null>(null);
    const [ duplicateHash, setDuplicateHash ] = useState<string | null>(null);
    const [ uploadError, setUploadError ] = useState<string>(" ")

    const submit = useCallback(async (formValues: FormValues) => {
        setUploadError("")
        if (file) {
            const hash = "0x" + await sha256Hex(file);
            const existingItem = locItems.find(item => item.type === "Document" && item.value === hash);
            if (existingItem !== undefined) {
                setStatus('Idle');
                setExistingItem(existingItem);
                setDuplicateHash(hash);
            } else {
                setStatus('Uploading')
                try {
                    await addFile!(formValues.fileName, file, formValues.nature);
                    setStatus('Idle');
                } catch (error) {
                    setStatus('UploadDialog')
                    setUploadError("" + error)
                }
            }
        }
    }, [ file, addFile, locItems, setExistingItem ])

    return (
        <>
            <Button onClick={ () => {
                reset()
                setFile(null)
                setUploadError("")
                setStatus('UploadDialog')
            } }>
                <Icon icon={ { id: "add" } } height="19px" /><span className="text">Add a confidential document</span>
            </Button>
            <Dialog
                show={ status !== 'Idle' }
                size={ "lg" }
                actions={ [
                    {
                        id: "cancel",
                        callback: () => setStatus('Idle'),
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    },
                    {
                        id: "submit",
                        buttonText: 'Submit',
                        buttonVariant: 'primary',
                        type: 'submit',
                        disabled: status === 'Uploading'
                    }
                ] }
                onSubmit={ handleSubmit(submit) }
            >
                <LocPrivateFileForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                    onFileSelected={ setFile }
                />
                { status === 'Uploading' &&
                    <Row>
                        <Spinner animation="border" size="sm" />
                        &nbsp;Uploading and encrypting
                    </Row>
                }
                { status !== 'Uploading' &&
                    <Row>{ uploadError }</Row>
                }
            </Dialog>
            <Dialog
                show={ duplicateHash !== null }
                size={ "lg" }
                actions={ [
                    {
                        id: "ok",
                        callback: () => setDuplicateHash(null),
                        buttonText: 'OK',
                        buttonVariant: 'primary',
                    }
                ] }
            >
                <p>A document with hash</p>
                <p>{ duplicateHash }</p>
                <p>already exists in this LOC:</p>
                <p>{ existingItem?.name }</p>
            </Dialog>
        </>
    )
}
