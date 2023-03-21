import { AxiosInstance } from "axios";

import Button from "./Button";

import Icon from "./Icon";

import './ViewFileButton.css';
import { Children, customClassName } from "./types/Helpers";
import { useLogionChain, AxiosFactory } from "../logion-chain";
import { MimeType, Token, TypedFile } from "@logion/client";
import { useCallback, useMemo, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export interface FileInfo {
    fileName: string;
    downloader: (axios: AxiosInstance) => Promise<TypedFile>;
}

export interface ViewFileProps extends FileInfo {
    nodeOwner: string;
    token?: Token;
    children?: Children;
    limitIconSize?: boolean;
    noPaddingOverride?: boolean;
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
    const [ downloadStarted, setDownloadStarted ] = useState(false);

    const onClickCallback = useCallback(() => {
        if(!downloadStarted && axiosFactory) {
            setDownloadStarted(true);
            openFile(axiosFactory(props.nodeOwner, props.token)!, props);
        }
    }, [ props, axiosFactory, downloadStarted ]);

    const children = useMemo(() => {
        if(props.children !== undefined) {
            return props.children;
        } else {
            let iconId: string;
            if(downloadStarted) {
                iconId = 'file_download_started';
            } else {
                iconId = 'file_download';
            }
            return <Icon icon={ { id: iconId } } />;
        }
    }, [ props.children, downloadStarted ]);

    const limitIconSize = (props.limitIconSize === undefined || props.limitIconSize);

    const className = customClassName("ViewFileButton", (limitIconSize ? "limit-icon-size" : undefined), props.noPaddingOverride ? "no-padding-override" : undefined);
    if(downloadStarted) {
        return (
            <OverlayTrigger
                delay={1000}
                overlay={
                    <Tooltip id={`ViewFileButton-tooltip-${props.fileName}`}>
                        If you want to try to download the file again, please refresh the page.
                        Note that with larger files, there may be a delay between the moment you click on the button and
                        the moment the download is actually queued by your browser.
                    </Tooltip>
                }
            >
                <span className="tooltip-trigger">
                    <Button onClick={ onClickCallback } className={ className } disabled={downloadStarted}>
                        { children }
                    </Button>
                </span>
            </OverlayTrigger>
        )
    } else {
        return (
            <Button onClick={ onClickCallback } className={ className }>
                { children }
            </Button>
        );
    }
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
