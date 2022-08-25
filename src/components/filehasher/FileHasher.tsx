import { useCallback, useEffect, useState } from "react";
import FileSelectorButton from "src/common/FileSelectorButton";
import { sha256Hex } from "src/common/hash";

export interface DocumentHash {
    file: File;
    hash: string;
}

export interface Props {
    buttonText: string;
    onHash: (hash: DocumentHash) => void;
    onFileSelected?: (file: File) => void;
}

export default function FileHasher(props: Props) {
    const [ file, setFile ] = useState<File | null>(null);
    const [ hashing, setHashing ] = useState<boolean>(false);
    const [ hash, setHash ] = useState<DocumentHash | null>(null);

    const onFileSelected = useCallback((file: File) => {
        setFile(file);
        if(props.onFileSelected) {
            props.onFileSelected(file);
        }
    }, [ setFile, props ]);

    useEffect(() => {
        if(file !== null
            && (hash === null || hash.file !== file)) {
            setHashing(true);
            (async function() {
                const hash = "0x" + await sha256Hex(file);
                const documentHash = {
                    file,
                    hash: hash
                };
                setHash(documentHash);
                setHashing(false);
                props.onHash(documentHash);
            })();
        }
    }, [ file, hash, setHash, props ]);

    return (
        <FileSelectorButton
            onFileSelected={ onFileSelected }
            disabled={ hashing }
            buttonText={ props.buttonText }
            onlyButton={ true }
        />
    );
}
