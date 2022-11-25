import { useEffect } from "react";
import { loadPagedJs } from "./PagedJS";
import { SofParams } from "./SofParams";
import SofTermsAndConditionsEN from "./SofTermsAndConditionsEN";

export interface Props {
    sofParams: SofParams;
}

export default function StatementOfFactsTemplateEN(props: Props) {

    useEffect(() => {
        loadPagedJs();
    }, []);

    return (
        <>
            <style>{`
                .pagedjs_pagebox > .pagedjs_area > .pagedjs_page_content {
                    background-image: url("${ props.sofParams.sealUrl }");
                    background-size: 100%;
                    background-position: center;
                    background-repeat: no-repeat;
                }
                .pagedjs_page .pagedjs_margin-bottom-center > .pagedjs_margin-content::after {
                    content: "All timestamps are displayed using Universal Time Coordinated (UTC)";
                }
            `}</style>
            <div className="header">
                <div className="contact">
                    <div className="postal-address">
                        <div>{ props.sofParams.postalAddressLine1 }</div>
                        <div>{ props.sofParams.postalAddressLine2 }</div>
                        <div>{ props.sofParams.postalAddressLine3 }</div>
                        <div>{ props.sofParams.postalAddressLine4 }</div>
                        <div>{ props.sofParams.email }</div>
                    </div>
                </div>
                <div className="logo">
                    <img src={ props.sofParams.logoUrl } alt="logo" />
                </div>
            </div>

            <div className="polkadot-address">
                <div>Logion Legal Officer public key:</div>
                <div>{ props.sofParams.polkadotAddress }</div>
            </div>

            <h1 className="main-title">
                Statement of facts
            </h1>

            <div className="time">
                { props.sofParams.timestampText }
            </div>

            <h2 className="prerequisite-title">Prerequisites</h2>
            { props.sofParams.prerequisites.map((prerequisite, index) => <div key={ index } className="prerequisite">
                    <h3>{ prerequisite.label }</h3>
                    { prerequisite.imageSrc.length > 0 &&
                        <img src={ prerequisite.imageSrc } width="100%" alt="Snapshot" />
                    }
                    { prerequisite.text.length > 0 &&
                        <p>{ prerequisite.text }</p>
                    }
                </div>
            ) }

            <h2 className="requester-title">Requester</h2>
            <p>{ props.sofParams.requesterText }</p>
            <p>Identified by the following ID: { props.sofParams.requester }</p>

            <p className="intro">I hereby undersigned, Me { props.sofParams.firstName } <span className="lastName">{ props.sofParams.lastName }</span>,
            Official Judicial Officer and Logion Legal Officer - ID { props.sofParams.polkadotAddress } - wihtin
                company { props.sofParams.company }, in charge of a public Judicial Officer office located at the following address: { props.sofParams.shortPostalAddress } ;</p>

            <p className="proceeds">certify that I observed  the following facts:</p>

            <h2 className="facts-title">Facts</h2>

            <p>The following facts have been established by strictly following the process defined in the Statement of Facts recorded in the following Legal Officer Case under the following ID: { props.sofParams.containingLocId }</p>

            <p>In order to establish the following facts, I perform the following operations:</p>
            <ul>
                <li>I access the URL { props.sofParams.nodeAddress } and authenticate myself.</li>
                <li>I access the following Legal Officer Case from which a Statement of Facts is requested: { props.sofParams.locId }</li>
            </ul>

            <p>The following materials have been factually recorded within the Legal Officer Case { props.sofParams.locId }:</p>

            <h3>1 - Public data</h3>

            <div className="facts">
                {
                    props.sofParams.publicItems.map(item =>
                        <div className="fact-container">
                            <div>Public description: { item.description }</div>
                            <div>Content: { item.content }</div>
                            <div>Timestamp: { item.timestamp }</div>
                        </div>
                    )
                }
            </div>

            <h3 className="confidential-title">2 - Confidential documents</h3>

            <p>With regard to confidential documents, only the digital fingerprints - made using the HASH / SHA256 technique - have been published on the logion blockchain. Confidential document related files from which digital fingerprints (HASH-SHA256) have been made in this Legal Officer Case are the following:</p>

            <div className="facts">
                {
                    props.sofParams.privateItems.map(item =>
                        <div className="fact-container">
                            <div>Public description: { item.publicDescription }</div>
                            <div>Private description: { item.privateDescription }</div>
                            <div>Hash: { item.hash }</div>
                            <div>Timestamp: { item.timestamp }</div>
                        </div>
                    )
                }
            </div>

            {
                props.sofParams.collectionItem &&
                <>
                <h3 className="item-title">3 - Collection item</h3>

                <p>As the Legal Officer Case mentioned in the present document - { props.sofParams.locId } - is a Collection Legal Officer Case, the following informations have been recorded as “Collection Item” by the requester him/herself on the logion infrastrcuture under the scope of the related Collection Legal Officer Case:</p>

                <div className="facts">
                    <hr/>
                    <div className="fact-container">
                        <div>Collection item ID: { props.sofParams.collectionItem.id }</div>
                        <div>Description: { props.sofParams.collectionItem.description }</div>
                        <div>Timestamp: { props.sofParams.collectionItem.addedOn }</div>
                        <div>Restricted delivery: { props.sofParams.collectionItem.restrictedDelivery ? "Yes" : "No" }</div>
                        {
                            props.sofParams.collectionItem.token &&
                            <>
                            <div>Underlying Token Type: { props.sofParams.collectionItem.token.type }</div>
                            <div>Underlying Token ID: { props.sofParams.collectionItem.token.id }</div>
                            </>
                        }
                        {
                            props.sofParams.collectionItem.files.map((file, index) => (
                                <>
                                <div>File #{index + 1} Name: { file.name }</div>
                                <div>File #{index + 1} Content Type: { file.contentType }</div>
                                <div>File #{index + 1} Hash: { file.hash }</div>
                                <div>File #{index + 1} Size: { file.size.toString() } bytes</div>
                                {
                                    file.deliveries.map((delivery, deliveryIndex) => (
                                        <>
                                        <div>File #{index + 1} - Delivery #{ deliveryIndex + 1 } Copy Hash: { delivery.hash }</div>
                                        <div>File #{index + 1} - Delivery #{ deliveryIndex + 1 } Owner: { delivery.owner }</div>
                                        </>
                                    ))
                                }
                                </>
                            ))
                        }
                        <SofTermsAndConditionsEN item={ props.sofParams.collectionItem } />
                    </div>
                    <hr/>
                </div>                
                </>
            }

            <p className="conclusion-first">As I concluded my observations, I create the present Statement of Facts and
                record it in the following Legal Officer Case: { props.sofParams.containingLocId } , a copy of which is
                archived at my office location.</p>

            <p>Web address (URL) of the related State of Facts public certificate:<br/>
                <a href={ props.sofParams.certificateUrl }>{ props.sofParams.certificateUrl }</a>
            </p>

            <p>This public certificate allows the verification of the authenticity of a digital copy of the present Statement of facts, resulting from the request made to the signatory of the present Statement of Facts. That verification will be done by a comparison of the digital fingerprint of the file that needs to be checked with the digital fingerprint of the present document, as recorded in the related Legal Officer Case. In the event of any conflict between the verified files, the version recorded by the Logion Legal Officer shall prevail.</p>

            <div className="footer">
                <div>
                    <h3>Price</h3>
                    <pre>{ props.sofParams.amount }</pre>
                </div>
                <div className="signature-container">
                    <h3>Signature</h3>
                    <img className="sof-signature" src={ process.env.PUBLIC_URL + "/assets/sof_signature.svg" } alt="signature" />
                </div>
            </div>

            <div className="appendix">
                <h2>Prestation de serment de l’Officier en charge de ce constat</h2>
                <div className="oath-container">
                    <div className="oath">
                        <p>{ props.sofParams.oathText }</p>
                    </div>
                    <div className="oath-logo">
                        <img src={ props.sofParams.oathLogoUrl } alt="oath logo" />
                    </div>
                </div>
            </div>
        </>
    );
}
