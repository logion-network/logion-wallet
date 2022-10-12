import { AxiosInstance } from "axios";

import Button from "./Button";

import { TypedFile } from "../loc/FileModel";
import Icon from "./Icon";

import './ViewFileButton.css';
import { Children, customClassName } from "./types/Helpers";
import { useLogionChain } from "../logion-chain";
import { AxiosFactory } from "./api";
import { MimeType } from "@logion/client";

export interface FileInfo {
    fileName: string;
    downloader: (axios: AxiosInstance) => Promise<TypedFile>;
}

export interface ViewFileProps extends FileInfo {
    nodeOwner: string;
    children?: Children;
    limitIconSize?: boolean;
}

async function openFile(axios: AxiosInstance, props: ViewFileProps) {
    const file = await props.downloader(axios!);
    const fileName = fixFileName(props.fileName, file.mimeType);
    const url = window.URL.createObjectURL(new Blob([ file.data ]));
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = url;
    link.target = "_blank"
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
}

function fixFileName(fileName: string, mimeType: MimeType): string {
    if(fileName.lastIndexOf(".") !== -1) {
        const validExtensions = mimeType.extensions;
        for(const extension of validExtensions) {
            if(fileName.endsWith(`.${extension}`)) {
                return fileName;
            }
        }
    }
    return `${fileName}.${mimeType.extensions[0]}`;
}

export default function ViewFileButton(props: ViewFileProps) {
    const { axiosFactory } = useLogionChain();
    if (axiosFactory === undefined) {
        return null;
    }

    const children = props.children !== undefined ?
        props.children :
        <Icon icon={ { id: 'view' } } />

    const limitIconSize = (props.limitIconSize === undefined || props.limitIconSize);

    const className = customClassName("ViewFileButton", (limitIconSize ? "limit-icon-size" : undefined))
    return (
        <Button onClick={ () => openFile(axiosFactory(props.nodeOwner)!, props) } className={ className }>
            { children }
        </Button>
    )
}

export interface DownloadFilesParams {
    nodeOwner: string;
    files: FileInfo[];
    axiosFactory: AxiosFactory
}

export async function openFiles(params: DownloadFilesParams) {
    const { nodeOwner, files, axiosFactory } = params
    for (const file of files) {
        await openFile(axiosFactory(params.nodeOwner), { nodeOwner, ...file })
    }
}
