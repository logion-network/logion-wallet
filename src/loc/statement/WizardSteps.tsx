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
                <p>Computer environment settings</p>
                <p></p>
                <p>Please establish your computer environement settings by describing your process in the following text area and selecting a screen capture considered as a proof of execution.</p>
            </div>,
        label: {
            en: "Computer environment settings",
            fr: "Description de l'environnement",
        },
        text: {
            en: "--",
            fr: "Les constatations vont être effectuées sur le poste informatique identifié «VNZN2002 » dans l’environnement de travail connecté au serveur informatique de l’Etude,  soit un  ordinateur  de  type  PC  Dell, avec  navigateur  Firefox (Version 100.0.2 (64-bit)) dont la page de démarrage est une page vierge (about :blank), Système d'Exploitation : Windows 10 Professionnel. J’effectue ci-dessous une capture écran des « Informations système générales » de mon ordinateur : ",
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
