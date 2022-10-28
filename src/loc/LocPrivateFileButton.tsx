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
import { useLocContext } from "./LocContext";
import { EditableRequest } from "@logion/client";

type Status = 'Idle' | 'UploadDialog' | 'Hashing' | 'Uploading';

export function LocPrivateFileButton() {
    const { mutateLocState, locItems } = useLocContext();
    const { colorTheme } = useCommonContext();
    const [ status, setStatus ] = useState<Status>('Idle');
    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>();
    const [ file, setFile ] = useState<File | null>(null);
    const [ existingItem, setExistingItem ] = useState<LocItem | null>(null);
    const [ duplicateHash, setDuplicateHash ] = useState<string | null>(null);
    const [ uploadError, setUploadError ] = useState<string>(" ")

    const submit = useCallback(async (formValues: FormValues) => {
        setUploadError("")
        if (file) {
            setStatus('Hashing')
            const hash = "0x" + await sha256Hex(file);
            const existingItem = locItems.find(item => item.type === "Document" && item.value === hash);
            if (existingItem !== undefined) {
                setStatus('Idle');
                setExistingItem(existingItem);
                setDuplicateHash(hash);
            } else {
                setStatus('Uploading')
                try {
                    await mutateLocState(async current => {
                        if(current instanceof EditableRequest) {
                            return current.addFile({
                                file,
                                fileName: formValues.fileName,
                                nature: formValues.nature,
                            });
                        } else {
                            return current;
                        }
                    });
                    setStatus('Idle');
                } catch (error: any) {
                    setStatus('UploadDialog')
                    const errorMessage = error?.response?.data?.errorMessage;
                    setUploadError(`${ error }: ${ errorMessage }`)
                }
            }
        }
    }, [ file, mutateLocState, locItems, setExistingItem ])

    const handleSelectedFile = useCallback((file: File) => {
        setFile(file);
        setValue("fileName", file.name);
    }, [ setValue ]);

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
                        disabled: status === 'Uploading' || status === 'Hashing'
                    }
                ] }
                onSubmit={ handleSubmit(submit) }
            >
                <LocPrivateFileForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                    onFileSelected={ handleSelectedFile }
                />
                { status === 'Hashing' &&
                    <Row>
                        <Spinner animation="border" size="sm" />
                        &nbsp;Calculating Hash
                    </Row>
                }
                { status === 'Uploading' &&
                    <Row>
                        <Spinner animation="border" size="sm" />
                        &nbsp;Uploading and encrypting
                    </Row>
                }
                { status !== 'Hashing' && status !== 'Uploading' &&
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
