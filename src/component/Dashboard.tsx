import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Children } from './types/Helpers';
import Addresses from './types/Addresses';
import Logo from './Logo';
import AddressSwitcher from './AddressSwitcher';
import {
    ColorTheme,
    PrimaryAreaColors,
    AccountAddressColors,
    BackgroundAndForegroundColors,
    ColorThemeType
} from './ColorTheme';
import Menu from './Menu';
import { MenuItemData } from './MenuItem';
import Shield from './Shield';

import './Dashboard.css';

export interface PrimaryAreaProps {
    children: Children,
    colors: PrimaryAreaColors,
    width: number,
}

export function PrimaryArea(props: PrimaryAreaProps) {

    return (
        <Col
            key="primary-area"
            md={ props.width }
            style={{
                backgroundColor: props.colors.background,
                color: props.colors.foreground,
            }}
        >
            <div className="PrimaryArea">
                { props.children }
            </div>
        </Col>
    );
}

export interface SecondaryAreaProps {
    children?: Children,
    colors: BackgroundAndForegroundColors,
    addresses: Addresses,
    accountColors: AccountAddressColors,
    selectAddress: (userAddress: string) => void,
    colorThemeType: ColorThemeType,
    width: number,
}

export function SecondaryArea(props: SecondaryAreaProps) {

    return (
        <Col
            key="secondary-area"
            md={ props.width }
            style={{
                backgroundColor: props.colors.background,
                color: props.colors.foreground,
            }}
        >
            <div className="SecondaryArea">
                { props.children }
            </div>
        </Col>
    );
}

export interface ContentPaneProps {
    addresses: Addresses,
    selectAddress: (userAddress: string) => void,
    primaryAreaChildren: Children,
    secondaryAreaChildren?: Children,
    colors: ColorTheme,
    primaryPaneWidth?: number,
}

const SIDEBAR_WIDTH = 2;

export function ContentPane(props: ContentPaneProps) {

    let primaryPaneWidth: number = 6;
    if(props.primaryPaneWidth !== undefined) {
        primaryPaneWidth = props.primaryPaneWidth;
    }

    return (
        <>
            <PrimaryArea
                colors={ props.colors.primaryArea }
                width={ primaryPaneWidth }
            >
                { props.primaryAreaChildren }
            </PrimaryArea>
            <SecondaryArea
                colors={ props.colors.secondaryArea }
                addresses={ props.addresses }
                accountColors={ props.colors.accounts }
                selectAddress={ props.selectAddress }
                colorThemeType={ props.colors.type }
                width={ 12 - SIDEBAR_WIDTH - primaryPaneWidth }
            >
                { props.secondaryAreaChildren }
            </SecondaryArea>
        </>
    );
}

export interface FullWidthPaneProps {
    addresses: Addresses,
    selectAddress: (userAddress: string) => void,
    children: Children,
    colors: ColorTheme,
}

export function FullWidthPane(props: FullWidthPaneProps) {

    return (
        <>
            <PrimaryArea
                colors={ props.colors.primaryArea }
                width={ 12 - SIDEBAR_WIDTH }
            >
                { props.children }
            </PrimaryArea>
        </>
    );
}

export interface Props {
    children: Children,
    colors: ColorTheme,
    addresses: Addresses,
    selectAddress: (userAddress: string) => void,
    menuTop: MenuItemData[],
    menuBottom: MenuItemData[],
    shieldItem: MenuItemData,
}

export default function Dashboard(props: Props) {

    const inlineCss = `
    .Dashboard .PrimaryArea a,
    .Dashboard .PrimaryArea .btn-link {
        color: ${props.colors.primaryArea.link}
    }

    .Dashboard .PrimaryArea .table {
        color: ${props.colors.primaryArea.foreground}
    }

    .Dashboard .SecondaryArea .table {
        color: ${props.colors.secondaryArea.foreground}
    }
    `;

    return (
        <Container
            className="Dashboard"
            fluid
            style={ props.colors.dashboard }
        >
            <style>
            { inlineCss }
            </style>
            <Row>
                <Col md={ SIDEBAR_WIDTH }>
                    <div className="Sidebar">
                        <Logo
                            foreground={ props.colors.menuArea.foreground }
                            background={ props.colors.menuArea.background }
                            shadowColor={ props.colors.shadowColor }
                        />
                        <div
                            className="MenuArea"
                            style={{
                                backgroundColor: props.colors.menuArea.background,
                                color: props.colors.menuArea.foreground,
                            }}
                        >
                            <Menu
                                items={ props.menuTop }
                                colorThemeType={ props.colors.type }
                            />
                            <Shield
                                item={ props.shieldItem }
                                colorThemeType={ props.colors.type }
                            />
                            <Menu
                                items={ props.menuBottom }
                                colorThemeType={ props.colors.type }
                            />
                        </div>
                    </div>
                </Col>
                { props.children }
                <div className="AddressSwitcherArea">
                    <AddressSwitcher
                        addresses={ props.addresses }
                        colors={ props.colors.accounts }
                        selectAddress={ props.selectAddress }
                        colorThemeType={ props.colors.type }
                    />
                </div>
            </Row>
        </Container>
    );
}
