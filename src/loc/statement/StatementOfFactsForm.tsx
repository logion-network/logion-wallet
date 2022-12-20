import { Controller, Control, FieldErrors } from "react-hook-form";
import Form from "react-bootstrap/Form";
import { LocType } from "@logion/node-api/dist/Types.js";

import FormGroup from "../../common/FormGroup";
import { useCommonContext } from "../../common/CommonContext";

import { FormValues, Language } from "./SofParams";

import "./StatementOfFactsForm.css"

const amountDefaultValues: Record<Language, string[]> = {
    en: [ "Cost", "Base", "Tax Excluded", "Tax", "Tax Included" ],
    fr: [ "Coût du présent", "Base", "HT", "Taxe", "TTC" ],
}

export interface Props {
    type: LocType,
    control: Control<FormValues>,
    errors: FieldErrors<FormValues>,
    language: Language,
    submitError: string | undefined,
}

export default function StatementOfFactsForm(props: Props) {

    const { colorTheme } = useCommonContext();
    const { type, control, submitError } = props;
    const info = type === 'Collection' ?
        "Collection Item and related Collection LOC" :
        `${ type } LOC`

    return (
        <div className="StatementOfFactsForm">
            <h3>Statement of Facts generator</h3>
            <p>You are about to generate a Statement of Facts PDF based on the scope of the
                current { info }. This Statement of Facts will list all the public content, confidential files hash and related description
                recorded by the logion infrastructure. After its generation, you will also be able to download a copy of all related files, mentioned in the
                PDF.</p>
            <p>A LOC must be created to let you upload the Statement of Facts <strong>after signature</strong>.
                This is a <strong>mandatory</strong> step as the Statement of Facts will contain the URL to the LOC public certificate of this Statement of Facts:
            </p>

            <FormGroup
                id="containingLocId"
                label="ID of the LOC you created that will contain your future SOF PDF"
                control={
                    <Controller
                        name="containingLocId"
                        control={ control }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={!!props.errors.containingLocId?.message}
                                type="text"
                                placeholder="e.g. 123...789"
                                aria-describedby="containingLocId"
                                { ...field }
                            />
                        ) }
                    />
                }
                colors={ colorTheme.dialog }
                feedback={ props.errors.containingLocId?.message }
            />
            <FormGroup
                id="timestampText"
                label="Timestamp in textual form"
                control={
                    <Controller
                        name="timestampText"
                        control={ control }
                        render={ ({ field }) => (
                            <Form.Control
                                as="textarea"
                                placeholder="e.g. L’AN DEUX MILLE VINGT DEUX ET LE VINGT NEUF FÉVRIER à 15 H 13 Min 45 secondes"
                                aria-describedby="timestampText"
                                style={ { height: '80px' } }
                                { ...field }
                            />
                        ) }
                    />
                }
                colors={ colorTheme.dialog }
            />
            <FormGroup
                id="requesterText"
                label="Legal description of the requester"
                control={
                    <Controller
                        name="requesterText"
                        control={ control }
                        render={ ({ field }) => (
                            <Form.Control
                                as="textarea"
                                placeholder="e.g. SARL YYYY, immatriculé au RCS de PARIS sous le numéro siren 123456, dont le siège social est situé rue de la Liberté 75001 PARIS agissant poursuites et diligences de son représentant légal domicilié en cette qualité audit siège."
                                aria-describedby="requesterText"
                                style={ { height: '80px' } }
                                { ...field }
                            />
                        ) }
                    />
                }
                colors={ colorTheme.dialog }
            />
            <FormGroup
                id="amount"
                label="Price"
                control={
                    <Controller
                        name="amount"
                        control={ control }
                        render={ ({ field }) => (
                            <Form.Control
                                as="textarea"
                                defaultValue={ amountDefaultValues[props.language].join("\n") }
                                aria-describedby="amount"
                                style={ { height: '140px' } }
                                { ...field }
                            />
                        ) }
                    />
                }
                colors={ colorTheme.dialog }
            />
            { submitError && <pre className="submit-error">{ submitError }</pre> }
        </div>
    )
}
