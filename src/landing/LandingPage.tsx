import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Button from '../common/Button';
import Dialog from '../common/Dialog';
import Icon from '../common/Icon';

import AbsoluteLogo from '../AbsoluteLogo';

import './LandingPage.css';
import { CreateWallet } from './CreateWallet';
import { InstallExtension } from './InstallExtension';

export interface Props {
    activeStep: Step,
}

export type Step = 'install' | 'create';

type DialogType = 'install' | 'create' | 'recover' | null;

export default function LandingPage(props: Props) {
    const [ showDialog, setShowDialog ] = useState<DialogType>(null);

    let stepsLeft;
    if(props.activeStep === 'install') {
        stepsLeft = 3;
    } else if(props.activeStep === 'create') {
        stepsLeft = 2;
    } else {
        stepsLeft = 1;
    }

    return (
        <div className="LandingPage">
            <Container fluid className="header-container">
                <AbsoluteLogo />
                <Container>
                    <header>
                        <div className="call">
                            <span className="first">You are only { stepsLeft } (simple) steps away</span>
                            <span className="second">from your logion legal protection</span>
                        </div>
                    </header>
                </Container>
            </Container>
            <Container>
                <Row>
                    <Col className={ "step one" + (props.activeStep === 'install' ? " active" : "") }>
                        <div className="step-container">
                            <div className="step-header">
                                <div className="number">01.</div>
                                <div className="description"><span className="action">Download</span> <span>the plugin</span></div>
                            </div>
                            <div className="step-content">
                                <img src={process.env.PUBLIC_URL + "/assets/landing/step1.svg"} alt="people carrying extension" />
                                {
                                    props.activeStep === 'install' &&
                                    <div className="button-container">
                                        <Button onClick={() => setShowDialog('install')}>
                                            <span>
                                                Start <Icon icon={{id: 'forward', hasVariants: true}} colorThemeType="light" />
                                            </span>
                                        </Button>
                                    </div>
                                }
                            </div>
                            <Dialog
                                actions={[
                                    {
                                        id: "close",
                                        buttonText: "Close",
                                        buttonVariant: "primary",
                                        callback: () => setShowDialog(null)
                                    }
                                ]}                                
                                show={ showDialog === 'install' }
                                size="xl"
                                onHide={ () => setShowDialog(null) }
                            >
                                <InstallExtension/>
                            </Dialog>
                        </div>
                    </Col>
                    <Col className={ "step two" + (props.activeStep === 'create' ? " active" : "") }>
                        <div className="step-container">
                            <div className="step-header">
                                <div className="number">02.</div>
                                <div className="description"><span className="action">Create</span> <span>your wallet</span></div>
                            </div>
                            <div className="step-content">
                                <img src={process.env.PUBLIC_URL + "/assets/landing/step2.svg"} alt="people carrying extension" />
                                {
                                    props.activeStep === 'create' &&
                                    <div className="button-container">
                                        <Button onClick={() => setShowDialog('create')}>
                                            <span>
                                                Start <Icon icon={{id: 'forward', hasVariants: true}} colorThemeType="dark" />
                                            </span>
                                        </Button>
                                    </div>
                                }
                            </div>
                            <Dialog
                                actions={[
                                    {
                                        id: "close",
                                        buttonText: "Close",
                                        buttonVariant: "primary",
                                        callback: () => setShowDialog(null)
                                    }
                                ]}
                                show={ showDialog === 'create' }
                                size="xl"
                                onHide={ () => setShowDialog(null) }
                            >
                                <CreateWallet/>
                            </Dialog>
                        </div>
                    </Col>
                    <Col className="step three">
                        <div className="step-container">
                            <div className="step-header">
                                <div className="number">03.</div>
                                <div className="description"><span className="action">Access</span> <span>your dashboard</span></div>
                            </div>
                            <div className="step-content">
                                <img src={process.env.PUBLIC_URL + "/assets/landing/step3.svg"} alt="people carrying extension" />
                            </div>
                        </div>
                    </Col>
                </Row>
                <div className="dark-waves" />
            </Container>
            <Container>
                <Row>
                    <Col className="what-section">
                        <h1>Logion offers</h1>
                        <p>
                            <strong>a blockchain network managed by legal officers</strong><br/>
                            that provides a decentralized and legal guarantee for all your <strong>digital assets</strong> and <strong>digital transactions</strong>
                        </p>
                    </Col>
                </Row>
            </Container>
            <Container>
                <Row>
                    <Col>
                        <h1 className="section-title"><span className="highlight">Digital Asset</span> protection</h1>
                    </Col>
                </Row>
            </Container>
            <div className="recovery-container">
                <Container>
                    <Row>
                        <Col md={3} className="lost-password-container">
                            <img className="lost-password" src={process.env.PUBLIC_URL + "/assets/landing/recovery1.svg"} alt="women lost password" />
                        </Col>
                        <Col md={6}>
                            <div className="recovery-process">
                                <p>
                                    Inaccessible wallet?&nbsp;
                                    <strong>recovery process</strong>
                                </p>
                                <Button onClick={ () => setShowDialog("recover") }>Start my recovery process</Button>
                                <Dialog
                                    actions={[
                                        {
                                            id: "close",
                                            buttonText: "Close",
                                            buttonVariant: "primary",
                                            callback: () => setShowDialog(null)
                                        }
                                    ]}
                                    show={ showDialog === 'recover' }
                                    size="lg"
                                >
                                    <ol>
                                        <li>Follow the steps at the top
                                        of the page (install the extension, then create a new account)</li>
                                        <li>Once you access your dashboard, start a recovery with your new account</li>
                                    </ol>
                                </Dialog>
                            </div>
                        </Col>
                        <Col md={3} className="recovered-password-container">
                            <img className="recovered-password" src={process.env.PUBLIC_URL + "/assets/landing/recovery2.svg"} alt="legal officer giving key" />
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="map-background">
                <Container>
                    <Row>
                        <Col>
                            <h1 className="section-title transaction-protection"><span className="highlight">Digital Transaction</span> protection</h1>
                        </Col>
                    </Row>
                </Container>
                <div className="transaction-container">
                    <Container>
                        <Row>
                            <Col md={7}>
                                <div className="transaction-process">
                                    <p>
                                       To protect all your digital transactions, <strong>Logion Legal Officers</strong> establish a secured logion's <strong>Legal Officer Case</strong>: 
                                       a blockchain based digital folder containing all references to transaction related legal documents, judicial reports and digital files, certified by a Judicial Officer, enforceable within +150 countries 
                                    </p>
                                </div>
                            </Col>
                            <Col md={5} className="transaction-protection-container">
                                <img className="transaction-protection" src={process.env.PUBLIC_URL + "/assets/landing/transaction-protection.svg"} alt="man adding an item to a case" />
                            </Col>
                        </Row>
                    </Container>
                </div>
                <div className="protection-container">
                    <p className="foundation"><strong>The foundation of</strong> your protection</p>
                    <div className="legal-officers">
                        <img className="protection-male" alt="male legal officer" src={process.env.PUBLIC_URL + "/assets/landing/protection_male.svg"}/>
                        <img className="protection-female" alt="female legal officer" src={process.env.PUBLIC_URL + "/assets/landing/protection_female.svg"}/>
                    </div>
                    <div className="explanation">
                        <h1>Logion Legal Officers</h1>
                        <p>
                            In charge of a <strong>public office</strong>, Logion Legal Officers are <strong>identified</strong> Judicial Officers,<br/>who apply a
                            strict code of ethics and are <strong>legaly responsible</strong> for their actions<br/>
                            while legally securing your digital assets and digital transactions.
                        </p>
                    </div>
                </div>
            </div>
            <footer>
                <Container fluid>
                    <Container>
                        <Row>
                            <Col>
                                <AbsoluteLogo position={{type: 'relative', top: "0", left: "0"}} />
                            </Col>
                            <Col>
                                <div className="contact">
                                    <div className="social">
                                        <a href="https://twitter.com/logion_network" target="_blank" rel="noreferrer"><img alt="twitter icon" src={process.env.PUBLIC_URL + "/assets/landing/twitter.png"}/></a>
                                        <a href="https://www.linkedin.com/company/logion-network/" target="_blank" rel="noreferrer"><img alt="linkedin icon" src={process.env.PUBLIC_URL + "/assets/landing/linkedin.png"}/></a>
                                        <a href="https://discord.gg/FvnxrtCYr6" target="_blank" rel="noreferrer"><img alt="discord icon" src={process.env.PUBLIC_URL + "/assets/landing/discord.png"}/></a>
                                    </div>
                                    <a className="mail" href="mailto:info@logion.network">info@logion.network</a>
                                </div>
                            </Col>
                            <Col>
                                <div className="legal">
                                    <a href="https://logion.network/" target="_blank" rel="noreferrer">Privay policy</a>
                                    <a href="https://logion.network/" target="_blank" rel="noreferrer">Terms and conditions</a>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Container>
            </footer>
        </div>
    );
}
