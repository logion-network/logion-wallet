import queryString, { ParsedQuery } from 'query-string';

export interface PublicItem {
    description: string;
    content: string;
}

export interface PrivateItem {
    publicDescription: string;
    privateDescription: string;
    hash: string;
}

export type Language = 'en' | 'fr';

export type AmountType = 'cost' | 'base' | 'taxExcluded' | 'tax' | 'taxIncluded';

export interface FormValues {
    containingLocId: string;
    timestampText: string;
    requesterText: string;
    amount: Record<AmountType, number>;
}

export interface PathModel extends FormValues {
    language: Language;
    polkadotAddress: string;
    postalAddressLine1: string;
    postalAddressLine2: string;
    postalAddressLine3: string;
    postalAddressLine4: string;
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    shortPostalAddress: string;
    requesterAddress: string;
    nodeAddress: string;
    locId: string;
    certificateUrl: string;
    publicItems: PublicItem[];
    privateItems: PrivateItem[];
    logoUrl: string;
}

export const DEFAULT_PATH_MODEL: PathModel = {
    language: "en",
    polkadotAddress: "",
    postalAddressLine1: "",
    postalAddressLine2: "",
    postalAddressLine3: "",
    postalAddressLine4: "",
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    shortPostalAddress: "",
    requesterAddress: "",
    nodeAddress: "",
    locId: "",
    certificateUrl: "",
    publicItems: [],
    privateItems: [],
    logoUrl: "",
    containingLocId: "",
    timestampText: "",
    requesterText: "",
    amount: {
        cost: 0,
        base: 0,
        taxExcluded: 0,
        tax: 0,
        taxIncluded: 0,
    }
}

class ParamsBuilder {
    private params: string[] = []

    param(name: string, value: string): ParamsBuilder {
        this.params.push(`${ name }=${ encodeURIComponent(value) }`)
        return this
    }

    build() {
        return `?${this.params.join("&")}`
    }
}

export function toSearchString(pathModel: PathModel): string {
    const builder = new ParamsBuilder()

    builder
        .param("lang", pathModel.language)
        .param("polkadot_address", pathModel.polkadotAddress)
        .param("postal_line1", pathModel.postalAddressLine1)
        .param("postal_line2", pathModel.postalAddressLine2)
        .param("postal_line3", pathModel.postalAddressLine3)
        .param("postal_line4", pathModel.postalAddressLine4)
        .param("email", pathModel.email)
        .param("first_name", pathModel.firstName)
        .param("last_name", pathModel.lastName)
        .param("company", pathModel.company)
        .param("short_postal_address", pathModel.shortPostalAddress)
        .param("node_address", pathModel.nodeAddress)
        .param("loc_id", pathModel.locId)
        .param("certificate_url", pathModel.certificateUrl)
        .param("requester", pathModel.requesterAddress)
        .param("logo", pathModel.logoUrl)

    for (const item of pathModel.publicItems) {
        builder
            .param("public_item_description", item.description)
            .param("public_item_content", item.content)
    }

    for (const item of pathModel.privateItems) {
        builder
            .param("private_item_public_description", item.publicDescription)
            .param("private_item_private_description", item.privateDescription)
            .param("private_item_hash", item.hash)
    }

    builder
        .param("containing_loc_id", pathModel.containingLocId)
        .param("timestamp_text", pathModel.timestampText)
        .param("requester_text", pathModel.requesterText)
        .param("amount_cost", "" + pathModel.amount.cost)
        .param("amount_base", "" + pathModel.amount.base)
        .param("amount_tax_excluded", "" + pathModel.amount.taxExcluded)
        .param("amount_tax", "" + pathModel.amount.tax)
        .param("amount_tax_included", "" + pathModel.amount.taxIncluded)

    return builder.build()
}

class ParamsParser {
    private readonly params: ParsedQuery;

    constructor(searchString: string) {
        this.params = queryString.parse(searchString);
    }

    value(name: string) {
        return this.params[name];
    }

    valueAsString(name: string): string {
        return decodeURIComponent(this.params[name] as string);
    }

    valueAsNumber(name: string): number {
        return parseFloat(this.valueAsString(name));
    }
}

export function parseSearchString(searchString: string): PathModel {
    if(searchString) {
        const parser = new ParamsParser(searchString)

        let publicItems: PublicItem[] = [];
        const publicDescriptions = parser.value('public_item_description');
        const publicContents = parser.value('public_item_content');
        if(publicDescriptions !== null && publicContents !== null) {
            if(Array.isArray(publicDescriptions) && Array.isArray(publicContents)) {
                for(let i = 0; i < publicDescriptions.length && i < publicContents.length; ++i) {
                    const description = publicDescriptions[i];
                    const content = publicContents[i];
                    if(description && content) {
                        publicItems.push({
                            description: decodeURIComponent(description),
                            content: decodeURIComponent(content),
                        });
                    }
                }
            } else {
                const description = publicDescriptions as string;
                const content = publicContents as string;
                if(description && content) {
                    publicItems.push({
                        description: decodeURIComponent(description),
                        content: decodeURIComponent(content),
                    });
                }
            }
        }

        let privateItems: PrivateItem[] = [];
        const privatePublicDescriptions = parser.value('private_item_public_description');
        const privatePrivateDescriptions = parser.value('private_item_private_description');
        const privateHashes = parser.value('private_item_hash');
        if(privatePublicDescriptions !== null && privatePrivateDescriptions !== null && privateHashes !== null) {
            if(Array.isArray(privatePublicDescriptions) && Array.isArray(privatePrivateDescriptions) && Array.isArray(privateHashes)) {
                for(let i = 0; i < privatePublicDescriptions.length && i < privatePrivateDescriptions.length && i < privateHashes.length; ++i) {
                    const publicDescription = privatePublicDescriptions[i];
                    const privateDescription = privatePrivateDescriptions[i];
                    const hash = privateHashes[i];
                    if(publicDescription && privateDescription && hash) {
                        privateItems.push({
                            publicDescription: decodeURIComponent(publicDescription),
                            privateDescription: decodeURIComponent(privateDescription),
                            hash: decodeURIComponent(hash),
                        });
                    }
                }
            } else {
                const publicDescription = privatePublicDescriptions as string;
                const privateDescription = privatePrivateDescriptions as string;
                const hash = privateHashes as string;
                if(publicDescription && privateDescription && hash) {
                    privateItems.push({
                        publicDescription: decodeURIComponent(publicDescription),
                        privateDescription: decodeURIComponent(privateDescription),
                        hash: decodeURIComponent(hash),
                    });
                }
            }
        }

        return {
            language: parser.value('lang') as Language,
            polkadotAddress: parser.valueAsString('polkadot_address'),
            postalAddressLine1: parser.valueAsString('postal_line1'),
            postalAddressLine2: parser.valueAsString('postal_line2'),
            postalAddressLine3: parser.valueAsString('postal_line3'),
            postalAddressLine4: parser.valueAsString('postal_line4'),
            email: parser.valueAsString('email'),
            firstName: parser.valueAsString('first_name'),
            lastName: parser.valueAsString('last_name'),
            company: parser.valueAsString('company'),
            shortPostalAddress: parser.valueAsString('short_postal_address'),
            requesterAddress: parser.valueAsString('requester'),
            nodeAddress: parser.valueAsString('node_address'),
            locId: parser.valueAsString('loc_id'),
            certificateUrl: parser.valueAsString('certificate_url'),
            logoUrl: parser.valueAsString('logo'),
            publicItems,
            privateItems,
            containingLocId: parser.valueAsString('containing_loc_id'),
            timestampText: parser.valueAsString('timestamp_text'),
            requesterText: parser.valueAsString('requester_text'),
            amount: {
                cost: parser.valueAsNumber('amount_cost'),
                base: parser.valueAsNumber('amount_base'),
                taxExcluded: parser.valueAsNumber('amount_tax_excluded'),
                tax: parser.valueAsNumber('amount_tax'),
                taxIncluded: parser.valueAsNumber('amount_tax_included'),
            },
        };
    } else {
        return DEFAULT_PATH_MODEL;
    }
}