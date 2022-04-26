import queryString from 'query-string';

export interface PublicItem {
    description: string;
    content: string;
}

export interface PrivateItem {
    publicDescription: string;
    privateDescription: string;
    hash: string;
}

export interface PathModel {
    language: string;
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
};

export function toSearchString(pathModel: PathModel): string {
    const params: string[] = [];

    params.push(`lang=${pathModel.language}`);
    params.push(`polkadot_address=${pathModel.polkadotAddress}`);
    params.push(`postal_line1=${pathModel.postalAddressLine1}`);
    params.push(`postal_line2=${pathModel.postalAddressLine2}`);
    params.push(`postal_line3=${pathModel.postalAddressLine3}`);
    params.push(`postal_line4=${pathModel.postalAddressLine4}`);
    params.push(`email=${pathModel.email}`);
    params.push(`first_name=${pathModel.firstName}`);
    params.push(`last_name=${pathModel.lastName}`);
    params.push(`company=${pathModel.company}`);
    params.push(`short_postal_address=${pathModel.shortPostalAddress}`);
    params.push(`node_address=${pathModel.nodeAddress}`);
    params.push(`loc_id=${pathModel.locId}`);
    params.push(`certificate_url=${pathModel.certificateUrl}`);
    params.push(`requester=${pathModel.requesterAddress}`);

    for(const item of pathModel.publicItems) {
        params.push(`public_item_description=${item.description}`);
        params.push(`public_item_content=${item.content}`);
    }

    for(const item of pathModel.privateItems) {
        params.push(`private_item_public_description=${item.publicDescription}`);
        params.push(`private_item_private_description=${item.privateDescription}`);
        params.push(`private_item_hash=${item.hash}`);
    }

    return `?${params.join("&")}`;
}

export function parseSearchString(searchString: string): PathModel {
    if(searchString) {
        const params = queryString.parse(searchString);

        let publicItems: PublicItem[] = [];
        const publicDescriptions = params['public_item_description'];
        const publicContents = params['public_item_content'];
        if(publicDescriptions !== null && publicContents !== null) {
            if(Array.isArray(publicDescriptions) && Array.isArray(publicContents)) {
                for(let i = 0; i < publicDescriptions.length && i < publicContents.length; ++i) {
                    const description = publicDescriptions[i];
                    const content = publicContents[i];
                    if(description !== null && content !== null) {
                        publicItems.push({
                            description,
                            content,
                        });
                    }
                }
            } else {
                const description = publicDescriptions as string;
                const content = publicContents as string;
                if(description !== null && content !== null) {
                    publicItems.push({
                        description,
                        content,
                    });
                }
            }
        }

        let privateItems: PrivateItem[] = [];
        const privatePublicDescriptions = params['private_item_public_description'];
        const privatePrivateDescriptions = params['private_item_private_description'];
        const privateHashes = params['private_item_hash'];
        if(privatePublicDescriptions !== null && privatePrivateDescriptions !== null && privateHashes !== null) {
            if(Array.isArray(privatePublicDescriptions) && Array.isArray(privatePrivateDescriptions) && Array.isArray(privateHashes)) {
                for(let i = 0; i < privatePublicDescriptions.length && i < privatePrivateDescriptions.length && privateHashes.length; ++i) {
                    const publicDescription = privatePublicDescriptions[i];
                    const privateDescription = privatePrivateDescriptions[i];
                    const hash = privateHashes[i];
                    if(publicDescription !== null && privateDescription !== null && hash !== null) {
                        privateItems.push({
                            publicDescription,
                            privateDescription,
                            hash,
                        });
                    }
                }
            } else {
                const publicDescription = privatePublicDescriptions as string;
                const privateDescription = privatePrivateDescriptions as string;
                const hash = privateHashes as string;
                if(publicDescription !== null && privateDescription !== null && hash !== null) {
                    privateItems.push({
                        publicDescription,
                        privateDescription,
                        hash,
                    });
                }
            }
        }

        return {
            language: params['lang'] as string,
            polkadotAddress: params['polkadot_address'] as string,
            postalAddressLine1: params['postal_line1'] as string,
            postalAddressLine2: params['postal_line2'] as string,
            postalAddressLine3: params['postal_line3'] as string,
            postalAddressLine4: params['postal_line4'] as string,
            email: params['email'] as string,
            firstName: params['first_name'] as string,
            lastName: params['last_name'] as string,
            company: params['company'] as string,
            shortPostalAddress: params['short_postal_address'] as string,
            requesterAddress: params['requester'] as string,
            nodeAddress: params['node_address'] as string,
            locId: params['loc_id'] as string,
            certificateUrl: params['certificate_url'] as string,
            publicItems,
            privateItems,
        };
    } else {
        return DEFAULT_PATH_MODEL;
    }
}
