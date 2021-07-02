import {
    signAndSend as signAndSendMock,
    createAsset as createAssetMock,
    setAssetMetadata as setAssetMetadataMock,
    mintAmount as mintAmountMock,
    mintTokens as mintTokensMock,
    replaceUnsubscriber as replaceUnsubscriberMock,
    useLogionChain as useLogionChainMock,
    isExtensionAvailable as isExtensionAvailableMock,
    setRecommendedExtension as setRecommendedExtensionMock,
    recommendedExtension as recommendedExtensionMock,
    LogionChainContextProvider as LogionChainContextProviderMock,
    sign as signMock,
    isFinalized as isFinalizedMock,
    unsubscribe as unsubscribeMock,
} from './LogionChainMock';

export const signAndSend = signAndSendMock;
export const createAsset = createAssetMock;
export const setAssetMetadata = setAssetMetadataMock;
export const mintAmount = mintAmountMock;
export const mintTokens = mintTokensMock;
export const replaceUnsubscriber = replaceUnsubscriberMock;
export const useLogionChain = useLogionChainMock;
export const isExtensionAvailable = isExtensionAvailableMock;
export const setRecommendedExtension = setRecommendedExtensionMock;
export const recommendedExtension = recommendedExtensionMock;
export const LogionChainContextProvider = LogionChainContextProviderMock;
export const sign = signMock;
export const isFinalized = isFinalizedMock;
export const unsubscribe = unsubscribeMock;
export const DEFAULT_ASSETS_DECIMALS = jest.requireActual("../Assets").DEFAULT_ASSETS_DECIMALS;
export const tokensFromBalance = jest.requireActual("../Assets").tokensFromBalance;
