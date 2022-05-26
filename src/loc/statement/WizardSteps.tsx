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
                <p>Please establish your computer environement settings by describing the process you follow in the text area bellow and selecting a screen capture considered as a proof of execution.</p>
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
            <div>
                <p>Network environment settings</p>
                <p></p>
                <p>Please establish your network environement settings by mentionning your network provider, you IP adress and by also selecting a screen capture of an external IP check service, considered as a proof of execution.</p>
            </div>,
        label: {
            en: "Network environment settings",
            fr: "Description de l'environnement réseau",
        },
        text: {
            en: "--",
            fr: "Fournisseur d'accès Internet Lien Principal : Fibre Dédiée Orange opérée par Sewan SAS IP : 178.255.167.44 Fournisseur d’accès lien Secondaire : Fibre Mutualisée Orange Pro IP : 81.250.134.85 Afin de connaître mon adresse IP publique, je me connecte à Internet et au site dont l’adresse est https://mon-ip.net/. Mon adresse IP publique est 178.255.167.44 ",
        },
        addImage: true
    },
    {
        wizardIntroduction:
            <div>
                <p>Network environment settings confirmation</p>
                <p></p>
                <p>Please verify your network environement settings by using your computer internal network tool and selecting a screen capture of it, considered as a proof of execution.</p>
            </div>,
        label: {
            en: "Network environment settings confirmation",
            fr: "Confirmation de l'environnement réseau",
        },
        text: {
            en: "--",
            fr: "Puis, dans la commande de mon ordinateur, je tape « cmd » et valide ma commande. Je tape alors dans la fenêtre qui s’ouvre « ipconfig ». La fenêtre suivante apparaît indiquant que mon adresse IPv4 est 192.168.100.42. Mon masque de sous réseau est 255.255.255.0 et la passerelle par défaut est 192.168.100.250.",
        },
        addImage: true
    },
    {
        wizardIntroduction:
            <div>
                <p>No-proxy environment confirmation</p>
                <p></p>
                <p>Please verify your proxy environement settings by checking your browser related settings and selecting a screen capture of it, considered as a proof of execution.</p>
            </div>,
        label: {
            en: "No-proxy environment confirmation",
            fr: "Confirmation d'absence d'usage d'un serveur proxy",
        },
        text: {
            en: "--",
            fr: "l’ordinateur utilisé n’est pas connecté à un Serveur Proxy (je m’en assure en vérifiant les paramètres de mon navigateur).",
        },
        addImage: true
    }, 
    {
        wizardIntroduction:
            <div>
              <p>Screen capture settings</p>
              <p></p>
              <p>Please provide in the following text area your screen resolution as well as the method / tool you are using to save your screen capture.</p>
            </div>,
        label: {
            en: "Screen capture settings",
            fr: "Paramètres de capture d'écran",
        },
        text: {
            en: "--",
            fr: "La résolution de mon écran est 1920 x 1080 pixels. Captures écran réalisées avec les  Touche Windows+ Shift + S dans le presse-papier puis enregistrée en format JPEG à 80% avec le logiciel Snipping Tool de Windows ",
        }
    },
    {
        wizardIntroduction:
            <div>
              <p>Time and date check</p>
              <p></p>
              <p>Please check the time and date of your computer operating system to verify its synchronization with internet time server. Then select a screen capture of it, considered as a proof of execution.</p>
            </div>,
        label: {
            en: "Time and date check",
            fr: "Vérification de la date et de l'heure",
        },
        text: {
            en: "--",
            fr: "la date et l’heure retenues par l'horloge du système d'exploitation sont bien la date de ce jour (synchronisation automatique avec un serveur de temps Internet time.windows.com).",
        },
        addImage: true
    },
]
