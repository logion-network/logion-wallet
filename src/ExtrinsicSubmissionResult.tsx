import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import { SignedTransaction, isFinalized } from './logion-chain/Signature';

export interface Props {
    result: SignedTransaction | null,
    error: any,
    successMessage?: string | JSX.Element,
    errorMessage?: string | JSX.Element,
}

export default function ExtrinsicSubmissionResult(props: Props) {

    const { result, error } = props;

    if(error === null) {
        if(result === null) {
            return (
                <Alert variant="info">
                    <p>Submitting...</p>
                </Alert>
            );
        } else if(!isFinalized(result)) {
            return (
                <Alert variant="info">
                    <Spinner animation="border"/>
                    <p>{`Current status: ${result?.status.type}`}</p>
                </Alert>
            );
        } else {
            return (
                <Alert variant="success">
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
        return (
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
}
