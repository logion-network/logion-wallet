import { AxiosInstance } from "axios";
import { useCommonContext } from "./CommonContext";
import Button from "./Button";
import { TypedFile } from "../legal-officer/Model";

export interface Props {
    fileName: string
    downloader: (axios: AxiosInstance) => Promise<TypedFile>
}

async function openFile(axios: AxiosInstance, props: Props) {
    const file = await props.downloader(axios!)
    const url = window.URL.createObjectURL(new Blob([ file.data ]));
    const link:HTMLAnchorElement = document.createElement('a');
    link.href = url;
    link.target = "_blank"
    link.setAttribute('download', `${props.fileName}.${file.extension}`);
    document.body.appendChild(link);
    link.click();
}

export default function ViewFileButton(props: Props) {
    const { axios } = useCommonContext();
    if (axios === undefined) {
        return null;
    }
    return (
        <Button onClick={ () => openFile(axios, props) }>
            View
        </Button>
    )
}
