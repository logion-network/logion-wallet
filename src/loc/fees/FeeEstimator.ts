import { Fees, Hash } from "@logion/node-api";
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
        const termsAndConditions: TermsAndConditionsElement[] = [];
        if(item.logionClassification) {
            termsAndConditions.push(item.logionClassification);
        } else if (item.creativeCommons) {
            termsAndConditions.push(item.creativeCommons);
        }

        if(item.specificLicense) {
            termsAndConditions.push(item.specificLicense);
        }

        const submittable = this.client.logionApi.polkadot.tx.logionLoc.addCollectionItem(
            this.client.logionApi.adapters.toLocId(loc.id),
            this.client.logionApi.adapters.toH256(item.id!),
            this.client.logionApi.adapters.toH256(Hash.of(item.description)),
            item.files.map(file => ({
                name: Hash.of(file.name),
                contentType: Hash.of(file.contentType.mimeType),
                size: file.size,
                hash: file.hashOrContent.contentHash,
            })).map(file => this.client.logionApi.adapters.toCollectionItemFile(file)),
            this.client.logionApi.adapters.toCollectionItemToken(item.token ? {
                id: Hash.of(item.token.id),
                type: Hash.of(item.token.type),
                issuance: item.token.issuance,
            } : undefined),
            item.restrictedDelivery,
            termsAndConditions.map(element => this.client.logionApi.adapters.toTermsAndConditionsElement({
                tcType: Hash.of(element.type),
                tcLocId: element.tcLocId,
                details: Hash.of(element.details),
            })),
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
