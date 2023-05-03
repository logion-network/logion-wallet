import { LogionNodeApiClass } from "@logion/node-api";
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { base58Encode, base58Decode } from "@polkadot/util-crypto";
import { u8aToHex, stringToU8a } from "@polkadot/util";
import { PalletLoAuthorityListLegalOfficerData } from "@polkadot/types/lookup";

/**
 * @deprecated use type in @logion/node-api
 */
export interface LegalOfficerData {
    hostData?: Partial<HostData>;
    isHost?: boolean;
    hostAddress?: string;
    guests?: string[];
}

/**
 * @deprecated use type in @logion/node-api
 */
export interface HostData {
    nodeId: string | null;
    baseUrl: string | null;
}

/**
 * @deprecated use api.queries.getLegalOfficerData(address)
 */
export async function getLegalOfficerData(args: { api: LogionNodeApiClass, address: string }): Promise<LegalOfficerData> {
    const { api, address } = args;
    let onchainSettings: LegalOfficerData = {};
    const legalOfficerData = await api.polkadot.query.loAuthorityList.legalOfficerSet(address);
    if(legalOfficerData.isSome) {
        const someLegalOfficerData = legalOfficerData.unwrap();
        if(someLegalOfficerData.isHost) {
            const hostData = toHostData(someLegalOfficerData);
            onchainSettings = {
                hostData,
                isHost: true,
                guests: await getGuestsOf({ api, address }),
            };
        } else {
            const hostAddress = someLegalOfficerData.asGuest.toString();
            const hostLegalOfficerData = await api.polkadot.query.loAuthorityList.legalOfficerSet(hostAddress);
            const hostData = toHostData(hostLegalOfficerData.unwrap());
            onchainSettings = {
                hostData,
                isHost: false,
                hostAddress,
            };
        }
    }
    return onchainSettings;
}

/**
 * @deprecated use api.adapters.toHostData(legalOfficerData)
 */
function toHostData(legalOfficerData: PalletLoAuthorityListLegalOfficerData): Partial<HostData> {
    let nodeId: string | undefined;
    if(legalOfficerData.asHost.nodeId.isSome) {
        const opaquePeerId = legalOfficerData.asHost.nodeId.unwrap();
        nodeId = base58Encode(opaquePeerId);
    }

    let baseUrl: string | undefined;
    if(legalOfficerData.asHost.baseUrl.isSome) {
        const urlBytes = legalOfficerData.asHost.baseUrl.unwrap();
        baseUrl = urlBytes.toUtf8();
    }

    return { baseUrl, nodeId };
}

async function getGuestsOf(args: { api: LogionNodeApiClass, address: string }): Promise<string[]> {
    const { api, address } = args;
    const legalOfficerData = await api.polkadot.query.loAuthorityList.legalOfficerSet.entries();
    return legalOfficerData
        .filter(entry => entry[1].isSome)
        .filter(entry => entry[1].unwrap().isGuest)
        .filter(entry => entry[1].unwrap().asGuest.toString() === address)
        .map(entry => entry[0].args[0].toString());
}

/**
 * @deprecated use directly api.polkadot.tx.loAuthorityList.updateLegalOfficer(address, legalOfficerData)
 */
export function updateLegalOfficerDataExtrinsic(args: {
    api: LogionNodeApiClass,
    address: string,
    legalOfficerData: PalletLoAuthorityListLegalOfficerData,
}): SubmittableExtrinsic {
    const { api, address, legalOfficerData } = args;
    return api.polkadot.tx.loAuthorityList.updateLegalOfficer(address, legalOfficerData);
}

/**
 * @deprecated use api.adapters.toPalletLoAuthorityListLegalOfficerDataHost(legalOfficerData)
 */
export function toPalletLoAuthorityListLegalOfficerDataHost(api: LogionNodeApiClass, legalOfficerData: Partial<HostData>): PalletLoAuthorityListLegalOfficerData {
    let nodeId: string | null = null;
    if(legalOfficerData.nodeId) {
        const opaquePeerId = base58Decode(legalOfficerData.nodeId);
        nodeId = u8aToHex(opaquePeerId);
    }

    let baseUrl: string | null = null;
    if(legalOfficerData.baseUrl) {
        const urlBytes = stringToU8a(legalOfficerData.baseUrl);
        baseUrl = u8aToHex(urlBytes);
    }
    return api.polkadot.createType<PalletLoAuthorityListLegalOfficerData>("PalletLoAuthorityListLegalOfficerData", { Host: { nodeId, baseUrl } });
}
