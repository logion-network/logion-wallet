import { useCallback, useState } from "react";

import Icon from "../../common/Icon";
import IconTextRow from "../../common/IconTextRow";
import { ColorTheme, GREEN, RED } from "../../common/ColorTheme";

import CheckFileResult from "../checkfileresult/CheckFileResult";
import FileHasher, { DocumentHash } from "../filehasher/FileHasher";

import './CheckFileFrame.css';
import Frame from "src/common/Frame";

export type CheckResult = 'NONE' | 'POSITIVE' | 'NEGATIVE';

export interface Props {
    checkHash: (hash: string) => void;
    checkResult: CheckResult;
    colorTheme?: ColorTheme;
    context: string;
    checkedItem: string;
}

export interface DocumentCheckResult {
    result: CheckResult;
    hash?: string;
}

export default function CheckFileFrame(props: Props) {
    const { checkHash, context, checkedItem } = props;
    const [ hash, setHash ] = useState<DocumentHash | null>(null);
    const [ checking, setChecking ] = useState(false);

    const onHash = useCallback((hash: DocumentHash) => {
        setHash(hash);
        checkHash(hash.hash);
    }, [ setHash, checkHash ]);

    return (
        <Frame
            className="CheckFileFrame"
            colorTheme={ props.colorTheme }
            border="2px solid #3B6CF4"
        >
            <IconTextRow
                icon={ <Icon icon={{id: "doc_check"}} width="45px" /> }
                text={
                    <>
                        <p className="text-title">Document Conformity Check Tool</p>
                        <p>Some documents referenced in this Legal Officer Case (LOC) are not downloadable through this
                            certificate. However, you can still check such a document you own to verify its conformity
                            with a { checkedItem } referenced in this { context }.</p>
                        <p>This tool will generate the “hash” - a digital fingerprint - of the submitted document,
                            compare it with all document “hashes” referenced in the LOC above, and will highlight
                            (dotted square) - if existing - the identified document. Otherwise, it will mean that the
                            submitted file version is not part of this current LOC.</p>
                        <p>Important: the document you submit is NOT uploaded to a server as the test is done by your
                            browser.</p>
                        <FileHasher
                            onHash={ onHash }
                            buttonText="Check a document"
                            onFileSelected={() => setChecking(true)}
                        />
                        {
                            checking &&
                            <CheckFileResult>
                                {
                                    (!hash || props.checkResult === "NONE") &&
                                    <div>
                                        <p>Hashing file and checking...</p>
                                    </div>
                                }
                                {
                                    hash && props.checkResult === "POSITIVE" &&
                                    <>
                                        <p><strong>Check result: <span style={{color: GREEN}}>positive</span></strong></p>
                                        <p>The document you uploaded has the following "hash":<br/><strong>{hash.hash}</strong><br/>
                                        and is referenced in the above LOC at the line <strong>with a dotted pink border</strong>.</p>
                                        <Icon icon={{id: "ok"}} />
                                    </>
                                }
                                {
                                    hash && props.checkResult === "NEGATIVE" &&
                                    <>
                                        <p><strong>Check result: <span style={{color: RED}}>negative</span></strong></p>
                                        <p>The document you uploaded has the following "hash":<br/><strong>{hash.hash}</strong><br/>
                                        and <strong>has NO match in the above LOC</strong>. Please be careful and execute a deeper due diligence.</p>
                                        <Icon icon={{id: "ko"}} />
                                    </>
                                }
                            </CheckFileResult>
                        }
                    </>
                }
            />
        </Frame>
    )
}
