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
import { addLink as modelAddLink } from "./Model"
import { fullCertificateUrl } from "../PublicPaths";
import { signAndSend } from "src/logion-chain/Signature";
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
    locState: ActiveLoc | null
    locItems: LocItem[]
    addMetadata: ((name: string, value: string) => void) | null
    addFile: ((name: string, file: File, nature: string) => Promise<void>) | null
    deleteFile: ((locItem: LocItem) => void) | null
    deleteMetadata: ((locItem: LocItem) => void) | null
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
    refresh: () => void
    checkHash: (hash: string) => void
    checkResult: DocumentCheckResult
    collectionItem?: CollectionItem
    requestSof: (() => void) | null
    requestSofOnCollection: ((collectionItemId: string) => void) | null
    addLink: ((otherLoc: LinkTarget, nature: string) => void) | null
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
        requestSof: null,
        requestSofOnCollection: null,
    }
}

const LocContextObject: React.Context<LocContext> = React.createContext(initialContextValue(new UUID(), "", () => ""))

type ActionType = 'SET_LOC_REQUEST'
    | 'SET_LOC'
    | 'SET_FUNCTIONS'
    | 'CLOSE'
    | 'VOID'
    | 'RESET'
    | 'SET_CHECK_RESULT'

interface Action {
    type: ActionType,
    locId?: UUID,
    supersededLoc?: PublicLoc,
    locItem?: LocItem,
    locItems?: LocItem[],
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
    requestSof?: () => void,
    requestSofOnCollection?: (collectionItemId: string) => void,
}

const reducer: Reducer<LocContext, Action> = (state: LocContext, action: Action): LocContext => {
    switch (action.type) {
        case "RESET":
            return initialContextValue(action.locId!, state.backPath, state.detailsPath)
        case "SET_LOC":
            return {
                ...state,
                supersededLoc: action.supersededLoc,
                locState: action.locState!,
                loc: action.locData!,
                locItems: action.locItems!,
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
                requestSof: action.requestSof!,
                requestSofOnCollection: action.requestSofOnCollection!,
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
        default:
            throw new Error(`Unknown type: ${ action.type }`);
    }
}

export interface Props {
    locId: UUID
    children: JSX.Element | JSX.Element[] | null
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
    refreshLocs: () => Promise<void>
}

const enum NextRefresh {
    STOP,
    SCHEDULE,
    IMMEDIATE
}

export function LocContextProvider(props: Props) {
    const { axiosFactory, accounts, api, client } = useLogionChain();
    const { refresh } = useCommonContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue(props.locId, props.backPath, props.detailsPath));
    const [ refreshing, setRefreshing ] = useState<boolean>(false);
    const [ refreshCounter, setRefreshCounter ] = useState<number>(0);

    useEffect(() => {
        if (props.locId.toString() !== contextValue.locId.toString()) {
            dispatch({ type: 'RESET', locId: props.locId });
        }
    }, [ contextValue.locId, props.locId ])

    const toLocItems = useCallback(async (locState: ActiveLoc) => {
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

            const linkedLocState = await locState.locsState().findById({ locId: item.id });
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
    }, [ ]);

    const dispatchLocAndItems = useCallback(async (locState: ActiveLoc, triggerRefresh: boolean, refreshLocs: boolean) => {
        const locItems = await toLocItems(locState);
        const locData = locState.data();
        let supersededLoc = undefined;
        if(locData.replacerOf) {
            if(contextValue.supersededLoc && contextValue.supersededLoc.data.id.toString() === locData.replacerOf.toString()) {
                supersededLoc = contextValue.supersededLoc;
            } else {
                supersededLoc = await client!.public.findLocById({ locId: locData.replacerOf });
            }
        }
        dispatch({
            type: 'SET_LOC',
            locState,
            locItems,
            supersededLoc,
            locData,
        });
        if (triggerRefresh && refreshNeeded(locItems)) {
            startRefresh();
        }
        if(refreshLocs) {
            await props.refreshLocs();
        }
    }, [ toLocItems, client, contextValue.supersededLoc, props, startRefresh ])

    useEffect(() => {
        if (client !== null && contextValue.locState === null) {
            (async function () {
                const locState = await (await client.locsState()).findById({ locId: contextValue.locId });
                await dispatchLocAndItems(locState!, true, false);
            })();
        }
    }, [ contextValue, contextValue.locId, accounts, client, dispatchLocAndItems ])

    const refreshLocState = useCallback(async (triggerRefresh: boolean, refreshLocs: boolean): Promise<ActiveLoc> => {
        const locState = await (await client!.locsState()).findById({ locId: contextValue.locId });
        await dispatchLocAndItems(locState!, triggerRefresh, refreshLocs);
        return locState!;
    }, [ contextValue.locId, client, dispatchLocAndItems ]);

    const refreshNameTimestamp = useCallback<() => Promise<NextRefresh>>(async () => {
        if (contextValue.loc === null) {
            return NextRefresh.SCHEDULE;
        }

        if (allItemsOK(contextValue.locItems) && requestOK(contextValue.loc)) {
            refresh!(false);
            props.refreshLocs();
            return NextRefresh.STOP;
        }

        if (contextValue.locState === null || !client) {
            return NextRefresh.SCHEDULE;
        }

        let nextRefresh = NextRefresh.SCHEDULE;
        const locState = await refreshLocState(false, false);
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
        refresh,
        props,
        client,
        contextValue.locState,
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

    const closeFunction = useCallback(async () => {
        await preClose(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.loc!.id);
        dispatch({ type: 'CLOSE' });
        startRefresh();
    }, [ axiosFactory, dispatch, contextValue.loc, startRefresh ])

    const confirmFileFunction = useCallback(async (locItem: LocItem) => {
        await confirmLocFile(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.locId, locItem.value);
        await refreshLocState(true, false);
    }, [ axiosFactory, contextValue.locId, contextValue.loc, refreshLocState ])

    const deleteFileFunction = useCallback(async (item: LocItem) => {
        await dispatchLocAndItems(await (contextValue.locState as OpenLoc).deleteFile({ hash: item.value }), true, false)
    }, [ dispatchLocAndItems, contextValue.locState ])

    const confirmLinkFunction = useCallback(async (locItem: LocItem) => {
        await confirmLocLink(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.locId, locItem.target!);
        await refreshLocState(true, false);
    }, [ axiosFactory, contextValue.locId, contextValue.loc, refreshLocState ])

    const deleteLinkFunction = useCallback(async (item: LocItem) => {
        await deleteLocLink(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.locId, item.target!)
        await refreshLocState(true, false);
    }, [ axiosFactory, contextValue.locId, contextValue.loc, refreshLocState ])

    const confirmMetadataFunction = useCallback(async (locItem: LocItem) => {
        await confirmLocMetadataItem(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.locId, locItem.name);
        await refreshLocState(true, false);
    }, [ axiosFactory, contextValue.locId, contextValue.loc, refreshLocState ])

    const deleteMetadataFunction = useCallback(async (item: LocItem) => {
        await dispatchLocAndItems(await (contextValue.locState as OpenLoc).deleteMetadata({ name: item.name }), true, false)
    }, [ contextValue.locState, dispatchLocAndItems ])

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

    const voidLocFunction = useCallback(async (voidInfo: FullVoidInfo) => {
        await preVoid(axiosFactory!(contextValue.loc!.ownerAddress)!, contextValue.loc!.id, voidInfo.reason);
        dispatch({ type: 'VOID', voidInfo });
        startRefresh();
    }, [ axiosFactory, dispatch, contextValue.loc, startRefresh ])

    const addLinkFunction = useCallback(async (otherLoc: LinkTarget, nature: string) => {
        await modelAddLink(axiosFactory!(contextValue.loc!.ownerAddress)!, {
            locId: contextValue.locId.toString(),
            target: otherLoc.id.toString(),
            nature
        });
        await refreshLocState(true, false);
    }, [ axiosFactory, contextValue, refreshLocState ])

    const addMetadataFunction = useCallback(async (name: string, value: string) => {
        await dispatchLocAndItems(await (contextValue.locState as OpenLoc).addMetadata({
            name,
            value,
        }), true, false);
    }, [ contextValue.locState, dispatchLocAndItems ])

    const addFileFunction = useCallback(async (name: string, file: File, nature: string) => {
        const state = await (contextValue.locState as OpenLoc).addFile({
            file,
            fileName: name,
            nature
        });
        await dispatchLocAndItems(state.state, true, false);
    }, [ contextValue.locState, dispatchLocAndItems ])

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

    const requestSofFunction = useCallback(async () => {
        const loc = contextValue.locState;
        if (loc instanceof OpenLoc || loc instanceof ClosedLoc) {
            await loc.requestSof();
            await props.refreshLocs();
        } else {
            throw Error("Can only request SOF on Open or Closed LOC.")
        }
    }, [ contextValue.locState, props ])

    const requestSofOnCollectionFunction = useCallback(async (itemId: string) => {
        const loc = contextValue.locState;
        if (loc instanceof ClosedCollectionLoc) {
            await loc.requestSof({ itemId });
            await props.refreshLocs();
        } else {
            throw Error("Can only request SOF on Closed Collection LOC.")
        }
    }, [ contextValue.locState, props ])

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
                requestSof: requestSofFunction,
                requestSofOnCollection: requestSofOnCollectionFunction,
            };
            dispatch(action)
        }
    }, [
        contextValue.loc,
        contextValue.addMetadata,
        publishMetadataFunction,
        publishFileFunction,
        closeFunction,
        closeExtrinsicFunction,
        confirmFileFunction,
        deleteFileFunction,
        confirmLinkFunction,
        deleteLinkFunction,
        confirmMetadataFunction,
        deleteMetadataFunction,
        dispatch,
        publishLinkFunction,
        voidLocFunction,
        voidLocExtrinsicFunction,
        addLinkFunction,
        addMetadataFunction,
        addFileFunction,
        refreshFunction,
        checkHashFunction,
        requestSofFunction,
        requestSofOnCollectionFunction
    ])

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

function refreshTimestamps(locItems: LocItem[], locState: ActiveLoc): boolean {
    for(const locItem of locItems.filter(locItem => locItem.timestamp === null)) {
        const locRequestItem = findItemInLocData(locState.data(), locItem);
        if (locRequestItem && locRequestItem.addedOn) {
            return true;
        }
    }
    return false;
}

function refreshRequestDates(current: ActiveLoc, next: ActiveLoc): boolean {
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
