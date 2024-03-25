import { LocType } from "@logion/node-api";
import { Icon } from "src/common/ColorTheme";

export interface LocTemplate {
    id: string;
    name: string;
    icon: Icon;
    documents: LocTemplateDocumentOrLink[];
    metadata: LocTemplateMetadataItem[];
    links: LocTemplateDocumentOrLink[];
}

export interface LocTemplateDocumentOrLink {
    publicDescription: string;
}

export interface LocTemplateMetadataItem {
    name: string;
}

export const CUSTOM_LOC_TEMPLATE_ID = "custom";

export const FALLBACK_ICON_ID = "empty-loc";

export const CUSTOM_LOC_TEMPLATE = {
    id: CUSTOM_LOC_TEMPLATE_ID,
    name: "Custom LOC",
    icon: {
        id: FALLBACK_ICON_ID,
    },
    documents: [],
    metadata: [],
    links: [],
};

export const COLLECTION_ART_NFT_TEMPLATE_ID = "art_nft";
export const COLLECTION_REAL_ESTATE_TEMPLATE_ID = "real_estate";

export const TEMPLATES: Record<LocType, LocTemplate[]> = {
    Identity: [
        {
            id: "individual_identity",
            name: "Identity LOC for individuals",
            icon: {
                id: "identity_loc",
            },
            documents: [
                {
                    publicDescription: "Identity LOC process and related obligations signed by the Requester",
                },
                {
                    publicDescription: "Proof of identity",
                },
            ],
            metadata: [],
            links: [],
        },
        {
            id: "company_identity",
            name: "Identity LOC for companies",
            icon: {
                id: "identity_loc",
            },
            documents: [
                {
                    publicDescription: "Identity LOC process and related obligations signed by the Requester",
                },
                {
                    publicDescription: "Proof of identity",
                },
                {
                    publicDescription: "Proof of company existence",
                },
                {
                    publicDescription: "Proof of capacity to engage the company",
                },
            ],
            metadata: [],
            links: [],
        },
        {
            id: "issuer_identity",
            name: "Identity LOC for Verified Issuers",
            icon: {
                id: "identity_loc",
            },
            documents: [
                {
                    publicDescription: "Identity LOC process and related obligations signed by the Requester",
                },
                {
                    publicDescription: "Proof of identity",
                },
                {
                    publicDescription: "Proof of professional capacity",
                },
            ],
            metadata: [],
            links: [],
        },
        CUSTOM_LOC_TEMPLATE
    ],
    Collection: [
        {
            id: COLLECTION_ART_NFT_TEMPLATE_ID,
            name: "Art NFT",
            icon: {
                id: "art_nft",
            },
            documents: [
                {
                    publicDescription: "Contract between token creator and artist"
                },
                {
                    publicDescription: "Collection LOC process and related obligations signed by the Requester"
                },
            ],
            metadata: [
                {
                    name: "Collection description",
                },
                {
                    name: "Requester address bound to smart contract",
                },
                {
                    name: "Requester address bound to token minting",
                },
            ],
            links: [
                {
                    publicDescription: "Company and director verification"
                }
            ]
        },
        {
            id: COLLECTION_REAL_ESTATE_TEMPLATE_ID,
            name: "Real Estate Tokenization",
            icon: {
                id: "real_estate",
            },
            documents: [
                {
                    publicDescription: "Contract between token creator and real estate owner"
                },
                {
                    publicDescription: "Real estate existence proof"
                },
                {
                    publicDescription: "Collection LOC process and related obligations signed by the Requester"
                },
            ],
            metadata: [
                {
                    name: "Real estate project description",
                },
                {
                    name: "Requester address bound to smart contract",
                },
                {
                    name: "Requester address bound to token minting",
                },
            ],
            links: [
                {
                    publicDescription: "Company and director verification"
                }
            ]
        },
        CUSTOM_LOC_TEMPLATE
    ],
    Transaction: [
        {
            id: "statement_of_facts",
            name: "Statement of Facts",
            icon: {
                id: "sof_loc",
            },
            documents: [
                {
                    publicDescription: "Statement of fact"
                },
                {
                    publicDescription: "Engagement letter from the Requester"
                },
            ],
            metadata: [],
            links: [],
        },
        CUSTOM_LOC_TEMPLATE
    ],
};

export function getTemplate(locType: LocType, templateId: string | undefined): LocTemplate | undefined {
    return TEMPLATES[locType].find(template => template.id === templateId);
}
