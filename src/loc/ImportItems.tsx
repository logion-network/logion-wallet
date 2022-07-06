import { useCallback, useState } from "react";
import csv from "csv-parser";

import Dialog from "../common/Dialog";
import FileSelectorButton from "../common/FileSelectorButton";
import Icon from "../common/Icon";
import Table, { Cell, EmptyTableMessage } from "../common/Table";
import { useCommonContext } from "../common/CommonContext";
import Button from "../common/Button";
import { useLogionChain } from "../logion-chain";
import { useResponsiveContext } from "../common/Responsive";
import { useUserLocContext } from "./UserLocContext";
import ImportItemDetails, { Item } from "./ImportItemDetails";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import './ImportItems.css';
import { toItemId } from "./types";
import { ClosedCollectionLoc } from "@logion/client";
import { ItemFile } from "@logion/node-api/dist/Types";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "../ClientExtrinsicSubmitter";

const fileReaderStream = require("filereader-stream");

type Submitters = Record<string, Call>;

export default function ImportItems() {
    const { width } = useResponsiveContext();
    const { signer } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const { refresh, locState } = useUserLocContext();

    const [ showImportItems, setShowImportItems ] = useState(false);
    const [ items, setItems ] = useState<Item[]>([]);
    const [ submitters, setSubmitters ] = useState<Submitters>({});
    const [ currentItem, setCurrentItem ] = useState(0);
    const [ isBatchImport, setIsBatchImport ] = useState(false);

    const readCsvFile = useCallback((file: File) => {
        const collection = locState as ClosedCollectionLoc;
        setSubmitters({});
        const rows: Item[] = [];
        const ids: Record<string, null> = {};
        fileReaderStream(file)
            .pipe(csv({headers: false}))
            .on("data", (data: any) => {
                if(Object.keys(data).length >= 2) {
                    const givenId = data['0'];
                    const id = toItemId(givenId);
                    const displayId = id !== undefined ? id : givenId;

                    let error: string | undefined = undefined;
                    if(id === undefined) {
                        error = "Invalid ID";
                    } else if(id in ids) {
                        error = "Duplicate ID";
                    }

                    let files: ItemFile[] = [];
                    if(Object.keys(data).length >= 6) {
                        files = [
                            {
                                name: data['2'],
                                contentType: data['3'],
                                size: data['4'],
                                hash: data['5']
                            }
                        ];
                    }

                    rows.push({
                        id: displayId,
                        error,
                        description: data['1'],
                        files,
                        submitted: false,
                        failed: false,
                        success: false,
                        upload: files.length > 0 ? true : false,
                    });

                    if(id !== undefined) {
                        ids[id] = null;
                    }
                }
            })
            .on("error", (error: any) => console.log(error))
            .on("end", () => {
                (async function() {
                    for(const item of rows) {
                        if(!item.error) {
                            const existingItem = await collection.getCollectionItem({
                                itemId: item.id
                            });
                            item.submitted = existingItem !== undefined;
                            item.success = existingItem !== undefined;
                            // TODO update item.upload using backend API
                        }
                    }
                    setItems(rows);
                    setShowImportItems(true);
                })();
            });
    }, [ setSubmitters, locState ]);

    const submitItem = useCallback(async (item: Item) => {
        const collection = locState as ClosedCollectionLoc;
        item.submitted = true;
        const signAndSubmit: Call = async (callback: CallCallback) => {
            await collection.addCollectionItem({
                signer: signer!,
                itemId: item.id,
                itemDescription: item.description,
                callback
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
                itemFile: {
                    ...item.files[0],
                    content: file,
                },
            });
            item.upload = false;
        } catch(e) {
            item.error = String(e);
        }
    }, [ locState ]);

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
                <p>Please double-check the items that you are about to add to your Collection LOC.</p>
                <p><strong>If you did not prefix the ID with "0x" in the CSV file, we hashed the provided value for you.</strong></p>

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
                                        (item.submitted && item.success && item.upload && !item.error) &&
                                        <Cell content={
                                            <FileSelectorButton
                                                buttonText="Upload file"
                                                onFileSelected={ file => uploadItemFile(item, file) }
                                                onlyButton={ true }
                                                accept={ item.files[0].contentType }
                                            />
                                        } />
                                    }
                                    {
                                        (item.submitted && item.success && !item.upload) &&
                                        <Cell content={ <Icon icon={{ id: "ok" }} /> } />
                                    }
                                    {
                                        item.error &&
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
