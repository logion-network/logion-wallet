import { useLogionChain } from './logion-chain/LogionChainContext';
import ExtrinsicSubmissionResult from './ExtrinsicSubmissionResult';

export interface Props {
    successMessage?: string;
    slim?: boolean;
}

export default function ExtrinsicSubmissionStateView(props: Props) {
    const { extrinsicSubmissionState } = useLogionChain();

    if(extrinsicSubmissionState.submitted) {
        return (<ExtrinsicSubmissionResult
            error={ extrinsicSubmissionState.error }
            result={ extrinsicSubmissionState.result }
            successMessage={ props.successMessage }
            slim={ props.slim }
        />);
    } else {
        return null;
    }
}
