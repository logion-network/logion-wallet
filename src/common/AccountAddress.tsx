import { CoinBalance } from "@logion/node-api";
import { CSSProperties, useCallback } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { Account } from './types/Accounts';
import { useCommonContext } from './CommonContext';
import Icon from './Icon';
import { copyToClipBoard } from "./Tools";

import './AccountAddress.css';
import { Spinner } from "react-bootstrap";
import InlineAmount from "src/components/inlineamount/InlineAmount";

export interface Props {
    balance?: CoinBalance | null;
    account: Account;
    disabled: boolean;
    login?: () => void;
}

export default function AccountAddress(props: Props) {
    const { colorTheme, setNotification } = useCommonContext();

    const copyAddress = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        copyToClipBoard(props.account.accountId.address);
        setNotification("The address was copied to your clip board");
    }, [ props.account.accountId.address, setNotification ]);

    let style: CSSProperties = {
        cursor: "copy"
    };
    const backgroundIcon = colorTheme.accounts.legalOfficerIcon;
    let foregroundIcon;
    if(props.account.isLegalOfficer) {
        style['backgroundImage'] = `url("${process.env.PUBLIC_URL}/assets/${backgroundIcon.id}.svg")`;
        style['backgroundRepeat'] = 'no-repeat';
        style['backgroundPositionX'] = '7px';
        style['backgroundPositionY'] = 'center';

        foregroundIcon = "polkadot-account-white";
    } else {
        style['backgroundColor'] = colorTheme.accounts.iconBackground;
        foregroundIcon = props.account.accountId.type === "Ethereum" ? "metamask" : "polkadot-account";
    }

    return (
        <div className={ "AccountAddress" + ( props.disabled ? " disabled" : "" ) }>
            <div
                className="icon"
                style={ style }
                onClick={ copyAddress }
            >
                <Icon icon={{ id: foregroundIcon }} width="40px" />
            </div>
            <div
                className="text"
                style={{
                    justifyContent: props.balance === undefined ? 'space-around' : 'space-between'
                }}
            >
                <div
                    className="name"
                    style={{
                        color: colorTheme.accounts.foreground,
                    }}
                >
                    { props.account.name }
                </div>
                <div
                    className="address"
                    style={{
                        color: colorTheme.accounts.foreground,
                    }}
                >
                    <OverlayTrigger
                      placement="bottom"
                      delay={ 500 }
                      overlay={
                        <Tooltip id={`tooltip-${props.account.accountId.toKey()}`}>
                          { props.account.accountId.address }
                        </Tooltip>
                      }
                    >
                      <span>{ props.account.accountId.address }</span>
                    </OverlayTrigger>
                </div>
                {
                    props.balance !== undefined &&
                    <div
                        className="balance"
                        style={{
                            color: colorTheme.accounts.foreground,
                        }}
                    >
                        {
                            props.balance === null &&
                            <Spinner size="sm"/>
                        }
                        {
                            props.balance !== null &&
                            <>
                            <InlineAmount amount={ props.balance.available } coin={ props.balance.coin } />{" "}
                            {
                                !props.balance.reserved.coefficient.isZero() &&
                                <span className="reserved">
                                    +{" "}
                                    <InlineAmount amount={ props.balance.reserved } coin={ props.balance.coin } />
                                </span>
                            }
                            </>
                        }
                    </div>
                }
            </div>
            {
                props.login !== undefined && props.account.token === undefined &&
                <div
                    className="login"
                >
                    <div
                        className="login-button"
                        onClick={ props.login }
                        style={{
                            border: `1px solid ${colorTheme.accounts.foreground}`
                        }}
                        role="button"
                        aria-label="login button"
                    >
                        <Icon
                            icon={{ id: "forward", hasVariants: true }}
                            colorThemeType={ colorTheme.type }
                        />
                    </div>
                </div>
            }
        </div>
    );
}
