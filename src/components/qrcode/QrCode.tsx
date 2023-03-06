import { toDataURL } from "qrcode";
import { useEffect, useState } from "react";

export interface Props {
    data: string;
    width: string;
}

export default function QrCode(props: Props) {
    const [ data, setData ] = useState<string>();
    const [ dataUrl, setDataUrl ] = useState<string>();

    useEffect(() => {
        if(data !== props.data) {
            setData(props.data);
            (async function() {
                setDataUrl(await toDataURL(props.data));
            })();
        }
    }, [ props.data, data ]);

    return <img width={props.width} src={ dataUrl } alt="QR code"/>;
}
