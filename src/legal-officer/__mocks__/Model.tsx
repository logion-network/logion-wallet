import {
    fetchRecoveryInfo,
    acceptAccountRecoveryRequest,
    rejectAccountRecoveryRequest,
} from './ModelMock';

export {
    fetchRecoveryInfo,
    acceptAccountRecoveryRequest,
    rejectAccountRecoveryRequest,
};

export function toRecoveryRequestType(value: string | undefined) {
    return value;
}
