import { LocData } from "@logion/client";
import { Fees, Numbers } from "@logion/node-api";
import AmountFormat from "../../common/AmountFormat";
import { customClassName } from "../../common/types/Helpers";
import "../EstimatedFees.css";
import { useMemo } from "react";
import { LocItem } from "../LocItem";

export interface Props {
    fees: Fees | undefined | null;
    hideTitle?: boolean;
    centered?: boolean;
    inclusionFeePaidBy?: string;
    otherFeesPaidBy?: string;
    hideNetworkLoadWarning?: boolean;
}

export default function EstimatedFees(props: Props) {

    const showPaidBy = useMemo(() => {
        return props.otherFeesPaidBy !== undefined || props.inclusionFeePaidBy !== undefined;
    }, [ props.otherFeesPaidBy, props.inclusionFeePaidBy ]);

    const fees = props.fees;

    const className = customClassName("EstimatedFees", props.centered === true ? "centered-table" : undefined);
    return (
        <div className={ className }>
            { props.hideTitle !== true && <h3>Estimated fees (LGNT)</h3> }
            <table>
                <tbody>
                    <tr>
                        <td>Blockchain record</td>
                        <td>
                            <AmountFormat
                                amount={ fees?.inclusionFee }
                                unit={ Numbers.NONE }
                                decimals={4}
                                undefinedText="-"
                            />
                        </td>
                        { showPaidBy && <td>{ props.inclusionFeePaidBy || "" }</td> }
                        { props.hideNetworkLoadWarning !== true && <td>(can be impacted by network load)</td> }
                    </tr>
                    { fees?.storageFee !== undefined &&
                        <tr>
                            <td>File storage</td>
                            <td>
                                <AmountFormat
                                    amount={ fees.storageFee }
                                    unit={ Numbers.NONE }
                                    decimals={4}
                                />
                            </td>
                            { showPaidBy && <td>{ props.otherFeesPaidBy || "" }</td> }
                        </tr>
                    }
                    { fees?.legalFee !== undefined &&
                        <tr>
                            <td>Legal fee</td>
                            <td>
                                <AmountFormat
                                    amount={ fees.legalFee }
                                    unit={ Numbers.NONE }
                                    decimals={4}
                                />
                            </td>
                            { showPaidBy && <td>{ props.otherFeesPaidBy || "" }</td> }
                        </tr>
                    }
                    { fees?.certificateFee !== undefined &&
                        <tr>
                            <td>Certificate fee</td>
                            <td>
                                <AmountFormat
                                    amount={ fees.certificateFee }
                                    unit={ Numbers.NONE }
                                    decimals={4}
                                />
                            </td>
                            { showPaidBy && <td>{ props.otherFeesPaidBy || "" }</td> }
                        </tr>
                    }
                    { fees?.valueFee !== undefined &&
                        <tr>
                            <td>Value fee</td>
                            <td>
                                <AmountFormat
                                    amount={ fees.valueFee }
                                    unit={ Numbers.NONE }
                                    decimals={4}
                                />
                            </td>
                            { showPaidBy && <td>{ props.otherFeesPaidBy || "" }</td> }
                        </tr>
                    }
                    { fees?.collectionItemFee !== undefined &&
                        <tr>
                            <td>Collection item fee</td>
                            <td>
                                <AmountFormat
                                    amount={ fees.collectionItemFee }
                                    unit={ Numbers.NONE }
                                    decimals={4}
                                />
                            </td>
                            { showPaidBy && <td>{ props.otherFeesPaidBy || "" }</td> }
                        </tr>
                    }
                    { fees?.tokensRecordFee !== undefined &&
                        <tr>
                            <td>Tokens record fee</td>
                            <td>
                                <AmountFormat
                                    amount={ fees.tokensRecordFee }
                                    unit={ Numbers.NONE }
                                    decimals={4}
                                />
                            </td>
                            { showPaidBy && <td>{ props.otherFeesPaidBy || "" }</td> }
                        </tr>
                    }
                    <tr>
                        <td>Total</td>
                        <td>
                            <AmountFormat
                                amount={ fees?.totalFee }
                                unit={ Numbers.NONE }
                                decimals={4}
                                undefinedText="-"
                            />
                        </td>
                        { showPaidBy && <td></td> }
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export function getOtherFeesPaidBy(loc: LocData) {
    if(loc.requesterLocId === undefined && loc.sponsorshipId === undefined) {
        return PAID_BY_REQUESTER;
    } else if(loc.sponsorshipId) {
        return PAID_BY_SPONSOR;
    } else {
        return PAID_BY_LEGAL_OFFICER;
    }
}

export const PAID_BY_REQUESTER = "paid by requester";
export const PAID_BY_SPONSOR = "paid by sponsor";
export const PAID_BY_LEGAL_OFFICER = "paid by legal officer";

export function geInclusionFeePaidBy(loc: LocData, item: LocItem) {
    return item.submitter?.type === "Polkadot" && item.submitter?.equals(loc.ownerAccountId) ? PAID_BY_LEGAL_OFFICER : PAID_BY_SUBMITTER;
}

export const PAID_BY_SUBMITTER = "paid by submitter";
