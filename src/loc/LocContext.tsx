import React, { useContext, useReducer, Reducer, useEffect, useCallback, useState } from "react";
import {
    UUID,
    addMetadata,
    addFile,
    closeLoc,
    addLink,
    voidLoc,
    VoidInfo,
    LocType,
} from "@logion/node-api";
import {
    OpenLoc,
    ClosedLoc,
    VoidedLoc,
    ClosedCollectionLoc,
    VoidedCollectionLoc,
    LocData,
    PublicLoc,
    MergedFile,
    MergedMetadataItem,
    MergedLink,
    CollectionItem,
} from "@logion/client";

import {
    confirmLocFile,
    deleteLocFile,
    preClose,
    preVoid,
    deleteLocLink,
    confirmLocLink,
    confirmLocMetadataItem,
    deleteLocMetadataItem,
    isGrantedAccess
} from "../common/Model";
import { useCommonContext } from "../common/CommonContext";
import { useLogionChain } from "../logion-chain";
import { SignAndSubmit } from "../ExtrinsicSubmitter";
import { LocItemStatus, LocItem } from "./types";
import {
    createDraftFileLocItem,
    createDraftMetadataLocItem,
    createDraftLinkedLocItem,
    createFileItem,
    createMetadataItem,
    createLinkItem
} from "./LocItemFactory";
import { addLink as modelAddLink, addMetadata as modelAddMetadata, addFile as modelAddFile } from "./Model"
import { fullCertificateUrl } from "../PublicPaths";
import { signAndSend } from "src/logion-chain/Signature";
import { useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";
import { DocumentCheckResult } from "src/components/checkfileframe/CheckFileFrame";

export interface FullVoidInfo extends VoidInfo {
    reason: string;
}

export type ActiveLoc = OpenLoc | ClosedLoc | ClosedCollectionLoc | VoidedLoc | VoidedCollectionLoc;

export interface LinkTarget {
    id: UUID;
    description: string;
    locType: LocType;
}

export interface LocContext {
    locId: UUID
    loc: LocData | null
    supersededLoc?: PublicLoc
    locItems: LocItem[]
    addMetadata: ((name: string, value: string) => void) | null
    addLink: ((otherLoc: LinkTarget, nature: string) => void) | null
    publishLink: ((locItem: LocItem) => SignAndSubmit) | null
    publishMetadata: ((locItem: LocItem) => SignAndSubmit) | null
    addFile: ((name: string, file: File, nature: string) => Promise<void>) | null
    publishFile: ((locItem: LocItem) => SignAndSubmit) | null
    close: (() => void) | null
    closeExtrinsic: ((seal?: string) => SignAndSubmit) | null
    confirmFile: ((locItem: LocItem) => void) | null
    deleteFile: ((locItem: LocItem) => void) | null
    confirmLink: ((locItem: LocItem) => void) | null
    deleteLink: ((locItem: LocItem) => void) | null
    confirmMetadata: ((locItem: LocItem) => void) | null
    deleteMetadata: ((locItem: LocItem) => void) | null
    voidLoc: ((voidInfo: FullVoidInfo) => void) | null
    voidLocExtrinsic?: ((voidInfo: VoidInfo) => SignAndSubmit) | null
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
    refresh: () => void
    locState: ActiveLoc | null
    checkHash: (hash: string) => void
    checkResult: DocumentCheckResult
    collectionItem?: CollectionItem
}

const MAX_REFRESH = 20;
const REFRESH_INTERVAL = 5000;

function initialContextValue(locId: UUID, backPath: string, detailsPath: (locId: UUID, type: LocType) => string): LocContext {
    return {
        locId,
        backPath,
        detailsPath,
        locItems: [],
        addMetadata: null,
        addLink: null,
        publishLink: null,
        publishMetadata: null,
        addFile: null,
        publishFile: null,
        close: null,
        closeExtrinsic: null,
        confirmFile: null,
        deleteFile: null,
        confirmLink: null,
        deleteLink: null,
        confirmMetadata: null,
        deleteMetadata: null,
        voidLoc: null,
        voidLocExtrinsic: null,
        refresh: () => {},
        locState: null,
        loc: null,
        checkHash: () => {},
        checkResult: { result: "NONE" },
    }
}

const LocContextObject: React.Context<LocContext> = React.createContext(initialContextValue(new UUID(), "", () => ""))

type ActionType = 'SET_LOC_REQUEST'
    | 'SET_LOC'
    | 'SET_FUNCTIONS'
    | 'ADD_ITEM'
    | 'UPDATE_ITEM_STATUS'
    | 'UPDATE_ITEM_TIMESTAMP'
    | 'DELETE_ITEM'
    | 'CLOSE'
    | 'VOID'
    | 'RESET'
    | 'SET_CHECK_RESULT'

interface Action {
    type: ActionType,
    locId?: UUID,
    supersededLoc?: PublicLoc,
    locItem?: LocItem,
    status?: LocItemStatus,
    name?: string,
    timestamp?: string,
    addMetadata?: (name: string, value: string) => void,
    addLink?: (otherLoc: LinkTarget, nature: string) => void,
    publishLink?: (locItem: LocItem) => SignAndSubmit,
    publishMetadata?: (locItem: LocItem) => SignAndSubmit,
    addFile?: (name: string, file: File, nature: string) => Promise<void>,
    publishFile?: (locItem: LocItem) => SignAndSubmit,
    close?: () => void,
    closeExtrinsic?: (seal?: string) => SignAndSubmit,
    confirmFile?: (locItem: LocItem) => void,
    deleteFile?: (locItem: LocItem) => void,
    confirmLink?: (locItem: LocItem) => void
    deleteLink?: (locItem: LocItem) => void,
    confirmMetadata?: (locItem: LocItem) => void,
    deleteMetadata?: (locItem: LocItem) => void,
    voidInfo?: FullVoidInfo,
    voidLoc?: (voidInfo: FullVoidInfo) => void,
    voidLocExtrinsic?: (voidInfo: VoidInfo) => SignAndSubmit,
    refresh?: () => void,
    locState?: ActiveLoc,
    locData?: LocData,
    checkHash?: (hash: string) => void,
    collectionItem?: CollectionItem,
    checkResult?: DocumentCheckResult,
}

const reducer: Reducer<LocContext, Action> = (state: LocContext, action: Action): LocContext => {
    const items = state.locItems.concat();
    const itemIndex = items.indexOf(action.locItem!);
    switch (action.type) {
        case "RESET":
            return initialContextValue(action.locId!, state.backPath, state.detailsPath)
        case "SET_LOC":
            return {
                ...state,
                supersededLoc: action.supersededLoc,
                locState: action.locState!,
                loc: action.locData!,
            }
        case "SET_FUNCTIONS":
            return {
                ...state,
                addMetadata: action.addMetadata!,
                publishMetadata: action.publishMetadata!,
                addLink: action.addLink!,
                publishLink: action.publishLink!,
                addFile: action.addFile!,
                publishFile: action.publishFile!,
                closeExtrinsic: action.closeExtrinsic!,
                close: action.close!,
                confirmFile: action.confirmFile!,
                deleteFile: action.deleteFile!,
                confirmLink: action.confirmLink!,
                deleteLink: action.deleteLink!,
                confirmMetadata: action.confirmMetadata!,
                deleteMetadata: action.deleteMetadata!,
                voidLoc: action.voidLoc!,
                voidLocExtrinsic: action.voidLocExtrinsic!,
                refresh: action.refresh!,
                checkHash: action.checkHash!,
            }
        case "ADD_ITEM":
            if (itemExists(action.locItem!, state.locItems)) {
                return { ...state }
            } else {
                return { ...state, locItems: state.locItems.concat(action.locItem!) }
            }
        case "UPDATE_ITEM_STATUS":
            items[itemIndex] = { ...action.locItem!, status: action.status!, newItem: false }
            return { ...state, locItems: items }
        case "UPDATE_ITEM_TIMESTAMP":
            items[itemIndex] = { ...action.locItem!, timestamp: action.timestamp!, newItem: false }
            return { ...state, locItems: items }
        case "DELETE_ITEM":
            items.splice(itemIndex, 1)
            return { ...state, locItems: items }
        case "CLOSE":
            return {
                ...state,
                loc: {
                    ...state.loc!,
                    closed: true,
                    status: "CLOSED",
                },
            }
        case "VOID":
            return {
                ...state,
                loc: {
                    ...state.loc!,
                    voidInfo: {
                        replacer: action.voidInfo!.replacer,
                        reason: action.voidInfo!.reason,
                    }
                },
            }
        case "SET_CHECK_RESULT":
            return {
                ...state,
                checkResult: action.checkResult!,
                collectionItem: action.collectionItem,
            }
        default:
            throw new Error(`Unknown type: ${ action.type }`);
    }
}

function itemExists(locItem: LocItem, locItems: LocItem[]): boolean {
    return locItems.find(item =>
        item.type === locItem.type &&
        item.name === locItem.name &&
        item.value === locItem.value) !== undefined;
}

export interface Props {
    locId: UUID
    children: JSX.Element | JSX.Element[] | null
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
}

const enum NextRefresh {
    STOP,
    SCHEDULE,
    IMMEDIATE
}

export function LocContextProvider(props: Props) {

    const { axiosFactory, accounts, api, client } = useLogionChain();
    const { refresh } = useCommonContext();
    const { refreshLocs } = useLegalOfficerContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue(props.locId, props.backPath, props.detailsPath));
    const [ refreshing, setRefreshing ] = useState<boolean>(false);
    const [ refreshCounter, setRefreshCounter ] = useState<number>(0);

    useEffect(() => {
        if (props.locId.toString() !== contextValue.locId.toString()) {
            dispatch({ type: 'RESET', locId: props.locId })
        }
    }, [ contextValue.locId, props.locId ])

    useEffect(() => {
        if (contextValue.loc === null && client !== null) {
            (async function() {
                const locState = await (await client.locsState()).findById({ locId: contextValue.locId });
                const locData = locState?.data();
                let supersededLoc = undefined;
                if(locData?.replacerOf) {
                    supersededLoc = await client.public.findLocById({ locId: locData.replacerOf });
                }
                dispatch({
                    type: 'SET_LOC',
                    supersededLoc,
                    locState,
                    locData,
                });

                if (locData) {
                    let refreshNeeded = false;
                    const submitter = locData.ownerAddress;
                    locData.metadata.forEach(itemFromBackend => {
                        const result = createMetadataItem(itemFromBackend)
                        dispatch({ type: 'ADD_ITEM', locItem: result.locItem })
                        if (result.refreshNeeded) {
                            refreshNeeded = true;
                        }
                    })
                    locData.files.forEach(fileFromBackend => {
                        const result = createFileItem(fileFromBackend);
                        dispatch({ type: 'ADD_ITEM', locItem: result.locItem })
                        if (result.refreshNeeded) {
                            refreshNeeded = true;
                        }
                    })
                    for (let i = 0; i < locData.links.length; ++i) {
                        const link = locData.links[i];
                        const linkedLocId = new UUID(link.target);
                        const linkedLoc = await client.public.findLocById({ locId: linkedLocId });
                        let linkDetailsPath: string;
                        let linkedLocData = linkedLoc!.data;
                        if(isGrantedAccess(accounts?.current?.address, linkedLocData)) {
                            const linkedLoc = await (await client.locsState()).findById({ locId: linkedLocId });
                            linkedLocData = linkedLoc!.data();
                            linkDetailsPath = contextValue.detailsPath(linkedLocId, linkedLocData.locType);
                        } else {
                            linkDetailsPath = fullCertificateUrl(linkedLocId);
                        }
                        const result = createLinkItem({
                            link,
                            otherLocDescription: linkedLocData.description || "- Confidential -",
                            submitter,
                            linkDetailsPath,
                        })
                        dispatch({ type: 'ADD_ITEM', locItem: result.locItem })
                        if (result.refreshNeeded) {
                            refreshNeeded = true;
                        }
                    }
                    if (refreshNeeded) {
                        setRefreshCounter(MAX_REFRESH);
                    }
                }
            })();
        }
    }, [ contextValue, contextValue.locId, accounts, client ])

    const refreshNameTimestamp = useCallback<() => Promise<NextRefresh>>(() => {

        function refreshTimestamps(locState: ActiveLoc): boolean {
            let refreshed = false;
            contextValue.locItems
                .filter(locItem => locItem.timestamp === null)
                .forEach(locItem => {
                    const locRequestItem = findItemInLocData(locState.data(), locItem)
                    if (locRequestItem && locRequestItem.addedOn) {
                        refreshed = true;
                        dispatch({ type: 'UPDATE_ITEM_TIMESTAMP', locItem, timestamp: locRequestItem.addedOn })
                    }
                })
            return refreshed;
        }

        function refreshRequestDates(locState: ActiveLoc): boolean {
            const locData = locState.data();
            let refreshed = false;
            if(contextValue.loc?.closedOn === undefined && locData.closedOn) {
                refreshed = true;
            }
            if(contextValue.loc?.voidInfo?.voidedOn === undefined && locData.voidInfo?.voidedOn) {
                refreshed = true;
            }
            if(refreshed) {
                dispatch({
                    type: 'SET_LOC',
                    locData,
                    locState,
                    supersededLoc: contextValue.supersededLoc,
                });
            }
            return refreshed;
        }

        if (contextValue.loc === null || axiosFactory === undefined) {
            return Promise.resolve(NextRefresh.SCHEDULE);
        }

        if (allItemsOK(contextValue.locItems) && requestOK(contextValue.loc)) {
            refresh!(false);
            refreshLocs();
            return Promise.resolve(NextRefresh.STOP);
        }

        const proceed = async () => {
            let nextRefresh = NextRefresh.SCHEDULE;
            const locState = await (await client!.locsState()).findById({ locId: contextValue.locId });
            if (refreshTimestamps(locState!)) {
                nextRefresh = NextRefresh.IMMEDIATE;
            }
            if (refreshRequestDates(locState!)) {
                nextRefresh = NextRefresh.IMMEDIATE;
            }
            return nextRefresh;
        }
        return proceed()
    }, [ contextValue.loc, contextValue.locItems, contextValue.locId, axiosFactory, refresh, refreshLocs, client, contextValue.supersededLoc ])

    useEffect(() => {
        if (refreshCounter > 0 && !refreshing) {
            (async function () {
                setRefreshing(true)
                const nextRefresh = await refreshNameTimestamp();
                switch (nextRefresh) {
                    case NextRefresh.STOP:
                        setRefreshCounter(0);
                        setRefreshing(false)
                        break;
                    case NextRefresh.SCHEDULE:
                        setRefreshCounter(refreshCounter - 1)
                        setTimeout(() => setRefreshing(false), REFRESH_INTERVAL, null)
                        break;
                    case NextRefresh.IMMEDIATE:
                        setRefreshCounter(refreshCounter - 1)
                        setRefreshing(false)
                        break;
                }
            })()
        }
    }, [ refreshNameTimestamp, refreshCounter, setRefreshCounter, refreshing, setRefreshing ])


    const publishMetadataFunction = useCallback((item: LocItem) => {
            const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSend({
                signerId: contextValue.loc!.ownerAddress,
                callback: setResult,
                errorCallback: setError,
                submittable: addMetadata({
                    locId: contextValue.loc!.id,
                    api: api!,
                    item: { name: item.name, value: item.value, submitter: item.submitter },
                })
            });
            return signAndSubmit;
        }, [ api, contextValue.loc ]
    )

    const addLocItemFunction = useCallback((locItemCreator: () => LocItem) => {
        const locItem = locItemCreator();
        dispatch({ type: 'ADD_ITEM', locItem })
        setRefreshCounter(MAX_REFRESH)
    }, [ setRefreshCounter ])

    const publishFileFunction = useCallback((item: LocItem) => {
            const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSend({
                signerId: contextValue.loc!.ownerAddress,
                callback: setResult,
                errorCallback: setError,
                submittable: addFile({
                    locId: contextValue.loc!.id,
                    api: api!,
                    hash: item.value,
                    nature: item.nature || "",
                    submitter: item.submitter,
                })
            });
            return signAndSubmit;
        }, [ api, contextValue.loc ]
    )

    const publishLinkFunction = useCallback((item: LocItem) => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSend({
            signerId: contextValue.loc!.ownerAddress,
            callback: setResult,
            errorCallback: setError,
            submittable: addLink({
                locId: contextValue.loc!.id,
                api: api!,
                target: item.target!,
                nature: item.nature || "",
            })
        });
        return signAndSubmit;
    }, [ api, contextValue.loc ])

    const closeExtrinsicFunction = useCallback((seal?: string) => {
            const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSend({
                signerId: contextValue.loc!.ownerAddress,
                callback: setResult,
                errorCallback: setError,
                submittable: closeLoc({
                    locId: contextValue.loc!.id,
                    api: api!,
                    seal
                })
            });
            return signAndSubmit;
        }, [ api, contextValue.loc ]
    )

    const closeFunction = useCallback(() => {
            preClose(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.loc!.id)
                .then(() => {
                    dispatch({ type: 'CLOSE' });
                    setRefreshCounter(MAX_REFRESH);
                });
        }, [ axiosFactory, dispatch, contextValue.loc ]
    )

    const dispatchPublished = (locItem: LocItem) => {
        dispatch({ type: 'UPDATE_ITEM_STATUS', locItem, status: "PUBLISHED" })
        setRefreshCounter(MAX_REFRESH)
    }

    const confirmFileFunction = useCallback(async (locItem: LocItem) => {
            confirmLocFile(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.locId, locItem.value)
                .then(() => dispatchPublished(locItem))
        }, [ axiosFactory, contextValue.locId, contextValue.loc ]
    )

    const deleteFileFunction = useCallback((item: LocItem) => {
            deleteLocFile(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.locId, item.value)
                .then(() => dispatch({ type: 'DELETE_ITEM', locItem: item }));
        }, [ axiosFactory, contextValue.locId, contextValue.loc ]
    )

    const confirmLinkFunction = useCallback(async (locItem: LocItem) => {
            confirmLocLink(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.locId, locItem.target!)
                .then(() => dispatchPublished(locItem))
        }, [ axiosFactory, contextValue.locId, contextValue.loc ]
    )

    const deleteLinkFunction = useCallback((item: LocItem) => {
            deleteLocLink(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.locId, item.target!)
                .then(() => dispatch({ type: 'DELETE_ITEM', locItem: item }));
        }, [ axiosFactory, contextValue.locId, contextValue.loc ]
    )

    const confirmMetadataFunction = useCallback(async (locItem: LocItem) => {
            confirmLocMetadataItem(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.locId, locItem.name)
                .then(() => dispatchPublished(locItem))
        }, [ axiosFactory, contextValue.locId, contextValue.loc ]
    )

    const deleteMetadataFunction = useCallback((item: LocItem) => {
            deleteLocMetadataItem(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.locId, item.name)
                .then(() => dispatch({ type: 'DELETE_ITEM', locItem: item }));
        }, [ axiosFactory, contextValue.locId, contextValue.loc ]
    )

    const voidLocExtrinsicFunction = useCallback((voidInfo: VoidInfo) => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSend({
            signerId: contextValue.loc!.ownerAddress,
            callback: setResult,
            errorCallback: setError,
            submittable: voidLoc({
                locId: contextValue.loc!.id,
                api: api!,
                voidInfo
            })
        });
        return signAndSubmit;
    }, [ api, contextValue.loc ])

    const voidLocFunction = useCallback((voidInfo: FullVoidInfo) => {
        preVoid(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.loc!.id, voidInfo.reason)
        .then(() => {
            dispatch({ type: 'VOID', voidInfo });
            setRefreshCounter(MAX_REFRESH);
        });
    }, [ axiosFactory, dispatch, contextValue.loc ])

    const addLinkFunction = useCallback(async (otherLoc: LinkTarget, nature: string) => {
        await modelAddLink(axiosFactory!(contextValue.loc!.ownerAddress)!, {
            locId: contextValue.locId.toString(),
            target: otherLoc.id.toString(),
            nature
        });
        addLocItemFunction(() => createDraftLinkedLocItem({
            link: { id: otherLoc.id, nature, published: false },
            otherLocDescription: otherLoc.description,
            submitter: contextValue.loc!.ownerAddress,
            linkDetailsPath: contextValue.detailsPath(otherLoc.id, otherLoc.locType)
        }, true));
    }, [ axiosFactory, contextValue, addLocItemFunction ])

    const addMetadataFunction = useCallback(async (name: string, value: string) => {
        const submitter = accounts!.current!.address;
        await modelAddMetadata(axiosFactory!(contextValue.loc!.ownerAddress), {
            locId: contextValue.locId.toString(),
            name,
            value,
            submitter,
        })
        addLocItemFunction(() => createDraftMetadataLocItem({ name, value, submitter }, true))
    }, [ axiosFactory, accounts, contextValue.locId, addLocItemFunction, contextValue.loc ])

    const addFileFunction = useCallback(async (name: string, file: File, nature: string) => {
        const submitter = accounts!.current!.address;
        const { hash } = await modelAddFile(axiosFactory!(contextValue.loc!.ownerAddress)!, {
            file,
            locId: contextValue.locId.toString(),
            fileName: name,
            nature,
            submitter,
        })
        addLocItemFunction(
            () => createDraftFileLocItem({
                    name,
                    hash,
                    nature,
                    submitter
                },
                true))
    }, [ axiosFactory, accounts, contextValue.locId, addLocItemFunction, contextValue.loc ])

    const refreshFunction = useCallback(() => {
        dispatch({ type: 'RESET', locId: contextValue.locId });
    }, [ dispatch, contextValue ]);

    const checkHashFunction = useCallback(async (hash: string) => {
        const result = await contextValue.locState?.checkHash(hash);

        if (result?.collectionItem || result?.file || result?.metadataItem) {
            dispatch({
                type: "SET_CHECK_RESULT",
                checkResult: {
                    result: "POSITIVE",
                    hash,
                },
                collectionItem: result?.collectionItem,
            });
        } else {
            dispatch({
                type: "SET_CHECK_RESULT",
                checkResult: {
                    result: "NEGATIVE",
                    hash,
                },
                collectionItem: undefined,
            });
        }
    }, [ contextValue.locState ]);

    useEffect(() => {
        if (contextValue.loc && contextValue.addMetadata === null) {
            const action: Action = {
                type: 'SET_FUNCTIONS',
                addMetadata: addMetadataFunction,
                addLink: addLinkFunction,
                publishLink: publishLinkFunction,
                publishMetadata: publishMetadataFunction,
                addFile: addFileFunction,
                publishFile: publishFileFunction,
                closeExtrinsic: closeExtrinsicFunction,
                close: closeFunction,
                confirmFile: confirmFileFunction,
                deleteFile: deleteFileFunction,
                confirmLink: confirmLinkFunction,
                deleteLink: deleteLinkFunction,
                confirmMetadata: confirmMetadataFunction,
                deleteMetadata: deleteMetadataFunction,
                voidLoc: voidLocFunction,
                voidLocExtrinsic: voidLocExtrinsicFunction,
                refresh: refreshFunction,
                checkHash: checkHashFunction,
            };
            dispatch(action)
        }
    }, [ contextValue.loc, contextValue.addMetadata, addLocItemFunction, publishMetadataFunction,
        publishFileFunction, closeFunction, closeExtrinsicFunction,
        confirmFileFunction, deleteFileFunction, confirmLinkFunction, deleteLinkFunction, confirmMetadataFunction,
        deleteMetadataFunction, dispatch, publishLinkFunction, voidLocFunction, voidLocExtrinsicFunction,
        addLinkFunction, addMetadataFunction, addFileFunction, refreshFunction, checkHashFunction ])

    return (
        <LocContextObject.Provider value={ contextValue }>
            { props.children }
        </LocContextObject.Provider>
    )
}

export function useLocContext() {
    return useContext(LocContextObject)
}

function findItemInLocData(locRequest: LocData, item: LocItem): MergedMetadataItem | MergedFile | MergedLink | undefined {
    if (item.type === 'Document') {
        return locRequest.files.find(file => file.hash === item.value)
    } if (item.type === 'Linked LOC') {
        return locRequest.links.find(link => UUID.fromAnyString(link.target)!.toString() === item.target!.toString())
    } else {
        return locRequest.metadata.find(metadata => metadata.name === item.name)
    }
}

function allItemsOK(items: LocItem[]): boolean {
    return items.find(item => item.status === "PUBLISHED" && item.timestamp === null) === undefined;
}

function requestOK(locRequest: LocData): boolean {
    return (locRequest.status !== "CLOSED" || locRequest.closedOn !== undefined)
        && (locRequest.voidInfo === undefined || locRequest.voidInfo.voidedOn !== undefined);
}
