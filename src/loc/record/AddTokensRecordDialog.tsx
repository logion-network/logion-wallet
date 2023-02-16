import { HashOrContent, TokensRecord, ClosedCollectionLoc, ItemFileWithContent, MimeType } from "@logion/client";
import { useCallback, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "src/ClientExtrinsicSubmitter";
import Alert from "src/common/Alert";
import { useCommonContext } from "src/common/CommonContext";
import Dialog from "src/common/Dialog";
import FileSelectorButton from "src/common/FileSelectorButton";
import FormGroup from "src/common/FormGroup";
import { useLogionChain } from "src/logion-chain";
import { useLocContext } from "../LocContext";

export interface Props {
    show: boolean;
    hide: () => void;
    records: TokensRecord[];
}

interface FormValues {
    fileName: string;
    contentType: string;
    description: string;
}

type Status = 'Idle' | 'Hashing' | 'Uploading' | 'Error';

export default function AddTokensRecordDialog(props: Props) {
    const { colorTheme } = useCommonContext();
    const { mutateLocState } = useLocContext();
    const { signer } = useLogionChain();
    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>();
    const [ file, setFile ] = useState<File>();
    const [ uploadError, setUploadError ] = useState<string>();
    const [ status, setStatus ] = useState<Status>('Idle');
    const [ call, setCall ] = useState<Call>();

    const onFileSelected = useCallback((file: File) => {
        setFile(file);
        setValue("fileName", file.name);
        setValue("contentType", file.type);
    }, [ setValue ]);

    const onError = useCallback((error?: string) => {
        setStatus('Error');
        setUploadError(error);
    }, []);

    const clear = useCallback(() => {
        setStatus('Idle');
        setUploadError("");
        reset();
        props.hide();
    }, [ props, reset ]);

    const submit = useCallback(async (formValues: FormValues) => {
        setUploadError("")
        if (file) {
            setStatus('Hashing')
            const content = await HashOrContent.fromContentFinalized(file);
            const hash = content.contentHash;
            const existingRecord = props.records.find(record => record.id === hash);
            if (existingRecord !== undefined) {
                onError(`Record with ID ${hash} already exists`);
            } else {
                setStatus('Uploading')
                try {
                    const call: Call = async (callback: CallCallback) => await mutateLocState(async current => {
                        if(signer && current instanceof ClosedCollectionLoc) {
                            await current.addTokensRecord({
                                recordId: hash,
                                description: formValues.description,
                                files: [
                                    new ItemFileWithContent({
                                        contentType: MimeType.from(formValues.contentType),
                                        hashOrContent: content,
                                        name: formValues.fileName,
                                    }),
                                ],
                                signer,
                                callback,
                            });
                            const currentLoc = current.getCurrentState() as ClosedCollectionLoc;
                            return currentLoc.refresh();
                        } else {
                            return current;
                        }
                    });
                    setCall(() => call);
                } catch (error: any) {
                    const errorMessage = error?.response?.data?.errorMessage;
                    onError(`${ error }: ${ errorMessage }`);
                }
            }
        }
    }, [ file, mutateLocState, onError, props.records, signer ]);

    return (
        <Dialog
            show={ props.show }
            size="lg"
            actions={[
                {
                    id: "cancel",
                    buttonText: "Cancel",
                    buttonVariant: "secondary",
                    callback: clear,
                    disabled: status === "Hashing" || status === "Uploading",
                },
                {
                    id: "publish",
                    buttonText: "Publish to the blockchain",
                    buttonVariant: "polkadot",
                    disabled: status === "Hashing" || status === "Uploading" || status === "Error",
                    type: "submit",
                }
            ]}
            onSubmit={handleSubmit(submit)}
        >
            <h3>Add a tokens record</h3>
            <p><strong>Warning:</strong> after processing and blockchain publication, the related data (recorded on the logion blockchain) and the document will be available through the logion public certificate for all token owners recorded in this Collection LOC.</p>

            <FormGroup
                id="locFile"
                label="File"
                control={ <FileSelectorButton onFileSelected={ onFileSelected } /> }
                colors={ colorTheme.dialog }
            />
            <FormGroup
                id="fileName"
                label="File Name"
                control={
                    <Controller
                        name="fileName"
                        control={ control }
                        defaultValue=""
                        rules={ { maxLength: 255, required: true } }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!errors.fileName?.message }
                                type="text" placeholder="e.g. XYZ"
                                data-testid="fileName"
                                aria-describedby="fileName"
                                { ...field }
                            />
                        ) } />

                }
                colors={ colorTheme.dialog }
            />
            <FormGroup
                id="contentType"
                label="File content type"
                control={
                    <Controller
                        name="contentType"
                        control={ control }
                        defaultValue=""
                        rules={ { maxLength: 255, required: true } }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!errors.contentType?.message }
                                type="text" placeholder="e.g. XYZ"
                                data-testid="contentType"
                                aria-describedby="contentType"
                                { ...field }
                            />
                        ) } />

                }
                colors={ colorTheme.dialog }
            />
            <FormGroup
                id="description"
                label="Document Public Description"
                control={
                    <Controller
                        name="description"
                        control={ control }
                        defaultValue=""
                        rules={ { maxLength: 4096, required: true } }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!errors.description?.message }
                                type="text" placeholder="e.g. XYZ"
                                aria-describedby="description"
                                { ...field }
                            />
                        ) } />

                }
                colors={ colorTheme.dialog }
            />
            { status === 'Hashing' &&
                <p>
                    <Spinner animation="border" size="sm" />
                    &nbsp;Calculating Hash
                </p>
            }
            {
                status === 'Error' && uploadError !== undefined &&
                <Alert
                    variant="danger"
                >
                    { uploadError }
                </Alert>
            }
            <ClientExtrinsicSubmitter
                call={call}
                onError={() => onError()}
                onSuccess={clear}
            />
        </Dialog>
    );
}
