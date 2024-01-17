import { HashOrContent, TokensRecord, ClosedCollectionLoc } from "@logion/client";
import { useCallback, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import Alert from "src/common/Alert";
import { useCommonContext } from "src/common/CommonContext";
import Dialog from "src/common/Dialog";
import FileSelectorButton from "src/common/FileSelectorButton";
import FormGroup from "src/common/FormGroup";
import Icon from "src/common/Icon";
import { CallCallback, useLogionChain } from "src/logion-chain";
import { useLocContext } from "../LocContext";
import { BrowserFile } from "@logion/client-browser";
import EstimatedFees from "../fees/EstimatedFees";
import { Fees } from "@logion/node-api";
import ExtrinsicSubmissionStateView from "src/ExtrinsicSubmissionStateView";

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

type Status = 'Idle' | 'Hashing' | 'Confirming' | 'Uploading' | 'Error';

export default function AddTokensRecordDialog(props: Props) {
    const { colorTheme } = useCommonContext();
    const { mutateLocState, locState } = useLocContext();
    const { signer, submitCall, clearSubmissionState } = useLogionChain();
    const { control, handleSubmit, formState: { errors }, reset, setValue, getValues } = useForm<FormValues>();
    const [ file, setFile ] = useState<File>();
    const [ uploadError, setUploadError ] = useState<string>();
    const [ status, setStatus ] = useState<Status>('Idle');
    const [ fees, setFees ] = useState<Fees | null>(null);
    const [ content, setContent ] = useState<HashOrContent>();

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
        clearSubmissionState();
        setStatus('Idle');
        setUploadError("");
        setFees(null);
        setContent(undefined);
        reset();
        props.hide();
    }, [ props, reset, clearSubmissionState ]);

    const estimateFees = useCallback(async (formValues: FormValues) => {
        setUploadError("")
        if (file) {
            setStatus('Hashing')
            try {
                const content = await HashOrContent.fromContentFinalized(new BrowserFile(file, formValues.fileName));
                setContent(content);
                const hash = content.contentHash;
                const existingRecord = props.records.find(record => record.id.toHex() === hash.toHex());
                if (existingRecord !== undefined) {
                    onError(`Record with ID ${hash.toHex()} already exists`);
                } else {
                    const collection = locState as ClosedCollectionLoc;
                    const fees = await collection.estimateFeesAddTokensRecord({
                        recordId: hash,
                        description: formValues.description,
                        files: [ content ],
                    });
                    setFees(fees);
                    setStatus('Confirming');
                }
            } catch (error: any) {
                const errorMessage = error?.response?.data?.errorMessage;
                onError(`${ error }: ${ errorMessage }`);
            }
        }
    }, [ file, locState, onError, props.records ]);

    const submit = useCallback(async () => {
        setUploadError("")
        if (content) {
            const hash = content.contentHash;
            setStatus('Uploading');
            const call = async (callback: CallCallback) => await mutateLocState(async current => {
                if (signer && current instanceof ClosedCollectionLoc) {
                    const formValues = getValues();
                    await current.addTokensRecord({
                        payload: {
                            recordId: hash,
                            description: formValues.description,
                            files: [ content ],
                        },
                        signer,
                        callback,
                    });
                    const currentLoc = current.getCurrentState() as ClosedCollectionLoc;
                    return currentLoc.refresh();
                } else {
                    return current;
                }
            });
            try {
                await submitCall(call);
                clear();
            } catch (error) {
                onError();
            }
        }
    }, [ mutateLocState, onError, signer, getValues, content, submitCall, clear ]);

    return (<>
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
            onSubmit={handleSubmit(estimateFees)}
        >
            <h3>Add a tokens record</h3>
            <Icon icon={{id: "big-warning"}} type="png" height="50px"/>

            <div style={{textAlign: "left"}}>
                <p><strong>Warning:</strong></p>
                <ul>
                    <li style={{marginBottom: "20px"}}>After publication, the only data that will be publicly available on the blockchain will be the HASH of the document, the file name, and its type. With regards to the name of the file, it's your responsibility to check if the file name does not show any personal (eg: private name, social security number, etc.), inappropriate or confidential information.</li>
                    <li>After processing and blockchain publication, the related data (recorded on the logion blockchain) and the document file(s) will be available through the logion public certificate for all token owners recorded in this Collection LOC. It's your responsibility to check if you have the required rights with regard to the assets you are about to record in this LOC.</li>
                </ul>
            </div>

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
            <ExtrinsicSubmissionStateView />
        </Dialog>

        <Dialog
            actions={[
                {
                    id: "cancel",
                    buttonText: "Cancel",
                    callback: () => setStatus('Idle'),
                    buttonVariant: "secondary",
                },
                {
                    id: "proceed",
                    buttonText: "Proceed",
                    callback: submit,
                    buttonVariant: "polkadot",
                }
            ]}
            show={ status === 'Confirming' }
            size="lg"
        >
            <h3>Tokens Record Creation Fees</h3>
            <EstimatedFees
                fees={ fees }
                centered={ true }
                hideTitle={ true }
            />
        </Dialog>
    </>);
}
