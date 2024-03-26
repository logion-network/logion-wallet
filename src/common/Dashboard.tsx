import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Toast from 'react-bootstrap/Toast';

import { Children } from './types/Helpers';
import Logo from './Logo';
import AddressSwitcher from './AddressSwitcher';
import { MenuIcon as MenuIconType } from './ColorTheme';
import Menu from './Menu';
import { MenuItemData } from './MenuItem';
import MainMenu from './MainMenu';
import MenuIcon from './MenuIcon';
import Clickable from './Clickable';
import Icon from './Icon';
import { useCommonContext } from './CommonContext';

import './Dashboard.css';

interface TopAreaProps {
    children: Children,
}

function TopArea(props: TopAreaProps) {

    return (
        <Row>
            <Col
                key="top-area"
                className="top-area-col"
            >
                <div className="TopArea">
                    { props.children }
                </div>
            </Col>
        </Row>
    );
}

interface PrimaryAreaProps {
    children: Children,
}

function PrimaryArea(props: PrimaryAreaProps) {

    return (
        <Col
            key="primary-area"
            md={ 12 }
            className="primary-area-col"
        >
            <div className="PrimaryArea">
                { props.children }
            </div>
        </Col>
    );
}

export interface ContentPaneProps extends TitlesProps {
    topAreaChildren?: Children,
    primaryAreaChildren: Children,
    secondaryAreaChildren: Children,
}

interface TitlesProps {
    mainTitle: string,
    subTitle?: string,
    titleIcon: MenuIconType,
    onBack?: () => void
}

function Titles(props: TitlesProps) {

    return (
        <div className="Titles">
            <h1>
                <MenuIcon
                    { ...props.titleIcon }
                />
                { props.mainTitle }
            </h1>
            {
                props.subTitle !== undefined &&
                <h2>{ props.subTitle }</h2>
            }
            {
                props.onBack !== undefined &&
                <div className="back-button">
                    <Clickable onClick={ props.onBack }>
                        <Icon icon={{id:"back", hasVariants: true}} /> Back
                    </Clickable>
                </div>
            }
        </div>
    );
}

export interface BasePaneProps extends TitlesProps {
    children: Children,
    className?: string,
    topAreaChildren?: Children,
}

function BasePane(props: BasePaneProps) {
    let contentAreaClass = "ContentArea";
    if(props.className !== undefined) {
        contentAreaClass = contentAreaClass + " " + props.className;
    }

    return (
        <div className="BasePane">
            <div className="BasePaneHeader">
                <div className="TitleArea">
                    <Titles {...props} />
                </div>
                <div className="AddressSwitcherArea">
                    <AddressSwitcher />
                </div>
            </div>
            {
                props.topAreaChildren &&
                <TopArea>
                    { props.topAreaChildren }
                </TopArea>
            }
            <Row className={ contentAreaClass }>
                { props.children }
            </Row>
        </div>
    );
}

export interface FullWidthPaneProps extends BasePaneProps {
    children: Children,
    className?: string,
}

export function FullWidthPane(props: FullWidthPaneProps) {

    return (
        <BasePane
            className={ props.className }
            mainTitle={ props.mainTitle }
            subTitle={ props.subTitle }
            titleIcon={ props.titleIcon }
            onBack={ props.onBack }
            topAreaChildren={ props.topAreaChildren }
        >
            <PrimaryArea>
                { props.children }
            </PrimaryArea>
        </BasePane>
    );
}

export interface Props {
    children: Children,
    menuTop: MenuItemData[],
    menuMiddle: MenuItemData[],
    menuBottom: MenuItemData[],
}

export default function Dashboard(props: Props) {
    const { colorTheme, notificationText, setNotification } = useCommonContext();

    const inlineCss = `
    .Dashboard .PrimaryArea .table {
        color: ${colorTheme.dashboard.foreground};
    }

    .Dashboard .SecondaryArea .table {
        color: ${colorTheme.dashboard.foreground};
    }

    .Dashboard a {
        color: ${colorTheme.dashboard.foreground};
    }

    .Dashboard .Sidebar .MenuItem.active {
        background-color: ${colorTheme.sidebar.activeItemBackground};
    }
    `;

    return (
        <div
            className="Dashboard"
            style={{
                backgroundColor: colorTheme.dashboard.background,
                color: colorTheme.dashboard.foreground,
            }}
        >
            <style>
            { inlineCss }
            </style>
            <div className="Sidebar"
                style={{
                    backgroundColor: colorTheme.sidebar.background,
                    color: colorTheme.sidebar.foreground,
                    boxShadow: `0 0 25px ${colorTheme.shadowColor}`,
                }}
            >
                <Logo
                    shadowColor={ colorTheme.shadowColor }
                />
                <div
                    className="MenuArea"
                >
                    <Menu
                        items={ props.menuTop }
                    />
                    <MainMenu
                        items={ props.menuMiddle }
                    />
                    <Menu
                        items={ props.menuBottom }
                    />
                </div>
            </div>
            { props.children }
            <div className="Notifications">
                <Toast
                    show={ notificationText !== undefined }
                    onClose={ () => setNotification(undefined) }
                    bg={ colorTheme.type }
                    autohide
                    delay={ 3000 }
                >
                    <Toast.Body>{ notificationText }</Toast.Body>
                </Toast>
            </div>
        </div>
    );
}
