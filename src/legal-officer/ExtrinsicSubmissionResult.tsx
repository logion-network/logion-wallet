import React from 'react';
import Alert from 'react-bootstrap/Alert';

import { ISubmittableResult, isFinalized } from '../logion-chain';

export interface Props {
    result: ISubmittableResult | null,
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
