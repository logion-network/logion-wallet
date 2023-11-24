import { useLogionChain } from './logion-chain';
import ExtrinsicSubmissionResult from './ExtrinsicSubmissionResult';

export interface Props {
    successMessage?: string;
    slim?: boolean;
    submissionId?: string;
}

export default function ExtrinsicSubmissionStateView(props: Props) {
    const { extrinsicSubmissionState } = useLogionChain();

    if(extrinsicSubmissionState.submitted) {
        return (<ExtrinsicSubmissionResult
            error={ extrinsicSubmissionState.getError(props.submissionId) }
            result={ extrinsicSubmissionState.getResult(props.submissionId) }
            successMessage={ props.successMessage }
            slim={ props.slim }
        />);
    } else {
        return null;
    }
}
