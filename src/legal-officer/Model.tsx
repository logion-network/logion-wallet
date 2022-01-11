import { AxiosInstance } from 'axios';
import { RecoveryInfo } from './Types';

export async function fetchRecoveryInfo(
    axios: AxiosInstance,
    requestId: string
): Promise<RecoveryInfo> {
    const response = await axios.put(`/api/protection-request/${requestId}/recovery-info`, {})
    return response.data;
}
