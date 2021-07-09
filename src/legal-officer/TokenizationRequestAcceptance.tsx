import React, { useState, useEffect, useCallback } from 'react';
import Alert from 'react-bootstrap/Alert';
import moment from 'moment';

import {
    useLogionChain,
    Unsubscriber,
    ISubmittableResult,
    createAsset,
    AssetId,
    isFinalized,
    setAssetMetadata,
    mintTokens,
    DEFAULT_ASSETS_DECIMALS,
    mintAmount,
    sign,
    unsubscribe
} from '../logion-chain';
import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import {
    TokenizationRequest,
} from './Types';
import {
    acceptRequest,
    setAssetDescription,
} from './Model';
import ProcessStep from './ProcessStep';
import ExtrinsicSubmissionResult from '../ExtrinsicSubmissionResult';

enum AcceptStatus {
    NONE,
    ACCEPTANCE_PENDING,
    ACCEPTING,
    ACCEPTED,
    ASSET_CREATION_PENDING,
    CREATING_ASSET,
    SET_METADATA_PENDING,
    SETTING_METADATA,
    MINTING_PENDING,
    MINTING,
    CLEAN_UP_PENDING,
    CLEANING_UP,
    DONE
}

interface AcceptState {
    status: AcceptStatus,
    assetId?: AssetId,
    sessionToken?: string,
    unsubscriber?: Unsubscriber | null,
}

export interface Props {
    requestToAccept: TokenizationRequest | null,
    clearRequestToAccept: () => void,
}

export default function TokenizationRequestAcceptance(props: Props) {
    const { api } = useLogionChain();
    const { currentAddress } = useRootContext();
    const { refreshRequests } = useLegalOfficerContext();

    const [ acceptState, setAcceptState ] = useState<AcceptState>({status: AcceptStatus.NONE});

    const [ assetCreationResult, setAssetCreationResult ] = useState<ISubmittableResult | null>(null);
    const [ assetCreationError, setAssetCreationError ] = useState<any>(null);
    
    const [ setMetadataResult, setSetMetadataResult ] = useState<ISubmittableResult | null>(null);
    const [ setMetadataError, setSetMetadataError ] = useState<any>(null);

    const [ mintingResult, setMintingResult ] = useState<ISubmittableResult | null>(null);
    const [ mintingError, setMintingError ] = useState<any>(null);

    // Request acceptance (off-chain)
    useEffect(() => {
        if(acceptState.status === AcceptStatus.ACCEPTANCE_PENDING) {
            setAcceptState({status: AcceptStatus.ACCEPTING});

            const proceed = async () => {
                const request = props.requestToAccept!;
                const attributes = [
                    `${request.id}`,
                ];
                const signedOn = moment();
                const signature = await sign({
                    signerId: request.legalOfficerAddress,
                    resource: 'token-request',
                    operation: 'accept',
                    signedOn,
                    attributes
                });

                const { sessionToken } = await acceptRequest({
                    requestId: request.id,
                    signature,
                    signedOn
                });

                setAcceptState({
                    status: AcceptStatus.ACCEPTED,
                    sessionToken
                });
            };
            proceed();
        }
    }, [acceptState, props.requestToAccept, setAcceptState]);

    const setStatus = useCallback((status: AcceptStatus) => {
        setAcceptState({...acceptState, status});
    }, [ acceptState, setAcceptState ]);

    // Asset creation
    useEffect(() => {
        if(acceptState.status === AcceptStatus.ASSET_CREATION_PENDING) {
            setStatus(AcceptStatus.CREATING_ASSET);
            const proceed = async () => {
                const { assetId, unsubscriber } = await createAsset({
                    api: api!,
                    signerId: currentAddress,
                    callback: setAssetCreationResult,
                    errorCallback: setAssetCreationError,
                });

                const request = props.requestToAccept!;
                await setAssetDescription({
                    requestId: request.id,
                    description: {
                        assetId: assetId.toString(),
                        decimals: DEFAULT_ASSETS_DECIMALS
                    },
                    sessionToken: acceptState.sessionToken!
                });

                setAcceptState({
                    status: AcceptStatus.CREATING_ASSET,
                    assetId,
                    unsubscriber,
                    sessionToken: undefined,
                });
            };
            proceed();
        }
    }, [
        acceptState,
        setStatus,
        setAcceptState,
        api,
        props.requestToAccept,
        currentAddress,
        setAssetCreationResult,
        setAssetCreationError,
    ]);

    // Metadata
    useEffect(() => {
        if(acceptState.status === AcceptStatus.SET_METADATA_PENDING) {
            setStatus(AcceptStatus.SETTING_METADATA);
            const proceed = async () => {
                await unsubscribe(acceptState.unsubscriber!);
                const unsubscriber = setAssetMetadata({
                    api: api!,
                    signerId: currentAddress,
                    callback: setSetMetadataResult,
                    errorCallback: setSetMetadataError,
                    assetId: acceptState.assetId!,
                    metadata: {
                        name: props.requestToAccept!.requestedTokenName,
                        symbol: props.requestToAccept!.requestedTokenName,
                        decimals: DEFAULT_ASSETS_DECIMALS,
                    }
                });
                setAcceptState({
                    ...acceptState,
                    status: AcceptStatus.SETTING_METADATA,
                    unsubscriber
                });
            };
            proceed();
        }
    }, [
        acceptState,
        setStatus,
        setAcceptState,
        api,
        currentAddress,
        setSetMetadataResult,
        setSetMetadataError,
        props.requestToAccept,
    ]);

    // Minting
    useEffect(() => {
        if(acceptState.status === AcceptStatus.MINTING_PENDING) {
            setStatus(AcceptStatus.MINTING);
            const proceed = async () => {
                await unsubscribe(acceptState.unsubscriber!);
                const unsubscriber = mintTokens({
                    api: api!,
                    signerId: currentAddress,
                    beneficiary: props.requestToAccept!.requesterAddress,
                    callback: setMintingResult,
                    errorCallback: setMintingError,
                    assetId: acceptState.assetId!,
                    amount: mintAmount(props.requestToAccept!.bars, DEFAULT_ASSETS_DECIMALS)
                });
                setAcceptState({
                    ...acceptState,
                    status: AcceptStatus.MINTING,
                    unsubscriber
                });
            };
            proceed();
        }
    }, [
        acceptState,
        setStatus,
        setAcceptState,
        api,
        currentAddress,
        props.requestToAccept,
        setMintingResult,
        setMintingError,
    ]);

    // Clean-up
    useEffect(() => {
        if(acceptState.status === AcceptStatus.CLEAN_UP_PENDING) {
            setStatus(AcceptStatus.CLEANING_UP);

            const proceed = async () => {
                await unsubscribe(acceptState.unsubscriber!);
                setAcceptState({
                    ...acceptState,
                    status: AcceptStatus.DONE,
                    unsubscriber: null
                });
            };
            proceed();
        }
    }, [ acceptState, setStatus, setAcceptState ]);

    const closeAndRefresh = useCallback(() => {
        refreshRequests!();
        props.clearRequestToAccept();
    }, [ refreshRequests, props ]);

    const cancel = useCallback(() => {
        setStatus(AcceptStatus.NONE);
        props.clearRequestToAccept();
    }, [ setStatus, props ]);

    if(props.requestToAccept === null) {
        return null;
    }

    return (
        <div>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.NONE
                            || acceptState.status === AcceptStatus.ACCEPTANCE_PENDING
                            || acceptState.status === AcceptStatus.ACCEPTING }
                closeCallback={ cancel }
                title={ `Accept request ${props.requestToAccept.id}` }
                mayProceed={ acceptState.status === AcceptStatus.NONE }
                proceedCallback={ () => setStatus(AcceptStatus.ACCEPTANCE_PENDING) }
                stepTestId={ `modal-accepting-${props.requestToAccept.id}` }
                proceedButtonTestId={ `proceed-accept-${props.requestToAccept.id}` }
            >
                <Alert variant="info">
                    <p>You are about to execute the following steps:</p>
                    <ol>
                        <li>accept the request</li>
                        <li>create an asset</li>
                        <li>set asset's metadata</li>
                        <li>issue { props.requestToAccept.bars } tokens
                        on account { props.requestToAccept.requesterAddress }.</li>
                    </ol>
                    <p>Each step will require your signature and may take several seconds.</p>
                </Alert>
                <Alert variant="warning">
                    <p>Once started, the process has to be completed with no interruption.</p>
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.ACCEPTED }
                title={ `Issuing tokens for request ${props.requestToAccept.id}` }
                mayProceed={ true }
                proceedCallback={ () => setStatus(AcceptStatus.ASSET_CREATION_PENDING) }
                stepTestId={`modal-accepted-${props.requestToAccept.id}`}
                proceedButtonTestId={`proceed-create-${props.requestToAccept.id}`}
            >
                <Alert variant="success">
                    <p>Request successfully accepted, you may now proceed with creating the asset.</p>
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.CREATING_ASSET }
                title={ `Creating asset for request ${props.requestToAccept.id}` }
                mayProceed={ isFinalized(assetCreationResult) }
                proceedCallback={ () => setStatus(AcceptStatus.SET_METADATA_PENDING) }
                stepTestId={ `modal-creating-${props.requestToAccept.id}` }
                proceedButtonTestId={ `proceed-metadata-${props.requestToAccept.id}` }
            >
                <ExtrinsicSubmissionResult
                    result={assetCreationResult}
                    error={assetCreationError}
                    successMessage="Asset successfully created, you may now proceed by setting asset's metadata."
                />
            </ProcessStep>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.SETTING_METADATA }
                title={ `Setting metadata for request ${props.requestToAccept.id}` }
                mayProceed={ isFinalized(setMetadataResult) }
                proceedCallback={ () => setStatus(AcceptStatus.MINTING_PENDING) }
                stepTestId={ `modal-setting-${props.requestToAccept.id}` }
                proceedButtonTestId={ `proceed-minting-${props.requestToAccept.id}` }
            >
                <ExtrinsicSubmissionResult
                    result={setMetadataResult}
                    error={setMetadataError}
                    successMessage="Metadata successfully set, you may now proceed by minting tokens."
                />
            </ProcessStep>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.MINTING }
                title={ `Minting tokens for request ${props.requestToAccept.id}` }
                mayProceed={ isFinalized(mintingResult) }
                proceedCallback={ () => setStatus(AcceptStatus.CLEAN_UP_PENDING) }
                stepTestId={`modal-minting-${props.requestToAccept.id}`}
                proceedButtonTestId={`proceed-review-${props.requestToAccept.id}`}
            >
                <ExtrinsicSubmissionResult
                    result={mintingResult}
                    error={mintingError}
                    successMessage="Tokens successfully minted, you may now review the report."
                />
            </ProcessStep>
            <ProcessStep
                active={ acceptState.status === AcceptStatus.DONE }
                closeCallback={ closeAndRefresh }
                title={ `Token issuance ${props.requestToAccept.id}]`}
                stepTestId={ `modal-review-${props.requestToAccept.id}` }
                closeButtonTestId={ `close-review-${props.requestToAccept.id}` }
            >
                <div>
                    <p>Asset { acceptState.assetId?.toString() } was successfully created.</p>
                    <p>Asset has name and symbol { props.requestToAccept.requestedTokenName },
                    token amounts may have up to { DEFAULT_ASSETS_DECIMALS } decimals.</p>
                    <p>{ props.requestToAccept.bars } tokens were successfully minted
                    on account { props.requestToAccept.requesterAddress }.</p>
                </div>
            </ProcessStep>
        </div>
    );
}
