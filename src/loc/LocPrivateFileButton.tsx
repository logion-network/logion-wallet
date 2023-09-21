import { useState, useCallback } from "react";
import { Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";

import Button from "../common/Button";
import Dialog from "../common/Dialog";
import LocPrivateFileForm, { FormValues } from "./LocPrivateFileForm";
import { useCommonContext } from "../common/CommonContext";
import { LocItem } from "./LocItem";
import Icon from "../common/Icon";
import { Row } from "../common/Grid";
import { useLocContext } from "./LocContext";
import { EditableRequest, HashOrContent } from "@logion/client";
import { Hash } from "@logion/node-api";

type Status = 'Idle' | 'UploadDialog' | 'Hashing' | 'Uploading';

export interface Props {
    text: string;
    nature?: string;
}

export function LocPrivateFileButton(props: Props) {
    const { mutateLocState, locItems } = useLocContext();
    const { colorTheme } = useCommonContext();
    const [ status, setStatus ] = useState<Status>('Idle');
    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>();
    const [ file, setFile ] = useState<File | null>(null);
    const [ existingItem, setExistingItem ] = useState<LocItem | null>(null);
    const [ duplicateHash, setDuplicateHash ] = useState<Hash | null>(null);
    const [ uploadError, setUploadError ] = useState<string>(" ")

    const submit = useCallback(async (formValues: FormValues) => {
        setUploadError("")
        if (file) {
            setStatus('Hashing')
            const content = await HashOrContent.fromContentFinalized(file);
            const hash = content.contentHash;
            const existingItem = locItems.find(item => item.type === "Document" && item.fileData().hash.equalTo(hash));
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
                                file: content,
                                fileName: formValues.fileName,
                                nature: props.nature ? props.nature : formValues.nature,
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
    }, [ file, mutateLocState, locItems, setExistingItem, props.nature ])

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
                <Icon icon={ { id: "add" } } height="19px" /><span className="text">{ props.text }</span>
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
                    nature={ props.nature }
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
                        &nbsp;Uploading, checking hash and encrypting
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
                <p>{ duplicateHash?.toHex() }</p>
                <p>already exists in this LOC:</p>
                <p>{ existingItem?.fileData().nature }</p>
            </Dialog>
        </>
    )
}
