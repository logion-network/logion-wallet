import { UUID } from "../../logion-chain/UUID";
import React, { useContext, useReducer, Reducer, useEffect, useCallback, useState } from "react";
import { LocRequest, LocFile, LocMetadataItem, LocLink } from "../../common/types/ModelTypes";
import { confirmLocFile, deleteLocFile, preClose, fetchLocRequest, preVoid } from "../../common/Model";
import { useCommonContext } from "../../common/CommonContext";
import { getLegalOfficerCase, addMetadata, addFile, closeLoc, addLink, voidLoc } from "../../logion-chain/LogionLoc";
import { LegalOfficerCase, VoidInfo, File } from "../../logion-chain/Types";
import { useLogionChain } from "../../logion-chain";
import { SignAndSubmit } from "../../ExtrinsicSubmitter";
import { SignAndSendCallback } from "../../logion-chain/Signature";
import { LocItemStatus, LocItem } from "./types";
import {
    createPublishedMetadataLocItem,
    createDraftFileLocItem,
    createDraftMetadataLocItem,
    createDraftLinkedLocItem,
    UNKNOWN_NAME,
    createPublishedLinkedLocItem,
    mergeLocFile
} from "./LocItemFactory";

export interface FullVoidInfo extends VoidInfo {
    reason: string;
}

export interface LocContext {
    locId: UUID
    locRequest: LocRequest | null
    loc: LegalOfficerCase | null
    supersededLoc?: LegalOfficerCase
    supersededLocRequest?: LocRequest
    locItems: LocItem[]
    addMetadata: ((name: string, value: string) => void) | null
    linkLoc: ((otherLocId: UUID, otherLocDescription: string, nature: string) => void) | null
    publishLocLink: ((locItem: LocItem) => SignAndSubmit) | null
    publishMetadata: ((locItem: LocItem) => SignAndSubmit) | null
    addFile: ((name: string, hash: string, nature: string) => void) | null
    publishFile: ((locItem: LocItem) => SignAndSubmit) | null
    removeItem: ((locItem: LocItem) => void) | null
    changeItemStatus: ((locItem: LocItem, status: LocItemStatus) => void) | null
    close: (() => void) | null
    closeExtrinsic: (() => SignAndSubmit) | null
    confirmFile: ((locItem: LocItem) => void) | null
    deleteFile: ((locItem: LocItem) => void) | null
    voidLoc: ((voidInfo: FullVoidInfo) => void) | null
    voidLocExtrinsic?: ((voidInfo: VoidInfo) => SignAndSubmit) | null
}

const MAX_REFRESH = 20;
const REFRESH_INTERVAL = 5000;

function initialContextValue(locId: UUID): LocContext {
    return {
        locId,
        locRequest: null,
        loc: null,
        locItems: [],
        addMetadata: null,
        linkLoc: null,
        publishLocLink: null,
        publishMetadata: null,
        addFile: null,
        publishFile: null,
        removeItem: null,
        changeItemStatus: null,
        close: null,
        closeExtrinsic: null,
        confirmFile: null,
        deleteFile: null,
        voidLoc: null,
        voidLocExtrinsic: null,
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
    | 'UPDATE_ITEM_TIMESTAMP_AND_NAME'
    | 'DELETE_ITEM'
    | 'CLOSE'
    | 'VOID'

interface Action {
    type: ActionType,
    locRequest?: LocRequest,
    loc?: LegalOfficerCase,
    supersededLoc?: LegalOfficerCase,
    supersededLocRequest?: LocRequest,
    locItem?: LocItem,
    status?: LocItemStatus,
    name?: string,
    timestamp?: string,
    addMetadata?: (name: string, value: string) => void,
    linkLoc?: (otherLocId: UUID, otherLocDescription: string, nature: string) => void,
    publishLocLink?: (locItem: LocItem) => SignAndSubmit,
    publishMetadata?: (locItem: LocItem) => SignAndSubmit,
    addFile?: (name: string, hash: string, nature: string) => void
    publishFile?: (locItem: LocItem) => SignAndSubmit,
    removeItem?: (locItem: LocItem) => void,
    changeItemStatus?: ((locItem: LocItem, status: LocItemStatus) => void),
    close?: () => void,
    closeExtrinsic?: () => SignAndSubmit,
    confirmFile?: (locItem: LocItem) => void,
    deleteFile?: (locItem: LocItem) => void,
    voidInfo?: FullVoidInfo,
    voidLoc?: (voidInfo: FullVoidInfo) => void,
    voidLocExtrinsic?: (voidInfo: VoidInfo) => SignAndSubmit,
}

const reducer: Reducer<LocContext, Action> = (state: LocContext, action: Action): LocContext => {
    const items = state.locItems.concat();
    const itemIndex = items.indexOf(action.locItem!);
    switch (action.type) {
        case "SET_LOC":
            return { ...state, loc: action.loc!, supersededLoc: action.supersededLoc, supersededLocRequest: action.supersededLocRequest, locRequest: action.locRequest! }
        case "SET_FUNCTIONS":
            return {
                ...state,
                addMetadata: action.addMetadata!,
                publishMetadata: action.publishMetadata!,
                linkLoc: action.linkLoc!,
                publishLocLink: action.publishLocLink!,
                addFile: action.addFile!,
                publishFile: action.publishFile!,
                removeItem: action.removeItem!,
                changeItemStatus: action.changeItemStatus!,
                closeExtrinsic: action.closeExtrinsic!,
                close: action.close!,
                confirmFile: action.confirmFile!,
                deleteFile: action.deleteFile!,
                voidLoc: action.voidLoc!,
                voidLocExtrinsic: action.voidLocExtrinsic!,
            }
        case "ADD_ITEM":
            if (itemExists(action.locItem!, state.locItems)) {
                return { ...state }
            } else {
                return { ...state, locItems: state.locItems.concat(action.locItem!) }
            }
        case "UPDATE_ITEM_STATUS":
            items[itemIndex] = { ...action.locItem!, status: action.status! }
            return { ...state, locItems: items }
        case "UPDATE_ITEM_NAME":
            items[itemIndex] = { ...action.locItem!, name: action.name! }
            return { ...state, locItems: items }
        case "UPDATE_ITEM_TIMESTAMP":
            items[itemIndex] = { ...action.locItem!, timestamp: action.timestamp! }
            return { ...state, locItems: items }
        case "UPDATE_ITEM_TIMESTAMP_AND_NAME":
            items[itemIndex] = { ...action.locItem!, timestamp: action.timestamp!, name: action.name! }
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
                },
                locRequest: {
                    ...state.locRequest!,
                    status: "CLOSED"
                }
            }
        case "VOID":
            return {
                ...state,
                loc: {
                    ...state.loc!,
                    voidInfo: {
                        replacer: action.voidInfo!.replacer
                    }
                },
                locRequest: {
                    ...state.locRequest!,
                    voidInfo: {
                        reason: action.voidInfo!.reason
                    }
                }
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
}

const enum NextRefresh {
    STOP,
    SCHEDULE,
    IMMEDIATE
}

export function LocContextProvider(props: Props) {

    const { api } = useLogionChain();
    const { axiosFactory, accounts, refresh } = useCommonContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue(props.locId));
    const [ refreshing, setRefreshing ] = useState<boolean>(false);
    const [ refreshCounter, setRefreshCounter ] = useState<number>(0);

    useEffect(() => {
        if (contextValue.locRequest === null && axiosFactory !== undefined && contextValue.loc === null && api !== null) {
            (async function() {
                const locRequest = await fetchLocRequest(axiosFactory(accounts!.current!.address)!, contextValue.locId.toString());
                const loc = await getLegalOfficerCase({ locId: contextValue.locId, api });
                let supersededLoc: LegalOfficerCase | undefined;
                let supersededLocRequest: LocRequest | undefined;
                if(loc?.replacerOf !== undefined) {
                    supersededLoc = await getLegalOfficerCase({ locId: loc.replacerOf, api });
                    supersededLocRequest = await fetchLocRequest(axiosFactory!(accounts!.current!.address)!, loc.replacerOf.toString());
                }
                dispatch({ type: 'SET_LOC', loc, supersededLoc, supersededLocRequest, locRequest });
                if (loc) {
                    let refreshNeeded = false;
                    loc!.metadata.forEach(item => {
                        const locItem = createPublishedMetadataLocItem(item, loc!.owner)
                        dispatch({ type: 'ADD_ITEM', locItem })
                        const data = findItemInLocRequest(locRequest, locItem);
                        if (data && data.addedOn) {
                            dispatch({ type: 'UPDATE_ITEM_TIMESTAMP', locItem, timestamp: data.addedOn })
                        } else {
                            refreshNeeded = true;
                        }
                    })
                    locRequest.files.forEach(locRequestFile => {
                        const locFile = findFileInLoc(loc, locRequestFile)
                        const result = mergeLocFile({ fileFromChain: locFile, fileFromBackend: locRequestFile, submitter: loc!.owner });
                        dispatch({ type: 'ADD_ITEM', locItem: result.locItem })
                        refreshNeeded = result.refreshNeeded;
                    })
                    for(let i = 0; i < loc!.links.length; ++i) {
                        const item = loc!.links[i];
                        const locItem = createPublishedLinkedLocItem(item, loc!.owner)
                        dispatch({ type: 'ADD_ITEM', locItem })

                        const otherLocId = UUID.fromDecimalString(locItem.value);
                        const otherLocRequest = await fetchLocRequest(axiosFactory!(accounts!.current!.address)!, otherLocId!.toString())
                        const data = findItemInLocRequest(locRequest, locItem);
                        if (data && data.addedOn) {
                            dispatch({ type: 'UPDATE_ITEM_TIMESTAMP_AND_NAME', locItem, timestamp: data.addedOn, name: otherLocRequest.description })
                        }  else {
                            dispatch({ type: 'UPDATE_ITEM_NAME', locItem, name: otherLocRequest.description })
                            refreshNeeded = true;
                        }
                    }
                    if(refreshNeeded) {
                        setRefreshCounter(MAX_REFRESH);
                    }
                }
            })();
        }
    }, [ contextValue.locRequest, contextValue.locId, axiosFactory, accounts, api, contextValue.loc ])

    const refreshNameTimestamp = useCallback<() => Promise<NextRefresh>>(() => {

        function refreshTimestamps(locRequest: LocRequest): boolean {
            let refreshed = false;
            contextValue.locItems
                .filter(locItem => locItem.timestamp === null)
                .forEach(locItem => {
                    const locFile = findItemInLocRequest(locRequest, locItem)
                    if (locFile && locFile.addedOn) {
                        refreshed = true;
                        dispatch({ type: 'UPDATE_ITEM_TIMESTAMP', locItem, timestamp: locFile.addedOn })
                    }
                })
            return refreshed;
        }

        async function refreshLinkedLocsDescription(): Promise<boolean> {
            let refreshed = false;
            for (const locItem of contextValue.locItems
                .filter(locItem => locItem.type === 'Linked LOC' && locItem.name === UNKNOWN_NAME)) {
                const otherLocId = UUID.fromDecimalString(locItem.value);
                const otherLocRequest = await fetchLocRequest(axiosFactory!(accounts!.current!.address)!, otherLocId!.toString())
                dispatch({ type: 'UPDATE_ITEM_NAME', locItem, name: otherLocRequest.description })
                refreshed = true;
            }
            return refreshed;
        }

        function refreshRequestDates(locRequest: LocRequest): boolean {
            let refreshed = false;
            if(contextValue.locRequest?.closedOn === undefined && locRequest.closedOn) {
                refreshed = true;
            }
            if(contextValue.locRequest?.voidInfo?.voidedOn === undefined && locRequest.voidInfo?.voidedOn) {
                refreshed = true;
            }
            if(refreshed) {
                dispatch({ type: 'SET_LOC_REQUEST', locRequest });
            }
            return refreshed;
        }

        if (contextValue.locRequest === null || contextValue.loc === null || axiosFactory === undefined) {
            return Promise.resolve(NextRefresh.SCHEDULE);
        }

        if (allItemsOK(contextValue.locItems) && requestOK(contextValue.locRequest)) {
            refresh!();
            return Promise.resolve(NextRefresh.STOP);
        }

        const proceed = async () => {
            let nextRefresh = NextRefresh.SCHEDULE;
            const locRequest = await fetchLocRequest(axiosFactory(accounts!.current!.address)!, contextValue.locId.toString());
            if (refreshTimestamps(locRequest)) {
                nextRefresh = NextRefresh.IMMEDIATE;
            }
            if (await refreshLinkedLocsDescription()) {
                nextRefresh = NextRefresh.IMMEDIATE;
            }
            if (refreshRequestDates(locRequest)) {
                nextRefresh = NextRefresh.IMMEDIATE;
            }
            return nextRefresh;
        }
        return proceed()
    }, [ contextValue.loc, contextValue.locItems, contextValue.locId, axiosFactory, accounts, contextValue.locRequest, refresh ])

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


    const publishMetadataFunction = useCallback((item: LocItem, name: string) => {
            const signAndSubmit: SignAndSubmit = (setResult, setError) => {
                const callback: SignAndSendCallback = (signedTransaction) => {
                    setResult(signedTransaction)
                };
                return addMetadata({
                    locId: contextValue.locId,
                    api: api!,
                    signerId: item.submitter,
                    item: { name, value: item.value },
                    callback,
                    errorCallback: setError
                })
            };
            return signAndSubmit;
        }, [ api, contextValue.locId ]
    )

    const addLocItemFunction = useCallback((locItemCreator: () => LocItem) => {
        const locItem = locItemCreator();
        dispatch({ type: 'ADD_ITEM', locItem })
        setRefreshCounter(MAX_REFRESH)
    }, [ setRefreshCounter ])

    const publishFileFunction = useCallback((item: LocItem) => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => {
            const callback: SignAndSendCallback = (signedTransaction) => {
                setResult(signedTransaction)
            };
            return addFile({
                locId: contextValue.locId,
                api: api!,
                signerId: item.submitter,
                    hash: item.value,
                    nature: item.nature || "",
                    callback,
                    errorCallback: setError
                })
            };
            return signAndSubmit;
        }, [ api, contextValue.locId ]
    )

    const publishLinkFunction = useCallback((item: LocItem) => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => {
            const callback: SignAndSendCallback = (signedTransaction) => {
                setResult(signedTransaction)
            };
            return addLink({
                locId: contextValue.locId,
                api: api!,
                signerId: item.submitter,
                target: item.target!,
                nature: item.nature || "",
                callback,
                errorCallback: setError
            })
        };
        return signAndSubmit;
    }, [ api, contextValue.locId ])

    const removeItemFunction = useCallback((locItem: LocItem) => {
            if (locItem.type === 'Document') {
                deleteLocFile(axiosFactory!(accounts!.current!.address)!, contextValue.locId, locItem.value)
                    .then(() => dispatch({ type: 'DELETE_ITEM', locItem }));
            } else {
                dispatch({ type: 'DELETE_ITEM', locItem });
            }
        }, [ axiosFactory, accounts, contextValue.locId, dispatch ]
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
            preClose(axiosFactory!(accounts!.current!.address)!, contextValue.locId)
            .then(() => {
                dispatch({ type: 'CLOSE' });
                setRefreshCounter(MAX_REFRESH);
            });
        }, [ axiosFactory, accounts, contextValue.locId, dispatch ]
    )

    const confirmFileFunction = useCallback((item: LocItem) => {
            confirmLocFile(axiosFactory!(accounts!.current!.address)!, contextValue.locId, item.value);
        }, [ axiosFactory, accounts, contextValue.locId ]
    )

    const deleteFileFunction = useCallback((item: LocItem) => {
            deleteLocFile(axiosFactory!(accounts!.current!.address)!, contextValue.locId, item.value);
        }, [ axiosFactory, accounts, contextValue.locId ]
    )

    const voidLocExtrinsicFunction = useCallback((voidInfo: VoidInfo) => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => {
            const callback: SignAndSendCallback = (signedTransaction) => {
                setResult(signedTransaction)
            };
            return voidLoc({
                locId: contextValue.locId,
                api: api!,
                signerId: contextValue.loc!.owner,
                callback,
                errorCallback: setError,
                voidInfo
            })
        };
        return signAndSubmit;
    }, [ api, contextValue.locId, contextValue.loc ])

    const voidLocFunction = useCallback((voidInfo: FullVoidInfo) => {
        preVoid(axiosFactory!(accounts!.current!.address)!, contextValue.locId, voidInfo.reason)
        .then(() => {
            dispatch({ type: 'VOID', voidInfo });
            setRefreshCounter(MAX_REFRESH);
        });
    }, [ axiosFactory, accounts, contextValue.locId, dispatch ])

    useEffect(() => {
        if (contextValue.loc && contextValue.loc.owner !== null && contextValue.addMetadata === null) {
            const submitter = contextValue.loc!.owner;
            const addMetadata = (name: string, value: string) => addLocItemFunction(
                () => createDraftMetadataLocItem(name, value, submitter));
            const linkLoc = (otherLocId: UUID, otherLocDescription: string, nature: string) => addLocItemFunction(
                () => createDraftLinkedLocItem({
                    id: otherLocId,
                    nature
                }, otherLocDescription, submitter))
            const publishLocLink = (locItem: LocItem) => publishLinkFunction(locItem);
            const publishMetadata = (locItem: LocItem) => publishMetadataFunction(locItem, locItem.name);
            const addFile = (name: string, hash: string, nature: string) => addLocItemFunction(
                () => createDraftFileLocItem({
                    file: {
                        hash,
                        nature
                    },
                    submitter,
                    name
                }))
            dispatch({
                type: 'SET_FUNCTIONS',
                addMetadata,
                linkLoc,
                publishLocLink,
                publishMetadata,
                addFile,
                publishFile: publishFileFunction,
                removeItem: removeItemFunction,
                changeItemStatus: changeItemStatusFunction,
                closeExtrinsic: closeExtrinsicFunction,
                close: closeFunction,
                confirmFile: confirmFileFunction,
                deleteFile: deleteFileFunction,
                voidLoc: voidLocFunction,
                voidLocExtrinsic: voidLocExtrinsicFunction,
            })
        }
    }, [ contextValue.loc, contextValue.addMetadata, addLocItemFunction, publishMetadataFunction,
        publishFileFunction, removeItemFunction, changeItemStatusFunction, closeFunction, closeExtrinsicFunction,
        confirmFileFunction, deleteFileFunction, dispatch, publishLinkFunction, voidLocFunction, voidLocExtrinsicFunction, ])

    return (
        <LocContextObject.Provider value={ contextValue }>
            { props.children }
        </LocContextObject.Provider>
    )
}

export function useLocContext() {
    return useContext(LocContextObject)
}

function findFileInLoc(loc: LegalOfficerCase, item:LocFile): File | undefined {
    return loc.files.find(file => file.hash === item.hash)
}

function findItemInLocRequest(locRequest: LocRequest, item: LocItem): LocMetadataItem | LocFile | LocLink | undefined {
    if (item.type === 'Document') {
        return findFile(locRequest, item.value)
    } if (item.type === 'Linked LOC') {
        return locRequest.links.find(link => UUID.fromAnyString(link.target)!.toString() === item.target!.toString())
    } else {
        return locRequest.metadata.find(metadata => metadata.name === item.name)
    }
}

function findFile(locRequest: LocRequest, hash: string): LocFile | undefined {
    return locRequest.files.find(file => file.hash === hash)
}

function allItemsOK(items: LocItem[]): boolean {
    return items.find(item => item.status === "PUBLISHED" && (item.name === UNKNOWN_NAME || item.timestamp === null)) === undefined;
}

function requestOK(locRequest: LocRequest): boolean {
    return (locRequest.status !== "CLOSED" || locRequest.closedOn !== undefined)
        && (locRequest.voidInfo === undefined || locRequest.voidInfo.voidedOn !== undefined);
}
