import { useCallback, useState } from "react";
import csv from "csv-parser";
import { UUID } from "@logion/node-api/dist/UUID";
import { getCollectionItem, addCollectionItem } from "@logion/node-api/dist/LogionLoc";

import Dialog from "../common/Dialog";
import FileSelectorButton from "../common/FileSelectorButton";
import Icon from "../common/Icon";
import Table, { Cell, EmptyTableMessage } from "../common/Table";
import { useCommonContext } from "../common/CommonContext";
import Button from "../common/Button";
import ExtrinsicSubmitter, { SignAndSubmit } from "../ExtrinsicSubmitter";
import { useLogionChain } from "../logion-chain";
import { useResponsiveContext } from "../common/Responsive";
import { useLocContext } from "./LocContext";
import ImportItemDetails, { Item } from "./ImportItemDetails";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import './ImportItems.css';
import { toItemId } from "./types";
import { signAndSend } from "src/logion-chain/Signature";

const fileReaderStream = require("filereader-stream");

type Submitters = Record<string, SignAndSubmit>;

export interface Props {
    collectionId: UUID;
}

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

                    rows.push({
                        id: displayId,
                        error,
                        description: data['1'],
                        submitted: false,
                        failed: false,
                        success: false
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
        const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSend({
            signerId: accounts!.current!.address,
            callback: setResult,
            errorCallback: setError,
            submittable: addCollectionItem({
                api: api!,
                collectionId: props.collectionId,
                itemId: item.id,
                itemDescription: item.description,
            })
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
