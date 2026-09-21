/*
    HTML-elementen ophalen.
    Hierdoor kunnen we deze elementen
    vanuit JavaScript aanpassen.
*/

const puzzleContainer =
    document.getElementById("puzzleContainer");

const movesElement =
    document.getElementById("moves");

const resetButton =
    document.getElementById("resetButton");

const winResetButton =
    document.getElementById("winResetButton");

const winMessage =
    document.getElementById("winMessage");


/*
    De puzzel is 4 bij 4.

    4 x 4 = 16 vakken.

    Omdat er één leeg vak is,
    zijn er 15 puzzelstukken.
*/
const puzzleSize = 4;


/*
    Hoeveel ruimte (in pixels) er tussen
    de tegels en aan de rand van het
    speelveld wordt gehouden.
*/
const gap = 4;
const padding = 4;


/*
    Hierin wordt de huidige volgorde
    van de puzzel opgeslagen.

    Bijvoorbeeld:

    [
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 0
    ]

    0 betekent het lege vak.
*/
let puzzle = [];


/*
    Houdt bij hoeveel zetten de speler
    heeft gedaan.
*/
let moves = 0;


/*
    Hierin bewaren we de tegel-elementen
    (HTML) per nummer (1 t/m 15).

    Deze elementen blijven bestaan zolang
    de pagina open is. Alleen hun positie
    (left/top) verandert wanneer er wordt
    geschoven. Daardoor kan de browser dat
    netjes animeren.
*/
const tileElements = new Map();


/*
    Maakt de 15 tegel-elementen eenmalig aan
    en voegt ze toe aan het speelveld.
*/
function createTiles() {

    for (
        let value = 1;
        value < puzzleSize * puzzleSize;
        value++
    ) {

        const tile =
            document.createElement("div");

        tile.classList.add("tile");


        /*
            Geef de tegel een achtergrondpositie
            gebaseerd op zijn nummer. Dit hoeft
            maar één keer bepaald te worden,
            want een tegel houdt altijd hetzelfde
            stukje afbeelding.
        */
        const imagePosition =
            value - 1;

        const row =
            Math.floor(
                imagePosition / puzzleSize
            );

        const column =
            imagePosition % puzzleSize;

        const xPosition =
            column * (100 / (puzzleSize - 1));

        const yPosition =
            row * (100 / (puzzleSize - 1));

        tile.style.backgroundImage =
            "url(\"museum.jpg\")";

        tile.style.backgroundPosition =
            `${xPosition}% ${yPosition}%`;


        /*
            Wanneer de speler op een tegel drukt,
            proberen we deze te schuiven. We kijken
            steeds opnieuw waar de tegel op dat
            moment staat, omdat die positie kan
            veranderen.
        */
        tile.addEventListener(
            "click",
            () => moveTile(value)
        );


        tileElements.set(value, tile);

        puzzleContainer.appendChild(tile);
    }
}


/*
    Berekent en zet de "left", "top", "width"
    en "height" van elke tegel, gebaseerd op
    de huidige volgorde in "puzzle".

    Als "instant" waar is, gebeurt dit zonder
    animatie (bijvoorbeeld bij het starten van
    een nieuwe puzzel).
*/
function positionTiles(instant) {

    /*
        Bepaal de grootte van het speelveld
        op dit moment. Dit kan veranderen,
        bijvoorbeeld als het scherm van
        grootte verandert.
    */
    const containerSize =
        puzzleContainer.clientWidth;

    const tileSize =
        (containerSize - padding * 2 - gap * (puzzleSize - 1))
        / puzzleSize;

    tileElements.forEach((tile, value) => {

        const index =
            puzzle.indexOf(value);

        const row =
            Math.floor(index / puzzleSize);

        const column =
            index % puzzleSize;

        const left =
            padding + column * (tileSize + gap);

        const top =
            padding + row * (tileSize + gap);


        /*
            Zonder animatie: transitie tijdelijk
            uitzetten zodat de tegel direct
            "springt" naar zijn plek.
        */
        if (instant) {

            tile.classList.add("no-transition");
        }


        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;

        tile.style.left = `${left}px`;
        tile.style.top = `${top}px`;


        if (instant) {

            /*
                Zet de transitie in het volgende
                frame weer aan, zodat toekomstige
                zetten wél geanimeerd worden.
            */
            requestAnimationFrame(() => {

                tile.classList.remove("no-transition");
            });
        }
    });
}


/*
    Maakt de beginvolgorde van de puzzel.
*/
function createPuzzle() {

    /*
        Maak een correcte puzzelvolgorde.

        1 t/m 15 zijn de tegels.
        0 is het lege vak.
    */
    puzzle = [];

    for (
        let i = 1;
        i < puzzleSize * puzzleSize;
        i++
    ) {

        puzzle.push(i);
    }

    /*
        Het laatste vak is leeg.
    */
    puzzle.push(0);


    /*
        Zet de puzzel terug naar 0 zetten.
    */
    moves = 0;

    movesElement.textContent = moves;


    /*
        Verberg de winmelding.
    */
    winMessage.classList.add("hidden");


    /*
        Hussel de puzzel.
    */
    shufflePuzzle();


    /*
        Plaats de tegels direct op hun
        (gehusselde) plek, zonder animatie.
    */
    positionTiles(true);
}


/*
    Husselt de puzzel door geldige schuifbewegingen
    te simuleren.

    Dit is belangrijk omdat een gewone random
    shuffle soms een onoplosbare 15-puzzle
    kan maken.
*/
function shufflePuzzle() {

    /*
        We voeren 200 geldige schuifbewegingen uit.
    */
    let previousEmptyPosition = -1;

    for (let i = 0; i < 200; i++) {

        const emptyPosition =
            puzzle.indexOf(0);


        /*
            Zoek alle tegels die naar het
            lege vak kunnen bewegen.
        */
        const possibleMoves =
            getPossibleMoves(emptyPosition);


        /*
            Voorkom zoveel mogelijk dat dezelfde
            beweging direct wordt teruggedraaid.
        */
        const filteredMoves =
            possibleMoves.filter(position => {

                return position !== previousEmptyPosition;

            });


        /*
            Als er geen andere mogelijkheid is,
            gebruiken we alle mogelijke zetten.
        */
        const availableMoves =
            filteredMoves.length > 0
                ? filteredMoves
                : possibleMoves;


        /*
            Kies willekeurig een tegel.
        */
        const randomIndex =
            Math.floor(
                Math.random() * availableMoves.length
            );


        const selectedPosition =
            availableMoves[randomIndex];


        /*
            Bewaar de vorige lege positie.
        */
        previousEmptyPosition =
            emptyPosition;


        /*
            Verwissel de tegel met het lege vak.
        */
        puzzle[emptyPosition] =
            puzzle[selectedPosition];

        puzzle[selectedPosition] = 0;
    }
}


/*
    Bepaalt welke tegels naast het lege vak staan.
*/
function getPossibleMoves(emptyPosition) {

    const possibleMoves = [];


    /*
        Bepaal de rij en kolom
        van het lege vak.
    */
    const row =
        Math.floor(emptyPosition / puzzleSize);

    const column =
        emptyPosition % puzzleSize;


    /*
        Tegel boven het lege vak.
    */
    if (row > 0) {

        possibleMoves.push(
            emptyPosition - puzzleSize
        );
    }


    /*
        Tegel onder het lege vak.
    */
    if (row < puzzleSize - 1) {

        possibleMoves.push(
            emptyPosition + puzzleSize
        );
    }


    /*
        Tegel links van het lege vak.
    */
    if (column > 0) {

        possibleMoves.push(
            emptyPosition - 1
        );
    }


    /*
        Tegel rechts van het lege vak.
    */
    if (column < puzzleSize - 1) {

        possibleMoves.push(
            emptyPosition + 1
        );
    }


    return possibleMoves;
}


/*
    Probeert een tegel met een bepaald nummer
    naar het lege vak te verplaatsen.
*/
function moveTile(value) {

    /*
        Zoek waar deze tegel nu staat.
    */
    const tilePosition =
        puzzle.indexOf(value);


    /*
        Zoek waar het lege vak staat.
    */
    const emptyPosition =
        puzzle.indexOf(0);


    /*
        Controleer of de aangeklikte tegel
        naast het lege vak staat.
    */
    const possibleMoves =
        getPossibleMoves(emptyPosition);


    if (
        possibleMoves.includes(tilePosition)
    ) {

        /*
            Verwissel de aangeklikte tegel
            met het lege vak.
        */
        puzzle[emptyPosition] =
            puzzle[tilePosition];

        puzzle[tilePosition] = 0;


        /*
            Tel de zet.
        */
        moves++;

        movesElement.textContent = moves;


        /*
            Zet de tegels op hun nieuwe plek.
            Dit gebeurt nu MET animatie, waardoor
            je de tegel ziet schuiven.
        */
        positionTiles(false);


        /*
            Controleer of de puzzel klaar is.
        */
        checkWin();
    }
}


/*
    Controleert of de puzzel volledig
    in de juiste volgorde staat.
*/
function checkWin() {

    /*
        De correcte volgorde is:

        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 0
    */
    for (
        let i = 0;
        i < puzzle.length - 1;
        i++
    ) {

        if (puzzle[i] !== i + 1) {

            /*
                De puzzel is nog niet klaar.
            */
            return;
        }
    }


    /*
        Alle tegels staan goed.

        We wachten heel even (net zo lang als de
        schuifanimatie duurt) voordat de winmelding
        verschijnt, zodat je de laatste zet nog
        ziet gebeuren.
    */
    setTimeout(puzzleCompleted, 200);
}


/*
    Wordt uitgevoerd wanneer de speler
    de puzzel heeft opgelost.
*/
function puzzleCompleted() {

    /*
        Toon de winmelding.
    */
    winMessage.classList.remove("hidden");
}


/*
    Wanneer het venster van grootte verandert,
    moet het speelveld opnieuw (zonder animatie)
    worden neergezet, omdat de tegels anders
    "zichtbaar" zouden schuiven naar hun nieuwe
    grootte.
*/
window.addEventListener("resize", () => {

    positionTiles(true);
});


/*
    Start een nieuwe puzzel wanneer
    op "Opnieuw" wordt gedrukt.
*/
resetButton.addEventListener(
    "click",
    createPuzzle
);


/*
    Ook vanuit de winmelding kan
    een nieuwe puzzel gestart worden.
*/
winResetButton.addEventListener(
    "click",
    createPuzzle
);


/*
    Maak de tegel-elementen eenmalig aan.
*/
createTiles();


/*
    Start de game zodra de pagina
    wordt geopend.
*/
createPuzzle();
