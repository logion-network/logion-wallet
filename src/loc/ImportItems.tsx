import {
    ClosedCollectionLoc,
    UploadableCollectionItem,
    HashOrContent,
    MimeType,
    ItemTokenWithRestrictedType,
    isTokenType,
    LogionClassification,
    SpecificLicense,
    CreativeCommons,
} from "@logion/client";
import { Fees, Hash } from '@logion/node-api';
import { useCallback, useState } from "react";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";

import Dialog from "../common/Dialog";
import FileSelectorButton from "../common/FileSelectorButton";
import Icon from "../common/Icon";
import Table, { Cell, CopyPasteCell, EmptyTableMessage } from "../common/Table";
import { useCommonContext } from "../common/CommonContext";
import Button from "../common/Button";
import { useLogionChain } from "../logion-chain";
import { useResponsiveContext } from "../common/Responsive";
import { useUserLocContext } from "./UserLocContext";
import ImportItemDetails, { ErrorType, Item } from "./ImportItemDetails";

import './ImportItems.css';
import ClientExtrinsicSubmitter, { Call, CallCallback } from "../ClientExtrinsicSubmitter";
import { CsvItem, readItemsCsv } from "./ImportCsvReader";
import Alert from "src/common/Alert";
import { UUID } from "@logion/node-api";
import config from "../config";
import EstimatedFees from "./fees/EstimatedFees";
import { BrowserFile } from "@logion/client-browser";

type Submitters = Record<string, Call>;

export default function ImportItems() {
    const { width } = useResponsiveContext();
    const { signer } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const { refresh, locState } = useUserLocContext();

    const [ showImportItems, setShowImportItems ] = useState(false);
    const [ items, setItems ] = useState<Item[]>([]);
    const [ csvReadError, setCsvReadError ] = useState<string>("");
    const [ submitters, setSubmitters ] = useState<Submitters>({});
    const [ currentItem, setCurrentItem ] = useState(0);
    const [ isBatchImport, setIsBatchImport ] = useState(false);
    const [ uploading, setUploading ] = useState(false);
    const [ fees, setFees ] = useState<Fees | null>(null);
    const [ itemToSubmit, setItemToSubmit ] = useState<Item>();

    const readCsvFile = useCallback(async (file: File) => {
        const collection = locState as ClosedCollectionLoc;
        const acceptsUpload = collectionAcceptsUpload(collection);
        setSubmitters({});

        const result = await readItemsCsv(file);
        if("items" in result) {
            const rows = toItems(result.items, acceptsUpload);

            for(const item of rows) {
                if(!item.error) {
                    const existingItem = await collection.getCollectionItem({ itemId: item.id as Hash });
                    item.submitted = existingItem !== undefined;
                    item.success = existingItem !== undefined;
                    item.upload = shouldUpload(acceptsUpload, existingItem, item.upload);
                }
            }

            setItems(rows);
        } else {
            setCsvReadError(result.error);
        }
        setShowImportItems(true);
    }, [ setSubmitters, locState ]);

    const submitItem = useCallback(async (item: Item) => {
        if (locState) {
            setItemToSubmit(item);
            const collection = locState as ClosedCollectionLoc;
            const fees = await collection.estimateFeesAddCollectionItem({
                itemId: item.id!,
                itemDescription: item.description,
                itemFiles: item.files,
                restrictedDelivery: item.restrictedDelivery,
                itemToken: item.token,
                logionClassification: item.logionClassification,
                specificLicenses: item.specificLicense ? [ item.specificLicense ] : undefined,
                creativeCommons: item.creativeCommons,
            })
            setFees(fees);
        }
    }, [ locState ]);

    const doSubmitItem = useCallback(async () => {
        if(itemToSubmit) {
            setFees(null);

            const collection = locState as ClosedCollectionLoc;
            const item = itemToSubmit;
            setItemToSubmit(undefined);

            item.submitted = true;
            setItems(items.slice());
            const signAndSubmit: Call = async (callback: CallCallback) => {
                await collection.addCollectionItem({
                    signer: signer!,
                    itemId: item.id!,
                    itemDescription: item.description,
                    itemFiles: item.files,
                    restrictedDelivery: item.restrictedDelivery,
                    itemToken: item.token,
                    logionClassification: item.logionClassification,
                    specificLicenses: item.specificLicense ? [ item.specificLicense ] : undefined,
                    creativeCommons: item.creativeCommons,
                    callback,
                })
            }
            const newSubmitters = { ...submitters };
            newSubmitters[item.id!.toHex()] = signAndSubmit;
            setSubmitters(newSubmitters);
        }
    }, [ submitters, signer, locState, itemToSubmit, items ]);

    const submitNext = useCallback(async (submittedItem: Item, failed: boolean) => {
        if(failed) {
            submittedItem.failed = true;
        } else {
            submittedItem.success = true;
        }
        setItems(items.slice());
        if(isBatchImport) {
            const nextItemIndex = getNextItem(items, currentItem);
            if(nextItemIndex < items.length) {
                setCurrentItem(nextItemIndex);
                await submitItem(items[nextItemIndex]);
            } else {
                setIsBatchImport(false);
            }
        }
    }, [ isBatchImport, currentItem, items, setCurrentItem, submitItem, setIsBatchImport ]);

    const cancelSubmission = useCallback(() => {
        setIsBatchImport(false);
        setFees(null);
        setItemToSubmit(undefined);
    }, []);

    const close = useCallback(() => {
        setShowImportItems(false);
        setIsBatchImport(false);
        setItems([]);
        refresh();
    }, [ setShowImportItems, setIsBatchImport, refresh ]);

    const importAll = useCallback(async () => {
        if(items.length > 0) {
            setIsBatchImport(true);
            const firstItemIndex = getFirstItem(items);
            setCurrentItem(firstItemIndex);
            await submitItem(items[firstItemIndex]);
        }
    }, [ setIsBatchImport, setCurrentItem, submitItem, items ]);

    const uploadItemFile = useCallback(async (item: Item, file: File) => {
        setUploading(true);
        const collection = locState as ClosedCollectionLoc;
        try {
            const itemFile = await HashOrContent.fromContentFinalized(new BrowserFile(file, item.files[0].name));
            if(itemFile.size !== item.files[0].size || !itemFile.contentHash.equalTo(item.files[0].contentHash)) {
                throw new Error("File does not match size and/or hash in CSV file");
            }
            await collection.uploadCollectionItemFile({
                itemId: item.id!,
                itemFile,
            });
            item.upload = false;
            item.error = undefined;
            item.errorType = undefined;
            setUploading(false);
        } catch(e) {
            item.error = String(e);
            item.errorType = "upload";
            setUploading(false);
        }
        setItems(items.slice());
    }, [ locState, items, setItems ]);

    if(!locState) {
        return null;
    }
    return (
        <div className="ImportItems">
            <FileSelectorButton
                buttonText="Import items"
                onFileSelected={ readCsvFile }
                onlyButton={ true }
                accept="text/csv"
            />
            <Dialog
                className="ImportItems"
                actions={[
                    {
                        id: "close",
                        buttonText: "Close",
                        callback: close,
                        buttonVariant: "primary",
                        disabled: isBatchImport
                    }
                ]}
                show={ showImportItems }
                size="xl"
            >
                <h3>Collection Items import tool</h3>
                <Icon icon={{id: "big-warning"}} type="png" height="50px"/>

                <div style={{textAlign: "left", marginTop: "10px"}}>
                    <p><strong>Please double-check the items that you are about to add to your Collection LOC:</strong></p>

                    <ul>
                        <li>ALL data below will be recorded on the logion blockchain. Further deletion will NOT be possible.</li>
                        <li>It's your responsibility to check if you do not publicly publish any personal (eg: private name, social security number, etc.), inappropriate, or confidential information and if you have the required rights with regard to the assets you are about to record in this LOC.</li>
                    </ul>

                    <p><strong>If you did not prefix the ID with "0x" in the CSV file, we hashed the provided value for you.</strong></p>
                </div>

                { items.length > 0 &&
                    <>
                    <div className="import-all-container">
                        <Button
                            variant="polkadot"
                            onClick={ importAll }
                            disabled={ getNotSubmitted(items) === 0 || isBatchImport }
                        >
                            <Icon icon={{id: "import_items"}} height="23px" /> Import all
                        </Button>
                    </div>

                    <Table
                        columns={[
                            {
                                header: "ID",
                                render: item => <CopyPasteCell content={ item.id?.toHex() || item.displayId } />,
                                align: "left",
                                width: width({
                                    onSmallScreen: "540px",
                                    otherwise: "610px"
                                }),
                            },
                            {
                                header: "Description",
                                render: item => <Cell content={ item.description } overflowing tooltipId={`item-${item.id}-description`}/>,
                                align: "left",
                                renderDetails: item => <ImportItemDetails locId={ locState?.data().id } item={ item } />,
                                detailsExpanded: item => item.error !== undefined,
                            },
                            {
                                header: "",
                                render: item => (
                                    <>
                                        {
                                            (!item.submitted && !item.error) &&
                                            <Button
                                                variant="polkadot"
                                                onClick={ () => submitItem(item) }
                                            >
                                                <Icon icon={{id: "import_items"}} height="23px" /> Import
                                            </Button>
                                        }
                                        {
                                            (item.submitted && !item.success && submitters[item.id?.toHex() || ""] !== undefined && submitters[item.id?.toHex() || ""] !== null) &&
                                            <Cell content={
                                                <ClientExtrinsicSubmitter
                                                    call={ submitters[item.id?.toHex() || ""] || null }
                                                    onError={ () => submitNext(item, true) }
                                                    onSuccess={ () => submitNext(item, false) }
                                                    slim
                                                />
                                            } />
                                        }
                                        {
                                            (item.submitted && item.success && item.upload && (!item.error || item.errorType === "upload")) &&
                                            <Cell content={
                                                <>
                                                {
                                                    !uploading &&
                                                    <FileSelectorButton
                                                        buttonText="Upload file"
                                                        onFileSelected={ file => uploadItemFile(item, file) }
                                                        onlyButton={ true }
                                                        accept={ item.files[0].mimeType.mimeType }
                                                    />
                                                }
                                                {
                                                    uploading &&
                                                    <Spinner animation="border" />
                                                }
                                                {
                                                    item.error &&
                                                    <span className="upload-error"><Icon icon={{ id: "ko" }} /></span>
                                                }
                                                </>
                                            } />
                                        }
                                        {
                                            (item.submitted && item.success && !item.upload) &&
                                            <Cell content={ <Icon icon={{ id: "ok" }} /> } />
                                        }
                                        {
                                            (item.error && item.errorType !== "upload") &&
                                            <Cell content={
                                                <OverlayTrigger
                                                    placement="bottom"
                                                    delay={ 500 }
                                                    overlay={
                                                        <Tooltip id={`tooltip-${item.id}`}>
                                                            { item.error }
                                                        </Tooltip>
                                                    }
                                                >
                                                    <span><Icon icon={{ id: "ko" }} /></span>
                                                </OverlayTrigger>
                                            } />
                                        }
                                    </>
                                )
                            }
                        ]}
                        data={ items || [] }
                        renderEmpty={ () => <EmptyTableMessage>No item to import</EmptyTableMessage> }
                        color={ colorTheme.dialogTable }
                    />

                    <div className="import-all-container">
                        <Button
                            variant="polkadot"
                            onClick={ importAll }
                            disabled={ getNotSubmitted(items) === 0 || isBatchImport }
                        >
                            <Icon icon={{id: "import_items"}} height="23px" /> Import all
                        </Button>
                    </div>
                    </>
                }
                {
                    csvReadError &&
                    <Alert variant="danger">
                        { csvReadError }
                    </Alert>
                }
            </Dialog>
            <Dialog
                className="ImportItems"
                actions={[
                    {
                        id: "cancel",
                        buttonText: "Cancel",
                        callback: cancelSubmission,
                        buttonVariant: "secondary",
                    },
                    {
                        id: "proceed",
                        buttonText: "Proceed",
                        callback: doSubmitItem,
                        buttonVariant: "polkadot",
                    }
                ]}
                show={ fees !== null }
                size="lg"
            >
                <h3>Collection Item Creation Fees</h3>
                <EstimatedFees
                    fees={ fees }
                    centered={ true }
                    hideTitle={ true }
                />
            </Dialog>
        </div>
    );
}

function getFirstItem(items: Item[]): number {
    return getNextItem(items, -1);
}


function getNextItem(items: Item[], current: number): number {
    let next = current + 1;
    while(next < items.length && (items[next].error || items[next].submitted)) {
        ++next;
    }
    return next;
}

function getNotSubmitted(items: Item[]): number {
    let count = 0;
    for(const item of items) {
        if(!item.submitted && !item.error) {
            ++count;
        }
    }
    return count;
}

function shouldUpload(collectionAcceptsUpload: boolean, existingItem: UploadableCollectionItem | undefined, initialValue: boolean): boolean {
    return collectionAcceptsUpload
        && (
            (existingItem === undefined && initialValue)
            || (existingItem !== undefined && existingItem.files.length > 0 && !existingItem.files[0].uploaded)
        );
}

function collectionAcceptsUpload(collection: ClosedCollectionLoc): boolean {
    return collection.data().collectionCanUpload !== undefined && collection.data().collectionCanUpload === true;
}

function toItems(csvItems: CsvItem[], collectionAcceptsUpload: boolean): Item[] {
    return csvItems.map(csvItem => {
        const id = csvItem.id;
        const displayId = csvItem.displayId;
        const description = csvItem.description;

        if(csvItem.validationError) {
            return {
                id,
                displayId,
                error: csvItem.validationError,
                errorType: "validation",
                description,
                files: [],
                restrictedDelivery: false,
                submitted: false,
                failed: false,
                success: false,
                upload: false,
            };
        } else {
            let error: string | undefined = undefined;
            let errorType: ErrorType | undefined = undefined;

            let files: HashOrContent[] = [];
            if("fileName" in csvItem) {
                files = [
                    HashOrContent.fromDescription({
                        hash: csvItem.fileHash,
                        mimeType: MimeType.from(csvItem.fileContentType),
                        name: csvItem.fileName,
                        size: BigInt(csvItem.fileSize),
                    }),
                ];
            }

            let restrictedDelivery = false;
            if("restrictedDelivery" in csvItem) {
                restrictedDelivery = csvItem.restrictedDelivery;
            }

            let token: ItemTokenWithRestrictedType | undefined;
            let tokenIssuance: string | undefined;
            if("tokenType" in csvItem) {
                if(csvItem.tokenType && csvItem.tokenId && csvItem.tokenIssuance) {
                    if(isTokenType(csvItem.tokenType)) {
                        token = {
                            type: csvItem.tokenType,
                            id: csvItem.tokenId,
                            issuance: BigInt(csvItem.tokenIssuance),
                        };
                    } else {
                        error = `Unsupported token type ${csvItem.tokenType}`;
                        errorType = "validation";
                    }
                }
            }

            let tcValidationResult: TCValidationResult = {}
            if (error === undefined) {
                tcValidationResult = validateTermsAndConditions(csvItem);
                error = tcValidationResult.tcError;
                errorType = "validation";
            }

            return {
                id,
                displayId,
                error,
                errorType,
                description,
                files,
                restrictedDelivery,
                token,
                tokenIssuance,
                submitted: false,
                failed: false,
                success: false,
                upload: collectionAcceptsUpload && files.length > 0,
                logionClassification: tcValidationResult.logionClassification,
                specificLicense: tcValidationResult.specificLicense,
                creativeCommons: tcValidationResult.creativeCommons,
            };
        }
    });
}

interface TCValidationResult {
    logionClassification?: LogionClassification;
    specificLicense?: SpecificLicense;
    creativeCommons?: CreativeCommons;
    tcError?: string;
}

function validateTermsAndConditions(csvItem: CsvItem): TCValidationResult {
    try {
        if (csvItem.termsAndConditionsType === 'logion_classification') {
            const logionClassificationLocId = UUID.fromAnyString(config.logionClassification);
            if (logionClassificationLocId === undefined) {
                return { tcError: "logion_classification: Logion Classification LOC id not properly configured" }
            }
            const logionClassification = LogionClassification.fromDetails(logionClassificationLocId, csvItem.termsAndConditionsParameters);
            return { logionClassification }
        } else if (csvItem.termsAndConditionsType === 'CC4.0') {
            const ccLocId = UUID.fromAnyString(config.creativeCommons);
            if (ccLocId === undefined) {
                return { tcError: "CC4.0: LOC id not properly configured" }
            }
            const creativeCommons = CreativeCommons.fromDetails(ccLocId, csvItem.termsAndConditionsParameters);
            return { creativeCommons }
        } else if (csvItem.termsAndConditionsType === 'specific_license') {
            const tcLocId = UUID.fromAnyString(csvItem.termsAndConditionsParameters);
            if (tcLocId === undefined) {
                return { tcError: "specific_license: Invalid Terms and Conditions LOC id found under TERM_AND_CONDITIONS parameters" }
            }
            const specificLicense = SpecificLicense.fromDetails(tcLocId, "");
            return { specificLicense }
        } else if (csvItem.termsAndConditionsType === 'none') {
            return {}
        }
        return { tcError: `Invalid TERM_AND_CONDITIONS type: '${ csvItem.termsAndConditionsType }'` };
    } catch (error) {
        return { tcError: "" + error }
    }
}
