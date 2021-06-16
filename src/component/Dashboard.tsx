import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Children, BackgroundAndForegroundColors } from './types/Helpers';
import Addresses from './types/Addresses';
import Logo from './Logo';
import AddressSwitcher from './AddressSwitcher';
import { AccountAddressColors } from './AccountAddress';
import Menu from './Menu';
import { MenuItemData } from './MenuItem';
import Shield from './Shield';

import './Dashboard.css';

export interface PrimaryAreaColors extends BackgroundAndForegroundColors {
    link: string,
}

export interface ColorTheme {
    sidebar: BackgroundAndForegroundColors,
    primaryArea: PrimaryAreaColors,
    secondaryArea: BackgroundAndForegroundColors,
    accounts: AccountAddressColors,
    frame: BackgroundAndForegroundColors,
}

export interface PrimaryAreaProps {
    children: Children,
    colors: PrimaryAreaColors,
}

export function PrimaryArea(props: PrimaryAreaProps) {

    return (
        <Col
            key="primary-area"
            md={7}
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
}

export function SecondaryArea(props: SecondaryAreaProps) {

    return (
        <Col
            key="secondary-area"
            md={3}
            style={{
                backgroundColor: props.colors.background,
                color: props.colors.foreground,
            }}
        >
            <div className="SecondaryArea">
                <div className="AddressSwitcherArea">
                    <AddressSwitcher
                        addresses={ props.addresses }
                        colors={ props.accountColors }
                        selectAddress={ props.selectAddress }
                    />
                </div>
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
}

export function ContentPane(props: ContentPaneProps) {

    return (
        <>
            <PrimaryArea
                colors={ props.colors.primaryArea }
            >
                { props.primaryAreaChildren }
            </PrimaryArea>
            <SecondaryArea
                colors={ props.colors.secondaryArea }
                addresses={ props.addresses }
                accountColors={ props.colors.accounts }
                selectAddress={ props.selectAddress }
            >
                { props.secondaryAreaChildren }
            </SecondaryArea>
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

    .Dashboard .PrimaryArea .table,
    .Dashboard .SecondaryArea .table {
        color: ${props.colors.secondaryArea.foreground}
    }
    `;

    return (
        <Container className="Dashboard" fluid>
            <style>
            { inlineCss }
            </style>
            <Row>
                <Col
                    md={2}
                    style={{
                        backgroundColor: props.colors.sidebar.background,
                        color: props.colors.sidebar.foreground,
                    }}
                >
                    <div className="Sidebar">
                        <Logo />
                        <div className="MenuArea">
                            <Menu
                                items={ props.menuTop }
                            />
                            <Shield item={ props.shieldItem } />
                            <Menu
                                items={ props.menuBottom }
                            />
                        </div>
                    </div>
                </Col>
                { props.children }
            </Row>
        </Container>
    );
}
