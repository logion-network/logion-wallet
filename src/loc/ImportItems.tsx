import { ClosedCollectionLoc, UploadableCollectionItem, ItemFileWithContent, HashOrContent, MimeType, ItemTokenWithRestrictedType } from "@logion/client";
import { useCallback, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import Dialog from "../common/Dialog";
import FileSelectorButton from "../common/FileSelectorButton";
import Icon from "../common/Icon";
import Table, { Cell, EmptyTableMessage } from "../common/Table";
import { useCommonContext } from "../common/CommonContext";
import Button from "../common/Button";
import { useLogionChain } from "../logion-chain";
import { useResponsiveContext } from "../common/Responsive";
import { useUserLocContext } from "./UserLocContext";
import ImportItemDetails, { ErrorType, Item } from "./ImportItemDetails";

import './ImportItems.css';
import { toItemId } from "./types";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "../ClientExtrinsicSubmitter";
import { ActiveLoc } from "./LocContext";
import { CsvItem, readItemsCsv } from "./ImportCsvReader";
import Alert from "src/common/Alert";

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

    const readCsvFile = useCallback(async (file: File) => {
        const collection = locState as ClosedCollectionLoc;
        setSubmitters({});

        const result = await readItemsCsv(file);
        if("items" in result) {
            const rows = toItems(result.items);

            for(const item of rows) {
                if(!item.error) {
                    const existingItem = await collection.getCollectionItem({
                        itemId: item.id
                    });
                    item.submitted = existingItem !== undefined;
                    item.success = existingItem !== undefined;
                    item.upload = shouldUpload(locState, existingItem);
                }
            }

            setItems(rows);
        } else {
            setCsvReadError(result.error);
        }
        setShowImportItems(true);
    }, [ setSubmitters, locState ]);

    const submitItem = useCallback(async (item: Item) => {
        const collection = locState as ClosedCollectionLoc;
        item.submitted = true;
        const signAndSubmit: Call = async (callback: CallCallback) => {
            await collection.addCollectionItem({
                signer: signer!,
                itemId: item.id,
                itemDescription: item.description,
                itemFiles: item.files,
                restrictedDelivery: item.restrictedDelivery,
                itemToken: item.token,
                callback,
            })
        }
        const newSubmitters = { ...submitters };
        newSubmitters[item.id] = signAndSubmit;
        setSubmitters(newSubmitters);
    }, [ submitters, signer, locState ]);

    const submitNext = useCallback(async (submittedItem: Item, failed: boolean) => {
        if(failed) {
            submittedItem.failed = true;
        } else {
            submittedItem.success = true;
        }
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

    const close = useCallback(() => {
        setShowImportItems(false);
        setIsBatchImport(false);
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
        const collection = locState as ClosedCollectionLoc;
        try {
            await collection.uploadCollectionItemFile({
                itemId: item.id,
                itemFile: new ItemFileWithContent({
                    name: item.files[0].name,
                    contentType: item.files[0].contentType,
                    size: item.files[0].size,
                    hashOrContent: new HashOrContent({ hash: item.files[0].hashOrContent.contentHash, content: file }),
                }),
            });
            item.upload = false;
            item.error = undefined;
            item.errorType = undefined;
        } catch(e) {
            item.error = String(e);
            item.errorType = "upload";
        }
        setItems([ ...items ]);
    }, [ locState, items, setItems ]);

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

                <p>Please double-check the items that you are about to add to your Collection LOC: related data will be recorded on
                    the logion blockchain. <strong>Further deletion will NOT be possible.</strong>
                </p>

                <p><strong>If you did not prefix the ID with "0x" in the CSV file, we hashed the provided value for you.</strong></p>

                { items.length > 0 &&
                    <>
                    <Table
                        columns={[
                            {
                                header: "ID",
                                render: item => <Cell content={ item.id } />,
                                align: "left",
                                width: width({
                                    onSmallScreen: "540px",
                                    otherwise: "610px"
                                }),
                            },
                            {
                                header: "Description",
                                render: item => <Cell content={ item.description } overflowing />,
                                align: "left",
                                renderDetails: item => <ImportItemDetails item={ item } />,
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
                                            (item.submitted && !item.success && submitters[item.id] !== undefined && submitters[item.id] !== null) &&
                                            <Cell content={
                                                <ClientExtrinsicSubmitter
                                                    call={ submitters[item.id] || null }
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
                                                <FileSelectorButton
                                                    buttonText="Upload file"
                                                    onFileSelected={ file => uploadItemFile(item, file) }
                                                    onlyButton={ true }
                                                    accept={ item.files[0].contentType.mimeType }
                                                />
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

function shouldUpload(locState: ActiveLoc | null, existingItem: UploadableCollectionItem | undefined): boolean {
    const mustUpload = uploadExpected(locState);
    return mustUpload && (existingItem === undefined || (existingItem.files.length > 0 && !existingItem.files[0].uploaded));
}

function uploadExpected(locState: ActiveLoc | null): boolean {
    const collection = locState as ClosedCollectionLoc;
    return collection.data().collectionCanUpload !== undefined && collection.data().collectionCanUpload === true;
}

function toItems(csvItems: CsvItem[]): Item[] {
    return csvItems.map(csvItem => {
        const givenId = csvItem.id;
        const id = toItemId(givenId);
        const displayId = id !== undefined ? id : givenId;
        const description = csvItem.description;

        if(csvItem.validationError) {
            return {
                id: displayId,
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
            if(id === undefined) {
                error = "Invalid ID";
                errorType = "validation";
            }

            let files: ItemFileWithContent[] = [];
            if("fileName" in csvItem) {
                files = [
                    new ItemFileWithContent({
                        name: csvItem.fileName,
                        contentType: MimeType.from(csvItem.fileContentType),
                        size: BigInt(csvItem.fileSize),
                        hashOrContent: HashOrContent.fromHash(csvItem.fileHash),
                    })
                ];
            }

            let restrictedDelivery = false;
            let token: ItemTokenWithRestrictedType | undefined = undefined;
            if("restrictedDelivery" in csvItem) {
                restrictedDelivery = csvItem.restrictedDelivery;
                if(csvItem.tokenType && csvItem.tokenId) {
                    if(csvItem.tokenType === "ethereum_erc721") {
                        token = {
                            type: csvItem.tokenType,
                            id: csvItem.tokenId,
                        }
                    } else {
                        error = `Unsupported token type ${csvItem.tokenType}`;
                        errorType = "validation";
                    }
                }
            }

            return {
                id: displayId,
                error,
                errorType,
                description,
                files,
                restrictedDelivery,
                token,
                submitted: false,
                failed: false,
                success: false,
                upload: false,
            };
        }
    });
}
