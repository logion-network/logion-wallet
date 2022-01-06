import React from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Alert from './common/Alert';

import { SignedTransaction, isSuccessful } from './logion-chain/Signature';

import './ExtrinsicSubmissionResult.css';

export interface Props {
    result: SignedTransaction | null,
    error: any,
    successMessage?: string | JSX.Element,
    errorMessage?: string | JSX.Element,
}

export default function ExtrinsicSubmissionResult(props: Props) {

    const { result, error } = props;

    let alert = null;
    if(error === null) {
        if(result === null) {
            alert = (
                <Alert variant="polkadot">
                    <p>Submitting...</p>
                </Alert>
            );
        } else if(!isSuccessful(result)) {
            alert = (
                <Alert variant="polkadot">
                    <Spinner animation="border"/>
                    <p>{`Current status: ${result?.status.type}`}</p>
                </Alert>
            );
        } else {
            alert = (
                <Alert variant="polkadot">
                {
                    props.successMessage === undefined &&
                    <p>Submission successful.</p>
                }
                {
                    props.successMessage !== undefined && props.successMessage
                }
                </Alert>
            );
        }
    } else {
        alert = (
            <Alert variant="danger">
            {
                props.errorMessage === undefined &&
                <p>{`Submission failed: ${error.toString()}`}</p>
            }
            {
                props.errorMessage !== undefined && props.errorMessage
            }
            </Alert>
        );
    }

    return (
        <div className="ExtrinsicSubmissionResult">
            { alert }
        </div>
    );
}
