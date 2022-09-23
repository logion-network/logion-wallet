import React, { useContext, useReducer, Reducer, useEffect, useCallback } from "react";
import { UUID } from "@logion/node-api/dist/UUID";
import { LocType } from "@logion/node-api/dist/Types";
import { useLogionChain } from "../logion-chain";
import { LocItemStatus, LocItem } from "./types";
import { createMetadataItem, createFileItem, createLinkItem } from "./LocItemFactory";
import { fullCertificateUrl } from "../PublicPaths";
import {
    OpenLoc,
    ClosedLoc,
    ClosedCollectionLoc,
    LocData,
    PendingRequest,
    PublicLoc,
    CollectionItem,
} from "@logion/client";
import { useUserContext } from "../wallet-user/UserContext";
import { ActiveLoc } from "./LocContext";
import { DocumentCheckResult } from "src/components/checkfileframe/CheckFileFrame";

export interface UserLocContext {
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
    requestSof: (() => void) | null
    requestSofOnCollection: ((collectionItemId: string) => void) | null
    checkHash: (hash: string) => void
    checkResult: DocumentCheckResult
    collectionItem?: CollectionItem
}

function initialContextValue(locId: UUID, backPath: string, detailsPath: (locId: UUID, type: LocType) => string): UserLocContext {
    return {
        locId,
        backPath,
        detailsPath,
        loc: null,
        locState: null,
        locItems: [],
        addMetadata: null,
        addFile: null,
        deleteFile: null,
        deleteMetadata: null,
        refresh: () => {
        },
        requestSof: null,
        requestSofOnCollection: null,
        checkHash: () => {},
        checkResult: { result: "NONE" },
    }
}

const UserLocContextObject: React.Context<UserLocContext> = React.createContext(initialContextValue(new UUID(), "", () => ""))

type ActionType = 'SET_LOC'
    | 'SET_FUNCTIONS'
    | 'RESET'
    | 'SET_CHECK_RESULT'

interface Action {
    type: ActionType,
    locId?: UUID,
    locState?: ActiveLoc,
    supersededLoc?: PublicLoc,
    locItems?: LocItem[],
    status?: LocItemStatus,
    addMetadata?: (name: string, value: string) => void,
    addFile?: (name: string, file: File, nature: string) => Promise<void>,
    deleteFile?: (locItem: LocItem) => void,
    deleteMetadata?: (locItem: LocItem) => void,
    refresh?: () => void,
    requestSof?: () => void,
    requestSofOnCollection?: (collectionItemId: string) => void,
    checkHash?: (hash: string) => void,
    collectionItem?: CollectionItem,
    checkResult?: DocumentCheckResult,
}

const reducer: Reducer<UserLocContext, Action> = (state: UserLocContext, action: Action): UserLocContext => {
    switch (action.type) {
        case "RESET":
            return initialContextValue(action.locId!, state.backPath, state.detailsPath)
        case "SET_LOC":
            return {
                ...state,
                locState: action.locState!,
                loc: action.locState!.data(),
                locItems: action.locItems!,
                supersededLoc: action.supersededLoc,
            }
        case "SET_FUNCTIONS":
            return {
                ...state,
                addMetadata: action.addMetadata!,
                addFile: action.addFile!,
                deleteFile: action.deleteFile!,
                deleteMetadata: action.deleteMetadata!,
                refresh: action.refresh!,
                requestSof: action.requestSof!,
                requestSofOnCollection: action.requestSofOnCollection!,
                checkHash: action.checkHash!,
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
}

export function UserLocContextProvider(props: Props) {

    const { accounts, client } = useLogionChain();
    const { mutateLocsState } = useUserContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue(props.locId, props.backPath, props.detailsPath));

    useEffect(() => {
        if (props.locId.toString() !== contextValue.locId.toString()) {
            dispatch({ type: 'RESET', locId: props.locId })
        }
    }, [ contextValue.locId, props.locId ])

    const toLocItems = useCallback(async (locState: ActiveLoc) => {
        const loc = locState?.data();
        let locItems: LocItem[] = [];
        if (!loc) {
            return locItems;
        }
        const locOwner = loc!.ownerAddress;
        loc.metadata.forEach(item => {
            const result = createMetadataItem(item)
            locItems.push(result.locItem)
        })
        loc.files.forEach(item => {
            const result = createFileItem(item);
            locItems.push(result.locItem)
        })
        for (let i = 0; i < loc.links.length; ++i) {
            const item = loc.links[i];

            const linkedLocState = await locState.locsState().findById({ locId: item.id });
            const linkedLoc = linkedLocState?.data();

            if (linkedLoc) {
                let linkDetailsPath: string;
                if (isGrantedAccess(accounts?.current?.address, linkedLoc)) {
                    linkDetailsPath = contextValue.detailsPath(linkedLoc.id, linkedLoc.locType);
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
    }, [ contextValue, accounts ])

    const refreshRequests = useCallback(async (locState: Promise<PendingRequest | ActiveLoc>) => {
        await mutateLocsState(() => locState
            .then(locState => locState.locsState()))
    }, [ mutateLocsState ])

    const dispatchLocAndItems = useCallback(async (promisedLoc: Promise<ActiveLoc>) => {
        const locState = await promisedLoc
        const locItems = await toLocItems(locState)
        const locData = locState.data()
        let supersededLoc = undefined;
        if(locData.replacerOf) {
            supersededLoc = await client!.public.findLocById({ locId: locData.replacerOf });
        }
        dispatch({ type: 'SET_LOC', locState, locItems, supersededLoc })
        await refreshRequests(promisedLoc)
    }, [ toLocItems, refreshRequests, client ])

    useEffect(() => {
        if (client !== null && contextValue.locState === null) {
            (async function () {
                const locState = (await client.locsState()).findById({ locId: contextValue.locId }) as Promise<ActiveLoc>;
                await dispatchLocAndItems(locState)
            })();
        }
    }, [ contextValue, contextValue.locId, accounts, client, dispatchLocAndItems ])

    const deleteFileFunction = useCallback(async (item: LocItem) => {
        await dispatchLocAndItems((contextValue.locState as OpenLoc).deleteFile({ hash: item.value }))
    }, [ contextValue.locState, dispatchLocAndItems ])

    const deleteMetadataFunction = useCallback(async (item: LocItem) => {
        await dispatchLocAndItems((contextValue.locState as OpenLoc).deleteMetadata({ name: item.name }))
    }, [ contextValue.locState, dispatchLocAndItems ])

    const addMetadataFunction = useCallback(async (name: string, value: string) => {
        await dispatchLocAndItems((contextValue.locState as OpenLoc).addMetadata({
            name,
            value,
        }))
    }, [ contextValue.locState, dispatchLocAndItems ])

    const addFileFunction = useCallback(async (name: string, file: File, nature: string) => {
        const state = (contextValue.locState as OpenLoc).addFile({
            file,
            fileName: name,
            nature
        }).then(result => result.state);
        await dispatchLocAndItems(state)
    }, [ contextValue.locState, dispatchLocAndItems ])

    const refreshFunction = useCallback(() => {
        dispatch({ type: 'RESET', locId: contextValue.locId });
    }, [ dispatch, contextValue ]);

    const requestSofFunction = useCallback(async () => {
        const loc = contextValue.locState;
        if (loc instanceof OpenLoc || loc instanceof ClosedLoc) {
            await refreshRequests(loc.requestSof())
        } else {
            throw Error("Can only request SOF on Open or Closed LOC.")
        }
    }, [ contextValue.locState, refreshRequests ])

    const requestSofOnCollectionFunction = useCallback(async (itemId: string) => {
        const loc = contextValue.locState;
        if (loc instanceof ClosedCollectionLoc) {
            await refreshRequests(loc.requestSof({ itemId }));
        } else {
            throw Error("Can only request SOF on Closed Collection LOC.")
        }
    }, [ contextValue.locState, refreshRequests ])

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
        if (contextValue.loc && contextValue.loc.ownerAddress !== null && contextValue.addMetadata === null) {
            const action: Action = {
                type: 'SET_FUNCTIONS',
                addMetadata: addMetadataFunction,
                addFile: addFileFunction,
                deleteFile: deleteFileFunction,
                deleteMetadata: deleteMetadataFunction,
                refresh: refreshFunction,
                requestSof: requestSofFunction,
                requestSofOnCollection: requestSofOnCollectionFunction,
                checkHash: checkHashFunction,
            };
            dispatch(action)
        }
    }, [ contextValue.loc, contextValue.addMetadata, deleteFileFunction,
        deleteMetadataFunction, dispatch, addMetadataFunction, addFileFunction, refreshFunction, requestSofFunction,
        requestSofOnCollectionFunction, checkHashFunction ])

    return (
        <UserLocContextObject.Provider value={ contextValue }>
            { props.children }
        </UserLocContextObject.Provider>
    )
}

export function useUserLocContext() {
    return useContext(UserLocContextObject)
}

function isGrantedAccess(address: string | undefined, loc: LocData): boolean {
    return loc.ownerAddress === address || loc.requesterAddress === address;
}
