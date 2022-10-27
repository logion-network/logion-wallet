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
    LocRequestState,
    OpenLoc,
    ClosedLoc,
    ClosedCollectionLoc,
    LocData,
    PublicLoc,
    MergedFile,
    MergedMetadataItem,
    MergedLink,
    CollectionItem,
    FetchAllLocsParams,
    DraftRequest,
    LocsState,
} from "@logion/client";

import {
    confirmLocFile,
    preClose,
    preVoid,
    deleteLocLink,
    confirmLocLink,
    confirmLocMetadataItem,
    isGrantedAccess,
} from "../common/Model";
import { useCommonContext } from "../common/CommonContext";
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
    deleteFile: ((locItem: LocItem) => void) | null
    deleteMetadata: ((locItem: LocItem) => void) | null
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
    refresh: () => Promise<void>
    checkHash: (hash: string) => void
    checkResult: DocumentCheckResult
    collectionItem?: CollectionItem
    requestSof: (() => Promise<void>) | null
    requestSofOnCollection: ((collectionItemId: string) => Promise<void>) | null
    publishLink: ((locItem: LocItem) => SignAndSubmit) | null
    publishMetadata: ((locItem: LocItem) => SignAndSubmit) | null
    publishFile: ((locItem: LocItem) => SignAndSubmit) | null
    close: (() => void) | null
    closeExtrinsic: ((seal?: string) => SignAndSubmit) | null
    confirmFile: ((locItem: LocItem) => void) | null
    confirmLink: ((locItem: LocItem) => void) | null
    deleteLink: ((locItem: LocItem) => void) | null
    confirmMetadata: ((locItem: LocItem) => void) | null
    voidLoc: ((voidInfo: FullVoidInfo) => void) | null
    voidLocExtrinsic?: ((voidInfo: VoidInfo) => SignAndSubmit) | null
    collectionItems: CollectionItem[]
    cancelRequest: () => Promise<void>
    submitRequest: () => Promise<void>
    mutateLocState: (mutator: (current: LocRequestState) => Promise<LocRequestState>) => Promise<void>
}

const MAX_REFRESH = 20;
const REFRESH_INTERVAL = 5000;

function initialContextValue(locState: LocRequestState | null, backPath: string, detailsPath: (locId: UUID, type: LocType) => string): LocContext {
    return {
        locState,
        loc: locState ? locState.data() : null,
        backPath,
        detailsPath,
        locItems: [],
        publishLink: null,
        publishMetadata: null,
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
        refresh: () => Promise.reject(new Error("undefined")),
        checkHash: () => {},
        checkResult: { result: "NONE" },
        requestSof: null,
        requestSofOnCollection: null,
        collectionItems: [],
        cancelRequest: () => Promise.reject(new Error("undefined")),
        submitRequest: () => Promise.reject(new Error("undefined")),
        mutateLocState: () => Promise.reject(),
    }
}

const LocContextObject: React.Context<LocContext> = React.createContext(initialContextValue(null, "", () => ""))

type ActionType = 'SET_LOC_REQUEST'
    | 'SET_LOC'
    | 'CLOSE'
    | 'VOID'
    | 'RESET'
    | 'SET_CHECK_RESULT'
    | 'SET_PUBLISH_METADATA'
    | 'SET_PUBLIC_LINK'
    | 'SET_PUBLISH_LINK'
    | 'SET_PUBLISH_FILE'
    | 'SET_CLOSE'
    | 'SET_CLOSE_EXTRINSIC'
    | 'SET_CONFIRM_FILE'
    | 'SET_DELETE_FILE'
    | 'SET_CONFIRM_LINK'
    | 'SET_DELETE_LINK'
    | 'SET_CONFIRM_METADATA'
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
    publishLink?: (locItem: LocItem) => SignAndSubmit,
    publishMetadata?: (locItem: LocItem) => SignAndSubmit,
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

const reducer: Reducer<LocContext, Action> = (state: LocContext, action: Action): LocContext => {
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
        case "SET_PUBLISH_METADATA":
            return {
                ...state,
                publishMetadata: action.publishMetadata!,
            }
        case 'SET_PUBLIC_LINK':
            return {
                ...state,
                publishLink: action.publishLink!,
            }
        case 'SET_PUBLISH_LINK':
            return {
                ...state,
                publishLink: action.publishLink!,
            }
        case 'SET_PUBLISH_FILE':
            return {
                ...state,
                publishFile: action.publishFile!,
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
        case 'SET_CONFIRM_FILE':
            return {
                ...state,
                confirmFile: action.confirmFile!,
            }
        case 'SET_DELETE_FILE':
            return {
                ...state,
                deleteFile: action.deleteFile!,
            }
        case 'SET_CONFIRM_LINK':
            return {
                ...state,
                confirmLink: action.confirmLink!,
            }
        case 'SET_DELETE_LINK':
            return {
                ...state,
                deleteLink: action.deleteLink!,
            }
        case 'SET_CONFIRM_METADATA':
            return {
                ...state,
                confirmMetadata: action.confirmMetadata!,
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
    const { refresh } = useCommonContext();
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
        if(contextValue.locState && mustRecomputeItems(contextValue.locState, contextValue.locItems)) {
            dispatchLocAndItems(contextValue.locState, true);
        }
    }, [ contextValue.locState, contextValue.locItems, dispatchLocAndItems ]);

    const refreshLocState = useCallback(async (triggerRefresh: boolean): Promise<LocRequestState> => {
        const locState = await contextValue.locState!.refresh();
        await dispatchLocAndItems(locState, triggerRefresh);
        return locState;
    }, [ contextValue.locState, dispatchLocAndItems ]);

    const refreshNameTimestamp = useCallback<() => Promise<NextRefresh>>(async () => {
        if (contextValue.loc === null) {
            return NextRefresh.SCHEDULE;
        }

        if (allItemsOK(contextValue.locItems) && requestOK(contextValue.loc)) {
            refresh!(false);
            props.refreshLocs(contextValue.locState!.locsState());
            return NextRefresh.STOP;
        }

        if (contextValue.locState === null || !client) {
            return NextRefresh.SCHEDULE;
        }

        let nextRefresh = NextRefresh.SCHEDULE;
        const locState = await refreshLocState(false);
        if (refreshTimestamps(contextValue.locItems, locState)) {
            nextRefresh = NextRefresh.IMMEDIATE;
        }
        if (refreshRequestDates(contextValue.locState, locState)) {
            nextRefresh = NextRefresh.IMMEDIATE;
        }
        return nextRefresh;
    }, [
        contextValue.loc,
        contextValue.locItems,
        contextValue.locState,
        refresh,
        props,
        client,
        refreshLocState
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

    useEffect(() => {
        if(contextValue.publishMetadata !== publishMetadataFunction) {
            dispatch({
                type: "SET_PUBLISH_METADATA",
                publishMetadata: publishMetadataFunction,
            })
        }
    }, [ contextValue.publishMetadata, publishMetadataFunction ]);

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

    useEffect(() => {
        if(contextValue.publishFile !== publishFileFunction) {
            dispatch({
                type: "SET_PUBLISH_FILE",
                publishFile: publishFileFunction,
            })
        }
    }, [ contextValue.publishFile, publishFileFunction ]);

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

    useEffect(() => {
        if(contextValue.publishLink !== publishLinkFunction) {
            dispatch({
                type: "SET_PUBLISH_LINK",
                publishLink: publishLinkFunction,
            })
        }
    }, [ contextValue.publishLink, publishLinkFunction ]);

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

    const confirmFileFunction = useCallback(async (locItem: LocItem) => {
        await confirmLocFile(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.loc!.id, locItem.value);
        await refreshLocState(true);
    }, [ axiosFactory, contextValue.loc, refreshLocState ])

    useEffect(() => {
        if(contextValue.confirmFile !== confirmFileFunction) {
            dispatch({
                type: "SET_CONFIRM_FILE",
                confirmFile: confirmFileFunction,
            })
        }
    }, [ contextValue.confirmFile, confirmFileFunction ]);

    const deleteFileFunction = useCallback(async (item: LocItem) => {
        await dispatchLocAndItems(await (contextValue.locState as OpenLoc).deleteFile({ hash: item.value }), true)
    }, [ dispatchLocAndItems, contextValue.locState ])

    useEffect(() => {
        if(contextValue.deleteFile !== deleteFileFunction) {
            dispatch({
                type: "SET_DELETE_FILE",
                deleteFile: deleteFileFunction,
            })
        }
    }, [ contextValue.deleteFile, deleteFileFunction ]);

    const confirmLinkFunction = useCallback(async (locItem: LocItem) => {
        await confirmLocLink(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.loc!.id, locItem.target!);
        await refreshLocState(true);
    }, [ axiosFactory, contextValue.loc, refreshLocState ])

    useEffect(() => {
        if(contextValue.confirmLink !== confirmLinkFunction) {
            dispatch({
                type: "SET_CONFIRM_LINK",
                confirmLink: confirmLinkFunction,
            })
        }
    }, [ contextValue.confirmLink, confirmLinkFunction ]);

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

    const confirmMetadataFunction = useCallback(async (locItem: LocItem) => {
        await confirmLocMetadataItem(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.loc!.id, locItem.name);
        await refreshLocState(true);
    }, [ axiosFactory, contextValue.loc, refreshLocState ])

    useEffect(() => {
        if(contextValue.confirmMetadata !== confirmMetadataFunction) {
            dispatch({
                type: "SET_CONFIRM_METADATA",
                confirmMetadata: confirmMetadataFunction,
            })
        }
    }, [ contextValue.confirmMetadata, confirmMetadataFunction ]);

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

function refreshNeeded(items: LocItem[]): boolean {
    for(const item of items) {
        if(!item.timestamp) {
            return true;
        }
    }
    return false;
}

function refreshTimestamps(locItems: LocItem[], locState: LocRequestState): boolean {
    for(const locItem of locItems.filter(locItem => locItem.timestamp === null)) {
        const locRequestItem = findItemInLocData(locState.data(), locItem);
        if (locRequestItem && locRequestItem.addedOn) {
            return true;
        }
    }
    return false;
}

function refreshRequestDates(current: LocRequestState, next: LocRequestState): boolean {
    const currentData = current.data();
    const nextData = next.data();
    if(currentData.closedOn === undefined && nextData.closedOn) {
        return true;
    }
    if(currentData.voidInfo?.voidedOn === undefined && nextData.voidInfo?.voidedOn) {
        return true;
    }
    return false;
}

function mustRecomputeItems(locState: LocRequestState, locItems: LocItem[]): boolean {
    const locData = locState.data();
    return (locData.files.length + locData.metadata.length + locData.links.length) !== locItems.length;
}
