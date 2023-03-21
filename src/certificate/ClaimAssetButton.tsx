import { Token, CollectionItem, TokensRecord, TypedFile } from "@logion/client";
import { UUID } from "@logion/node-api";
import { AxiosInstance } from "axios";
import { useState, useEffect } from "react";
import ViewFileButton from "../common/ViewFileButton";
import {
    getCollectionFile,
    getCollectionItemFile,
    GetCollectionItemFileParameters,
    GetTokensRecordFileParameters,
    getTokensRecordFile
} from "../loc/FileModel";
import Icon from "src/common/Icon";

import './ClaimAssetButton.css';

export type ClaimedFileType = "Collection" | "Item" | "TokensRecord";

export interface ClaimedFile {
    name: string;
    hash: string;
    type: ClaimedFileType;
}

export interface Props {
    locId: UUID,
    owner: string,
    item: CollectionItem,
    record?: TokensRecord,
    file: ClaimedFile,
    tokenForDownload: Token | undefined,
}

export default function ClaimAssetButton(props: Props) {
    const { locId, owner, item, file, tokenForDownload, record } = props;
    const [ downloaded, setDownloaded ] = useState(false);

    useEffect(() => {
        if (tokenForDownload === undefined && downloaded) {
            setDownloaded(false);
        }
    }, [ downloaded, tokenForDownload ]);

    return (
        <div className="ClaimAssetButton">
            {
                tokenForDownload !== undefined && !downloaded &&
                <ViewFileButton
                    nodeOwner={ owner }
                    fileName={ file.name }
                    token={ tokenForDownload }
                    downloader={ (axios: AxiosInstance) => {
                        setDownloaded(true);
                        return getClaimedFile(
                            axios,
                            file.type,
                            {
                                locId: locId.toString(),
                                collectionItemId: item.id,
                                hash: file.hash,
                                recordId: record?.id
                            }
                        )
                    }}
                    limitIconSize={ false }
                    noPaddingOverride={ true }
                >
                    <Icon icon={{ id: "download_claimed" }} height="24px" /> { buttonText(file.type) }
                </ViewFileButton>
            }
            {
                tokenForDownload !== undefined && downloaded &&
                <span className="download-started">Download started</span>
            }
        </div>
    )
}

async function getClaimedFile(
    axios: AxiosInstance,
    fileType: ClaimedFileType,
    parameters: GetCollectionItemFileParameters | GetTokensRecordFileParameters
): Promise<TypedFile> {
    if(fileType === "Item") {
        return getCollectionItemFile(axios, parameters);
    } else if (fileType === "Collection") {
        return getCollectionFile(axios, parameters);
    } else {
        return getTokensRecordFile(axios, parameters as GetTokensRecordFileParameters);
    }
}

function buttonText(fileType: ClaimedFileType) {
    if(fileType === "Item") {
        return "Claim your asset";
    } else {
        return "Claim document";
    }
}
