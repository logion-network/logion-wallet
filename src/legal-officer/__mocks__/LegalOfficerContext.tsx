import { COLOR_THEME } from "../../common/TestData";

import {
    pendingTokenizationRequests,
    rejectRequest,
    tokenizationRequestsHistory,
    refreshRequests,
    pendingProtectionRequests,
    activatedProtectionRequests,
    protectionRequestsHistory,
} from "./LegalOfficerContextMock";

export function useLegalOfficerContext() {
    return {
        pendingTokenizationRequests,
        rejectRequest,
        tokenizationRequestsHistory,
        refreshRequests,
        pendingProtectionRequests,
        activatedProtectionRequests,
        protectionRequestsHistory,
        colorTheme: COLOR_THEME,
    };
}
