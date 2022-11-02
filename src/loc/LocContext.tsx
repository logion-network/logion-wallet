import React, { useContext, useReducer, Reducer, useEffect, useCallback, useState } from "react";
import {
    UUID,
    closeLoc,
    voidLoc,
    VoidInfo,
    LocType,
} from "@logion/node-api";
import {
    LocRequestState,
    OpenLoc,
    ClosedLoc,
    ClosedCollectionLoc,
    LocData,
    PublicLoc,
    CollectionItem,
    FetchAllLocsParams,
    DraftRequest,
    LocsState,
} from "@logion/client";

import {
    preClose,
    preVoid,
    deleteLocLink,
    isGrantedAccess,
} from "../common/Model";
import { useLogionChain } from "../logion-chain";
import { SignAndSubmit } from "../ExtrinsicSubmitter";
import { LocItemStatus, LocItem } from "./types";
import {
    createFileItem,
    createMetadataItem,
    createLinkItem
} from "./LocItemFactory";
import { fullCertificateUrl } from "../PublicPaths";
import { signAndSend } from "src/logion-chain/Signature";
import { DocumentCheckResult } from "src/components/checkfileframe/CheckFileFrame";

export interface FullVoidInfo extends VoidInfo {
    reason: string;
}

export interface LocContext {
    loc: LocData | null
    supersededLoc?: PublicLoc
    locState: LocRequestState | null
    locItems: LocItem[]
    deleteMetadata: ((locItem: LocItem) => void) | null
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
    refresh: () => Promise<void>
    checkHash: (hash: string) => void
    checkResult: DocumentCheckResult
    collectionItem?: CollectionItem
    requestSof: (() => Promise<void>) | null
    requestSofOnCollection: ((collectionItemId: string) => Promise<void>) | null
    close: (() => void) | null
    closeExtrinsic: ((seal?: string) => SignAndSubmit) | null
    deleteLink: ((locItem: LocItem) => void) | null
    voidLoc: ((voidInfo: FullVoidInfo) => void) | null
    voidLocExtrinsic?: ((voidInfo: VoidInfo) => SignAndSubmit) | null
    collectionItems: CollectionItem[]
    cancelRequest: () => Promise<void>
    submitRequest: () => Promise<void>
    mutateLocState: (mutator: (current: LocRequestState) => Promise<LocRequestState>) => Promise<void>
}

export interface PrivateLocContext extends LocContext {
    mustFetchCollectionItems: boolean;
}

const MAX_REFRESH = 20;
const REFRESH_INTERVAL = 5000;

function initialContextValue(locState: LocRequestState | null, backPath: string, detailsPath: (locId: UUID, type: LocType) => string): PrivateLocContext {
    return {
        locState,
        loc: locState ? locState.data() : null,
        backPath,
        detailsPath,
        locItems: [],
        close: null,
        closeExtrinsic: null,
        deleteLink: null,
        deleteMetadata: null,
        voidLoc: null,
        voidLocExtrinsic: null,
        refresh: () => Promise.reject(new Error("undefined")),
        checkHash: () => {},
        checkResult: { result: "NONE" },
        requestSof: null,
        requestSofOnCollection: null,
        collectionItems: [],
        cancelRequest: () => Promise.reject(new Error("undefined")),
        submitRequest: () => Promise.reject(new Error("undefined")),
        mutateLocState: () => Promise.reject(),
        mustFetchCollectionItems: locState instanceof ClosedCollectionLoc,
    }
}

const LocContextObject: React.Context<PrivateLocContext> = React.createContext(initialContextValue(null, "", () => ""))

type ActionType = 'SET_LOC_REQUEST'
    | 'SET_LOC'
    | 'CLOSE'
    | 'VOID'
    | 'RESET'
    | 'SET_CHECK_RESULT'
    | 'SET_CLOSE'
    | 'SET_CLOSE_EXTRINSIC'
    | 'SET_DELETE_LINK'
    | 'SET_DELETE_METADATA'
    | 'SET_VOID_LOC'
    | 'SET_VOID_LOC_EXTRINSIC'
    | 'SET_REFRESH'
    | 'SET_CHECK_HASH'
    | 'SET_REQUEST_SOF'
    | 'SET_REQUEST_SOF_ON_COLLECTION'
    | 'SET_CANCEL_REQUEST'
    | 'SET_SUBMIT_REQUEST'
    | 'SET_MUTATE_LOC_STATE'
;

interface Action {
    type: ActionType,
    locId?: UUID,
    supersededLoc?: PublicLoc,
    locItem?: LocItem,
    locItems?: LocItem[],
    status?: LocItemStatus,
    name?: string,
    timestamp?: string,
    close?: () => void,
    closeExtrinsic?: (seal?: string) => SignAndSubmit,
    deleteLink?: (locItem: LocItem) => void,
    deleteMetadata?: (locItem: LocItem) => void,
    voidInfo?: FullVoidInfo,
    voidLoc?: (voidInfo: FullVoidInfo) => void,
    voidLocExtrinsic?: (voidInfo: VoidInfo) => SignAndSubmit,
    refresh?: () => Promise<void>,
    locState?: LocRequestState,
    locData?: LocData,
    checkHash?: (hash: string) => void,
    collectionItem?: CollectionItem,
    checkResult?: DocumentCheckResult,
    requestSof?: () => Promise<void>,
    requestSofOnCollection?: (collectionItemId: string) => Promise<void>,
    collectionItems?: CollectionItem[],
    cancelRequest?: () => Promise<void>,
    submitRequest?: () => Promise<void>,
    mutateLocState?: (mutator: (current: LocRequestState) => Promise<LocRequestState>) => Promise<void>,
}

const reducer: Reducer<PrivateLocContext, Action> = (state: PrivateLocContext, action: Action): PrivateLocContext => {
    switch (action.type) {
        case "RESET":
            return initialContextValue(action.locState!, state.backPath, state.detailsPath)
        case "SET_LOC":
            return {
                ...state,
                supersededLoc: action.supersededLoc,
                locState: action.locState!,
                loc: action.locData!,
                locItems: action.locItems!,
                collectionItems: action.collectionItems!,
                mustFetchCollectionItems: false,
            }
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
        case 'SET_CLOSE':
            return {
                ...state,
                close: action.close!,
            }
        case 'SET_CLOSE_EXTRINSIC':
            return {
                ...state,
                closeExtrinsic: action.closeExtrinsic!,
            }
        case 'SET_DELETE_LINK':
            return {
                ...state,
                deleteLink: action.deleteLink!,
            }
        case 'SET_DELETE_METADATA':
            return {
                ...state,
                deleteMetadata: action.deleteMetadata!,
            }
        case 'SET_VOID_LOC':
            return {
                ...state,
                voidLoc: action.voidLoc!,
            }
        case 'SET_VOID_LOC_EXTRINSIC':
            return {
                ...state,
                voidLocExtrinsic: action.voidLocExtrinsic!,
            }
        case 'SET_REFRESH':
            return {
                ...state,
                refresh: action.refresh!,
            }
        case 'SET_CHECK_HASH':
            return {
                ...state,
                checkHash: action.checkHash!,
            }
        case 'SET_REQUEST_SOF':
            return {
                ...state,
                requestSof: action.requestSof!,
            }
        case 'SET_REQUEST_SOF_ON_COLLECTION':
            return {
                ...state,
                requestSofOnCollection: action.requestSofOnCollection!,
            }
        case 'SET_CANCEL_REQUEST':
            return {
                ...state,
                cancelRequest: action.cancelRequest!,
            }
        case 'SET_SUBMIT_REQUEST':
            return {
                ...state,
                submitRequest: action.submitRequest!,
            }
        case 'SET_MUTATE_LOC_STATE':
            return {
                ...state,
                mutateLocState: action.mutateLocState!,
            }
        default:
            throw new Error(`Unknown type: ${ action.type }`);
    }
}

export interface Props {
    locState: LocRequestState
    children: JSX.Element | JSX.Element[] | null
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
    refreshLocs: (newLocsState: LocsState) => Promise<void>
    fetchAllLocsParams?: FetchAllLocsParams
}

const enum NextRefresh {
    STOP,
    SCHEDULE,
    IMMEDIATE
}

export function LocContextProvider(props: Props) {
    const { axiosFactory, accounts, api, client } = useLogionChain();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue(props.locState, props.backPath, props.detailsPath));
    const [ refreshing, setRefreshing ] = useState<boolean>(false);
    const [ refreshCounter, setRefreshCounter ] = useState<number>(0);

    useEffect(() => {
        if (props.locState !== contextValue.locState) {
            dispatch({ type: 'RESET', locState: props.locState });
        }
    }, [ contextValue.locState, props.locState ])

    const toLocItems = useCallback((locState: LocRequestState) => {
        const loc = locState.data();
        let locItems: LocItem[] = [];
        loc.metadata.forEach(item => {
            const result = createMetadataItem(item);
            locItems.push(result.locItem);
        });
        loc.files.forEach(item => {
            const result = createFileItem(item);
            locItems.push(result.locItem);
        });
        const locOwner = loc!.ownerAddress;
        for (let i = 0; i < loc.links.length; ++i) {
            const item = loc.links[i];

            const linkedLocState = locState.locsState().findById(item.id);
            const linkedLoc = linkedLocState?.data();

            if (linkedLoc) {
                let linkDetailsPath: string;
                if (isGrantedAccess(accounts?.current?.address, linkedLoc)) {
                    linkDetailsPath = props.detailsPath(linkedLoc.id, linkedLoc.locType);
                } else {
                    linkDetailsPath = fullCertificateUrl(linkedLoc.id);
                }
                const result = createLinkItem({
                    link: item,
                    otherLocDescription: linkedLoc.description || "- Confidential -",
                    submitter: locOwner,
                    linkDetailsPath,
                })
                locItems.push(result.locItem)
            }
        }
        return locItems;
    }, [ accounts, props ])

    const startRefresh = useCallback(() => {
        setRefreshCounter(MAX_REFRESH);
    }, []);

    const dispatchLocAndItems = useCallback(async (locState: LocRequestState, triggerRefresh: boolean) => {
        const locItems = toLocItems(locState);
        const locData = locState.data();
        let supersededLoc = undefined;
        if(locData.replacerOf) {
            if(contextValue.supersededLoc && contextValue.supersededLoc.data.id.toString() === locData.replacerOf.toString()) {
                supersededLoc = contextValue.supersededLoc;
            } else {
                supersededLoc = await client!.public.findLocById({ locId: locData.replacerOf });
            }
        }
        let collectionItems: CollectionItem[] = [];
        if(locState instanceof ClosedCollectionLoc) {
            collectionItems = await locState.getCollectionItems();
        }
        dispatch({
            type: 'SET_LOC',
            locState,
            locItems,
            supersededLoc,
            locData,
            collectionItems,
        });
        if (triggerRefresh && refreshNeeded(locItems) && !(locState instanceof DraftRequest)) {
            startRefresh();
        }
        await props.refreshLocs(locState.locsState());
    }, [ toLocItems, client, contextValue.supersededLoc, props, startRefresh ]);

    useEffect(() => {
        if(contextValue.locState && !contextValue.locState.discarded
            && mustDispatchNewState(contextValue.locState, contextValue.locItems, contextValue.mustFetchCollectionItems)) {

            dispatchLocAndItems(contextValue.locState, true);
        }
    }, [ contextValue.locState, contextValue.locItems, contextValue.mustFetchCollectionItems, dispatchLocAndItems ]);

    const refreshLocState = useCallback(async (triggerRefresh: boolean): Promise<LocRequestState> => {
        const locState = await contextValue.locState!.refresh();
        await dispatchLocAndItems(locState, triggerRefresh);
        return locState;
    }, [ contextValue.locState, dispatchLocAndItems ]);

    const refreshNameTimestamp = useCallback<() => Promise<NextRefresh>>(async () => {
        if (contextValue.loc === null || contextValue.locState === null || contextValue.locState.discarded) {
            return NextRefresh.SCHEDULE;
        }

        if (allItemsOK(contextValue.locItems) && requestOK(contextValue.loc)) {
            props.refreshLocs(contextValue.locState.locsState());
            return NextRefresh.STOP;
        } else {
            return NextRefresh.SCHEDULE;
        }
    }, [
        contextValue.loc,
        contextValue.locItems,
        contextValue.locState,
        props,
    ])

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

    useEffect(() => {
        if(contextValue.closeExtrinsic !== closeExtrinsicFunction) {
            dispatch({
                type: "SET_CLOSE_EXTRINSIC",
                closeExtrinsic: closeExtrinsicFunction,
            })
        }
    }, [ contextValue.closeExtrinsic, closeExtrinsicFunction ]);

    const closeFunction = useCallback(async () => {
        await preClose(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.loc!.id);
        dispatch({ type: 'CLOSE' });
        startRefresh();
    }, [ axiosFactory, contextValue.loc, startRefresh ])

    useEffect(() => {
        if(contextValue.close !== closeFunction) {
            dispatch({
                type: "SET_CLOSE",
                close: closeFunction,
            })
        }
    }, [ contextValue.close, closeFunction ]);

    const deleteLinkFunction = useCallback(async (item: LocItem) => {
        await deleteLocLink(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.loc!.id, item.target!)
        await refreshLocState(true);
    }, [ axiosFactory, contextValue.loc, refreshLocState ])

    useEffect(() => {
        if(contextValue.deleteLink !== deleteLinkFunction) {
            dispatch({
                type: "SET_DELETE_LINK",
                deleteLink: deleteLinkFunction,
            })
        }
    }, [ contextValue.deleteLink, deleteLinkFunction ]);

    const deleteMetadataFunction = useCallback(async (item: LocItem) => {
        await dispatchLocAndItems(await (contextValue.locState as OpenLoc).deleteMetadata({ name: item.name }), false)
    }, [ contextValue.locState, dispatchLocAndItems ])

    useEffect(() => {
        if(contextValue.deleteMetadata !== deleteMetadataFunction) {
            dispatch({
                type: "SET_DELETE_METADATA",
                deleteMetadata: deleteMetadataFunction,
            })
        }
    }, [ contextValue.deleteMetadata, deleteMetadataFunction ]);

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

    useEffect(() => {
        if(contextValue.voidLocExtrinsic !== voidLocExtrinsicFunction) {
            dispatch({
                type: "SET_VOID_LOC_EXTRINSIC",
                voidLocExtrinsic: voidLocExtrinsicFunction,
            })
        }
    }, [ contextValue.voidLocExtrinsic, voidLocExtrinsicFunction ]);

    const voidLocFunction = useCallback(async (voidInfo: FullVoidInfo) => {
        await preVoid(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.loc!.id, voidInfo.reason);
        dispatch({ type: 'VOID', voidInfo });
        startRefresh();
    }, [ axiosFactory, contextValue.loc, startRefresh ])

    useEffect(() => {
        if(contextValue.voidLoc !== voidLocFunction) {
            dispatch({
                type: "SET_VOID_LOC",
                voidLoc: voidLocFunction,
            })
        }
    }, [ contextValue.voidLoc, voidLocFunction ]);

    const refreshFunction = useCallback(async () => {
        await refreshLocState(true);
    }, [ refreshLocState ]);

    useEffect(() => {
        if(contextValue.refresh !== refreshFunction) {
            dispatch({
                type: "SET_REFRESH",
                refresh: refreshFunction,
            })
        }
    }, [ contextValue.refresh, refreshFunction ]);

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
        if(contextValue.checkHash !== checkHashFunction) {
            dispatch({
                type: "SET_CHECK_HASH",
                checkHash: checkHashFunction,
            })
        }
    }, [ contextValue.checkHash, checkHashFunction ]);

    const requestSofFunction = useCallback(async () => {
        const loc = contextValue.locState;
        if (loc instanceof OpenLoc || loc instanceof ClosedLoc) {
            const pendingSof = await loc.requestSof();
            await props.refreshLocs(pendingSof.locsState());
        } else {
            throw Error("Can only request SOF on Open or Closed LOC.")
        }
    }, [ contextValue.locState, props ])

    useEffect(() => {
        if(contextValue.requestSof !== requestSofFunction) {
            dispatch({
                type: "SET_REQUEST_SOF",
                requestSof: requestSofFunction,
            })
        }
    }, [ contextValue.requestSof, requestSofFunction ]);

    const requestSofOnCollectionFunction = useCallback(async (itemId: string) => {
        const loc = contextValue.locState;
        if (loc instanceof ClosedCollectionLoc) {
            const pendingSof = await loc.requestSof({ itemId });
            await props.refreshLocs(pendingSof.locsState());
        } else {
            throw Error("Can only request SOF on Closed Collection LOC.")
        }
    }, [ contextValue.locState, props ])

    useEffect(() => {
        if(contextValue.requestSofOnCollection !== requestSofOnCollectionFunction) {
            dispatch({
                type: "SET_REQUEST_SOF_ON_COLLECTION",
                requestSofOnCollection: requestSofOnCollectionFunction,
            })
        }
    }, [ contextValue.requestSofOnCollection, requestSofOnCollectionFunction ]);

    const cancelRequestFunction = useCallback(async () => {
        const loc = contextValue.locState;
        if (loc instanceof DraftRequest) {
            const newLocsState = await loc.cancel();
            await props.refreshLocs(newLocsState);
        } else {
            throw Error("Can only request SOF on Closed Collection LOC.")
        }
    }, [ contextValue.locState, props ])

    useEffect(() => {
        if(contextValue.cancelRequest !== cancelRequestFunction) {
            dispatch({
                type: "SET_CANCEL_REQUEST",
                cancelRequest: cancelRequestFunction,
            })
        }
    }, [ contextValue.cancelRequest, cancelRequestFunction ]);

    const submitRequestFunction = useCallback(async () => {
        const loc = contextValue.locState;
        if (loc instanceof DraftRequest) {
            const newState = await loc.submit();
            dispatchLocAndItems(newState, false);
        } else {
            throw Error("Can only request SOF on Closed Collection LOC.")
        }
    }, [ contextValue.locState, dispatchLocAndItems ])

    useEffect(() => {
        if(contextValue.submitRequest !== submitRequestFunction) {
            dispatch({
                type: "SET_SUBMIT_REQUEST",
                submitRequest: submitRequestFunction,
            })
        }
    }, [ contextValue.submitRequest, submitRequestFunction ]);

    const mutateLocStateCallback = useCallback(async (mutator: (current: LocRequestState) => Promise<LocRequestState>): Promise<void> => {
        const newState = await mutator(contextValue.locState!);
        if(newState !== contextValue.locState) {
            dispatchLocAndItems(newState, true);
        }
    }, [ contextValue.locState, dispatchLocAndItems ]);

    useEffect(() => {
        if (contextValue.mutateLocState !== mutateLocStateCallback) {
            dispatch({
                type: "SET_MUTATE_LOC_STATE",
                mutateLocState: mutateLocStateCallback,
            });
        }
    }, [ mutateLocStateCallback, contextValue.mutateLocState ]);

    return (
        <LocContextObject.Provider value={ contextValue }>
            { props.children }
        </LocContextObject.Provider>
    )
}

export function useLocContext() {
    return useContext(LocContextObject)
}

function allItemsOK(items: LocItem[]): boolean {
    return items.find(item => item.status === "PUBLISHED" && item.timestamp === null) === undefined;
}

function requestOK(locRequest: LocData): boolean {
    return (locRequest.status !== "CLOSED" || locRequest.closedOn !== undefined)
        && (locRequest.voidInfo === undefined || locRequest.voidInfo.voidedOn !== undefined);
}

function refreshNeeded(items: LocItem[]): boolean {
    for(const item of items) {
        if(!item.timestamp) {
            return true;
        }
    }
    return false;
}

function mustDispatchNewState(locState: LocRequestState, locItems: LocItem[], mustFetchCollectionItems: boolean): boolean {
    const locData = locState.data();
    return mustFetchCollectionItems || (locData.files.length + locData.metadata.length + locData.links.length) !== locItems.length;
}
