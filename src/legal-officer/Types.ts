import { ColorTheme, rgbaToHex } from '../common/ColorTheme';
import Identity from '../common/types/Identity';
import PostalAddress from '../common/types/PostalAddress';

export type TokenizationRequestStatus = "PENDING" | "REJECTED" | "ACCEPTED";

export interface AssetDescription {
    assetId: string,
    decimals: number,
}

export interface TokenizationRequest {
    id: string,
    legalOfficerAddress: string,
    requesterAddress: string,
    requestedTokenName: string,
    bars: number,
    status: TokenizationRequestStatus,
    rejectReason?: string | null,
    createdOn?: string,
    decisionOn?: string,
    assetDescription?: AssetDescription,
}

export type LegalOfficerDecisionStatus = "PENDING" | "REJECTED" | "ACCEPTED";

export type ProtectionRequestStatus = "PENDING" | "ACTIVATED";

export interface LegalOfficerDecision {
    legalOfficerAddress: string,
    status: LegalOfficerDecisionStatus,
    rejectReason: string | null,
    decisionOn: string | null,
}

export interface ProtectionRequest {
    id: string,
    requesterAddress: string,
    decisions: LegalOfficerDecision[],
    userIdentity: Identity,
    userPostalAddress: PostalAddress,
    createdOn: string,
    isRecovery: boolean,
    addressToRecover: string | null,
    status: ProtectionRequestStatus,
}

export interface RecoveryInfo {
    recoveryAccount: ProtectionRequest,
    accountToRecover: ProtectionRequest,
}

export const LIGHT_MODE: ColorTheme = {
    type: 'light',
    shadowColor: rgbaToHex('#3b6cf4', 0.1),
    dashboard: {
        background: '#eff3fe',
        foreground: '#000000',
    },
    sidebar: {
        background: '#ffffff',
        foreground: '#000000',
        activeItemBackground: '#d8e2fd',
    },
    accounts: {
        iconBackground: '#3b6cf4',
        hintColor: rgbaToHex('#000000', 0.6),
        foreground: '#000000',
        background: 'eff3fe',
        legalOfficerIcon: {
            category: 'legal-officer',
            id: 'account-shield'
        }
    },
    frame: {
        background: '#ffffff',
        foreground: '#000000',
        link: rgbaToHex('#3b6cf4', 0.15),
        altBackground: '#eff3fe',
    },
    topMenuItems: {
        iconGradient: {
            from: '#3b6cf4',
            to: '#6050dc',
        }
    },
    bottomMenuItems: {
        iconGradient: {
            from: '#7a90cb',
            to: '#3b6cf4',
        }
    },
    recoveryItems: {
        iconGradient: {
            from: '#e95b5b',
            to: '#6050dc',
        }
    },
    buttons: {
        secondary: {
            background: '#ffffff',
            foreground: '#000000',
        }
    },
    select: {
        background: '#d8e2fd',
        foreground: '#000000',
        menuBackgroundColor: '#d8e2fd',
        selectedOptionBackgroundColor: rgbaToHex('#ffffff', 0.20),
    },
    table: {
        background: '#ffffff',
        foreground: '#000000',
        header: {
            background: '#ffffff',
            foreground: rgbaToHex('#000000', 0.70),
        },
        row: {
            background: '#eff3fe',
            foreground: '#000000',
        }
    },
    tabs: {
        background: '#ffffff',
        foreground: '#000000',
        inactiveTab: {
            background: '#eff3fe',
            foreground: rgbaToHex('#000000', 0.70),
        },
        borderColor: '#3b6cf4',
    },
    dialog: {
        background: '#ffffff',
        foreground: '#000000',
        borderColor: '#e6007a',
    },
};
