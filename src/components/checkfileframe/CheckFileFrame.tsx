import { useCallback, useState } from "react";

import Icon from "../../common/Icon";
import PolkadotFrame from "../../common/PolkadotFrame";
import IconTextRow from "../../common/IconTextRow";
import { ColorTheme, GREEN, RED } from "../../common/ColorTheme";

import CheckFileResult from "../checkfileresult/CheckFileResult";
import FileHasher, { DocumentHash } from "../filehasher/FileHasher";

import './CheckFileFrame.css';

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

    const onHash = useCallback((hash: DocumentHash) => {
        setHash(hash);
        checkHash(hash.hash);
    }, [ setHash, checkHash ]);

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
                        <p>Check a document to verify its conformity with a { checkedItem } referenced in this { context }.
                            This tool will generate the “hash” - a digital fingerprint - of the submitted document,
                            compare it with all document “hashes” referenced in the { context } above, and will highlight
                            (dotted square) above - if existing - the identified document. Otherwise, it will mean that
                            the submitted file version is not part of this current { context }.</p>
                        <p>Important: the document you submit is NOT uploaded to a server as the test is done by your
                            browser.</p>
                        <FileHasher
                            onHash={ onHash }
                            buttonText="Check a document"
                        />
                        {
                            props.checkResult !== "NONE" && hash !== null &&
                            <CheckFileResult>
                                {
                                    props.checkResult === "POSITIVE" &&
                                    <>
                                        <p><strong>Check result: <span style={{color: GREEN}}>positive</span></strong></p>
                                        <p>The document you uploaded has the following "hash":<br/><strong>{hash.hash}</strong><br/>
                                        and is referenced in the above LOC at the line <strong>with a dotted pink border</strong>.</p>
                                        <Icon icon={{id: "ok"}} />
                                    </>
                                }
                                {
                                    props.checkResult === "NEGATIVE" &&
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
        </PolkadotFrame>
    )
}
