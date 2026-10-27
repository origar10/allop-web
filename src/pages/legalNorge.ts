// Textos legales de la plataforma en Noruega (allop.no): bokmål y inglés. Los de España siguen en
// LegalPage.tsx. Las políticas de cada salón (sus clientes) viven en {slug}.allop.no/personvern.
// Mismos slugs que en España (/privacidad, /terminos, /cookies, /dpa) para no romper enlaces.

export interface SeccionLegal { heading: string; text: string[] }
export interface PaginaLegal { title: string; updatedAt: string; intro: string; sections: SeccionLegal[] }

const ACTUALIZADO = '2026-10-27';
const EMPRESA = 'Origarsolutions, S.L.';
const PERSONVERN = 'privacidad@origar.es';
const SUPPORT = 'soporte@allop.es';

const nb: Record<string, PaginaLegal> = {
  privacidad: {
    title: 'Personvernerklæring',
    updatedAt: ACTUALIZADO,
    intro: 'Slik behandler Allop personopplysninger når du besøker allop.no, registrerer en salong eller kontakter oss.',
    sections: [
      { heading: 'Behandlingsansvarlig', text: [`${EMPRESA} (Spania) driver Allop og er behandlingsansvarlig for opplysningene på denne siden. Kontakt om personvern: ${PERSONVERN}.`] },
      { heading: 'Hvilke opplysninger vi behandler', text: [
        'Salongkontoer: salongens navn, ditt navn, e-post, telefon (valgfritt), by og adresse, innloggingsdata og abonnementsstatus.',
        'Henvendelser via skjemaet «Vi setter det opp for deg»: salongens navn, Instagram eller nettside, navn, telefon/WhatsApp og e-post.',
        'Teknisk informasjon som IP-adresse og nettlesertype i serverlogger, for sikkerhet og feilsøking.',
        'Betalingskortet ditt behandles av Stripe; Allop ser eller lagrer aldri kortnummeret.',
      ] },
      { heading: 'Formål og rettslig grunnlag', text: [
        'Opprette og drifte salongkontoen, prøveperioden og abonnementet (avtale, GDPR art. 6 nr. 1 b).',
        'Svare på henvendelser og sette opp kontoen når du ber om det (tiltak før avtale, art. 6 nr. 1 b).',
        'Sikkerhet, misbruksforebygging og feilretting (berettiget interesse, art. 6 nr. 1 f).',
        'Bokføring og fakturaer (rettslig forpliktelse, art. 6 nr. 1 c).',
        'Analyse av besøk bare hvis du godtar det i informasjonskapsel-banneret (samtykke, art. 6 nr. 1 a).',
      ] },
      { heading: 'Hvem vi deler med (databehandlere)', text: [
        'Hetzner Online GmbH: servere i Helsingfors (Finland, EØS).',
        'Stripe: betaling og fakturering av abonnementet.',
        'Cloudflare: DNS for allop.no.',
        'Apple: kart (MapKit) på søkesidene.',
        'Discord: interne varsler til teamet om nye henvendelser og registreringer.',
        'Plausible: personvernvennlig analyse, bare med samtykke.',
        'Noen av disse kan behandle opplysninger utenfor EØS; da skjer det med EU-kommisjonens standardavtaler eller tilsvarende garantier.',
      ] },
      { heading: 'Hvor lenge vi lagrer', text: [
        'Salongkontoen lagres så lenge avtalen varer. Etter oppsigelse sletter vi eller anonymiserer opplysningene, bortsett fra det vi må beholde etter bokføringsregler.',
        'Henvendelser som ikke fører til en konto slettes når de ikke lenger er aktuelle.',
      ] },
      { heading: 'Dine rettigheter', text: [
        `Du kan be om innsyn, retting, sletting, begrensning, dataportabilitet og protestere mot behandling ved å skrive til ${PERSONVERN}.`,
        'Du kan klage til Datatilsynet (datatilsynet.no).',
      ] },
      { heading: 'Salongenes kunder', text: [
        'Når en kunde bestiller time hos en salong, er salongen behandlingsansvarlig og Allop databehandler. Salongens egen personvernerklæring finnes på bestillingssiden ({salong}.allop.no/personvern).',
      ] },
    ],
  },
  terminos: {
    title: 'Vilkår for salonger',
    updatedAt: ACTUALIZADO,
    intro: 'Disse vilkårene gjelder når en salong, barbershop eller annen virksomhet bruker Allop i Norge.',
    sections: [
      { heading: 'Tjenesten', text: [
        'Allop gir salongen en egen bestillingsside, timebok, kundeoversikt, nettpanel, appen Allop Pro for teamet og automatiske påminnelser til kundene.',
        'Allop håndterer ikke betaling fra salongens kunder.',
      ] },
      { heading: 'Prøveperiode', text: [
        'Nye salonger får 14 dager gratis fra e-posten er bekreftet. Vi ber ikke om betalingskort.',
        'Når prøveperioden er over uten aktivt abonnement, stenges bestillingssiden og panelet til abonnementet aktiveres. Dataene blir liggende.',
      ] },
      { heading: 'Pris og betaling', text: [
        'Basis koster 499 kr per måned eller 4 990 kr per år, inkludert mva. Det er ingen provisjon per bestilling.',
        'Betaling skjer forskuddsvis med kort via Stripe. Aktiveres abonnementet mens prøveperioden pågår, trekkes første betaling når prøveperioden er over.',
        'Prisendringer varsles minst 30 dager før de gjelder.',
      ] },
      { heading: 'Ingen binding og oppsigelse', text: [
        'Abonnementet kan sies opp når som helst fra panelet (Abonnement → Faktureringsportal). Det løper ut den perioden som er betalt, og påbegynte perioder refunderes ikke.',
        'Ved manglende betaling prøver vi igjen i noen dager; deretter kan kontoen bli suspendert.',
      ] },
      { heading: 'Salongens ansvar', text: [
        'Salongen er ansvarlig for at opplysningene om tjenester, priser og åpningstider er riktige, og for tjenestene den yter til kundene.',
        'Salongen er behandlingsansvarlig for kundenes opplysninger og skal ha en lovlig grunn for å registrere dem (se databehandleravtalen).',
        'Innloggingsdata er personlige og skal holdes hemmelige.',
      ] },
      { heading: 'Tilgjengelighet og ansvar', text: [
        'Vi gjør vårt beste for at Allop alltid er tilgjengelig, men kan ikke garantere drift uten avbrudd. Planlagt vedlikehold varsles når det er mulig.',
        'Allops samlede ansvar er begrenset til det salongen har betalt de siste 12 månedene. Vi er ikke ansvarlige for indirekte tap eller tapt fortjeneste.',
      ] },
      { heading: 'Endringer', text: [
        'Vi kan endre vilkårene. Vesentlige endringer varsles per e-post minst 30 dager før de trer i kraft.',
      ] },
      { heading: 'Kontakt', text: [`${EMPRESA} · ${SUPPORT}`] },
    ],
  },
  cookies: {
    title: 'Informasjonskapsler',
    updatedAt: ACTUALIZADO,
    intro: 'Slik bruker allop.no informasjonskapsler og lokal lagring.',
    sections: [
      { heading: 'Nødvendige', text: ['Brukes for innlogging, språkvalg, lyst/mørkt tema og for å huske valget ditt i banneret. Krever ikke samtykke.'] },
      { heading: 'Analyse', text: ['Plausible (uten informasjonskapsler for sporing) lastes bare hvis du trykker «Godta analyse». Trykker du «Avvis», lastes ingenting.'] },
      { heading: 'Endre valget', text: ['Slett lokal lagring for allop.no i nettleseren, så vises banneret igjen.'] },
    ],
  },
  dpa: {
    title: 'Databehandleravtale',
    updatedAt: ACTUALIZADO,
    intro: 'Denne avtalen er en del av vilkårene og gjelder opplysningene om salongens kunder og ansatte som lagres i Allop (GDPR art. 28).',
    sections: [
      { heading: 'Roller', text: [`Salongen er behandlingsansvarlig. ${EMPRESA} (Allop) er databehandler og behandler opplysningene bare etter salongens instrukser, det vil si for å levere tjenesten.`] },
      { heading: 'Hvilke opplysninger', text: [
        'Kunder: navn, e-post, telefon, timehistorikk, notater og eventuelle svar på helseskjema hvis salongen bruker det.',
        'Ansatte: navn, e-post, rolle, arbeidstid og innloggingsdata.',
      ] },
      { heading: 'Sikkerhet', text: [
        'Krypterte forbindelser (HTTPS), krypterte felt for sensitive opplysninger, tilgangsstyring per rolle, logging og daglige sikkerhetskopier.',
        'Alle som har tilgang hos Allop har taushetsplikt.',
      ] },
      { heading: 'Underleverandører', text: [
        'Hetzner Online GmbH (servere i Finland) og vår egen e-posttjeneste for påminnelser og koder. Nye underleverandører varsles på forhånd, og salongen kan protestere.',
      ] },
      { heading: 'Avvik', text: ['Vi varsler salongen uten ugrunnet opphold, og senest innen 48 timer, hvis vi oppdager et brudd på personopplysningssikkerheten.'] },
      { heading: 'Bistand og innsyn', text: ['Vi hjelper salongen med å svare på kundenes forespørsler om innsyn, retting og sletting, og gir informasjonen som trengs for å vise at avtalen følges.'] },
      { heading: 'Opphør', text: ['Når avtalen opphører, kan salongen be om eksport av dataene. Deretter slettes de, bortsett fra det loven krever at vi beholder.'] },
    ],
  },
};

const en: Record<string, PaginaLegal> = {
  privacidad: {
    title: 'Privacy policy',
    updatedAt: ACTUALIZADO,
    intro: 'How Allop handles personal data when you visit allop.no, register a salon or contact us.',
    sections: [
      { heading: 'Controller', text: [`${EMPRESA} (Spain) operates Allop and is the controller for the data on this site. Privacy contact: ${PERSONVERN}.`] },
      { heading: 'What we process', text: [
        'Salon accounts: salon name, your name, email, phone (optional), city and address, login data and subscription status.',
        'Requests through the «We set it up for you» form: salon name, Instagram or website, name, phone/WhatsApp and email.',
        'Technical information such as IP address and browser type in server logs, for security and troubleshooting.',
        'Your card is handled by Stripe; Allop never sees or stores the card number.',
      ] },
      { heading: 'Purposes and legal basis', text: [
        'Running the salon account, trial and subscription (contract, GDPR art. 6(1)(b)).',
        'Answering requests and setting up the account when you ask us to (pre-contractual steps, art. 6(1)(b)).',
        'Security, abuse prevention and bug fixing (legitimate interest, art. 6(1)(f)).',
        'Bookkeeping and invoices (legal obligation, art. 6(1)(c)).',
        'Visit analytics only if you accept it in the cookie banner (consent, art. 6(1)(a)).',
      ] },
      { heading: 'Who we share with (processors)', text: [
        'Hetzner Online GmbH: servers in Helsinki (Finland, EEA).',
        'Stripe: subscription payments and invoicing.',
        'Cloudflare: DNS for allop.no.',
        'Apple: maps (MapKit) on the search pages.',
        'Discord: internal alerts to the team about new requests and sign-ups.',
        'Plausible: privacy-friendly analytics, only with consent.',
        'Some of them may process data outside the EEA; when they do, it is under the EU Commission’s standard contractual clauses or equivalent safeguards.',
      ] },
      { heading: 'How long we keep it', text: [
        'The salon account is kept for as long as the agreement runs. After cancellation we delete or anonymise the data, except what bookkeeping rules require us to keep.',
        'Requests that do not lead to an account are deleted once they are no longer relevant.',
      ] },
      { heading: 'Your rights', text: [
        `You can ask for access, rectification, erasure, restriction and portability, and object to processing, by writing to ${PERSONVERN}.`,
        'You can complain to the Norwegian Data Protection Authority, Datatilsynet (datatilsynet.no).',
      ] },
      { heading: 'Salons’ customers', text: [
        'When a customer books at a salon, the salon is the controller and Allop the processor. The salon’s own privacy policy is on its booking page ({salon}.allop.no/personvern).',
      ] },
    ],
  },
  terminos: {
    title: 'Terms for salons',
    updatedAt: ACTUALIZADO,
    intro: 'These terms apply when a salon, barbershop or other business uses Allop in Norway.',
    sections: [
      { heading: 'The service', text: [
        'Allop gives the salon its own booking page, calendar, client list, web panel, the Allop Pro app for the team and automatic reminders to clients.',
        'Allop does not handle payments from the salon’s clients.',
      ] },
      { heading: 'Free trial', text: [
        'New salons get 14 days free from the moment their email is confirmed. No card is required.',
        'When the trial ends without an active subscription, the booking page and the panel are closed until the subscription is activated. The data is kept.',
      ] },
      { heading: 'Price and payment', text: [
        'Basic costs NOK 499 per month or NOK 4,990 per year, VAT included. There is no commission per booking.',
        'Payment is made in advance by card through Stripe. If the subscription is activated during the trial, the first payment is taken when the trial ends.',
        'Price changes are announced at least 30 days before they apply.',
      ] },
      { heading: 'No commitment and cancellation', text: [
        'The subscription can be cancelled at any time from the panel (Subscription → Billing portal). It runs until the end of the paid period; started periods are not refunded.',
        'If a payment fails we retry for a few days; after that the account may be suspended.',
      ] },
      { heading: 'Salon’s responsibilities', text: [
        'The salon is responsible for the accuracy of its services, prices and opening hours, and for the services it provides to its clients.',
        'The salon is the controller of its clients’ data and must have a lawful basis for registering them (see the data processing agreement).',
        'Login details are personal and must be kept secret.',
      ] },
      { heading: 'Availability and liability', text: [
        'We do our best to keep Allop available at all times but cannot guarantee uninterrupted operation. Planned maintenance is announced whenever possible.',
        'Allop’s total liability is limited to what the salon has paid in the last 12 months. We are not liable for indirect loss or lost profit.',
      ] },
      { heading: 'Changes', text: ['We may change these terms. Material changes are announced by email at least 30 days before they take effect.'] },
      { heading: 'Contact', text: [`${EMPRESA} · ${SUPPORT}`] },
    ],
  },
  cookies: {
    title: 'Cookies',
    updatedAt: ACTUALIZADO,
    intro: 'How allop.no uses cookies and local storage.',
    sections: [
      { heading: 'Necessary', text: ['Used for login, language, light/dark theme and remembering your choice in the banner. No consent needed.'] },
      { heading: 'Analytics', text: ['Plausible (no tracking cookies) only loads if you press «Accept analytics». If you press «Decline», nothing is loaded.'] },
      { heading: 'Changing your choice', text: ['Clear local storage for allop.no in your browser and the banner will show again.'] },
    ],
  },
  dpa: {
    title: 'Data processing agreement',
    updatedAt: ACTUALIZADO,
    intro: 'This agreement is part of the terms and covers the data about the salon’s clients and staff stored in Allop (GDPR art. 28).',
    sections: [
      { heading: 'Roles', text: [`The salon is the controller. ${EMPRESA} (Allop) is the processor and only processes the data on the salon’s instructions, that is, to provide the service.`] },
      { heading: 'What data', text: [
        'Clients: name, email, phone, booking history, notes and any health form answers if the salon uses that form.',
        'Staff: name, email, role, working hours and login data.',
      ] },
      { heading: 'Security', text: [
        'Encrypted connections (HTTPS), encrypted fields for sensitive data, role-based access, logging and daily backups.',
        'Everyone with access at Allop is bound by confidentiality.',
      ] },
      { heading: 'Sub-processors', text: [
        'Hetzner Online GmbH (servers in Finland) and our own email service for reminders and codes. New sub-processors are announced in advance and the salon may object.',
      ] },
      { heading: 'Breaches', text: ['We notify the salon without undue delay, and within 48 hours at the latest, if we detect a personal data breach.'] },
      { heading: 'Assistance and audits', text: ['We help the salon answer its clients’ requests for access, rectification and erasure, and provide the information needed to show the agreement is complied with.'] },
      { heading: 'Termination', text: ['When the agreement ends, the salon can ask for an export of its data. After that it is deleted, except what the law requires us to keep.'] },
    ],
  },
};

export const LEGAL_NORGE: Record<'nb' | 'en', Record<string, PaginaLegal>> = { nb, en };

/** Enlaces del pie de Noruega: slug → título en el idioma. */
export const ENLACES_LEGALES_NORGE = ['privacidad', 'terminos', 'cookies', 'dpa'] as const;
