
(function () {
  const NL_TO_EN = {
    "Track & trace openen": "Open track & trace",
    "Track & trace opslaan": "Save track & trace",
    "Track & trace link": "Track & trace link",
    "Track & trace code": "Track & trace code",
    "Vervoerder": "Carrier",
    "Factuur PDF": "Invoice PDF",
    "Offerte PDF": "Quote PDF",
    "Factuur downloaden": "Download invoice",
    "Offerte downloaden": "Download quote",
    "Orders, offerte en factuur bekijken": "View orders, quote and invoice",
    "Adres en contactgegevens aanpassen": "Edit address and contact details",
    "Accountgegevens": "Account details",
    "Klant": "Customer",
    "Bedragen": "Amounts",
    "Order detail": "Order detail",
    "Afgerond": "Completed",
    "Verzonden / shipping": "Shipped / shipping",
    "Verzonden": "Shipped",
    "3D printen": "3D printing",
    "Voorbereiding": "Preparation",
    "Nieuw": "New",
    "Status opslaan": "Save status",
    "Download STL": "Download STL",
    "Download uploadbestand": "Download uploaded file",
    "Factuur": "Invoice",
    "Offerte": "Quote",
    "Factuur bekijken": "View invoice",
    "Offerte bekijken": "View quote",
    "Gebruik minimaal 6 tekens voor je nieuwe wachtwoord.": "Use at least 6 characters for your new password.",
    "Geen order geselecteerd.": "No order selected.",
    "Bekijk": "View",
    "Selecteer een order om de details te bekijken.": "Select an order to view the details.",
    "Orders verversen": "Refresh orders",
    "Bekijk je eerdere orders en open de details.": "View your previous orders and open the details.",
    "Mijn orders": "My orders",
    "Adresgegevens": "Address details",
    "Status": "Status",
    "Orders ophalen mislukt.": "Could not load orders.",
    "Order openen mislukt.": "Could not open order.",
    "Orders laden...": "Loading orders...",
    "Order laden...": "Loading order...",
    "U ontvangt een bevestiging.": "You will receive a confirmation.",
    "Uw ordernummer is": "Your order number is",
    "Bedankt voor uw order.": "Thank you for your order.",
    "Wachtwoord gewijzigd.": "Password changed.",
    "Wachtwoord wijzigen": "Change password",
    "Minimaal 6 tekens": "At least 6 characters",
    "Nieuw wachtwoord": "New password",
    "Huidig wachtwoord": "Current password",
    "Nog geen orders gevonden.": "No orders found yet.",
    "Mijn orders bekijken": "View my orders",
    "Orders": "Orders",
    "Gewicht": "Weight",
    "Afmetingen": "Dimensions",
    "Bestand": "File",
    "Fout": "Error",
    "Ik ga akkoord dat mijn STL-bestanden gebruikt mogen worden voor deze bestelling.": "I agree that my STL files may be used for this order.",
    "Note": "Note",
    "Order plaatsen": "Place order",
    "Plaats bestelling": "Place order",
    "Complete order": "Complete order",
    "Wachtwoord": "Password",
    "Inloggen": "Log in",
    "Account": "Account",
    "Uitloggen / vergrendelen": "Log out / lock",
    "Uitloggen": "Log out",
    "Gegevens opslaan": "Save details",
    "Bedrijfsnaam en btw-nummer staan vast en kunnen alleen door Pro3D worden aangepast.": "Company name and VAT number are fixed and can only be changed by Pro3D.",
    "Huisnummer": "House number",
    "Straat": "Street",
    "Achternaam": "Last name",
    "Voornaam": "First name",
    "Gegevens": "Details",
    "Bijvoorbeeld: PO-2026-001, bestelnummer of projectnaam": "For example: PO-2026-001, purchase order number or project name",
    "PO nummer / orderreferentie": "PO number / order reference",
    "Ordergegevens": "Order details",
    "Btw-nummer": "VAT number",
    "Zakelijk": "Business",
    "Privé": "Private",
    "Klanttype": "Customer type",
    "Je bent ingelogd. Je accountgegevens worden automatisch gebruikt voor deze bestelling.": "You are logged in. Your account details will be used automatically for this order.",
    "Vaste klant": "Regular customer",
    "Account aanvragen via contact": "Request an account via contact",
    "Vraag een vast klantenaccount aan via het aanvraagformulier op de contactpagina.": "Request a regular customer account using the request form on the contact page.",
    "Nog geen account?": "No account yet?",
    // General / nav
    "Home": "Home",
    "TPU 90A": "TPU 90A",
    "TPU 85A": "TPU 85A",
    "Risico / flexibel": "Risk / flexible",
    "Risico / technisch": "Risk / technical",
    "STL / STEP": "STL / STEP",
    "Upload je STL of STEP bestand, kies de printtechniek en ontvang direct een duidelijke 3D-printprijs.": "Upload your STL or STEP file, choose the printing process and receive a clear 3D printing price instantly.",
    "FDM is geschikt voor prototypes, houders, behuizingen en functionele onderdelen. Het is sterk, snel en voordelig, maar fijne printlijnen blijven meestal zichtbaar. Door de laagopbouw kan FDM een zwakker punt hebben bij belasting haaks op de printlagen.": "FDM is suitable for prototypes, brackets, housings and functional parts. It is strong, fast and cost-effective, but fine print lines usually remain visible. Because of the layer structure, FDM can have a weaker point when loaded across the print layers.",
    "SLA is bedoeld voor kleine onderdelen met veel detail, scherpe randen en een strak oppervlak. Deze techniek is ideaal voor zichtmodellen, miniaturen, figuren en nauwkeurige prototypes. Minder geschikt voor grote of zwaar belaste onderdelen.": "SLA is intended for small parts with high detail, sharp edges and a smooth surface. This process is ideal for display models, miniatures, figures and accurate prototypes. It is less suitable for large or heavily loaded parts.",
    "SLS is de sterkste keuze voor functionele nylon onderdelen en eindproducten. Het materiaal is taai, slijtvast en geschikt voor clips, scharnieren, klikverbindingen, complexe vormen en kleine series. Er zijn geen zichtbare supportsporen. Foodgrade is eventueel beschikbaar in wit of blauw met certificaat.": "SLS is the strongest choice for functional nylon parts and end-use products. The material is tough, wear-resistant and suitable for clips, hinges, snap-fits, complex shapes and small series. There are no visible support marks. Food-grade is optionally available in white or blue with certificate.",
    "Kies eerst de printtechniek, daarna materiaal en kleur. De calculator berekent automatisch of je model past en toont direct de prijs. Als het model te groot is voor het maximale printformaat krijg je direct een duidelijke melding.": "First choose the printing process, then the material and color. The calculation automatically checks whether your model fits and shows the price instantly. If the model is too large for the maximum print size, you will get a clear message.",
    "Kies eerst een STL- of STEP-bestand.": "Choose an STL or STEP file first.",
    "STEP wordt alvast omgezet voor de viewer. Je kunt ondertussen op bereken prijs klikken.": "STEP is being converted for the viewer. You can click calculate price while it loads.",
    "STEP wordt bij berekenen automatisch omgezet naar STL. Daarna laden we de geconverteerde STL in de viewer.": "STEP is automatically converted to STL during calculation. After that, the converted STL is loaded into the viewer.",
    "STEP is alvast omgezet en geladen in de viewer. Klik op bereken prijs voor de calculator.": "STEP has already been converted and loaded into the viewer. Click calculate price for the calculation.",
    "STEP-preview laden": "Loading STEP preview",
    "STEP-conversie mislukt": "STEP conversion failed",
    "Geen STEP-bestand ontvangen.": "No STEP file received.",
    "Geen STL- of STEP-bestand ontvangen.": "No STL or STEP file received.",
    "Sleep je STL- of STEP-bestand hier of klik om te uploaden": "Drag your STL or STEP file here, or click to upload",
    "Upload een STL- of STEP-bestand en klik op berekenen.": "Upload an STL or STEP file and click calculate.",
    "Upload alleen een STL- of STEP-bestand.": "Upload only an STL or STEP file.",
    "STEP-bestand geladen": "STEP file loaded",
    "STEP wordt na klikken op bereken prijs automatisch omgezet naar STL. Als dat niet lukt, maken we er een handmatige aanvraag van.": "After clicking calculate price, STEP will be converted to STL automatically. If conversion fails, we will create a manual request.",
    "STEP conversie mislukt": "STEP conversion failed",
    "Dit STEP-bestand kon niet automatisch worden omgezet. Verstuur een aanvraag, dan controleren we het handmatig.": "This STEP file could not be converted automatically. Send a request and we will check it manually.",
    "Calculatie": "Calculatie",
    "Wie zijn wij": "About us",
    "Contact": "Contact",
    "Bereken prijs": "Calculate price",
    "Start calculator": "Start calculator",
    "Winkelwagen": "Cart",
    "Afrekenen": "Checkout",

    // Access gate
    "Privé demo": "Private demo",
    "Pro3D Manufacturing calculator": "Pro3D Manufacturing calculator",
    "Voer de toegangscode in om de calculator te bekijken.": "Enter the access code to view the calculator.",
    "Toegangscode": "Access code",
    "Openen": "Open",
    "Code klopt niet.": "Incorrect code.",

    // Homepage
    "Upload je STL of STEP bestand en ontvang direct je 3D-printprijs.": "Upload your STL or STEP file and receive an instant 3D printing price.",
    "Kies eerst de printtechniek, daarna materiaal en kleur. De calculator berekent automatisch of je model past en toont direct de prijs. Als het model te groot is voor het maximale printformaat krijg je direct een duidelijke melding.": "First choose the printing process, then the material and color. The calculation automatically checks whether your model fits and shows the price instantly. If the model is too large for the maximum print size, you will get a clear message.",
    "Direct inzicht": "Instant insight",
    "Upload je STL of STEP bestand, kies de printtechniek en ontvang direct een duidelijke 3D-printprijs.": "Upload your STL or STEP file, choose the printing process and receive a clear 3D printing price instantly.",
    "Functioneel, sterk en voordelig": "Functional, strong and cost-effective",
    "Strak oppervlak en hoge details": "Smooth surface and high detail",
    "Sterk nylon voor eindproducten": "Strong nylon for end-use parts",
    "FDM is ideaal voor prototypes, houders, behuizingen en functionele onderdelen. Deze techniek is sterk, snel en voordelig, maar je ziet meestal fijne printlijnen. Houd er rekening mee dat de laagopbouw een zwakker punt kan zijn, vooral bij belasting haaks op de printlagen. Goede keuze als maatvoering, stevigheid en prijs belangrijker zijn dan een volledig glad oppervlak.": "FDM is ideal for prototypes, brackets, housings and functional parts. This process is strong, fast and cost-effective, but fine print lines are usually visible. Keep in mind that the layer structure can be a weaker point, especially under load across the print layers. A good choice when dimensions, strength and price matter more than a completely smooth surface.",
    "SLA is de beste keuze voor kleine onderdelen met veel detail, scherpe randen en een strak oppervlak. Ideaal voor zichtmodellen, miniaturen, figuren en nauwkeurige prototypes. Het resultaat oogt netter dan FDM, maar is minder geschikt voor grote of zwaar belaste onderdelen.": "SLA is the best choice for small parts with high detail, sharp edges and a smooth surface. Ideal for display models, miniatures, figures and accurate prototypes. The result looks cleaner than FDM, but is less suitable for large or heavily loaded parts.",
    "SLS is de sterkste en meest professionele keuze voor functionele nylon onderdelen en eindproducten. Het materiaal is taai, slijtvast en geschikt voor clips, scharnieren, klikverbindingen, complexe vormen en kleine series. Omdat er geen support nodig is, blijven er geen supportsporen zichtbaar. Foodgrade SLS is eventueel beschikbaar in wit of blauw met certificaat.": "SLS is the strongest and most professional choice for functional nylon parts and end-use products. The material is tough, wear-resistant and suitable for clips, hinges, snap-fits, complex shapes and small series. Because no support is needed, there are no visible support marks. Food-grade SLS is optionally available in white or blue with certificate.",

    // Calculatie
    "Bereken je prijs": "Calculate your price",
    "Sleep je STL hier of klik om te uploaden": "Drag your STL here or click to upload",
    "Printtechniek": "Print technology",
    "Kies eerst welke printtechniek je wilt gebruiken.": "First choose which print technology you want to use.",
    "Filament": "Filament",
    "Resin": "Resin",
    "Nylon": "Nylon",
    "FDM filament": "FDM filament",
    "SLA resin": "SLA resin",
    "SLS nylon": "SLS nylon",
    "Materiaal & kleur": "Material & color",
    "Alleen opties die bij de gekozen printtechniek horen worden getoond.": "Only options matching the selected print technology are shown.",
    "Materiaal": "Material",
    "Kleur": "Color",
    "Aantal": "Quantity",
    "Foodgrade met certificaat": "Food grade with certificate",
    "Foodgrade SLS wordt geleverd met certificaat en is alleen mogelijk in wit of blauw. Zonder foodgrade staat SLS standaard op zwart.": "Food-grade SLS is supplied with a certificate and is only available in white or blue. Without food grade, SLS is black by default.",
    "Printinstellingen": "Print settings",
    "De calculator toont alleen instellingen die logisch zijn voor de gekozen techniek.": "The calculator only shows settings that make sense for the selected technology.",
    "Laaghoogte": "Layer height",
    "Hoe kleiner de laaghoogte, hoe strakker en gladder de print oogt. De print wordt wel langzamer en daardoor duurder.": "The smaller the layer height, the smoother and cleaner the print looks. Printing becomes slower and therefore more expensive.",
    "FDM instellingen — SLS en SLA gebruiken geen infill-instelling in deze calculator.": "FDM settings — SLS and SLA do not use an infill setting in this calculator.",
    "Infill FDM %": "FDM infill %",
    "Wanddikte mm": "Wall thickness mm",
    "Infill type": "Infill type",
    "Let op: automatische prijs is betrouwbaar voor gesloten STL-modellen. Niet-watertight modellen krijgen een waarschuwing.": "Note: the automatic price is reliable for closed STL models. Non-watertight models will receive a warning.",

    // Result
    "Resultaat": "Result",
    "Nog geen bestand": "No file yet",
    "Upload een STL en klik op berekenen.": "Upload an STL and click calculate.",
    "STL geladen": "STL loaded",
    "Klik op bereken prijs links om de automatische calculator te starten.": "Click calculate price on the left to start the automatic calculation.",
    "Instellingen aangepast": "Settings changed",
    "Klik opnieuw op bereken prijs voor de nieuwe instellingen.": "Click calculate price again for the new settings.",
    "Berekenen...": "Calculating...",
    "Totaalprijs excl. btw": "Total price excl. VAT",
    "Totaal incl. 21% btw": "Total incl. 21% VAT",
    "Prijs per stuk": "Price per piece",
    "Afmetingen model": "Model dimensions",
    "Gekozen optie": "Selected option",
    "Foodgrade": "Food grade",
    "Met certificaat": "With certificate",
    "Past binnen het maximale printformaat": "Fits within the maximum print size",
    "Handmatige controle nodig": "Manual check required",
    "Dit model krijgt wel een prijsindicatie, maar kan niet direct besteld worden.": "This model gets an indicative price, but cannot be ordered directly.",
    "Dit model vraagt handmatige controle. De prijs is een indicatie; je kunt een aanvraag versturen.": "This model requires a manual check. The price is indicative; you can send a request.",
    "Aanvraag versturen": "Send request",
    "aanvraag versturen": "send request",
    "Toevoegen aan winkelwagen": "Add to cart",
    "Aan winkelwagen toevoegen": "Add to cart",
    "Vraag handmatige controle aan": "Request manual check",
    "Upload alleen een STL-bestand.": "Upload an STL file only.",
    "Dit product kon niet veilig aan de winkelwagen worden toegevoegd. Probeer opnieuw te berekenen.": "This product could not be safely added to the cart. Please calculate again.",
    "Aanvraag versturen mislukt.": "Sending the request failed.",
    "Aanvraag is opgeslagen/verstuurd.": "Request has been saved/sent.",
    "excl. btw": "excl. VAT",
    "incl. btw": "incl. VAT",
    "btw": "VAT",

    // Material descriptions / specs
    "Goede keuze voor betaalbare functionele onderdelen, prototypes en behuizingen. FDM is sterk, snel en relatief voordelig.": "A good choice for affordable functional parts, prototypes and housings. FDM is strong, fast and relatively cost-effective.",
    "Beste keuze voor miniaturen, figuren en zeer nette prints met veel detail en een glad oppervlak. Ideaal voor kleine nauwkeurige onderdelen.": "Best choice for miniatures, figures and very clean prints with lots of detail and a smooth surface. Ideal for small accurate parts.",
    "Beste keuze voor sterke nylon onderdelen zonder supportsporen. Ideaal voor functionele onderdelen en kleine series.": "Best choice for strong nylon parts without support marks. Ideal for functional parts and small series.",
    "Standaard FDM materiaal voor nette, betaalbare prints.": "Standard FDM material for clean, affordable prints.",
    "Makkelijk te printen": "Easy to print",
    "Net oppervlak": "Clean surface",
    "Betaalbaar": "Affordable",
    "Minder hittebestendig": "Lower heat resistance",
    "Sterker en taaier dan PLA. Goede allround keuze.": "Stronger and tougher than PLA. A good all-round choice.",
    "Taai": "Tough",
    "Goede chemische bestendigheid": "Good chemical resistance",
    "Voor functionele delen": "For functional parts",
    "PETG met carbon fiber voor stijvere technische onderdelen.": "PETG with carbon fiber for stiffer technical parts.",
    "Stijver dan PETG": "Stiffer than PETG",
    "Mat technisch oppervlak": "Matte technical surface",
    "Duurder materiaal": "More expensive material",
    "Flexibel materiaal voor rubbers, dempers en elastische onderdelen.": "Flexible material for rubber-like parts, dampers and elastic parts.",
    "Flexibel": "Flexible",
    "Langzamer te printen": "Slower to print",
    "Betaalbaar technisch materiaal voor sterke onderdelen.": "Affordable technical material for strong parts.",
    "Sterk": "Strong",
    "Hogere hittebestendigheid": "Higher heat resistance",
    "Kan kromtrekken": "Can warp",
    "Technisch materiaal voor buitengebruik en sterkere onderdelen.": "Technical material for outdoor use and stronger parts.",
    "UV-bestendig": "UV resistant",
    "Meer hittebestendig": "More heat resistant",
    "Sterk technisch materiaal met goede hittebestendigheid.": "Strong technical material with good heat resistance.",
    "Hoge sterkte": "High strength",
    "Goede hittebestendigheid": "Good heat resistance",
    "Technisch materiaal": "Technical material",
    "Allround resin voor miniaturen, details, prototypes en nette zichtdelen.": "All-round resin for miniatures, details, prototypes and clean visible parts.",
    "Goede detailweergave": "Good detail reproduction",
    "Glad oppervlak": "Smooth surface",
    "Standaard keuze": "Standard choice",
    "Taaier dan standaard resin. Minder snel breuk bij stoten of buigen.": "Tougher than standard resin. Less likely to break under impact or bending.",
    "Taaier": "Tougher",
    "Meer flexibel": "More flexible",
    "Voor functionele prototypes": "For functional prototypes",
    "Sterkere ABS-like resin voor functionele prototypes en behuizingen.": "Stronger ABS-like resin for functional prototypes and housings.",
    "Sterker dan standaard": "Stronger than standard",
    "Goede maatvastheid": "Good dimensional accuracy",
    "Functionele prototypes": "Functional prototypes",
    "Voor miniaturen, fijne details, strak oppervlak en zichtmodellen.": "For miniatures, fine details, smooth surfaces and display models.",
    "Zeer fijn detail": "Very fine detail",
    "Voor zichtwerk": "For visible parts",
    "Sterk, maatvast en goede allround keuze voor SLS.": "Strong, dimensionally stable and a good all-round choice for SLS.",
    "Maatvast": "Dimensionally stable",
    "Lage warping": "Low warping",
    "Taaier en slagvaster dan PA12.": "Tougher and more impact-resistant than PA12.",
    "Slagvast": "Impact resistant",
    "Goed voor clips en scharnieren": "Good for clips and hinges",

    // Options
    "Wit": "White",
    "Zwart": "Black",
    "Blauw": "Blue",
    "Grijs": "Gray",
    "0.10 mm - zeer fijn, langzaamste print": "0.10 mm - very fine, slowest print",
    "0.12 mm - fijn detail": "0.12 mm - fine detail",
    "0.16 mm - strak/allround": "0.16 mm - clean/all-round",
    "0.20 mm - standaard keuze": "0.20 mm - standard choice",
    "0.24 mm - sneller, grovere lagen": "0.24 mm - faster, coarser layers",
    "Grid - standaard": "Grid - standard",
    "Gyroid - sterk/allround": "Gyroid - strong/all-round",
    "Cubic - sterk 3D patroon": "Cubic - strong 3D pattern",
    "Lines - snel/goedkoper": "Lines - fast/cheaper",
    "Honeycomb - sterk maar duurder": "Honeycomb - strong but more expensive",

    // About / contact
    "Van STL naar nette 3D-print.": "From STL to clean 3D prints.",
    "Pro3D Manufacturing helpt klanten met FDM, SLA en SLS prints: van prototype tot kleine serie. De focus ligt op duidelijke keuzes, snelle prijsindicatie en nette afwerking.": "Pro3D Manufacturing helps customers with FDM, SLA and SLS prints: from prototypes to small series. The focus is on clear choices, fast price indication and clean finishing.",
    "Prototypes, zichtdelen en functionele onderdelen.": "Prototypes, visible parts and functional components.",
    "Onze aanpak": "Our approach",
    "Duidelijk, snel en praktisch.": "Clear, fast and practical.",
    "Je uploadt een STL-bestand, kiest printtechniek, materiaal en kleur. De calculator controleert het formaat en berekent direct een prijs. Bij vragen over materiaalkeuze of seriewerk kun je contact opnemen.": "You upload an STL file, choose print technology, material and color. The calculator checks the size and calculates a price instantly. If you have questions about materials or series production, you can contact us.",
    "Betaalbaar en sterk voor prototypes, houders, behuizingen en functionele onderdelen.": "Affordable and strong for prototypes, brackets, housings and functional parts.",
    "Voor fijne details, glad oppervlak en nette zichtdelen.": "For fine details, smooth surfaces and clean visible parts.",
    "Sterke nylon onderdelen zonder supportsporen, geschikt voor functionele delen en series.": "Strong nylon parts without support marks, suitable for functional parts and series.",
    "Vraag over je 3D-print?": "Question about your 3D print?",
    "Stuur je vraag door. Het formulier stuurt de vraag naar info@Pro3DManufacturing.nl en slaat hem ook lokaal op in de website-map.": "Send your question. The form sends it to info@Pro3DManufacturing.nl and also stores it locally in the website folder.",
    "Bedrijfsgegevens": "Company details",
    "Vraag stellen": "Ask a question",
    "Contactformulier": "Contact form",
    "Naam": "Name",
    "Bedrijfsnaam": "Company name",
    "E-mail": "Email",
    "Telefoon": "Phone",
    "Adres": "Address",
    "Postcode": "Postal code",
    "Plaats": "City",
    "Land": "Country",
    "Onderwerp": "Subject",
    "Vraag": "Question",
    "Bericht": "Message",
    "Opmerking": "Note",
    "Je naam": "Your name",
    "info@Pro3DManufacturing.nl": "info@Pro3DManufacturing.nl",
    "Optioneel": "Optional",
    "Bijvoorbeeld: materiaalkeuze": "For example: material choice",
    "Typ hier je vraag": "Type your question here",
    "Vraag versturen": "Send question",
    "Vraag wordt verstuurd...": "Question is being sent...",
    "Bedankt, je vraag is ontvangen.": "Thank you, your question has been received.",

    // Checkout / cart
    "Bestelling afronden": "Complete order",
    "Samenvatting": "Summary",
    "Ik ga akkoord dat mijn STL-bestanden worden gebruikt voor deze bestelling.": "I agree that my STL files may be used for this order.",
    "Bestelling plaatsen": "Place order",
    "Bestelling wordt geplaatst...": "Order is being placed...",
    "Bestelling plaatsen mislukt.": "Placing the order failed.",
    "Bestelling ontvangen. Ordernummer:": "Order received. Order number:",
    "Je bestelling": "Your order",
    "Producten excl. btw": "Products excl. VAT",
    "Verzendkosten": "Shipping costs",
    "Totaal excl. btw": "Total excl. VAT",
    "Totaal incl. btw": "Total incl. VAT",
    "Winkelwagen leegmaken": "Empty cart",
    "Je winkelwagen is leeg.": "Your cart is empty.",
    "Je winkelwagen is leeggemaakt omdat er oude/foute data in stond.": "Your cart was emptied because it contained old/invalid data.",

    // Countries
    "Nederland": "Netherlands",
    "België": "Belgium",
    "Duitsland": "Germany",
    "Frankrijk": "France",
    "Luxemburg": "Luxembourg",
    "Spanje": "Spain",
    "Italië": "Italy",
    "Oostenrijk": "Austria",
    "Polen": "Poland",
    "Slowakije": "Slovakia",
    "Zweden": "Sweden",
    "Zwitserland": "Switzerland",
    "Verenigd Koninkrijk": "United Kingdom",
    "Verenigde Staten": "United States",
    "Overige Europese landen": "Other European countries",
    "Overige wereld": "Rest of world"
  };

  const originalText = new WeakMap();

  function currentLang() {
    return localStorage.getItem("pro3d_lang") || "nl";
  }

  function translateFromNl(text, target) {
    if (!text || typeof text !== "string") return text;
    if (target === "nl") return text;

    const trimmed = text.trim();
    if (!trimmed) return text;

    if (NL_TO_EN[trimmed]) {
      return text.replace(trimmed, NL_TO_EN[trimmed]);
    }

    // Only translate known NL fragments to EN. Never translate EN back inside already changed text.
    let out = text;
    Object.entries(NL_TO_EN)
      .sort((a, b) => b[0].length - a[0].length)
      .forEach(([nl, en]) => {
        if (out.includes(nl)) out = out.split(nl).join(en);
      });

    return out;
  }

  function ensureOriginalTextNode(node) {
    if (!originalText.has(node)) {
      originalText.set(node, node.nodeValue);
    }
    return originalText.get(node);
  }

  function ensureOriginalAttr(el, attr) {
    const key = "data-pro3d-original-" + attr;
    if (!el.hasAttribute(key)) {
      el.setAttribute(key, el.getAttribute(attr) || "");
    }
    return el.getAttribute(key) || "";
  }

  let busy = false;

  function applyLanguage(target = currentLang()) {
    if (busy) return;
    busy = true;

    document.documentElement.lang = target;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p || ["SCRIPT", "STYLE", "TEXTAREA"].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      const original = ensureOriginalTextNode(node);
      const translated = translateFromNl(original, target);
      if (node.nodeValue !== translated) node.nodeValue = translated;
    });

    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(el => {
      const original = ensureOriginalAttr(el, "placeholder");
      el.setAttribute("placeholder", translateFromNl(original, target));
    });

    document.querySelectorAll("[title]").forEach(el => {
      const original = ensureOriginalAttr(el, "title");
      el.setAttribute("title", translateFromNl(original, target));
    });

    document.querySelectorAll("select option").forEach(opt => {
      const original = ensureOriginalTextNode(opt.firstChild || opt.appendChild(document.createTextNode(opt.textContent)));
      const translated = translateFromNl(original, target);
      if (opt.textContent !== translated) opt.textContent = translated;
    });

    document.querySelectorAll("[data-lang]").forEach(btn => {
      const active = btn.dataset.lang === target;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    busy = false;
  }

  let timer = null;
  function scheduleApply() {
    if (busy) return;
    clearTimeout(timer);
    timer = setTimeout(() => applyLanguage(currentLang()), 80);
  }

  function init() {
    document.querySelectorAll("[data-lang]").forEach(btn => {
      btn.addEventListener("click", () => {
        localStorage.setItem("pro3d_lang", btn.dataset.lang || "nl");
        applyLanguage(currentLang());
      });
    });

    applyLanguage(currentLang());

    const observer = new MutationObserver(mutations => {
      if (busy) return;
      if (mutations.some(m => m.type === "childList" || m.type === "attributes")) {
        scheduleApply();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["placeholder", "title"]
    });
  }

  window.pro3dTranslate = applyLanguage;
  window.pro3dTranslateText = translateFromNl;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
