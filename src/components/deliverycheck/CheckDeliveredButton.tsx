import { CheckCertifiedCopyResult, CheckResultType } from "@logion/client";
import { Hash } from "@logion/node-api";
import { useCallback, useEffect, useState } from "react";

import FileHasher, { DocumentHash } from "../filehasher/FileHasher";
import Icon from "src/common/Icon";
import { GREEN, RED } from "src/common/ColorTheme";

export function checkResultTypeSpan(type: CheckResultType): JSX.Element {
    return (
        <span style={{ color: checkResultTypeColor(type) }}>
            { checkResultTypeText(type) }
        </span>
    );
}

export function checkResultTypeText(type: CheckResultType): string {
    return type === CheckResultType.POSITIVE ? "positive" : "negative";
}

export function checkResultTypeColor(type: CheckResultType): string {
    return type === CheckResultType.POSITIVE ? GREEN : RED;
}

export interface Props {
    checkCertifiedCopy: (hash: Hash) => Promise<CheckCertifiedCopyResult>;
    onChecked: (result: CheckCertifiedCopyResult) => void;
    onChecking: () => void;
    buttonText: string;
}

export default function CheckDeliveredButton(props: Props) {
    const [ hash, setHash ] = useState<DocumentHash | null>(null);
    const [ checked, setChecked ] = useState(false);

    useEffect(() => {
        if(hash && !checked) {
            setChecked(true);
            (async function() {
                const result = await props.checkCertifiedCopy(hash.hash);
                props.onChecked(result);
            })();
        }
    }, [ hash, checked, props ]);

    const onFileSelected = useCallback(() => {
        setHash(null);
        setChecked(false);

        props.onChecking();
    }, [ props ]);

    return (
        <div className="CheckDeliveredButton">
            <FileHasher
                onFileSelected={ onFileSelected }
                onHash={ setHash }
                buttonText={ <span><Icon icon={{ id: "search" }} /> {props.buttonText}</span> }
            />
        </div>
    );
}
