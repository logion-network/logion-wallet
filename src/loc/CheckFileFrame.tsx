import { useEffect, useState } from "react";

import FileSelectorButton from "../common/FileSelectorButton";
import Icon from "../common/Icon";
import PolkadotFrame from "../common/PolkadotFrame";
import { sha256Hex } from "../common/hash";

import CheckFileResult from "./CheckFileResult";

import './CheckFileFrame.css';
import IconTextRow from "../common/IconTextRow";
import { ColorTheme } from "../common/ColorTheme";

interface DocumentHash {
    file: File;
    hash: string;
}

export type CheckResult = 'NONE' | 'POSITIVE' | 'NEGATIVE';

export interface Props {
    checkHash: (hash: string) => void;
    checkResult: CheckResult;
    colorTheme?: ColorTheme
}

export interface DocumentCheckResult {
    result: CheckResult;
    hash?: string;
}

export default function CheckFileFrame(props: Props) {
    const { checkHash } = props;
    const [ file, setFile ] = useState<File | null>(null);
    const [ hash, setHash ] = useState<DocumentHash | null>(null);
    const [ hashing, setHashing ] = useState<boolean>(false);

    useEffect(() => {
        if(file !== null
            && (hash === null || hash.file !== file)) {
            setHashing(true);
            (async function() {
                const hash = "0x" + await sha256Hex(file);
                setHash({
                    file,
                    hash: hash
                });
                checkHash(hash);
                setHashing(false);
            })();
        }
    }, [ file, hash, setHash, checkHash ]);

    return (
        <PolkadotFrame
            className="CheckFileFrame"
            colorTheme={ props.colorTheme }
        >
            <IconTextRow
                icon={ <Icon icon={{id: "polkadot_doc_check"}} width="45px" /> }
                text={
                    <>
                        <p className="text-title">Document conformity check tool</p>
                        <p>Check a document to verify its conformity with a confidential document referenced in this
                            LOC. This tool will generate the “hash” - a digital fingerprint - of the submitted document,
                            compare it with all document “hashes” referenced in the LOC above, and will highlight
                            (dotted square) above - if existing - the identified document. Otherwise, it will mean that
                            the submitted file version is not part of this current transaction LOC.</p>
                        <p>Important: the document you submit is NOT uploaded to a server as the test is done by your
                            browser.</p>
                        <FileSelectorButton
                            onFileSelected={ setFile }
                            disabled={ hashing }
                            buttonText="Check a document"
                            onlyButton={ true }
                        />
                        {
                            props.checkResult !== "NONE" &&
                            <CheckFileResult
                                type={ props.checkResult }
                                hash={ hash!.hash }
                            />
                        }
                    </>
                }
            />
        </PolkadotFrame>
    )
}
