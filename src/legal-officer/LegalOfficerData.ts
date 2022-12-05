import { LogionNodeApi } from "@logion/node-api";
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { base58Encode, base58Decode } from "@polkadot/util-crypto";
import { u8aToHex, stringToU8a } from "@polkadot/util";
import { PalletLoAuthorityListLegalOfficerData } from "@polkadot/types/lookup";

export interface LegalOfficerData {
    nodeId?: string;
    baseUrl?: string;
}

export async function getLegalOfficerData(args: { api: LogionNodeApi, address: string }): Promise<LegalOfficerData> {
    const { api, address } = args;
    let onchainSettings: LegalOfficerData = {};
    const legalOfficerData = await api.query.loAuthorityList.legalOfficerSet(address);
    if(legalOfficerData.isSome) {
        let nodeId: string | undefined;
        if(legalOfficerData.unwrap().asHost.nodeId.isSome) {
            const opaquePeerId = legalOfficerData.unwrap().asHost.nodeId.unwrap();
            nodeId = base58Encode(opaquePeerId);
        }

        let baseUrl: string | undefined;
        if(legalOfficerData.unwrap().asHost.baseUrl.isSome) {
            const urlBytes = legalOfficerData.unwrap().asHost.baseUrl.unwrap();
            baseUrl = urlBytes.toUtf8();
        }

        onchainSettings = { baseUrl, nodeId };
    }
    return onchainSettings;
}

export function updateLegalOfficerDataExtrinsic(args: {
    api: LogionNodeApi,
    address: string,
    legalOfficerData: LegalOfficerData,
}): SubmittableExtrinsic {
    const { api, address, legalOfficerData } = args;

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

    const data = api.createType<PalletLoAuthorityListLegalOfficerData>("PalletLoAuthorityListLegalOfficerData", { Host: { nodeId, baseUrl } });
    return api.tx.loAuthorityList.updateLegalOfficer(address, data);
}
