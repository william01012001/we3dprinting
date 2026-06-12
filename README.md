# Pro3D Manufacturing Calculator

STL-only MVP website voor automatische prijsberekening.

## Nieuw in deze versie

- Keuzebalk printtechniek: FDM, SLA, SLS
- Daarna materiaalkeuze per techniek
- Duidelijke uitleg per printtechniek
- Duidelijke uitleg/specs per materiaal
- Kleuren per techniek:
  - FDM: wit, zwart, blauw
  - SLA: grijs, wit, zwart
  - SLS standaard: zwart
  - SLS foodgrade: wit of blauw
- SLS materialen: PA12 en PA11
- SLA materialen op basis van Anycubic:
  - Anycubic Standard Resin V2
  - Anycubic Tough Resin 2.0
  - Anycubic ABS-Like Resin Pro 2
  - Anycubic DLP Craftsman Resin
- Foodgrade vinkje voor SLS
- Geruite grid in 3D viewer verwijderd
- Marge/winst uitleg toegevoegd

## Installatie

```bash
npm install
npm start
```

Open daarna:

```text
http://localhost:3000
```

## Belangrijk

Open niet direct `public/index.html`. De calculator werkt via de Node server op `localhost:3000`.

## Prijzen aanpassen

Open `server.js` en pas `MATERIALS` aan.

Voorbeeld:

```js
fdm_pla: {
  density: 1.24,
  materialEuroPerKg: 24,
  machineEuroPerHour: 3.5,
  setup: 10,
  minimum: 15,
  finishFactor: 1.0
}
```

Betekenis:

- `density`: dichtheid in g/cm³
- `materialEuroPerKg`: materiaalprijs per kg
- `machineEuroPerHour`: machinekosten per uur
- `setup`: instelkosten per order
- `minimum`: minimumprijs
- `finishFactor`: opslag voor nabewerking/moeilijkheid

## Foodgrade

In deze versie is foodgrade met certificaat alleen beschikbaar voor SLS. Als foodgrade aangevinkt is, kan de klant alleen wit of blauw kiezen. Zonder foodgrade staat SLS standaard op zwart.

Let op: echte foodgrade verkoop vereist dat je materiaal, proces en nabewerking ook daadwerkelijk food-contact geschikt en aantoonbaar zijn. De calculator rekent alleen de optie door.


## V6 wijzigingen
- SLS materiaalprijs intern aangepast naar €65/kg.
- Printers en maximale formaten toegevoegd:
  - FDM: FDM printformaat — 325 × 320 × 325 mm
  - SLA: SLA printformaat — 298 × 164 × 300 mm
  - SLS: SLS printformaat — 220 × 220 × 350 mm
- Als een STL groter is dan het gekozen printerformaat, toont de calculator direct een duidelijke melding en rekent hij geen prijs door.
- Anycubic-naam is uit de zichtbare materiaalnamen gehouden.


## V9
- Printtijd verwijderd uit klantresultaat.
- Resultaatscherm opgeschoond: alleen prijs, btw, gemiddelde stukprijs, afmetingen en gekozen optie.
- Serieprijs aangepast: opstartkosten zitten in 1 stuk, maar worden maar één keer gerekend bij meerdere stuks. Daardoor daalt de prijs per stuk duidelijk bij aantallen.


## V9 prijslogica

- FDM machinekosten: €1 per uur excl. materiaal.
- SLA machinekosten: €1 per uur excl. materiaal.
- SLS machinekosten: €4 per uur excl. materiaal.
- Stroomkosten: €0,50 per printuur.
- Arbeid per opdracht: FDM 10 minuten, SLA 30 minuten, SLS 1,5 uur.
- Arbeidstarief: €50 per uur.
- Opslag: 40% over de complete interne kostprijs.
- Arbeid/opstart wordt maar 1 keer per opdracht gerekend, waardoor prijs per stuk lager wordt bij hogere aantallen.


V11: Supportveld verwijderd. Support wordt automatisch geschat op basis van overhang in het STL-model. SLS krijgt automatisch 0% support.


## V16 wijzigingen
- Wanddikte FDM standaard naar 0.4 mm.
- Verzendland toegevoegd bij checkout.
- Verzendkosten worden berekend op basis van PostNL indicatieve tarieven per land, gewicht en formaat.


## Contactformulier e-mail
Het contactformulier stuurt naar info@Pro3DManufacturing.nl wanneer SMTP is ingesteld. Zonder SMTP worden vragen opgeslagen in de map `messages`.

Voor echt mailen zet je deze environment variables voordat je start:

```bash
set SMTP_HOST=smtp.jouwdomein.nl
set SMTP_PORT=587
set SMTP_USER=info@Pro3DManufacturing.nl
set SMTP_PASS=jouw_wachtwoord
set SMTP_FROM=info@Pro3DManufacturing.nl
npm start
```

Let op: `info@Pro3DManufacturing.nl` moet bij je hosting/provider als echte mailbox of alias bestaan.


V23: SLA en SLS rustiger geprijsd, SLA support minder zwaar, wanddikte standaard 0.4 mm.


V24: SLA materiaalprijzen aangepast naar actuele inkoopprijzen en SLA machinekosten terug naar €1/uur.


V25 wijzigingen:
- FDM materiaalprijzen aangepast: PLA €14/kg, PETG €18/kg, ASA/ABS €24/kg, PC €42/kg.
- SLA arbeid naar 30 minuten per order.
- SLS arbeid naar 1,5 uur per order.
- 40% opslag wordt niet meer over arbeid gerekend.


V27: PA6-CF verwijderd. ABS, ABS-GF en ASA-CF toegevoegd. ABS/ASA/PETG/PLA prijzen aangepast op basis van actuele inkoopindicaties.


V28: ABS-GF verwijderd uit FDM materiaalkeuze.


V29: ASA-CF verwijderd. Alleen ASA basis blijft beschikbaar.


V35: Terug naar stabiele dropdown-versie. Frontend app.js opnieuw opgebouwd zodat STL upload en FDM/SLA/SLS wisselen weer betrouwbaar werken.


V36: Syntaxfout in server.js opgelost bij PRINTERS/blok. Node start weer normaal.


V37: Mooie FDM/SLA/SLS keuze-balk teruggezet, maar technisch blijft de stabiele dropdown op de achtergrond werken.


V38: FDM risico-regels strenger gemaakt. Kleine organische/lastige modellen met veel overhang/detail gaan weer naar aanvraag. SLS blijft direct bestelbaar binnen maatvoering; SLA blijft soepeler.


V39: FDM veel strenger gezet. Alleen simpele gesloten FDM-geometrie kan direct bestellen; veel support/detail/organische of dunne vormen worden aanvraag.


V40: FDM risico slimmer gemaakt. Niet-watertight blokkeert niet meer automatisch; dunne lijntjes/wire-achtige vormen, lage fill-ratio, hoge surface/volume en support/overhang gaan naar aanvraag.


V41: SLA risico-regeling soepeler gemaakt. SLA accepteert dunne/organische vormen sneller; alleen extreem kapotte, zware of ultradunne modellen gaan naar aanvraag.


V42: Frontend gefixt: bij opnieuw proberen verdwijnt winkelwagenknop en verschijnt Aanvraag versturen. Cart laden is robuuster gemaakt tegen oude/foute localStorage items.


V43: Winkelwagen openen robuuster gemaakt met delegated click handler, automatische opschoning van kapotte cart-data en resetPro3DCart noodfunctie.


V44: Zichtbare knop 'Winkelwagen resetten' toegevoegd plus ?resetCart=1 optie, zodat console plakken niet meer nodig is.


V45: Automatische winkelwagen-cleaner toegevoegd. Oude/foute producten zonder geldig schema, prijs, quote-id, STL-naam of aanvraagproducten worden automatisch verwijderd.


V46: Resetknop verwijderd. Winkelwagen openen simpeler en direct gemaakt met window.openPro3DCart + normale listener. Cart drawer krijgt ook fallback display:block bij openen.


V47: Winkelwagenflow teruggezet en versimpeld. Na toevoegen verschijnt weer Product toegevoegd met Verder winkelen / Naar winkelwagen. Cart-knop gebruikt simpele onclick-functie. Resetknop blijft verwijderd.


V48: Lelijke popup verwijderd. Winkelwagen opnieuw hard/stabiel gemaakt als vaste drawer met eigen CSS override. Toevoegen aan winkelwagen opent direct de drawer.


V49: Winkelwagen-lade hard naar rechts geforceerd en blur/backdrop-filter volledig verwijderd. Open/close JS zet nu ook inline right/top/height/filter stijlen.


V50: Winkelwagen klikbaar gemaakt: klikken in drawer sluit hem niet meer. Drawer z-index boven overlay gezet en doffe/blur styling hard verwijderd.


V53: Checkout is nu een popup/modal. Formulier staat links, samenvatting met totaalprijs rechts. Afrekenen opent modal in plaats van naar onderen scrollen.


V54: Checkout-samenvatting toont nu materiaal/techniek en aantallen. Simpele privé toegangscode toegevoegd: pro3d2026. Ook mogelijk via ?code=pro3d2026.


V55: Layout compacter gemaakt zodat 100% browserzoom meer lijkt op 75%. Scrollwiel op 3D viewer zoomt model niet meer; pagina blijft normaal scrollen.


V56: 3D viewer kan weer zoomen zonder pagina-scroll kapot te maken. Normaal scrollen = pagina scroll; Ctrl/Shift + scroll = model zoom. Ook + / − / Reset knoppen toegevoegd.


V57: FDM handmatige-controle drempels iets soepeler gezet. Vlakke/simpele onderdelen gaan sneller direct naar winkelwagen; echte wire/dunne/support/organische risico's blijven aanvraag.


V58: 3D model opent dichterbij/groter in beeld. Topbar/navigatieknoppen groter en duidelijker gemaakt.


V59: SLA-teksten aangevuld met miniaturen/figuren als toepassing.


V60: Layout opnieuw gecentreerd en minder uitgezoomd gemaakt. Max-width kleiner, kaarten groter, calculator netter verdeeld.


V61: Beeld iets voller gemaakt: bredere content, grotere kaarten, minder lege ruimte en grotere viewer.


V62: Wie zijn wij pagina gecentreerd en bovenste introkaart uitgelijnd met de kaarten eronder.


V63: Viewer + / - / Reset en helptekst verwijderd. Bovenin alleen bedrijfsnaam behouden, subtitel verwijderd.


V64: Scrollen boven de 3D-viewer laat de pagina normaal scrollen. Bij upload wordt de camera automatisch passend op het model gezet.


V65: Preview camera fit nu echt automatisch op het STL-model. Scrollen boven viewer blijft pagina-scroll zonder Ctrl/Shift.


V66: Na STL upload verschijnt in het resultaatblok ook een Bereken prijs knop.


V67: Na STL upload staat er nu ook een duidelijke Bereken prijs knop in het resultaatblok.


V68: Bereken prijs knop in resultaatblok verwijderd. Maximaal aantal stuks verhoogd naar 9999.


V69: Laatste overgebleven resultaat-knop code verwijderd. Aantal blijft max 9999.


V70: Nederlands/Engels taalwissel werkend gemaakt met localStorage en vertaling van belangrijkste teksten.


V71: Alle pagina's (calculator, over-ons, contact) hebben nu een gedeelde NL/EN taalmodule. Ook dynamische teksten zoals resultaat, winkelwagen en checkout worden mee vertaald.


V72: 3D productviewer sticky gemaakt zodat deze meebeweegt tijdens scrollen binnen de calculator.


V73: Vertaling opgeschoond: oude app-taalcode verwijderd, gedeelde vertaler uitgebreid voor resultaat, materiaalinfo, winkelwagen, checkout, contact en dynamische teksten.


V74: Dynamische materiaalkaarten/specs worden direct opnieuw vertaald na wijzigingen. Extra materiaalvertalingen toegevoegd.


V75: Extra vertalingen toegevoegd voor laaghoogte-opties zoals '0.20 mm - standaard keuze'.


V76: Dropdown-opties voor laaghoogte en infill type volledig vertaald, inclusief directe refresh na taalwissel en UI-updates.


V78: Taalbug definitief gefixt. Vertaler onthoudt originele Nederlandse tekst per node en vertaalt alleen daarvan naar Engels; geen herhaal-loop meer zoals 'Resultaataataat'.


## V80 STEP automatische conversie

- STL upload blijft direct werken met preview en automatische prijs.
- STEP upload wordt op de server automatisch geconverteerd naar STL via FreeCAD.
- Als conversie lukt, rekent de bestaande STL-calculator automatisch prijs uit.
- Als conversie mislukt, krijgt de klant een handmatige aanvraag-melding.

### Render deploy

Gebruik voor deze versie Render als Docker Web Service, zodat FreeCAD mee geïnstalleerd wordt.

- Build/runtime: Docker
- Start command is niet nodig; Dockerfile gebruikt `npm start`.


V81: Front-end STEP uploadcheck gefixt. STEP wordt niet meer direct geweigerd en wordt bij berekenen naar de server gestuurd voor conversie.


V82: STEP converter verbeterd met MeshPart.meshFromShape en /api/cad-health endpoint voor FreeCAD diagnose.


V83: FreeCAD headless/offscreen fix voor Render Docker. QT_QPA_PLATFORM=offscreen toegevoegd.


V84: Docker dependency fix. Dockerfile installeert npm dependencies na COPY en controleert express/multer tijdens build.


V85: Docker npm fix. Package-lock verwijderd en Docker installeert express/multer/cors/nodemailer expliciet.


V86: FreeCAD Render fix met xvfb-run wrapper `freecad-headless`. Cad-health gebruikt nu HEALTH i.p.v. --health.


V87: STEP import robuuster gemaakt met Import.open + compound fallback en duidelijke foutdetails.


V88: STEP converter vermijdt Import.open/QtWebEngine eerst en zet QTWEBENGINE_CHROMIUM_FLAGS=--no-sandbox.


V89: FreeCAD wordt niet meer als programma/freecadcmd gestart. STEP conversie gebruikt python3 direct met FreeCAD Python libraries om QtWebEngine/Add-on Manager problemen te vermijden.


V90: STEP extensie-fix. Multer upload zonder extensie wordt eerst gekopieerd naar tijdelijk .step/.stp bestand voordat FreeCAD het leest.


V94: Stabiele rollback op V90 upload/STEP conversie met alleen veilige standalone toegangscode en naam 'calculatie'. Geen agressieve app.js vervangingen.


V96: Stabiele viewer-flow. Nieuwe bestandsselectie maakt viewer direct leeg. STL previewt direct. STEP previewt pas na succesvolle serverconversie naar opgeslagen STL via /api/quote-stl.


V97: Snelle STEP-preview toegevoegd. Bij STEP selectie start direct een aparte /api/preview-step conversie, zodat de viewer al kan laden vóór de prijsberekening.


V98: Materiaalkeuze aangepast. PETG Basic / HF is PETG Basic geworden. FDM materialen zijn gegroepeerd met TPU apart onder Flexibel.


V99: Homepage techniek-uitleg herschreven. Minder algemene marketingtekst, duidelijker wanneer FDM/SLA/SLS gekozen moet worden.


V100: Uitgebreide, duidelijke uitleg voor FDM, SLA en SLS toegevoegd. SLS vermeldt eindproducten en optionele foodgrade met certificaat.


V101: FDM uitleg aangepast met zichtbare printlijnen en laagopbouw als mogelijk zwakker punt. Standaard wanddikte aangepast naar 0.8 mm.


V102: Teksten aangepast naar STL- of STEP-bestand. STP is overal verwijderd. Engelse vertalingen opgeschoond.


V106: Herstelversie vanaf V102. Logo embedded als data-image. Upload click/change/drop robuust hersteld voor .stl en .step. STP blijft verwijderd.


V107: Upload fix. Uploadvak is nu native label for=fileInput, zodat klikken altijd de Windows bestandselectie opent. V106 preventDefault click-handler verwijderd.


V108: Upload ID fix. HTML input gebruikt nu id=fileInput en label id=dropzone/for=fileInput, gelijk aan app.js. App.js heeft fallback naar modelFile/.dropzone.


V109: Echte upload runtime fix. app.js gebruikt nu fileInput/dropzone ids die HTML heeft, dropzone wordt voor gebruik gedeclareerd en de te vroege crash-code is verwijderd. Over-ons teksten opnieuw hersteld.


V110: Homepage FDM/SLA/SLS knoppen springen nu naar de calculatie en selecteren meteen de gekozen printtechniek. Verder geen upload/viewer/server logic aangepast.


V111: Naam gewijzigd naar Pro3D Manufacturing, e-mail naar info@Pro3DManufacturing.nl, logo vervangen door aangeleverd Pro3D Manufacturing logo. Upload/viewer/calculatie niet aangepast.


V112: Website e-mailadres aangepast naar info@Pro3DManufacturing.nl. Verder niets aangepast aan upload/viewer/calculatie.


V113: Contactgegevens netter gemaakt. Bedrijfsnaam boven telefoon toegevoegd en e-mailadres gecorrigeerd naar info@Pro3DManufacturing.nl zonder spatie.


V115: Contactblok met klein logo netjes gemaakt. Engelse hoofdpagina-vertalingen uitgebreid zodat ze gelijkwaardig zijn aan Nederlands. Upload/viewer/calculatie niet aangepast.


V116: Hero kaart aangepast naar STL / STEP. Contactkaart compact gemaakt zodat bedrijfsnaam en e-mail binnen de kaart blijven.


V117: Alleen e-mailtekst in contactkaart kleiner/strakker gemaakt. Geen upload/viewer/calculatie aangepast.


V118: Winkelwagen hersteld vanaf stabiele V110 cart-code en extra fallback binding toegevoegd. Upload/viewer/calculatie/contactlayout niet aangepast.


V119: Alleen winkelwagenknoppen gefixt. openCartBtn, closeCartBtn, cartOverlay, checkoutBtn en clearCartBtn opnieuw gekoppeld aan bestaande cart drawer.


V120: TPU 85A en TPU 90A apart gezet. PETG-CF, ABS, ASA, TPU 85A en TPU 90A als risicomaterialen met 50% marge. Geen upload/viewer/winkelwagen/contact aangepast.


V121: Opnieuw berekenen bug gefixt. Geselecteerd STL/STEP bestand wordt intern onthouden en opnieuw toegevoegd aan FormData. Na een fout blijft berekenen mogelijk zonder opnieuw uploaden.


V122 clean: Prijsfix zonder PLA/PETG basisprijzen te wijzigen. Berekening gebruikt nu m.markup 0.50 voor risicomaterialen. Risicovol FDM-materiaal kan niet goedkoper uitvallen dan PLA voor dezelfde print.


V123: Account systeem voor vaste zakelijke klanten toegevoegd. Klant kan account aanmaken/inloggen. Checkout heeft privé/zakelijk keuze, zakelijke velden bedrijfsnaam + btw-nummer, en betalen op factuur voor ingelogde vaste klanten.


V124: Publiek account aanmaken uitgeschakeld. Alleen Pro3D kan vaste klantaccounts aanmaken via /admin-accounts.html met ADMIN_CODE. Factuurbetaling blijft alleen beschikbaar voor ingelogde door Pro3D aangemaakte accounts.


V125: Adminpagina eerst vergrendeld met admin-code. Accounts overzicht toegevoegd. Admin kan adresgegevens invullen. Klant kan voornaam/achternaam/adres zelf aanpassen, maar bedrijfsnaam/btw/factuurrecht blijven vast. Accountknop naast taalkeuze gezet.


V126: Order portaal toegevoegd op /admin-orders.html met verplichte admin-code per sessie, geen opslag van admin-code. Orders sorteren op datum/bedrag, zoeken en detail openen. Nieuwe orders sturen een e-mail via SMTP als SMTP ingesteld is en blijven opgeslagen in orders-map.


V127: Checkout voor ingelogde vaste klanten opgeschoond. Bij ingelogd account worden klantvelden verborgen en accountgegevens automatisch gebruikt. PO/orderreferentie veld toegevoegd. Note blijft zichtbaar.


V128: Checkout opgeschoond. Keuzeknop 'op factuur vaste klant' weggehaald; ingelogd = automatisch factuur, niet ingelogd = normale aanvraag. PO/orderreferentie bij ordergegevens. Account heeft kopje Gegevens met adresvelden.


V129: BTW-check toegevoegd via EU VIES. Controleert btw-nummer en vergelijkt geregistreerde bedrijfsnaam met ingevulde bedrijfsnaam. Beschikbaar in zakelijke checkout en admin accountbeheer. Ongeldig btw-nummer blokkeert; VIES offline geeft melding maar blokkeert niet onnodig.


V130: BTW-check blokkeert niet meer hard; VIES ongeldig/naamafwijking is waarschuwing. Account knop fallback toegevoegd zodat account modal weer opent.


V131: Runtime crash in app.js gefixt. Per ongeluk geplaatste updateCheckoutModeForAccount() in de materiaaldata verwijderd. Upload, winkelwagen en account bindings daardoor hersteld.


V132: Grote STL fix. Binary STL analyse gebruikt low-memory iteratie i.p.v. volledige triangle-array/edge-map. Support-analyse gebruikt ook streaming iteratie. Frontend leest calculate response veilig als tekst zodat lege/afgebroken responses nette melding geven.


V133: BTW-check verbeterd voor NL. Naamvergelijking gebruikt eerste hoofdwoord zoals Freshtech. NL-formaat NL123456789B01 krijgt fallbackValid wanneer VIES niet positief bevestigt of offline is. Resultaat wordt waarschuwing, geen rode blokkade.


V134: Account-popup tekst aangepast. Klanten worden nu verwezen naar het aanvraagformulier op de contactpagina om een vast klantenaccount aan te vragen. Geen functies aangepast.


V135: Btw-controle/VIES verwijderd uit checkout en admin. Btw-nummer blijft invulveld en verplicht bij zakelijke klanten, maar er wordt niet meer extern gecontroleerd. Geen andere functies aangepast.


V136: Engelse vertalingen gecontroleerd/aangevuld. Account-aanvraagtekst en checkout/accountvelden correct vertaald naar Engels. Geen functies aangepast.


V137: Klanten kunnen in hun account eigen orders bekijken en orderdetails openen. Klant kan eigen wachtwoord wijzigen. Na order plaatsen toont checkout: bedankt voor uw order, ordernummer en bevestigingstekst. Geen andere functies aangepast.


V138: Order plaatsen JSON-fix. /api/order is volledig in try/catch gezet en geeft altijd JSON terug. Frontend leest order-response veilig als tekst en daarna JSON. Order wordt eerst opgeslagen voordat e-mail verstuurd wordt.


V139: Stale account fix. Als browser nog oude accountgegevens/token heeft maar account bestaat niet meer op server, wordt klant automatisch uitgelogd en checkout gebruikt geen oud account meer.


V140: Account popup dashboard layout. Grotere account-popup met menu links: Gegevens, Orders, Wachtwoord. Rechterpaneel toont alleen gekozen onderdeel. Orders tonen lijst links en detail rechts.


V141: Orderdocumenten en statusbeheer. Admin kan status aanpassen, offerte/factuur openen en upload/STL bestanden downloaden. Klant kan offerte/factuur openen en status zien. Berekening bewaart originele upload bij quote zodat orderdownload mogelijk is voor nieuwe orders.


V142: Startup fix. De foutieve V141-regels `orderUploadsDir = path.join(dataDir, ...)` en `ensureDir(orderUploadsDir)` zijn verwijderd. Server gebruikt bestaande quotes-map voor orderbestand-downloads. Geen functionele wijzigingen.


V143: Account flow fix. Blur zonder modal gefixt door inner panels te hernoemen naar account-content-panel. Niet-ingelogd toont weer klein inlogscherm. Ingelogd toont eerst klein keuzescherm, daarna groot dashboard per keuze.


V144: Admin orderdetail index-fout opgelost door item map index mee te geven. Calculator reset oude prijs direct bij iedere instelling-wijziging zodat opnieuw berekenen verplicht is.


V145: Account/order layout groter en zonder horizontale schuif. Offerte/factuur worden nu als PDF-download gegenereerd met logo via pdfkit. Documentlinks gaan naar .pdf met attachment download.


V146: Lopende berekening wordt ongeldig bij instelling-wijziging. Oude response wordt genegeerd, knop wordt direct vrijgegeven en klant kan meteen opnieuw berekenen.


V147: Account opnieuw openen fix. Bij sluiten/reset wordt dashboard verborgen en account-modal-wide verwijderd. Bij opnieuw openen verschijnt altijd eerst klein login/keuzescherm; groot dashboard opent alleen na keuze.


V148: PDF route fix. Simpele route /api/order/:orderNumber/:docName toegevoegd voor quote.pdf en invoice.pdf. readOrderFile zoekt orderbestand robuuster. Factuur/offerte downloaden nu via PDF attachment.


V149: PDF publicDir fix + STL guard. Logo pad in PDF gebruikt nu __dirname/public/logo.png. Zware STL-bestanden worden vóór analyse begrensd op MB/triangles en geven handmatige-controle melding i.p.v. service crash.


V150: Status verwijderd uit factuur/offerte PDF. Status blijft wel zichtbaar in orderportaal en klantaccount.


V151: PDF spacing fix. Meer ruimte tussen klantgegevens/PO en tabelkop Omschrijving. Itemregels iets ruimer gezet. Geen functionele wijzigingen.


V152: Orderlijst toont statusbadge. Admin orderdetail krijgt track & trace velden: vervoerder, code en link. Klantaccount toont track & trace wanneer ingevuld. Factuur/offerte PDF blijven zonder status.


V153: STL automatische berekening zonder vooraf ingestelde triangle/MB limiet. De vooraf-stop op zware STL's is verwijderd. Zware STL wordt gewoon berekend; alleen echte server/geheugenfouten worden nog netjes afgevangen.


V154: FDM voorbereidingstijd aangepast van 10 minuten naar 15 minuten. Geen andere wijzigingen.


V155: Winkelwagen safety check accepteert nu STL én STEP bestandsnamen. Oorzaak fout: cart-validatie stond nog alleen op .stl terwijl calculator/upload ook .step ondersteunt.


V156: Mobiele checkout klanttype Privé/Zakelijk netjes gemaakt. FDM maakbaarheidscontrole iets minder streng gezet: wire/high-surface/thin/support/minDim thresholds ruimer. Geen prijswijzigingen.


V157: Checkout responsive fix. Desktop/tablet en telefoon gescheiden: klanttype naast elkaar op breed scherm, onder elkaar op mobiel. Mobiel krijgt extra onderruimte zodat bestelknop niet onder browserbalk verdwijnt.


V158: STEP-preview overschrijft berekenresultaat niet meer. Late preview-response wordt genegeerd zodra berekening gestart/afgerond is, terwijl viewer-preview wel blijft laden.


V159: Account/orders layout fix. Dubbele scrollbars verwijderd: alleen buitenste account-popup scrollt nog, orderlijst en orderdetail scrollen niet meer apart. Horizontale scroll blijft uit.


V160: Track & trace popup toegevoegd. Als admin status op Verzonden zet en opslaat, opent popup voor vervoerder/code/link. Opslaan zet status op shipping en bewaart track & trace.


V161: Track & trace popup click fix. Annuleren/X/Opslaan hebben inline fallback en globale functions, plus pointer-events/z-index fix zodat knoppen altijd klikbaar zijn.


V162: Mobiele winkelwagen/checkout fix. Alleen via max-width 640px CSS extra onderruimte en safe-area toegevoegd, zodat afrekenknoppen boven iPhone/Safari balk bereikbaar blijven. Desktop onaangeraakt.


V164: Harde staffelkorting vervangen door vloeiende logaritmische seriekorting. 1 stuk = 0%, 1000+ stuks = max 40%. Geen zichtbare website-grafiek toegevoegd.


V165: Max seriekorting 50%, gewicht in winkelwagen/checkout/orderdetail verbeterd, bedrijfsnaamveld verborgen bij Privé, en na succesvolle bestelling formulier vervangen door nette NL/EN bedankmelding met ordernummer.


V166: Checkout success scherm centraal/groot gemaakt, samenvatting verdwijnt na order, knop Sluiten toegevoegd en dubbele bedrijfsnaam bij zakelijk weggehaald. Mollie nog niet toegevoegd.


V167: bedankscherm gecentreerd gemaakt, volle nette kaart in het midden met betere spacing en zelfde visuele vorm als de achtergrondkaart.


V168: FDM gewicht realistischer gemaakt met slicer-achtige ondergrens op basis van massief modelvolume. Labels tonen 'Geschat gewicht'. Geen echte slicer toegevoegd.


V169: hero tekst bovenaan aangepast van "FDM · SLA · SLS" naar "FDM SLA SLS" zonder scheidingstekens. Cache bumped naar v169.


V170: FDM geschat gewicht gefixt. Gewicht wordt weer logisch gebaseerd op echte STL-inhoud/modelvolume met begrenzing, niet op bounding box. Extreme kilo-uitlezingen voorkomen.


V171: FDM gewicht herberekend met oppervlak × wanddikte + intern volume × infill%. Geen agressieve massieve ondergrens meer.


V172: SLA printtijd/prijs verbeterd. SLA tijd nu op basis van Z-hoogte / laaghoogte × 4,2 sec per laag plus lift/settling marge. SLA machine/handling en resinverlies realistischer gezet.


V173: SLA printtijd aangepast van 4,2 seconden per laag naar 4,0 seconden per laag. Verder niets aangepast.


V174: SLA prijs getuned. 4,0 sec/laag blijft, maar SLA arbeid 30 min, machine 1,8 €/uur en resinverlies 15% zodat SLA niet ca. 20 euro te hoog uitvalt.


V175: SLA printtijd aangepast van 4,0 seconden per laag naar 3,8 seconden per laag. Marge blijft 40% over productiekosten, niet over arbeid.


V176: SLA machinekosten teruggezet naar 1,00 euro per uur. Stroom blijft 0,50 euro per uur. SLA 3,8 sec per laag, arbeid 30 min en resinverlies 15% blijven hetzelfde.


V177: Hoofdscherm tekst aangepast naar: "Upload je STL of STEP bestand en ontvang direct je 3D-printprijs." Cache-versies in HTML verhoogd naar v=177. Bestaande SLA-laaghoogte tijden behouden: 0,03 mm = 3,8 sec, 0,05 mm = 4,2 sec, 0,10 mm = 4,7 sec.
