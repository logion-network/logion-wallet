import { Child } from "../../common/types/Helpers";
import { Language } from "./SofParams";

export interface WizardStep {
    /**
     * The html element that will appear at the top of the wizard step.
     */
    wizardIntroduction: Child
    /**
     * The label that will show in the generated Statement of facts.
     */
    label: Record<Language, string>
    /**
     * Set to true to add an image during the step.
     */
    addImage?: boolean
    /**
     * if defined, will add a text area with default value.
     */
    text?: Record<Language, string>
}

export const PREREQUISITE_WIZARD_STEPS: WizardStep[] = [
    {
        wizardIntroduction:
            <div>
                <p>Take a screen shot of the <strong>empty trash bin</strong>,
                    save it to a file and add it to SOF with the below button.</p>
                <p>Second paragraph... </p>
                <p>A third one...</p>
            </div>,
        label: {
            en: "Screenshot of empty trash bin",
            fr: "Capture d'écran de la poubelle vide",
        },
        addImage: true
    },
    {
        wizardIntroduction:
            <p>Take a screen shot of the <strong>empty download folder</strong>,
                save it to a file and add it to SOF with the below button.</p>,
        label: {
            en: "Screenshot of empty download folder",
            fr: "Capture d'écran du dossier de téléchargement vide",
        },
        addImage: true
    },
    {
        wizardIntroduction:
            <p>Type here the text of your oath</p>,
        label: {
            en: "Transcript of my oath",
            fr: "Transcription de ma prestation de serment",
        },
        text: {
            en: "I swear to respect blabla... ",
            fr: "Je jure de respecter blabla...",
        }
    },
]
