//------- INITIALIZE CORE GLOBAL GAME COMPONENTS-------
const playArea = document.getElementById("playArea");
// minimum 900 600 resolution
let windowHeight = window.innerHeight;
let windowWidth = window.innerWidth;
if (windowWidth < 900 || windowHeight < 600) {
    alert("Your window screen is too small. Please maximize.")
}
// check if subject went through forms first. Or if disqualified can't return to game.
if (!localStorage.getItem("subject")) {
    window.location.href = "/pages/disqualified.html";
}

// check if page focus is lost
const disqualifyBackToStart = async () => {
    //if they get a perfect round or play to the end then don't delete
    if (currentRound !== numberOfRounds && level !== numberOfLevels) {
        let data = {
            refreshedPage: performance.navigation.type == 1 ? true : false,
            abandonedPage: performance.navigation.type == 1 ? false : true,
            subjectId: parseInt(localStorage.getItem("subject"))
        }
        const options = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        }
        await fetch('/api/trial', options)
        // previous versions delete data. Now we just redirect.
        localStorage.removeItem("subject");
        localStorage.removeItem("gameVersion");
        window.location.href = "/pages/disqualified.html";
    }
}

const gameVersion = localStorage.getItem("gameVersion");
let gameCondition = "";
if (gameVersion === "version1") {
    gameCondition = 1;
} else if (gameVersion === "version2") {
    gameCondition = 2;
} else {
    gameCondition = 3;
}
let score = 0;
let trialIteration = 0;
const numberOfRounds = 30;
const numberOfLevels = 6;
let currentRound = 1;
let level = 1;
let cursorX_enterOccluder = 0;
let cursorY_enterOccluder = 0;
let cursorX_exitOccluder = 0;
let cursorY_exitOccluder = 0;
let keepPlaying = true;
let success = false;
let direction = '';
let refreshedPage = false;
let abandonedPage = false;
// attributes to send to database:
let currentRoundFeatures = {
    bg_color: '',
    eye_size: '',
    eye_color: '',
    mouth_w: '',
    mouth_h: '',
    horns_w: '',
    horns_h: '',
}

//------ direction animations:
let animRight = gsap.timeline();
let animLeft = gsap.timeline();

//------ initialze heads up display
document.getElementById("level").innerHTML = `Level : ${level}/${numberOfLevels}`;
document.getElementById("score").innerHTML = `Score : ${score}`;

//------ initialize sound
const soundEffect = document.getElementById("mySound")
//------ circle for click effect
const circleForEffect = document.createElementNS("http://www.w3.org/2000/svg", "circle");
// =========================== END CORE GLOBAL COMPONENTS ===========================

//=========================== GAME FUNCTIONS ========================================
let timedMessage = (text, timeToDelay) => {

    // give break a chance to return
    window.removeEventListener("blur", disqualifyBackToStart);

    let timeLeft = 0
    const timerBySecond = () => {
        if (timeLeft < timeToDelay) {
            timeLeft += 1000;
            document.getElementById("timer").innerHTML = `${text} ${(timeToDelay - timeLeft) / 1000} seconds`;
        } else {
            // check if tab lost focus
            window.addEventListener("blur", disqualifyBackToStart);
            clearInterval(timer);
            gameAnimation(createCharacter(), createOccluder());
            document.getElementById("timer").innerHTML = "";
        }
    }
    const timer = setInterval(timerBySecond, 1000)

}
let gameEnd = () => {
    document.getElementById("timer").innerHTML = `Thank you for playing! `
    let buttonGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    buttonGroup.setAttribute("id", "character");
    let buttonText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    buttonText.setAttribute("x", "46");
    buttonText.setAttribute("y", "20");
    buttonText.setAttribute("fill", "white")
    buttonText.setAttribute("style", "font-size:0.2rem")
    buttonText.innerHTML = "Go to Final Review";
    let button = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    button.setAttribute("width", "29");
    button.setAttribute("height", "6");
    button.setAttribute("x", "44");
    button.setAttribute("y", "16");
    button.setAttribute("rx", "1px");
    button.setAttribute("ry", "1px");
    button.setAttribute("fill", "navy");
    // group button and text
    buttonGroup.appendChild(button);
    buttonGroup.appendChild(buttonText);
    // create exit interview entry in db, then edit in following pages
    let data = {
        subjectId: parseInt(localStorage.getItem("subject")),
        completed_block_100percent_after_trial: score == numberOfRounds ? level : 0,
        condition: gameCondition,
        aborted: false
    }
    const options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    }
    fetch('/api/exit', options)
    // imidiately assign re-route action
    buttonGroup.addEventListener("mousedown", () => { window.location.href = "/pages/exitInterview_1.html" });
    document.getElementById("playArea").appendChild(buttonGroup);
}
let addScore = () => {
    success = true;
    return score += 1;
}
let addTrialIteration = () => {
    return trialIteration += 1;
}
let addRound = () => {
    return currentRound += 1;
}
let nextLevel = () => {
    level += 1;
}
let removeElement = (elementToRemove) => {
    elementToRemove.remove()
}
// !!**==== CHECK IF GAME IS OVER EVERY ROUND ===**!!
let checkGameOver = (charactersToRemove) => {
    // POST ROUND TO DATABASE
    let data = {
        trialIteration: addTrialIteration(),
        success: success ? 1 : 0,
        condition: gameCondition,
        bg_color: currentRoundFeatures.bg_color,
        eye_size: currentRoundFeatures.eye_size,
        eye_color: currentRoundFeatures.eye_color,
        mouth_w: currentRoundFeatures.mouth_w,
        mouth_h: currentRoundFeatures.mouth_h,
        horns_w: currentRoundFeatures.horns_w,
        horns_h: currentRoundFeatures.horns_h,
        exitDirection: direction,
        subjectId: parseInt(localStorage.getItem("subject")),
        cursorX_enterOccluder, cursorY_enterOccluder, cursorX_exitOccluder, cursorY_exitOccluder, score,
    }
    const options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    }
    fetch('/api/trial', options)

    //*****========= PERFORM ROUND LOGIC ============= ******
    //----Last Level, Last Round----
    if (level === numberOfLevels && currentRound === numberOfRounds) {
        keepPlaying = false;
        gameEnd();
    } else if (score === numberOfRounds) {
        //----Last Round, Not Last Level----
        keepPlaying = false;
        gameEnd();
    } else if (currentRound === numberOfRounds) {
        //----Perfect Round----
        if (charactersToRemove) {
            removeElement(charactersToRemove[0])//<-- if there are more elements we can add later
        }
        keepPlaying = true;
        currentRound = 1;
        score = 0;
        level += 1;
        document.getElementById("level").innerHTML = `Level : ${level}/${numberOfLevels}`
        document.getElementById("score").innerHTML = `Score : ${score}`
        timedMessage("Level Complete! Next levels starts in : ", 20000) //<!!!***RECURSIVELY STARTING ANOTHER ROUND***!!!
    } else {
        //----keep playing
        if (charactersToRemove) {
            removeElement(charactersToRemove[0])//<-- if there are more elements we can add later
        }
        addRound();
        document.getElementById("level").innerHTML = `Level : ${level}/${numberOfLevels}`
        document.getElementById("score").innerHTML = `Score : ${score}`
        gameAnimation(createCharacter(), createOccluder()); //<!!!***RECURSIVELY STARTING ANOTHER ROUND***!!!
    }
}
let clearDirectionAnimations = () => {
    animRight.clear();
    animLeft.clear();
}
//------need to track mouse constantly:
let currentX = 0;
let currentY = 0;
let mouseCoordinate_window = (e) => {
    currentX = e.clientX;
    currentY = e.clientY;
}
document.addEventListener('mousemove', mouseCoordinate_window);

let mouseCoordinate_svg = () => {
    // Need to transform document screen space to svg coordinate space.
    const svgToTransform = document.getElementById("playArea");
    let pt = svgToTransform.createSVGPoint();
    pt.x = currentX;
    pt.y = currentY;
    let svgSpace = pt.matrixTransform(svgToTransform.getScreenCTM().inverse());

    // console.log(`[${svgSpace.x},${svgSpace.y}]`)
    return [`${svgSpace.x}`, `${svgSpace.y}`]
}
let mouseBeforeHidden = () => {
    let [x, y] = mouseCoordinate_svg();
    cursorX_enterOccluder = Math.round(x * 100 + Number.EPSILON) / 100;
    cursorY_enterOccluder = Math.round(y * 100 + Number.EPSILON) / 100;
}
let mouseAfterHidden = () => {
    let [x, y] = mouseCoordinate_svg();
    cursorX_exitOccluder = Math.round(x * 100 + Number.EPSILON) / 100;
    cursorY_exitOccluder = Math.round(y * 100 + Number.EPSILON) / 100;
}
let effectAnimation = () => {
    // Need to transform document screen space to svg coordinate space.
    const svgToTransform = document.getElementById("playArea");
    let pt = svgToTransform.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    let svgSpace = pt.matrixTransform(svgToTransform.getScreenCTM().inverse());

    circleForEffect.setAttribute("cx", svgSpace.x);
    circleForEffect.setAttribute("cy", svgSpace.y);
    circleForEffect.setAttribute("r", "1.9");
    circleForEffect.setAttribute("fill", "none");
    circleForEffect.setAttribute("stroke-width", "1.5");
    circleForEffect.setAttribute("stroke", "rgb(94, 179, 45)");
    document.getElementById("playArea").appendChild(circleForEffect);
    gsap.fromTo(circleForEffect, { scale: 1, opacity: 0.9 }, { scale: 1.6, opacity: 0, ease: "expo:out", transformOrigin: "center center", duration: 0.7 });
}
//=========================== Animation section ========================================
//******CHARACTER FADE OUT WHEN CLICKED and delete object when animmation is done
const characterFadeOut = (characterToFade, occluder) => {
    gsap.timeline({ onComplete: removeElement, onCompleteParams: [characterToFade] })
        .to(characterToFade, { duration: 0.5, scale: 1.2, opacity: 0, transformOrigin: "center center", onComplete: clearDirectionAnimations })
        .to(occluder, { duration: 1, y: 2, opacity: 0, scale: 1.1, transformOrigin: "center center", onComplete: checkGameOver, onCompleteParams: [[characterToFade, occluder]] }, "+=0.5")
}
//******ANIMATE RIGHT
const animateRight = (characterToAnimate, occluder) => {
    direction = "right";
    animRight.to(characterToAnimate, { duration: 0.5, x: 21, y: -30 })
    animRight.to(characterToAnimate, { duration: 0.5, opacity: 1, onComplete: mouseAfterHidden })
    animRight.to(characterToAnimate, { duration: 0.5, x: 46.5, y: -30, ease: "none", svgOrigin: "300 200", onComplete: removeElement, onCompleteParams: [characterToAnimate] })
    animRight.to(occluder, { duration: 1, y: 2, opacity: 0, scale: 1.1, transformOrigin: "center center", onComplete: checkGameOver, onCompleteParams: [[occluder]] }, "+=0.5")
}
//******ANIMATE LEFT
const animateLeft = (characterToAnimate, occluder) => {
    direction = "left";
    animLeft.to(characterToAnimate, { duration: 0.5, x: -21, y: -30 })
    animLeft.to(characterToAnimate, { duration: 0.5, opacity: 1, onComplete: mouseAfterHidden })
    animLeft.to(characterToAnimate, { duration: 0.5, x: -46.5, y: -30, ease: "none", onComplete: removeElement, onCompleteParams: [characterToAnimate] })
    animLeft.to(occluder, { duration: 1, y: 2, opacity: 0, scale: 1.1, transformOrigin: "center center", onComplete: checkGameOver, onCompleteParams: [[occluder]] }, "+=0.5")
}
//******MAIN GAME ANIMATION (CLICK CHECK INITIATES IN HERE)*****
const gameAnimation = (characterToAnimate, occluder) => {

    success = false; //<-- need to reset this every round
    // ==== DIRECTION LOGIC ========
    let directionToAnimate = () => {
        switch (gameCondition) {
            //---------- Random Direction -----------
            case 1:
                if (Math.random() >= 0.5) {
                    return animateRight(characterToAnimate, occluder);
                } else {
                    return animateLeft(characterToAnimate, occluder);
                }
            //---------- Dictated by eye size (1.6 goes right) -----------
            case 2:
                if (currentRoundFeatures.eye_size == "1.6") {
                    return animateRight(characterToAnimate, occluder);
                } else {
                    return animateLeft(characterToAnimate, occluder);
                }
            //---------- Dictated by horns (size 7 AND 80% chance goes right)-----------
            case 3:
                if (currentRoundFeatures.eye_size == "1.6" && Math.random() >= 0.2) {
                    return animateRight(characterToAnimate, occluder);
                } else {
                    return animateLeft(characterToAnimate, occluder);
                }
            default:
                alert("there is no version assigned. Please reach out to administrator");
        }

    }
    // make character clickable only once per round
    const once = () => {
        soundEffect.play();
        effectAnimation();
        characterToAnimate.removeEventListener("mousedown", once);
        document.getElementById("score").innerHTML = `Score : ${addScore()}`;
        characterFadeOut(characterToAnimate, occluder);
    }
    // provide listener to animation below only after character goes behind occluder/blocker
    // also tracking coordinates before character goes behind occluder
    let provideListener = () => {
        characterToAnimate.addEventListener("mousedown", once);
        mouseBeforeHidden();
    }
    // character animates on, goes behind occluder, then passes off to direction animation
    gsap.timeline({ onComplete: directionToAnimate, onCompleteParams: [characterToAnimate, occluder] })
        .from(occluder, { duration: 1, y: 2, opacity: 0 }, "+=0.5")
        .from(characterToAnimate, { duration: 1.5, y: 30, ease: "elastic.out(1,1)" }, "+=0.5")
        .to(characterToAnimate, { duration: 1, y: -16.4, ease: "power2.in", onComplete: provideListener }, "+=2")
        .to(characterToAnimate, { duration: 0.5, opacity: 0 })

}
//=========================== ELEMENTS TO CREATE ========================================
const features = {
    eyeColor: [
        // yellow shades
        ["rgb(252, 186, 3)", "rgb(255, 204, 61)", "rgb(255, 220, 122)", "rgb(201, 148, 0)", "rgb(161, 118, 0)"]
        ,
        // blue shades
        ["rgb(92, 198, 255)", "rgb(41, 180, 255)", "rgb(0, 166, 255)", "rgb(0, 131, 201)", "rgb(0, 98, 150)"]
    ],
    eyeSize: ["0.8", "1.6"],
    bodyColor: ["rgb(209, 51, 40)", "rgb(135, 135, 135)"],
    // mouthWidth and Height assigned in randomFeature()
    // hornWidth and Height assigned in randomFeature()
}
let randomFeature = () => {
    return {
        eyeColor: features.eyeColor[Math.floor(Math.random() * 2)][Math.floor(Math.random() * 5)],
        eyeSize: features.eyeSize[Math.floor(Math.random() * 2)],
        bodyColor: features.bodyColor[Math.floor(Math.random() * 2)],
        hornWidth: Math.floor(Math.random() * 2) + 1,
        hornHeight: Math.floor(Math.random() * 7) + 1,
        mouthWidth: Math.floor(Math.random() * 5) + 1,
        mouthHeight: Math.floor(Math.random() * 2) + 1
    }
}
const createOccluder = () => {

    let occluder = document.createElementNS("http://www.w3.org/2000/svg", "path");
    occluder.setAttribute("id", "blocker");
    occluder.setAttribute("d", "m18.1753,1.821852c0,0 24.29116,24.21453 24.29116,24.21453c0,0 24.44442,-24.06128 24.44442,-24.06128c0,0 0,20.68964 0,20.68964c0,0 -13.40995,13.5632 -13.40995,13.5632c0,0 -21.99231,-0.07663 -22.00194,-0.11737c0.00963,0.04074 -13.40032,-13.59909 -13.40994,-13.63983c0.00962,-0.03589 0.08625,-20.64889 0.08625,-20.648z");
    occluder.setAttribute("stroke-width", "1.5");
    occluder.setAttribute("stroke", "rgba(0,0,0,1)");
    occluder.setAttribute("fill", "rgba(0,0,0,1)");

    // ---attach to svg ---
    document.getElementById("playArea").appendChild(occluder);
    return occluder;
}
const createCharacter = (() => {

    let characterAttributes = randomFeature();

    currentRoundFeatures = {
        bg_color: characterAttributes.bodyColor,
        eye_size: characterAttributes.eyeSize,
        eye_color: characterAttributes.eyeColor,
        mouth_w: characterAttributes.mouthWidth,
        mouth_h: characterAttributes.mouthHeight,
        horns_w: characterAttributes.hornWidth,
        horns_h: characterAttributes.hornHeight
    }

    // create g tag (group that holds all pieces of character)
    let characterGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    characterGroup.setAttribute("id", "character");

    // ------ create body ------------
    let body = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    body.setAttribute("width", "8");
    body.setAttribute("height", "8");
    body.setAttribute("x", "38.5");
    body.setAttribute("y", "45");
    body.setAttribute("fill", characterAttributes.bodyColor);
    // ------ create left eye sclera ------------
    let leftEyeWhites = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    leftEyeWhites.setAttribute("cx", "40.5");
    leftEyeWhites.setAttribute("cy", "47.5");
    leftEyeWhites.setAttribute("r", characterAttributes.eyeSize);
    leftEyeWhites.setAttribute("fill", "white");
    // ------ create left eye pupil ------------
    let leftEye = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    leftEye.setAttribute("cx", "40.5");
    leftEye.setAttribute("cy", "47.5");
    leftEye.setAttribute("r", "0.2667");
    leftEye.setAttribute("fill", characterAttributes.eyeColor);
    // ------ create right eye sclera------------
    let rightEyeWhites = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    rightEyeWhites.setAttribute("cx", "44.5");
    rightEyeWhites.setAttribute("cy", "47.5");
    rightEyeWhites.setAttribute("r", characterAttributes.eyeSize);
    rightEyeWhites.setAttribute("fill", "white");
    // ------ create right eye pupil------------
    let rightEye = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    rightEye.setAttribute("cx", "44.5");
    rightEye.setAttribute("cy", "47.5");
    rightEye.setAttribute("r", "0.2667");
    rightEye.setAttribute("fill", characterAttributes.eyeColor);
    // ------ create left horn ------------
    let leftHorn = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    leftHorn.setAttribute("points", `38.5,45 ${38.5 + characterAttributes.hornWidth},45 ${38.5 + (characterAttributes.hornWidth / 2)},${45 - characterAttributes.hornHeight}`);
    leftHorn.setAttribute("style", `fill:${characterAttributes.bodyColor}`);
    // ------ create right horn ------------
    let rightHorn = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    rightHorn.setAttribute("points", `${46.5 - characterAttributes.hornWidth},45 46.5,45 ${46.5 - (characterAttributes.hornWidth / 2)},${45 - characterAttributes.hornHeight}`);
    rightHorn.setAttribute("style", `fill:${characterAttributes.bodyColor}`);
    // ------ create mouth ------------
    let mouth = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    mouth.setAttribute("width", `${characterAttributes.mouthWidth}`);
    mouth.setAttribute("height", `${characterAttributes.mouthHeight}`);
    mouth.setAttribute("x", `${42.6 - characterAttributes.mouthWidth / 2}`);
    mouth.setAttribute("y", `${51 - characterAttributes.mouthHeight / 2}`);
    mouth.setAttribute("fill", "black");

    //---- attach it to the container group (characterGroup) ----
    characterGroup.appendChild(body);
    characterGroup.appendChild(leftEyeWhites);
    characterGroup.appendChild(leftEye);
    characterGroup.appendChild(rightEyeWhites);
    characterGroup.appendChild(rightEye);
    characterGroup.appendChild(leftHorn);
    characterGroup.appendChild(rightHorn);
    characterGroup.appendChild(mouth);

    //---- attach to static svg on page ----
    document.getElementById("playArea").appendChild(characterGroup);

    return (characterGroup)
});
//<!!!***RECURSIVE THROUGH "checkGameOver = (characterToRemove)" FUNCTION***!!!
// createCharacter() returns a collection "<g>" of svg elements to attach to parent svg on the game page.
// createOccluder() returns the occluder object to animate on and off screen per round.
if (windowWidth > 900 && windowHeight > 600) {
    timedMessage("Game Starts in :", 6000)
}

// checking if page refreshed
if (performance.navigation.type == 1) {
    disqualifyBackToStart()
} else {
    // check if tab lost focus
    window.addEventListener("blur", disqualifyBackToStart);
}