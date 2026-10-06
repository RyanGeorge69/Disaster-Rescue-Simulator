/* =========================================================
   RELIABLE STAGE CONTROLLER
========================================================= */

let currentStage = 0;
/* =========================================================
   INITIAL LOAD
========================================================= */

function initSimulator() {
    loadStage(0);
}

if (scene.hasLoaded) {
    initSimulator();
} else {
    scene.addEventListener(
        "loaded",
        initSimulator,
        {
            once: true
        }
    );
}
/*
    Possible states:

    "loading"
    "briefing"
    "playing"
    "decision"
    "summary"
    "final"
*/

let gameState = "loading";

let stageSession = 0;

let transitionInProgress = false;

let stageFinished = false;

let gameStarted = false;

let score = 0;

let rescued = 0;

let equipmentCollected = 0;

let safety = 100;

let timeLeft = 0;

let safetyDecisionDone = false;

let safetyDecisionCorrect = false;

let nearestSurvivor = null;

let nearestEquipment = null;

let hazardStates = [];

let timer = null;

let stageResults = [];


/* =========================================================
   ELEMENTS
========================================================= */

const scene =
    document.getElementById("scene");

const world =
    document.getElementById("world");

const player =
    document.getElementById("player");

const camera =
    document.getElementById("camera");

const boat =
    document.getElementById("boat");

const sky =
    document.getElementById("sky");

const missionText =
    document.getElementById("missionText");

const stageDisplay =
    document.getElementById("stageDisplay");

const survivorCount =
    document.getElementById("survivorCount");

const scoreElement =
    document.getElementById("score");

const timerElement =
    document.getElementById("timer");

const hazardsElement =
    document.getElementById("hazards");

const equipmentElement =
    document.getElementById("equipment");

const safetyElement =
    document.getElementById("safety");

const actionButton =
    document.getElementById("actionButton");

const proximityText =
    document.getElementById("proximityText");

const startModal =
    document.getElementById("startModal");

const startTitle =
    document.getElementById("startTitle");

const startStageTitle =
    document.getElementById("startStageTitle");

const startDescription =
    document.getElementById("startDescription");

const decisionModal =
    document.getElementById("decisionModal");

const summaryModal =
    document.getElementById("summaryModal");

const safetyModal =
    document.getElementById("safetyModal");

const finalModal =
    document.getElementById("finalModal");

const nextStageButton =
    document.getElementById("nextStageButton");


/* =========================================================
   INITIALIZE ONLY ONCE
========================================================= */

function initializeSimulator() {

    if (gameStarted) {
        return;
    }

    gameStarted = true;

    /*
        ALWAYS begin at Stage 1.
    */

    currentStage = 0;

    stageResults = [];

    loadStage(0);

}


/*
    A-Frame can be loaded before or after this script
    executes, so handle both cases.
*/

if (scene.hasLoaded) {

    initializeSimulator();

}

else {

    scene.addEventListener(
        "loaded",
        initializeSimulator,
        {
            once: true
        }
    );

}


/* =========================================================
   LOAD STAGE
========================================================= */

function loadStage(stageIndex) {

    /*
        Validate stage.
    */

    if (
        stageIndex < 0 ||
        stageIndex >= STAGES.length
    ) {

        console.error(
            "Invalid stage index:",
            stageIndex
        );

        return;

    }


    /*
        Every stage receives a NEW session ID.

        Old timers/events from previous stages
        cannot control the new stage.
    */

    stageSession++;

    const thisSession =
        stageSession;


    /*
        Stop previous timer.
    */

    clearInterval(timer);

    timer = null;


    /*
        Set current stage.
    */

    currentStage =
        stageIndex;


    /*
        Set state to briefing.

        Nothing can automatically start the stage.
    */

    gameState =
        "briefing";


    stageFinished =
        false;


    /*
        Reset stage values.
    */

    score = 0;

    rescued = 0;

    equipmentCollected = 0;

    safety = 100;

    timeLeft =
        STAGES[currentStage].time;

    safetyDecisionDone =
        false;

    safetyDecisionCorrect =
        false;

    nearestSurvivor =
        null;

    nearestEquipment =
        null;


    /*
        Reset hazards.
    */

    hazardStates =
        STAGES[currentStage].hazards.map(
            function(hazard) {

                return {
                    data: hazard,
                    entered: false
                };

            }
        );


    /*
        Remove previous stage.
    */

    world.innerHTML =
        "";


    /*
        Hide action buttons.
    */

    if (actionButton) {

        actionButton.style.display =
            "none";

    }


    if (proximityText) {

        proximityText.style.display =
            "none";

    }


    /*
        Hide every modal.
    */

    startModal.style.display =
        "none";

    decisionModal.style.display =
        "none";

    summaryModal.style.display =
        "none";

    safetyModal.style.display =
        "none";

    finalModal.style.display =
        "none";


    /*
        Reset next-stage button.
    */

    if (nextStageButton) {

        nextStageButton.disabled =
            false;

        nextStageButton.style.display =
            "inline-block";

        nextStageButton.onclick =
            nextStage;

    }


    /*
        Update environment.
    */

    const stage =
        STAGES[currentStage];


    sky.setAttribute(
        "color",
        stage.sky
    );


    scene.setAttribute(
        "fog",
        `
        type: exponential;
        color: ${stage.sky};
        density: 0.012;
        `
    );


    /*
        Flood boat.
    */

    if (boat) {

        boat.setAttribute(
            "visible",

            currentStage === 1
                ? "true"
                : "false"
        );

    }


    /*
        Reset player.
    */

    player.setAttribute(
        "position",
        "0 1.7 18"
    );


    /*
        Reset centered camera.
    */

    camera.setAttribute(
        "position",
        "0 0 0"
    );

    camera.setAttribute(
        "rotation",
        "0 0 0"
    );


    /*
        Build the stage.
    */

    createEnvironment(stage);


    stage.survivors.forEach(
        createSurvivor
    );


    stage.equipment.forEach(
        createEquipment
    );


    stage.hazards.forEach(
        createHazard
    );


    createDecisionMarker(
        stage.decision
    );


    createEvacuationZone(
        stage.evacuation
    );


    /*
        Update HUD.
    */

    updateHUD();


    /*
        Stage title.
    */

    stageDisplay.innerText =
        "STAGE " +
        (currentStage + 1) +
        " — " +
        stage.name;


    /*
        Briefing.
    */

    startTitle.innerText =
        "🚨 STAGE " +
        (currentStage + 1);


    startStageTitle.innerText =
        stage.name;


    startDescription.innerText =
        getStageDescription(
            currentStage
        );


    /*
        IMPORTANT:

        Stage 1/2/3 does NOT start automatically.
        The player must press ENTER STAGE.
    */

    startModal.style.display =
        "block";


    /*
        Safety check:
        make sure this load operation is still
        the latest stage operation.
    */

    if (
        thisSession !==
        stageSession
    ) {

        return;

    }

}


/* =========================================================
   START CURRENT STAGE
========================================================= */

function beginCurrentStage() {

    /*
        Only the briefing can start a stage.
    */

    if (
        gameState !==
        "briefing"
    ) {

        return;

    }


    /*
        Stop accidental double-clicks.
    */

    gameState =
        "playing";


    startModal.style.display =
        "none";


    const thisSession =
        stageSession;


    timeLeft =
        STAGES[currentStage].time;


    updateHUD();


    if (
        currentStage === 0
    ) {

        missionText.innerText =
            "🌎 EARTHQUAKE — Rescue all survivors and reach evacuation.";

    }

    else if (
        currentStage === 1
    ) {

        missionText.innerText =
            "🌊 FLOOD — Your rescue boat is ready. Rescue all survivors.";

    }

    else {

        missionText.innerText =
            "🔥 BUILDING FIRE — Rescue all survivors and evacuate.";

    }


    clearInterval(timer);


    timer =
        setInterval(
            function() {

                /*
                    Old timer?
                    Ignore it.
                */

                if (
                    thisSession !==
                    stageSession
                ) {

                    return;

                }


                if (
                    gameState !==
                    "playing"
                ) {

                    return;

                }


                timeLeft--;


                updateHUD();


                if (
                    timeLeft <= 0
                ) {

                    timeLeft =
                        0;


                    finishStage(
                        false,
                        "TIME RAN OUT"
                    );

                }

            },
            1000
        );

}


/* =========================================================
   FINISH STAGE
========================================================= */

function finishStage(
    success,
    reason
) {

    /*
        A stage can only finish from PLAYING.
    */

    if (
        gameState !==
        "playing"
    ) {

        return;

    }


    /*
        Lock the stage immediately.
    */

    gameState =
        "summary";


    stageFinished =
        true;


    clearInterval(timer);


    timer = null;


    if (actionButton) {

        actionButton.style.display =
            "none";

    }


    if (proximityText) {

        proximityText.style.display =
            "none";

    }


    const stage =
        STAGES[currentStage];


    /*
        Count hazards hit.
    */

    let hazardsHit =
        0;


    hazardStates.forEach(
        function(state) {

            if (
                state.entered
            ) {

                hazardsHit++;

            }

        }
    );


    const hazardsAvoided =
        stage.hazards.length -
        hazardsHit;


    /*
        SCORE
    */

    const survivorPoints =
        rescued * 100;


    const timePoints =
        timeLeft * 2;


    const hazardPoints =
        hazardsAvoided * 50;


    const equipmentPoints =
        equipmentCollected * 50;


    const safetyPoints =
        safetyDecisionCorrect
            ? 50
            : 0;


    const total =
        survivorPoints +
        timePoints +
        hazardPoints +
        equipmentPoints +
        safetyPoints;


    /*
        Save exactly ONE result for
        this stage.
    */

    stageResults[currentStage] = {

        stage:
            currentStage + 1,

        name:
            stage.name,

        survivorPoints:
            survivorPoints,

        timePoints:
            timePoints,

        hazardPoints:
            hazardPoints,

        equipmentPoints:
            equipmentPoints,

        safetyPoints:
            safetyPoints,

        total:
            total

    };


    /*
        Update summary.
    */

    document.getElementById(
        "summaryTitle"
    ).innerText =

        success
            ? "✅ STAGE COMPLETE!"
            : "⚠ STAGE ENDED";


    document.getElementById(
        "summaryDescription"
    ).innerText =
        reason;


    document.getElementById(
        "summarySurvivors"
    ).innerText =
        "+" +
        survivorPoints;


    document.getElementById(
        "summaryTime"
    ).innerText =
        "+" +
        timePoints;


    document.getElementById(
        "summaryHazards"
    ).innerText =
        hazardsAvoided +
        " avoided = +" +
        hazardPoints;


    document.getElementById(
        "summaryEquipment"
    ).innerText =
        equipmentCollected +
        " collected = +" +
        equipmentPoints;


    document.getElementById(
        "summarySafety"
    ).innerText =
        safetyDecisionCorrect
            ? "+50"
            : "+0";


    document.getElementById(
        "summaryTotal"
    ).innerText =
        total;


    /*
        Configure NEXT button.
    */

    nextStageButton.disabled =
        false;


    if (
        currentStage <
        STAGES.length - 1
    ) {

        nextStageButton.innerText =
            "NEXT STAGE →";


        nextStageButton.onclick =
            nextStage;

    }

    else {

        nextStageButton.innerText =
            "🏆 FINAL RESULTS";


        nextStageButton.onclick =
            showFinalResults;

    }


    summaryModal.style.display =
        "block";

}


/* =========================================================
   NEXT STAGE
========================================================= */

function nextStage() {

    /*
        THIS IS THE ONLY PLACE WHERE
        currentStage is increased.
    */

    if (
        gameState !==
        "summary"
    ) {

        return;

    }


    /*
        Prevent double-click.
    */

    if (
        transitionInProgress
    ) {

        return;

    }


    transitionInProgress =
        true;


    /*
        Disable the button immediately.
    */

    nextStageButton.disabled =
        true;


    /*
        IMPORTANT:
        Save the exact next stage BEFORE
        changing anything.
    */

    const nextIndex =
        currentStage + 1;


    /*
        No stage beyond Stage 3.
    */

    if (
        nextIndex >=
        STAGES.length
    ) {

        transitionInProgress =
            false;

        showFinalResults();

        return;

    }


    /*
        Stop current stage.
    */

    gameState =
        "loading";


    clearInterval(timer);

    timer = null;


    /*
        Hide summary.
    */

    summaryModal.style.display =
        "none";


    /*
        Move exactly one stage.
    */

    loadStage(
        nextIndex
    );


    /*
        Unlock only AFTER loadStage has
        completed synchronously.
    */

    transitionInProgress =
        false;

}


/* =========================================================
   RESTART GAME
========================================================= */

function restartGame() {

    /*
        Stop everything first.
    */

    clearInterval(timer);

    timer = null;


    transitionInProgress =
        false;


    /*
        Clear saved results.
    */

    stageResults =
        [];


    /*
        Explicitly reset to Stage 1.
    */

    currentStage =
        0;


    /*
        Load Stage 1.
    */

    loadStage(0);

}


/* =========================================================
   FINISH STAGE SAFETY
========================================================= */

function canFinishCurrentStage() {

    const stage =
        STAGES[currentStage];


    /*
        All survivors required.
    */

    if (
        rescued <
        stage.survivors.length
    ) {

        return false;

    }


    /*
        Safety decision required.
    */

    if (
        !safetyDecisionDone
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   EVACUATION CHECK
========================================================= */

function checkEvacuation() {

    if (
        gameState !==
        "playing"
    ) {

        return;

    }


    const stage =
        STAGES[currentStage];


    const position =
        getCameraPosition();


    const distance =
        Math.hypot(

            position.x -
            stage.evacuation.x,

            position.z -
            stage.evacuation.z

        );


    if (
        distance >
        2.8
    ) {

        return;

    }


    /*
        DO NOT advance the stage here.

        Only finish the current stage.
    */

    if (
        !canFinishCurrentStage()
    ) {

        if (
            rescued <
            stage.survivors.length
        ) {

            missionText.innerText =
                "🚧 Rescue every survivor before evacuation.";

        }

        else {

            missionText.innerText =
                "🧠 Complete the safety decision first.";

        }

        return;

    }


    finishStage(
        true,
        "ALL SURVIVORS SUCCESSFULLY EVACUATED"
    );

}


/* =========================================================
   MAIN LOOP
========================================================= */

function mainLoop() {

    updateNearby();

    checkDecision();

    checkHazards();

    checkEvacuation();

    requestAnimationFrame(
        mainLoop
    );

}


mainLoop();