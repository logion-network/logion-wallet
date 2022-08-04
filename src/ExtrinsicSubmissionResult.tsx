import Spinner from 'react-bootstrap/Spinner';
import { isSuccessful } from '@logion/client';

import { SignedTransaction } from './logion-chain/Signature';
import Alert from './common/Alert';

import './ExtrinsicSubmissionResult.css';

export interface Props {
    result?: SignedTransaction | null,
    error: any,
    successMessage?: string | JSX.Element,
    errorMessage?: string | JSX.Element,
    slim?: boolean,
}

export default function ExtrinsicSubmissionResult(props: Props) {

    const { result, error } = props;

    if(result === undefined && !error) {
        return null;
    }

    let alert = null;
    if(!error) {
        if(!result) {
            alert = (
                <Alert variant="polkadot" slim={ props.slim }>
                    <p>Submitting...</p>
                </Alert>
            );
        } else if(!isSuccessful(result || null)) {
            if(props.slim) {
                alert = (
                    <Alert variant="polkadot" slim={ props.slim }>
                        <p><Spinner animation="border" size="sm" /> {`Current status: ${result?.status.type}`}</p>
                    </Alert>
                );
            } else {
                alert = (
                    <Alert variant="polkadot" slim={ props.slim }>
                        <Spinner animation="border"/>
                        <p>{`Current status: ${result?.status.type}`}</p>
                    </Alert>
                );
            }
        } else {
            alert = (
                <Alert variant="polkadot" slim={ props.slim }>
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
            <Alert variant="danger" slim={ props.slim }>
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
