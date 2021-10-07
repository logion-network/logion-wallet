import { AxiosInstance } from "axios";
import { useCommonContext } from "./CommonContext";
import Button from "./Button";

export interface Props {
    fileName: string
    downloader: (axios: AxiosInstance) => Promise<any>
}

async function openFile(axios: AxiosInstance, props: Props) {
    const data = await props.downloader(axios!);
    const url = window.URL.createObjectURL(new Blob([ data ]));
    const link:HTMLAnchorElement = document.createElement('a');
    link.href = url;
    link.target = "_blank"
    link.setAttribute('download', props.fileName);
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
