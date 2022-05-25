import { AxiosInstance } from "axios";

import Button from "./Button";

import { TypedFile } from "../loc/FileModel";
import Icon from "./Icon";

import './ViewFileButton.css';
import { Children } from "./types/Helpers";
import { useLogionChain } from "../logion-chain";

export interface FileInfo {
    fileName: string;
    downloader: (axios: AxiosInstance) => Promise<TypedFile>;
}

export interface ViewFileProps extends FileInfo {
    nodeOwner: string;
}

async function openFile(axios: AxiosInstance, props: ViewFileProps) {
    const file = await props.downloader(axios!);
    const url = window.URL.createObjectURL(new Blob([ file.data ]));
    const link:HTMLAnchorElement = document.createElement('a');
    link.href = url;
    link.target = "_blank"
    link.setAttribute('download', `${props.fileName}.${file.extension}`);
    document.body.appendChild(link);
    link.click();
}

export default function ViewFileButton(props: ViewFileProps) {
    const { axiosFactory } = useLogionChain();
    if (axiosFactory === undefined) {
        return null;
    }
    return (
        <Button onClick={ () => openFile(axiosFactory(props.nodeOwner)!, props) } className="ViewFileButton">
            <Icon icon={{id: 'view'}} />
        </Button>
    )
}

export interface DownloadFilesProps {
    nodeOwner: string;
    files: FileInfo[];
    children?: Children;
}

export function DownloadFilesButton(props: DownloadFilesProps) {
    const { axiosFactory } = useLogionChain();
    if (axiosFactory === undefined) {
        return null;
    }
    const { nodeOwner } = props
    const openFiles = async () => {
        for (const file of props.files) {
            await openFile(axiosFactory(props.nodeOwner), { nodeOwner, ...file })
        }
    }
    return (
        <Button onClick={ openFiles } className="DownloadFilesButton">
            { props.children }
        </Button>
    )
}
