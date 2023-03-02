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

export const CUSTOM_LOC_TEMPLATE_ID = "specific";

export const CUSTOM_LOC_TEMPLATE = {
    id: CUSTOM_LOC_TEMPLATE_ID,
    name: "Custom LOC",
    icon: {
        id: "empty-loc",
    },
    documents: [],
    metadata: [],
    links: [],
};

export const TEMPLATES: Record<LocType, LocTemplate[]> = {
    Identity: [
        {
            id: "individual_identity",
            name: "Identity LOC for individuals",
            icon: {
                id: "empty-loc",
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
                id: "empty-loc",
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
                id: "empty-loc",
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
            id: "art_nft",
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
            id: "real_estate",
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
                id: "empty-loc",
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

export function autoSelectTemplate(locType: LocType): string | undefined {
    const templates = TEMPLATES[locType];
    if(templates.length === 1 && templates[0].id === CUSTOM_LOC_TEMPLATE_ID) {
        return CUSTOM_LOC_TEMPLATE_ID;
    } else {
        return undefined;
    }
}

export function backendTemplate(templateId: string | undefined): string | undefined {
    return templateId === CUSTOM_LOC_TEMPLATE_ID ? undefined : templateId;
}

export function getTemplate(locType: LocType, templateId: string | undefined): LocTemplate | undefined {
    return TEMPLATES[locType].find(template => template.id === templateId);
}
