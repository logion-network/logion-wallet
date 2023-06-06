import { Fees } from "@logion/node-api";
import { SubmittableExtrinsic } from "@polkadot/api/promise/types";
import { LocData, LogionClient } from "@logion/client";
import { CollectionLimits, DEFAULT_LIMITS } from "../CollectionLimitsForm";

export class FeeEstimator {

    private readonly client: LogionClient;

    constructor(client: LogionClient) {
        this.client = client;
    }

    async estimateCreateLoc(request: LocData, limits?: CollectionLimits): Promise<Fees> {
        const client = this.client;
        const locId = client.logionApi.adapters.toLocId(request.id);
        let submittable: SubmittableExtrinsic;
        if(request.locType === "Collection") {
            const apiLimits = limits ?
                await limits.toApiLimits(client.logionApi) :
                await DEFAULT_LIMITS.toApiLimits(client.logionApi) ;
            submittable = client.logionApi.polkadot.tx.logionLoc.createCollectionLoc(
                locId,
                request.ownerAddress,
                apiLimits.collectionLastBlockSubmission || null,
                apiLimits.collectionMaxSize || null,
                apiLimits.collectionCanUpload,
            );
        } else if(request.locType === "Identity") {
            if(request.requesterAddress) {
                submittable = client.logionApi.polkadot.tx.logionLoc.createPolkadotIdentityLoc(
                    locId,
                    request.ownerAddress,
                );
            } else {
                submittable = client.logionApi.polkadot.tx.logionLoc.createLogionIdentityLoc(
                    locId,
                );
            }
        } else if(request.locType === "Transaction") {
            if(request.requesterAddress) {
                submittable = client.logionApi.polkadot.tx.logionLoc.createPolkadotTransactionLoc(
                    locId,
                    request.ownerAddress,
                );
            } else if(request.requesterLocId) {
                submittable = client.logionApi.polkadot.tx.logionLoc.createLogionTransactionLoc(
                    locId,
                    client.logionApi.adapters.toNonCompactLocId(request.requesterLocId),
                );
            } else {
                throw new Error("Transaction LOC without requester");
            }
        } else {
            throw new Error("Unsupported LOC type");
        }

        return await client.logionApi.fees.estimateCreateLoc({
            origin: client.currentAddress?.address || "",
            locType: request.locType,
            submittable,
        });
    }
}
