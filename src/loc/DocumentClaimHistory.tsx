import { CheckCertifiedCopyResult, CheckResultType, LocData, TokensRecord, ClosedCollectionLoc, TypedFile, LocRequestState } from "@logion/client";
import { UUID } from "@logion/node-api";
import { AxiosInstance } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useCommonContext } from "src/common/CommonContext";
import Frame from "src/common/Frame";
import CheckDeliveredFrame from "src/components/deliverycheck/CheckDeliveredFrame";
import ItemFiles, { DeliveredFile } from "src/components/itemfiles/ItemFiles";
import { locDetailsPath, tokensRecordPath } from "src/legal-officer/LegalOfficerPaths";
import { useLogionChain } from "src/logion-chain";
import { locDetailsPath as userLocDetailsPath, tokensRecordPath as requesterTokensRecordPath, vtpTokensRecordPath } from "src/wallet-user/UserRouter";
import { CheckLatestDeliveryResponse, getAllCollectionFileDeliveries, getTokensRecordDeliveries, getTokensRecordFileSource } from "./FileModel";
import { LegalOfficerLocContextProvider } from "./LegalOfficerLocContext";
import { useLocContext } from "./LocContext";
import LocPane from "./LocPane";
import { UserLocContextProvider } from "./UserLocContext";
import "./DocumentClaimHistory.css";
import { ContributionMode } from "./types";

export interface Props {
    hash: string;
    icon: string;
    title: string;
    file: (loc: LocData) => DeliveredFile;
    getFileDeliveries: (axios: AxiosInstance, loc: LocData) => Promise<CheckLatestDeliveryResponse[]>;
    getFile: (loc: LocRequestState) => Promise<TypedFile>;
    contributionMode?: ContributionMode;
}

export default function DocumentClaimHistory(props: Props) {
    const { hash } = props;
    const { loc, locState, backPath } = useLocContext();
    const [ deliveries, setDeliveries ] = useState<CheckLatestDeliveryResponse[]>();
    const [ checkCertifiedCopyResult, setCheckCertifiedCopyResult ] = useState<CheckCertifiedCopyResult>();
    const { axiosFactory } = useLogionChain();
    const { colorTheme } = useCommonContext();

    useEffect(() => {
        if(axiosFactory && loc && hash && deliveries === undefined) {
            (async function() {
                const deliveries = await props.getFileDeliveries(axiosFactory(loc.ownerAddress), loc);
                setDeliveries(deliveries);
            })();
        }
    }, [ props, hash, axiosFactory, loc, deliveries ]);

    const checkCertifiedCopy = useCallback(async (fileHash: string): Promise<CheckCertifiedCopyResult> => {
        if(deliveries) {
            for(let i = 0; i < deliveries.length; ++i) {
                const delivery = deliveries[i];
                if(delivery.copyHash === fileHash) {
                    return {
                        latest: i === 0 ? CheckResultType.POSITIVE : CheckResultType.NEGATIVE,
                        logionOrigin: CheckResultType.POSITIVE,
                        nftOwnership: CheckResultType.POSITIVE,
                        summary: CheckResultType.POSITIVE,
                        match: {
                            ...delivery,
                            belongsToCurrentOwner: false,
                            originalFileHash: fileHash,
                        }
                    };
                }
            }
        }
        return {
            latest: CheckResultType.NEGATIVE,
            logionOrigin: CheckResultType.NEGATIVE,
            nftOwnership: CheckResultType.NEGATIVE,
            summary: CheckResultType.NEGATIVE,
        };
    }, [ deliveries ]);

    const files = useMemo(() => {
        if(loc) {
            return [ props.file(loc) ];
        } else {
            return [];
        }
    }, [ loc, props ]);

    if(!loc || !locState) {
        return null;
    }

    return (
        <LocPane
            backPath={backPath}
            loc={loc}
            className="DocumentClaimHistory"
            contributionMode={props.contributionMode}
        >
            <Frame>
                <ItemFiles
                    collectionLoc={loc}
                    deliveries={{ [hash]: (deliveries || []) }}
                    checkCertifiedCopyResultResult={ checkCertifiedCopyResult }
                    files={ files }
                    downloader={ hash => locState.getFile(hash)}
                    defaultExpanded={true}
                    icon={props.icon}
                    title={props.title}
                />
            </Frame>
            <div className="check-delivered-container">
                <CheckDeliveredFrame
                    checkCertifiedCopy={ checkCertifiedCopy }
                    colorTheme={ colorTheme }
                    detailedError={ false }
                    icon="check_document_tool"
                    title="Restricted download Check Tool"
                    buttonText="Check document"
                    onChecked={result => setCheckCertifiedCopyResult(result)}
                />
            </div>
        </LocPane>
    );
}

export function GuardianDocumentClaimHistory() {
    const locId = new UUID(useParams<"locId">().locId);
    const hash = useParams<"hash">().hash || "";

    return (
        <LegalOfficerLocContextProvider
            locId={ locId }
            backPath={ locDetailsPath(locId, "Collection") }
            detailsPath={ locDetailsPath }
        >
            <CollectionDocumentClaimHistory hash={hash}/>
        </LegalOfficerLocContextProvider>
    )
}

function CollectionDocumentClaimHistory(props: { hash: string }) {
    const { hash } = props;
    return (
        <DocumentClaimHistory
            hash={hash}
            icon="check_document"
            title="Document claim history"
            getFileDeliveries={ (axios, loc) => getCollectionFileDeliveries(axios, { locId: loc.id.toString(), hash }) }
            getFile={ loc => loc.getFile(hash)}
            file={ (loc) => loc.files.filter(file => file.hash === hash).map(file => ({
                ...file,
                size: BigInt(file.size),
            }))[0]}
        />
    );
}

async function getCollectionFileDeliveries(axios: AxiosInstance, parameters: {
    locId: string,
    hash: string,
}): Promise<CheckLatestDeliveryResponse[]> {
    const { locId, hash } = parameters;
    const deliveries = await getAllCollectionFileDeliveries(axios, { locId, hash });
    return deliveries.deliveries;
}

export function UserDocumentClaimHistory() {
    const locId = new UUID(useParams<"locId">().locId);
    const hash = useParams<"hash">().hash || "";

    return (
        <UserLocContextProvider
            locId={ locId }
            backPath={ userLocDetailsPath(locId, "Collection") }
            detailsPath={ userLocDetailsPath }
        >
            <CollectionDocumentClaimHistory hash={hash}/>
        </UserLocContextProvider>
    )
}

export function LegalOfficerTokensRecordDocumentClaimHistory() {
    const locId = new UUID(useParams<"locId">().locId);
    const recordId = useParams<"recordId">().recordId || "";
    const hash = useParams<"hash">().hash || "";

    return (
        <LegalOfficerLocContextProvider
            locId={ locId }
            backPath={ tokensRecordPath(locId) }
            detailsPath={ locDetailsPath }
        >
            <TokensRecordDocumentClaimHistory recordId={recordId} hash={hash}/>
        </LegalOfficerLocContextProvider>
    )
}

function TokensRecordDocumentClaimHistory(props: { recordId: string, hash: string, contributionMode?: ContributionMode }) {
    const { recordId, hash } = props;
    const [ record, setRecord ] = useState<TokensRecord>();
    const { locState } = useLocContext();

    useEffect(() => {
        if(record === undefined && locState instanceof ClosedCollectionLoc) {
            (async function() {
                const record = await locState.getTokensRecord({ recordId });
                setRecord(record);
            })();
        }
    }, [ recordId, record, locState ]);

    if(!record) {
        return null;
    }

    return (
        <DocumentClaimHistory
            hash={hash}
            icon="records_blue"
            title="Tokens record claim history"
            getFileDeliveries={ (axios, loc) => getTokensRecordFileDeliveries(axios, { locId: loc.id.toString(), recordId, hash })}
            getFile={ loc => getTokensRecordFileSource(loc.owner.buildAxiosToNode(), { locId: loc.data().id.toString(), recordId, hash }) }
            file={ () => getRecordFile(record, hash) }
            contributionMode={ props.contributionMode }
        />
    );
}

async function getTokensRecordFileDeliveries(axios: AxiosInstance, parameters: {
    locId: string,
    recordId: string,
    hash: string,
}): Promise<CheckLatestDeliveryResponse[]> {
    const { locId, recordId, hash } = parameters;
    const allDeliveries = await getTokensRecordDeliveries(axios, { locId, recordId });
    if(hash in allDeliveries) {
        return allDeliveries[hash];
    } else {
        return [];
    }
}

function getRecordFile(record: TokensRecord | undefined, hash: string): DeliveredFile {
    if(!record) {
        return emptyDeliveredFile(hash);
    } else {
        const file = record.files.find(file => file.hash === hash);
        return file || emptyDeliveredFile(hash);
    }
}

function emptyDeliveredFile(hash: string): DeliveredFile {
    return {
        contentType: "",
        hash,
        name: "",
        size: 0n,
    };
};

export function UserTokensRecordDocumentClaimHistory(props: { contributionMode: ContributionMode }) {
    const locId = new UUID(useParams<"locId">().locId);
    const recordId = useParams<"recordId">().recordId || "";
    const hash = useParams<"hash">().hash || "";

    return (
        <UserLocContextProvider
            locId={ locId }
            backPath={ userTokensRecordPath(props.contributionMode, locId) }
            detailsPath={ userLocDetailsPath }
        >
            <TokensRecordDocumentClaimHistory recordId={recordId} hash={hash} contributionMode={props.contributionMode}/>
        </UserLocContextProvider>
    )
}

function userTokensRecordPath(contributionMode: ContributionMode, locId: UUID): string {
    if(contributionMode === "Requester") {
        return requesterTokensRecordPath(locId);
    } else {
        return vtpTokensRecordPath(locId);
    }
}
