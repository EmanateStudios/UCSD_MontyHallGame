//----- GSAP IMPORTS
import gsap from 'gsap';

export let gameSettings = {
    currentLevel : 1,
    totalLevels : 2, //<-- production: 20
    currentRound : 1,
    totalRounds: 3, //<-- production: 6
    score : 0,
    scoreIncrement: 20, 
    scoreDecrement: 10,
    subject : '',
    success: 0,
    isGameOver:false,
    isBreak:false,
    breakTime:10000, //<---production:20000 (in milliseconds)
    playSound (soundToPlay) {
        soundToPlay.play()
    },
    soundControl(checkBoxId,soundForWinning,soundForLosing){
        if (!checkBoxId){
            checkBoxId = 'music'
        }
        if (!soundForWinning){
            soundForWinning = 'winSound'
        }
        if (!soundForLosing){
            soundForLosing = 'loseSound'
        }
        const Volume = 1.0
        const winSound = document.getElementById(soundForWinning);
        const loseSound = document.getElementById(soundForLosing);
        const soundCheckBox = document.getElementById(checkBoxId);
        const SoundListener = soundCheckBox.addEventListener('change',()=>{
            if (soundCheckBox.checked) {
                winSound.volume = Volume;
                loseSound.volume = Volume;
            } else {
                winSound.volume = 0;
                loseSound.volume = 0;
            }
        });
        return SoundListener
    }
}

let hidden, visibilityChange; 
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

export let disqualificationSettings = {
    hidden,
    visibilityChange
}

export const disqualifyAction = (breakBool) =>{
    if (document[hidden]) {
        if(breakBool == false){

                let data = {
                    subjectId: localStorage.getItem("subject"),
                    abandonedPage:true,
                }
                const options = {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' }
                }
                fetch('https://ucsd-mh-game.herokuapp.com/api/trial', options) //<--actual call to server
            
                let ExitData = {
                    subjectId: parseInt(localStorage.getItem("subject")),
                    aborted: true
                }
                const ExitOptions = {
                    method: 'POST',
                    body: JSON.stringify(ExitData),
                    headers: { 'Content-Type': 'application/json' }
                }
                fetch('/api/exit', ExitOptions)
                localStorage.removeItem("subject");
                localStorage.removeItem("gameVersion");
                window.location.href = "/pages/disqualified.html"
        }

    } else {
    console.log('coming back from break')
    }
}



export const breakScreen = async (finalAction,timeToDelay) =>{

    return new Promise((resolve,reject) =>{

        const pauseScreen = document.createElement("div");
        pauseScreen.setAttribute('id','loader');
    
        const continueButton = document.createElement("BUTTON");
    
        pauseScreen.appendChild(continueButton)
        continueButton.innerHTML = `${timeToDelay/1000} seconds left in break`;
    
        // add the newly created element and its content into the DOM 
        const infoDiv = document.getElementById("infoBar"); 
        document.body.insertBefore(pauseScreen, infoDiv);
        
        const fadeOutPauseScreen = (actionOnComplete) =>{
            gsap.timeline({
                onComplete: () => {actionOnComplete}
                })
                .to(continueButton, {
                    duration: 1.5, scale: 1.1, opacity: 0, onComplete: () => {
                        continueButton.removeEventListener('mouseup', fadeOutPauseScreen)
                        continueButton.remove()
                    }
                })
                .to(pauseScreen, { duration: 1.5, opacity: 0, onComplete: () => { 
                    pauseScreen.remove()
                    resolve(false) //<-- this tells isBreak to turn false, effectively re-enabline disqualification
                }}, "-=1.0")
        }
        gsap.timeline({
            onComplete: () => { finalAction}
            })
            .fromTo(pauseScreen,{opacity:0}, {duration: 1.5, opacity: 0.75,
                onComplete: ()=>{
                    let timeLeft = 0
                    const timerBySecond = () => {
                        if (timeLeft < timeToDelay) {
                            timeLeft += 1000;
                            continueButton.innerHTML = `${(timeToDelay - timeLeft) / 1000} seconds left in break`;
                        } else {
                            clearInterval(timer);
                            continueButton.innerHTML = "continue";
                            continueButton.addEventListener('mouseup', fadeOutPauseScreen)
                        }
                    }
                    const timer = setInterval(timerBySecond, 1000)
                } },"+=3")

    })

    
}

export const endScreen = () =>{
    const pauseScreen = document.createElement("div");
    pauseScreen.setAttribute('id','loader');
    
    const continueButton = document.createElement("BUTTON");

    pauseScreen.appendChild(continueButton)
    continueButton.innerHTML = `Thanks for playing! Click here to continue`;

    // add the newly created element and its content into the DOM 
    const infoDiv = document.getElementById("infoBar"); 
    document.body.insertBefore(pauseScreen, infoDiv);
    
    gsap.timeline()
        .fromTo(pauseScreen,{opacity:0}, {duration: 2, opacity: 0.75,
            onComplete: ()=>{
                continueButton.addEventListener('mouseup', ()=>{window.location.href = "/pages/exitInterview_1.html"},"+=5")
            }
        })
}
// buttonGroup.addEventListener("mousedown", () => { window.location.href = "/pages/exitInterview_1.html" });




// // check if subject went through forms first. Or if disqualified can't return to game.
// if (!localStorage.getItem("subject")) {
//     window.location.href = "/pages/disqualified.html";
// }

// // check if page focus is lost
// const disqualifyBackToStart = async () => {
//     //if they get a perfect round or play to the end then don't delete
//     if (currentRound !== numberOfRounds && level !== numberOfLevels) {
//         let data = {
//             refreshedPage: performance.navigation.type == 1 ? true : false,
//             abandonedPage: performance.navigation.type == 1 ? false : true,
//             subjectId: parseInt(localStorage.getItem("subject"))
//         }
//         const options = {
//             method: 'POST',
//             body: JSON.stringify(data),
//             headers: { 'Content-Type': 'application/json' }
//         }
//         await fetch('/api/trial', options)
//         // previous versions delete data. Now we just redirect.
//         localStorage.removeItem("subject");
//         localStorage.removeItem("gameVersion");
//         window.location.href = "/pages/disqualified.html";
//     }
// }