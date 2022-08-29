import { AxiosInstance } from "axios";
import { COLOR_THEME } from "../../common/TestData";

import {
    pendingTokenizationRequests,
    rejectRequest,
    tokenizationRequestsHistory,
    refreshRequests,
    pendingProtectionRequests,
    activatedProtectionRequests,
    protectionRequestsHistory,
    openedLocRequests,
    openedIdentityLocs,
    openedIdentityLocsByType,
    closedLocRequests,
    closedIdentityLocsByType,
    pendingLocRequests,
    rejectedLocRequests,
    voidIdentityLocsByType,
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
        openedLocRequests,
        openedIdentityLocs,
        openedIdentityLocsByType,
        closedLocRequests,
        closedIdentityLocsByType,
        pendingLocRequests,
        rejectedLocRequests,
        voidIdentityLocsByType,
        refreshLocs: () => {},
        axios: {} as AxiosInstance,
    };
}
