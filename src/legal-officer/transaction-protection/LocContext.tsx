import { UUID } from "../../logion-chain/UUID";
import React, { useContext, useReducer, Reducer, useEffect, useCallback, useState } from "react";
import { LocRequest, LocFile, LocMetadataItem } from "../../common/types/ModelTypes";
import { confirmLocFile, deleteLocFile, preClose, fetchLocRequest } from "../../common/Model";
import { useCommonContext } from "../../common/CommonContext";
import { getLegalOfficerCase, addMetadata, addHash, closeLoc } from "../../logion-chain/LogionLoc";
import { LegalOfficerCase } from "../../logion-chain/Types";
import { useLogionChain } from "../../logion-chain";
import { SignAndSubmit } from "../../ExtrinsicSubmitter";
import { SignAndSendCallback } from "../../logion-chain/Signature";

export interface LocContext {
    locId: UUID
    locRequest: LocRequest | null
    loc: LegalOfficerCase | null
    locItems: LocItem[]
    addMetadata: ((name: string, value: string) => void) | null
    publishMetadata: ((locItem: LocItem) => SignAndSubmit) | null
    addFile: ((name: string, hash: string) => void) | null
    publishFile: ((locItem: LocItem) => SignAndSubmit) | null
    removeItem: ((locItem: LocItem) => void) | null
    changeItemStatus: ((locItem: LocItem, status: LocItemStatus) => void) | null
    close: (() => void) | null
    closeExtrinsic: (() => SignAndSubmit) | null
    confirmFile: ((locItem: LocItem) => void) | null
    deleteFile: ((locItem: LocItem) => void) | null
}

export const UNKNOWN_FILE = "-";

const MAX_REFRESH = 20;
const REFRESH_INTERVAL = 5000;

function initialContextValue(locId: UUID): LocContext {
    return {
        locId,
        locRequest: null,
        loc: null,
        locItems: [],
        addMetadata: null,
        publishMetadata: null,
        addFile: null,
        publishFile: null,
        removeItem: null,
        changeItemStatus: null,
        close: null,
        closeExtrinsic: null,
        confirmFile: null,
        deleteFile: null,
    }
}

const LocContextObject: React.Context<LocContext> = React.createContext(initialContextValue(new UUID()))

type ActionType = 'SET_LOC_REQUEST'
    | 'SET_LOC'
    | 'SET_FUNCTIONS'
    | 'ADD_ITEM'
    | 'UPDATE_ITEM_STATUS'
    | 'UPDATE_ITEM_NAME'
    | 'UPDATE_ITEM_TIMESTAMP'
    | 'DELETE_ITEM'
    | 'CLOSE'

interface Action {
    type: ActionType,
    locRequest?: LocRequest,
    loc?: LegalOfficerCase,
    locItem?: LocItem,
    status?: LocItemStatus,
    name?: string,
    timestamp?: string,
    addMetadata?: (name: string, value: string) => void,
    publishMetadata?: (locItem: LocItem) => SignAndSubmit,
    addFile?: (name: string, hash: string) => void
    publishFile?: (locItem: LocItem) => SignAndSubmit,
    removeItem?: (locItem: LocItem) => void,
    changeItemStatus?: ((locItem: LocItem, status: LocItemStatus) => void),
    close?: () => void,
    closeExtrinsic?: () => SignAndSubmit,
    confirmFile?: (locItem: LocItem) => void,
    deleteFile?: (locItem: LocItem) => void,
}

const reducer: Reducer<LocContext, Action> = (state: LocContext, action: Action): LocContext => {
    console.log(`ActionType: ${ action.type }`)
    const items = state.locItems.concat();
    const itemIndex = items.indexOf(action.locItem!);
    switch (action.type) {
        case "SET_LOC_REQUEST":
            return { ...state, locRequest: action.locRequest! }
        case "SET_LOC":
            return { ...state, loc: action.loc! }
        case "SET_FUNCTIONS":
            return {
                ...state,
                addMetadata: action.addMetadata!,
                publishMetadata: action.publishMetadata!,
                addFile: action.addFile!,
                publishFile: action.publishFile!,
                removeItem: action.removeItem!,
                changeItemStatus: action.changeItemStatus!,
                closeExtrinsic: action.closeExtrinsic!,
                close: action.close!,
                confirmFile: action.confirmFile!,
                deleteFile: action.deleteFile!,
            }
        case "ADD_ITEM":
            return { ...state, locItems: state.locItems.concat(action.locItem!) }
        case "UPDATE_ITEM_STATUS":
            items[itemIndex] = { ...action.locItem!, status: action.status! }
            return { ...state, locItems: items }
        case "UPDATE_ITEM_NAME":
            items[itemIndex] = { ...action.locItem!, name: action.name! }
            return { ...state, locItems: items }
        case "UPDATE_ITEM_TIMESTAMP":
            items[itemIndex] = { ...action.locItem!, timestamp: action.timestamp! }
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
                }
            }
        default:
            throw new Error(`Unknown type: ${ action.type }`);
    }
}

export interface Props {
    locId: UUID
    children: JSX.Element | JSX.Element[] | null
}

export function LocContextProvider(props: Props) {

    const UNKNOWN_FILE = "-";
    const { api } = useLogionChain();
    const { axios } = useCommonContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue(props.locId));
    const [ refreshing, setRefreshing ] = useState<boolean>(false);
    const [ refreshCounter, setRefreshCounter ] = useState<number>(0);

    useEffect(() => {
        if (contextValue.locRequest === null && axios !== undefined) {
            fetchLocRequest(axios, contextValue.locId.toString())
                .then(locRequest => {
                    dispatch({ type: 'SET_LOC_REQUEST', locRequest });
                })
        }
    }, [ contextValue.locRequest, contextValue.locId, axios ])

    const enum NextRefresh {
        STOP,
        SCHEDULE,
        IMMEDIATE
    }

    const refreshNameTimestamp = useCallback<() => Promise<NextRefresh>>(() => {
        console.log(`refreshNameTimestamp() ${ refreshCounter } ${ new Date() }`)

        function findItem(locRequest: LocRequest, item: LocItem): LocMetadataItem | LocFile | undefined {
            if (item.type === 'Document') {
                return findFile(locRequest, item.value)
            } else {
                return locRequest.metadata.find(metadata => metadata.name === item.name)
            }
        }

        function findFile(locRequest: LocRequest, hash: string): LocFile | undefined {
            return locRequest.files.find(file => file.hash === hash)
        }

        function allItemsOK(items: LocItem[]): boolean {
            return items.find(item => item.status === "PUBLISHED" && (item.name === UNKNOWN_FILE || item.timestamp === null)) === undefined
        }

        if (contextValue.loc === null || axios === undefined) {
            return Promise.resolve(NextRefresh.SCHEDULE);
        }

        if (allItemsOK(contextValue.locItems)) {
            return Promise.resolve(NextRefresh.STOP);
        }

        const proceed = async () => {
            let nextRefresh = NextRefresh.SCHEDULE;
            const locRequest = await fetchLocRequest(axios, contextValue.locId.toString());
            contextValue.locItems
                .filter(locItem => locItem.type === 'Document' && locItem.name === UNKNOWN_FILE)
                .forEach(locItem => {
                    const locFile = findFile(locRequest, locItem.value)
                    if (locFile && locFile.name) {
                        nextRefresh = NextRefresh.IMMEDIATE;
                        dispatch({ type: 'UPDATE_ITEM_NAME', locItem, name: locFile.name })
                    }
                })
            contextValue.locItems
                .filter(locItem => locItem.timestamp === null)
                .forEach(locItem => {
                    const locFile = findItem(locRequest, locItem)
                    if (locFile && locFile.addedOn) {
                        nextRefresh = NextRefresh.IMMEDIATE;
                        dispatch({ type: 'UPDATE_ITEM_TIMESTAMP', locItem, timestamp: locFile.addedOn })
                    }
                })
            return nextRefresh;
        }
        return proceed()
    }, [ contextValue.loc, contextValue.locItems, contextValue.locId, axios, refreshCounter, NextRefresh.STOP, NextRefresh.SCHEDULE, NextRefresh.IMMEDIATE])

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
    }, [ refreshNameTimestamp, refreshCounter, setRefreshCounter, refreshing, setRefreshing, NextRefresh.STOP, NextRefresh.SCHEDULE, NextRefresh.IMMEDIATE ])


    const addMetadataFunction = useCallback((name: string, value: string) => {
            const locItem: LocItem = {
                name,
                value,
                type: 'Data',
                timestamp: null,
                submitter: contextValue.loc!.owner,
                status: 'DRAFT'
            }
            dispatch({ type: 'ADD_ITEM', locItem: locItem })
            setRefreshCounter(MAX_REFRESH)
        }, [ contextValue.loc, setRefreshCounter ]
    )

    const publishMetadataFunction = useCallback((item: LocItem) => {
            const signAndSubmit: SignAndSubmit = (setResult, setError) => {
                const callback: SignAndSendCallback = (signedTransaction) => {
                    setResult(signedTransaction)
                };
                return addMetadata({
                    locId: contextValue.locId,
                    api: api!,
                    signerId: item.submitter,
                    item: { name: item.name || "", value: item.value },
                    callback,
                    errorCallback: setError
                })
            };
            return signAndSubmit;
        }, [ api, contextValue.locId ]
    )

    const addFileFunction = useCallback((name: string, hash: string) => {
            const locItem: LocItem = {
                name,
                value: hash,
                type: 'Document',
                timestamp: null,
                submitter: contextValue.loc!.owner,
                status: 'DRAFT'
            }
            dispatch({ type: 'ADD_ITEM', locItem: locItem })
            setRefreshCounter(MAX_REFRESH)
        }, [ contextValue.loc, setRefreshCounter ]
    )

    const publishFileFunction = useCallback((item: LocItem) => {
            const signAndSubmit: SignAndSubmit = (setResult, setError) => {
                const callback: SignAndSendCallback = (signedTransaction) => {
                    setResult(signedTransaction)
                };
                return addHash({
                    locId: contextValue.locId,
                    api: api!,
                    signerId: item.submitter,
                    hash: item.value,
                    callback,
                    errorCallback: setError
                })
            };
            return signAndSubmit;
        }, [ api, contextValue.locId ]
    )

    const removeItemFunction = useCallback((locItem: LocItem) => {
            if (locItem.type === 'Document') {
                deleteLocFile(axios!, contextValue.locId, locItem.value)
                    .then(() => dispatch({ type: 'DELETE_ITEM', locItem }));
            } else {
                dispatch({ type: 'DELETE_ITEM', locItem });
            }
        }, [ axios, contextValue.locId, dispatch ]
    )

    const changeItemStatusFunction = useCallback((locItem: LocItem, status: LocItemStatus) => {
            dispatch({ type: 'UPDATE_ITEM_STATUS', locItem, status })
            setRefreshCounter(MAX_REFRESH)
        }, [ dispatch ]
    )

    const closeExtrinsicFunction = useCallback(() => {
            const signAndSubmit: SignAndSubmit = (setResult, setError) => {
                const callback: SignAndSendCallback = (signedTransaction) => {
                    setResult(signedTransaction)
                };
                return closeLoc({
                    locId: contextValue.locId,
                    api: api!,
                    signerId: contextValue.loc!.owner,
                    callback,
                    errorCallback: setError
                })
            };
            return signAndSubmit;
        }, [ api, contextValue.locId, contextValue.loc ]
    )

    const closeFunction = useCallback(() => {
            preClose(axios!, contextValue.locId)
                .then(() => dispatch({ type: 'CLOSE' }));
        }, [ axios, contextValue.locId, dispatch ]
    )

    const confirmFileFunction = useCallback((item: LocItem) => {
            confirmLocFile(axios!, contextValue.locId, item.value);
        }, [ axios, contextValue.locId ]
    )

    const deleteFileFunction = useCallback((item: LocItem) => {
            deleteLocFile(axios!, contextValue.locId, item.value);
        }, [ axios, contextValue.locId ]
    )

    useEffect(() => {
        if (contextValue.loc !== null && contextValue.addMetadata === null) {
            const addMetadata = addMetadataFunction
            const publishMetadata = publishMetadataFunction;
            const addFile = addFileFunction
            const publishFile = publishFileFunction;
            const removeItem = removeItemFunction;
            const changeItemStatus = changeItemStatusFunction;
            const closeExtrinsic = closeExtrinsicFunction;
            const close = closeFunction;
            const confirmFile = confirmFileFunction;
            const deleteFile = deleteFileFunction;
            dispatch({
                type: 'SET_FUNCTIONS',
                addMetadata,
                publishMetadata,
                addFile,
                publishFile,
                removeItem,
                changeItemStatus,
                closeExtrinsic,
                close,
                confirmFile,
                deleteFile
            })
        }
    }, [ contextValue, addMetadataFunction, publishMetadataFunction, addFileFunction, publishFileFunction, removeItemFunction, changeItemStatusFunction, closeFunction, closeExtrinsicFunction, confirmFileFunction, deleteFileFunction, dispatch ])

    useEffect(() => {
        if (contextValue.loc === null && api !== null) {
            getLegalOfficerCase({ locId: contextValue.locId, api })
                .then(loc => {
                    dispatch({ type: 'SET_LOC', loc })
                    loc!.metadata.forEach(item => {
                        const locItem: LocItem = {
                            name: item.name,
                            value: item.value,
                            submitter: loc!.owner,
                            timestamp: null,
                            type: 'Data',
                            status: 'PUBLISHED'
                        }
                        dispatch({ type: 'ADD_ITEM', locItem })
                        setRefreshCounter(MAX_REFRESH)
                    })
                    loc!.hashes.forEach(item => {
                        const locItem: LocItem = {
                            name: UNKNOWN_FILE,
                            value: item,
                            submitter: loc!.owner,
                            timestamp: null,
                            type: 'Document',
                            status: 'PUBLISHED'
                        }
                        dispatch({ type: 'ADD_ITEM', locItem })
                        setRefreshCounter(MAX_REFRESH)
                    })
                })
        }
    }, [ contextValue.loc, api, contextValue.locId, setRefreshCounter ])

    return (
        <LocContextObject.Provider value={ contextValue }>
            { props.children }
        </LocContextObject.Provider>
    )
}

export function useLocContext() {
    return useContext(LocContextObject)
}
