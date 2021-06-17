import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { AccountAddressColors } from './ColorTheme';
import { AccountAddress as AddressType } from './types/Addresses';

import './AccountAddress.css';

export interface Props {
    hint?: string,
    address: AddressType,
    colors: AccountAddressColors
}

export default function AccountAddress(props: Props) {
    return (
        <div className="AccountAddress">
            <div
                className="icon"
                style={{
                    backgroundColor: props.colors.iconBackground,
                }}
            >
                { props.address.name.substring(0, 1).toUpperCase() }
            </div>
            <div
                className="text"
                style={{
                    justifyContent: props.hint === undefined ? 'space-around' : 'space-between'
                }}
            >
                {
                    props.hint !== undefined &&
                    <div
                        className="hint"
                        style={{
                            color: props.colors.hintColor,
                        }}
                    >
                        { props.hint }
                    </div>
                }
                <div
                    className="name"
                    style={{
                        color: props.colors.foreground,
                    }}
                >
                    { props.address.name }
                </div>
                <div
                    className="address"
                    style={{
                        color: props.colors.foreground,
                        backgroundColor: props.colors.background,
                    }}
                >
                    <OverlayTrigger
                      placement="bottom"
                      delay={ 500 }
                      overlay={
                        <Tooltip id={`tooltip-${props.address.address}`}>
                          { props.address.address }
                        </Tooltip>
                      }
                    >
                      <span>{ props.address.address }</span>
                    </OverlayTrigger>
                </div>
            </div>
        </div>
    );
}
