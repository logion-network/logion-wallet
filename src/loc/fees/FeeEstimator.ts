import { Adapters, Fees, TermsAndConditionsElement as ChainTermsAndConditionsElement } from "@logion/node-api";
import { SubmittableExtrinsic } from "@polkadot/api/promise/types";
import { LocData, LogionClient, TermsAndConditionsElement } from "@logion/client";
import { CollectionLimits, DEFAULT_LIMITS } from "../CollectionLimitsForm";
import { Item } from "../ImportItemDetails";

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

    async estimateAddItem(loc: LocData, item: Item) {
        const termsAndConditions: ChainTermsAndConditionsElement[] = [];

        const addTC = (tc: TermsAndConditionsElement) => {
            termsAndConditions.push({
                tcType: tc.type,
                tcLocId: tc.tcLocId,
                details: tc.details,
            })
        };

        if(item.logionClassification) {
            addTC(item.logionClassification);
        } else if (item.creativeCommons) {
            addTC(item.creativeCommons);
        }

        if(item.specificLicense) {
            addTC(item.specificLicense);
        }

        const submittable = this.client.logionApi.polkadot.tx.logionLoc.addCollectionItem(
            this.client.logionApi.adapters.toLocId(loc.id),
            item.id,
            item.description,
            item.files.map(file => ({
                name: file.name,
                contentType: file.contentType.mimeType,
                size: file.size,
                hash: file.hashOrContent.contentHash,
            })).map(Adapters.toCollectionItemFile),
            Adapters.toCollectionItemToken(item.token),
            item.restrictedDelivery,
            termsAndConditions.map(Adapters.toTermsAndConditionsElement),
        );

        const origin = loc.requesterAddress?.address;
        if(!origin) {
            throw new Error("Bad origin");
        }
        const inclusionFee = (await this.client.logionApi.fees.estimateWithoutStorage({
            origin,
            submittable
        })).inclusionFee;
        const certificateFee = await this.client.logionApi.fees.estimateCertificateFee({ tokenIssuance: item.token?.issuance || 0n });
        const storageFee = await this.client.logionApi.fees.estimateStorageFee({
            numOfEntries: BigInt(item.files.length),
            totSize: item.files.map(file => file.size).reduce((prev, cur) => prev + cur, 0n),
        });
        return new Fees({
            inclusionFee,
            certificateFee,
            storageFee,
        });
    }
}
