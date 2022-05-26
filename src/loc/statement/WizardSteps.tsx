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
                <p><b>Mandatory initial browsing and computer environment cleaning</b></p>
                <p></p>
                <p>If not already done, you  have to CLOSE your browser and then execute the following operations. For each step, you will have to take a screen capture considered as a proof of execution.</p>
                <p>The required operations are:</p>
                <li>Open the browser you will use to generate the State of Facts, please select the "Clear browsing data" menu and erase all the following data: browsing history, download history, cookies and other site data, cached images and files. Then take a screen capture of the menu with the related options checked as a proof of execution.</li>
                <li>Empty your recycle bin and take a screen capture of the your empty recycle bin as a proof of execution.</li>
                <li>Open a new empty browser window and take a screen capture of it as a proof of execution.
                <p></p>
                <p>Then access again the current Statement of Facts generator and click on the "Next" button: the next step will let you describe those operations and upload related screen captures as a proof of execution.
            </div>,
    },
    {
        wizardIntroduction:
            <div>
                <p><b>Mandatory initial browsing environment cleaning</b></p>
                <p></p>
                <p>As explained in the previous screen, you should have cleared browsing data and take a screen capture of the menu with the related options checked.</p>
            </div>,
        label: {
            en: "Mandatory initial browsing environment cleaning",
            fr: "Nettoyage initial du navigateur",
        },
        text: {
            en: "--",
            fr: "Avant de commencer la création de mon constat, j’efface toutes les données de navigation en ouvrant les paramètres de mon navigateur Firefox. Je m’assure que les cases « Historique de navigation », « Historique des téléchargements », « Images et fichiers en cache » et « Cookies et autres données de site » sont cochées puis je clique sur « Effacer les données ».",
        },
        addImage: true
    },              
    {
        wizardIntroduction:
            <div>
                <p><b>Recycle bin cleaning</b></p>
                <p></p>
                <p>As explained in the first screen, you should have cleared your recycle bin and take a screen capture of it as a proof of execution.</p>
            </div>,
        label: {
            en: "Recycle bin cleaning",
            fr: "Nettoyage de la corbeille",
        },
        text: {
            en: "--",
            fr: "La corbeille est vidée.",
        },
        addImage: true
    },
    {
        wizardIntroduction:
            <div>
                <p><b>New browser window opening and logion access</b></p>
                <p></p>
                <p>As explained in the first screen, you should have open a brand new browser window and take a screen capture of it as a proof of execution.</p>
            </div>,
        label: {
            en: "New browser window opening and logion access",
            fr: "Ouverture d'une nouvelle fenêtre de navigateur et accès à logion",
        },
        text: {
            en: "--",
            fr: "J’ouvre mon navigateur. Une page vierge se présente. Ensuite, afin d'accéder à logion et procéder à l'établissement de ce constat, je rentre l'adresse suivante "https://node02.logion.network/" puis m'identifie avec mes codes d'accès logion.
        },
        addImage: true
    },
    {
        wizardIntroduction:
            <div>
                <p><b>Network environment settings confirmation</b></p>
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
                <p><b>No-proxy environment confirmation</b></p>
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
              <p><b>Screen capture settings</b></p>
              <p></p>
              <p>Please provide in the following text area your screen resolution as well as the method / tool you are using to save your screen capture.</p>
            </div>,
        label: {
            en: "Screen capture settings",
            fr: "Paramètres de capture d'écran",
        },
        text: {
            en: "--",
            fr: "La résolution de mon écran est 1920 x 1080 pixels. Captures écran réalisées avec les touches Windows+Shift+S dans le presse-papier puis enregistrée en format JPEG à 80% avec le logiciel Snipping Tool de Windows ",
        }
    },
    {
        wizardIntroduction:
            <div>
              <p><b>Time and date check</b></p>
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
    {
        wizardIntroduction:
            <div>
              <p><b>Additional comment</b></p>
              <p></p>
              <p>Please write here any additional information you would like to mention within this Statement of Facts</div>,
        label: {
            en: "Additional comment",
            fr: "Information complémentaires",
        },
        text: {
            en: "--",
            fr: "Je n'ai aucune information complémentaire à mentioner.",
        },
        
    }
]
