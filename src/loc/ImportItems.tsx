import { useCallback, useState } from "react";
import csv from "csv-parser";

import Dialog from "../common/Dialog";
import FileSelectorButton from "../common/FileSelectorButton";
import Icon from "../common/Icon";
import Table, { Cell, EmptyTableMessage } from "../common/Table";
import { useCommonContext } from "../common/CommonContext";
import Button from "../common/Button";
import ExtrinsicSubmitter, { SignAndSubmit } from "../ExtrinsicSubmitter";
import { CollectionItem } from "../logion-chain/Types";
import { addCollectionItem, getCollectionItem } from "../logion-chain/LogionLoc";
import { useLogionChain } from "../logion-chain";
import { UUID } from "../logion-chain/UUID";
import { sha256HexFromString } from "../common/hash";
import { useResponsiveContext } from "../common/Responsive";
import { useLocContext } from "./LocContext";

const fileReaderStream = require("filereader-stream");

interface Item extends CollectionItem {
    valid: boolean;
    submitted: boolean;
    failed: boolean;
    success: boolean;
}

type Submitters = Record<string, SignAndSubmit>;

export interface Props {
    collectionId: UUID;
}

const INVALID_ID = "Invalid ID";

export default function ImportItems(props: Props) {
    const { width } = useResponsiveContext();
    const { colorTheme, accounts } = useCommonContext();
    const { api } = useLogionChain();
    const { refresh } = useLocContext();

    const [ showImportItems, setShowImportItems ] = useState(false);
    const [ items, setItems ] = useState<Item[]>([]);
    const [ submitters, setSubmitters ] = useState<Submitters>({});
    const [ currentItem, setCurrentItem ] = useState(0);
    const [ isBatchImport, setIsBatchImport ] = useState(false);

    const readCsvFile = useCallback((file: File) => {
        setSubmitters({});
        const rows: Item[] = [];
        fileReaderStream(file)
            .pipe(csv({headers: false}))
            .on("data", (data: any) => {
                if(Object.keys(data).length === 2) {
                    const id = toHexString(data['0']);
                    rows.push({
                        id,
                        valid: id !== INVALID_ID,
                        description: data['1'],
                        submitted: false,
                        failed: false,
                        success: false
                    });
                }
            })
            .on("error", (error: any) => console.log(error))
            .on("end", () => {
                (async function() {
                    for(const item of rows) {
                        if(item.valid) {
                            const existingItem = await getCollectionItem({
                                api: api!,
                                locId: props.collectionId,
                                itemId: item.id
                            });
                            item.submitted = existingItem !== undefined;
                            item.success = existingItem !== undefined;
                        }
                    }
                    setItems(rows);
                    setShowImportItems(true);
                })();
            });
    }, [ setSubmitters, api, props.collectionId ]);

    const submitItem = useCallback((item: Item) => {
        item.submitted = true;
        const signAndSubmit: SignAndSubmit = (setResult, setError) => addCollectionItem({
            api: api!,
            collectionId: props.collectionId,
            signerId: accounts!.current!.address,
            itemId: item.id,
            itemDescription: item.description,
            callback: setResult,
            errorCallback: setError
        });
        const newSubmitters = { ...submitters };
        newSubmitters[item.id] = signAndSubmit;
        setSubmitters(newSubmitters);
    }, [ submitters, accounts, api, props.collectionId ]);

    const submitNext = useCallback((submittedItem: Item, failed: boolean) => {
        if(failed) {
            submittedItem.failed = true;
        } else {
            submittedItem.success = true;
        }
        if(isBatchImport) {
            const nextItemIndex = getNextItem(items, currentItem);
            if(nextItemIndex < items.length) {
                setCurrentItem(nextItemIndex);
                submitItem(items[nextItemIndex]);
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

    const importAll = useCallback(() => {
        if(items.length > 0) {
            setIsBatchImport(true);
            const firstItemIndex = getFirstItem(items);
            setCurrentItem(firstItemIndex);
            submitItem(items[firstItemIndex]);
        }
    }, [ setIsBatchImport, setCurrentItem, submitItem, items ]);

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
                            render: item => <Cell content={ item.description } tooltipId={ `${item.id}-tooltip` } overflowing />,
                            align: "left",
                        },
                        {
                            header: "",
                            render: item => (
                                <>
                                    {
                                        (!item.submitted && item.valid) &&
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
                                            <ExtrinsicSubmitter
                                                id={ item.id }
                                                signAndSubmit={ submitters[item.id] || null }
                                                onError={ () => submitNext(item, true) }
                                                onSuccess={ () => submitNext(item, false) }
                                                slim
                                            />
                                        } />
                                    }
                                    {
                                        (item.submitted && item.success) &&
                                        <Cell content={ <Icon icon={{ id: "ok" }} /> } />
                                    }
                                    {
                                        !item.valid &&
                                        <Cell content={ <Icon icon={{ id: "ko" }} /> } />
                                    }
                                </>
                            )
                        }
                    ]}
                    data={ items || [] }
                    renderEmpty={ () => <EmptyTableMessage>No item to import</EmptyTableMessage> }
                    color={ colorTheme.dialogTable }
                />
                <Button
                    variant="polkadot"
                    onClick={ importAll }
                    disabled={ getNotSubmitted(items) === 0 || isBatchImport }
                >
                    <Icon icon={{id: "import_items"}} height="23px" /> Import all
                </Button>
            </Dialog>
        </div>
    );
}

function toHexString(maybeHex: string): string {
    if(maybeHex.startsWith("0x") && maybeHex.length === 66) {
        return maybeHex;
    } else if(maybeHex.startsWith("0x") && maybeHex.length !== 66) {
        return INVALID_ID;
    } else {
        return `0x${sha256HexFromString(maybeHex)}`;
    }
}

function getFirstItem(items: Item[]): number {
    return getNextItem(items, -1);
}


function getNextItem(items: Item[], current: number): number {
    let next = current + 1;
    while(next < items.length && (!items[next].valid || items[next].submitted)) {
        ++next;
    }
    return next;
}

function getNotSubmitted(items: Item[]): number {
    let count = 0;
    for(const item of items) {
        if(!item.submitted && item.valid) {
            ++count;
        }
    }
    return count;
}
