//----- animation functions
let slideOn = (objectToAdd) => {
    gsap.from(objectToAdd, { duration: 1, y: -10, ease: "Power2.easeInOut", opacity: 0, stagger: 0.1 })
}
let slideOff = (objectToRemove) => {
    gsap.to(objectToRemove, { duration: 1, y: 10, ease: "power2.in", opacity: 0 })
}
// REDIRECT IF SPECS NOT MET---
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
if (screenWidth < 900 || screenHeight < 600 || navigator.maxTouchPoints != 0) {
    window.location.href = "/pages/lackRequirements.html";
}
//================== INITIAL VARIABLES / FUNCTIONS ======================
// import time zones from moment that we want to convert to (below LA and NY)
moment.tz.add([
    'America/Los_Angeles|PST PDT|80 70|0101|1Lzm0 1zb0 Op0',
    'America/New_York|EST EDT|50 40|0101|1Lz50 1zb0 Op0'
]);
let timeOnPageLoad = moment.utc().tz('America/Los_Angeles').format('YYYY-MM-DD h:mm:ss.ms'); //<--recorded as soon as page is loaded

let getGameVersion = (id) => {

    const v1Offset = 2;
    const v2Offset = 1;
    const rotateCycle = 3;
    let gameVersion = "";

    // assign version of game per 3rd intervals (managed by rotateCycle)
    if ((id + v2Offset) % rotateCycle == 0) {
        gameVersion = "version2";
    } else if ((id + v1Offset) % rotateCycle == 0) {
        gameVersion = "version1";
    } else {
        gameVersion = "versionP";
    }

    return gameVersion

}
// ACQUIRE ALL FORMS FROM PAGE
// DOM elements need to be assigned to array first 
let AllForms = [...document.getElementsByTagName("form")]

//***!!!---- ALL FORMS FROM ALL PAGES HANDLED IN THIS SWITCH CASE -----!!*****
AllForms.forEach(form => {

    switch (form.getAttribute("id")) {
        // --------------CONSENT FORM ------------------
        case 'consent':
            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                let data = {
                    startTime_consent: timeOnPageLoad,
                    endTime_consent: moment.utc().tz('America/Los_Angeles').format('YYYY-MM-DD h:mm:ss.ms'),
                    firstName: form.elements["firstName"].value,
                    lastName: form.elements["lastName"].value,
                    email: form.elements["emailConsent"].value,
                    wantsConsentEmailed: form.elements["sendEmail"].checked,
                    screenWidth,
                    screenHeight,
                    userAgent: navigator.userAgent
                }
                // very rudamentary form check but quick and gets job done
                const { firstName, lastName, email } = data;
                if (!firstName || !lastName || !email) {
                    alert('please fill out all the inputs');
                    return;
                }
                // add version to local storage on client system based off subject ID

                const options = {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' }
                }
                const newUser = await fetch('/api/subject', options)
                console.log(newUser.status);
                if (newUser.status == 400) {
                    return window.location.href = "/pages/existingUser.html";
                } else {
                    const jsonData = await newUser.json();
                    const subjectID = jsonData.subject
                    localStorage.setItem("subject", subjectID)//<--temporarily provide persisted data to local storage. Removed on errors or at end of game.
                    localStorage.setItem("gameVersion", getGameVersion(subjectID))
                    window.location.href = "/pages/demographics.html";
                }
            });
            break;
        // --------------DEMOGRAPHICS FORM ------------------
        case 'demographics':
            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                let data = {
                    age: form.elements["age"].value,
                    gender: form.elements["gender"].value,
                    demographic: form.elements["demographic"].value,
                    subjectId: localStorage.getItem("subject"),
                }
                // very rudamentary form check but quick and gets job done
                const { age, gender, demographic } = data;
                if (!age || gender == "" || demographic == "") {
                    alert('please fill out all the inputs');
                    return;
                }
                const options = {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' }
                }
                await fetch('/api/demographic', options)
                window.location.href = "/pages/instructions.html";
            });
            break;
        // --------------QUIZ FORM ------------------
        case 'quiz':
            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                let data = {
                    startTime_quiz: timeOnPageLoad,
                    endTime_quiz: moment.utc().tz('America/Los_Angeles').format('YYYY-MM-DD h:mm:ss.ms'),
                    subjectId: localStorage.getItem("subject")
                }
                const options = {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' }
                }
                if (form.elements["q1"].value === "2" &&
                    form.elements["q2"].value === "1" &&
                    form.elements["q3"].value === "3" &&
                    form.elements["q4"].value === "2" &&
                    form.elements["q5"].value === "3" 
                ) {
                    try {
                        await fetch('/api/quiz', options)
                        window.location.href = "/game.html";
                    } catch (err) {
                        console.error(err)
                    }
                } else {
                    try {
                        await fetch('/api/quiz', options)
                        window.location.href = "/pages/failedInstructions.html";
                    } catch (err) {
                        console.error(err);
                    }
                }


            });
            break;
        // --------------FINAL EXIT INTERVIEW PART 1 ------------------
        case 'exitInterview_1':
            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                window.location.href = "/pages/exitInterview_2.html";
            });
            break;
        // --------------FINAL EXIT INTERVIEW HUNCH 1------------------
        case 'exitInterview_2':
            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                let data = {
                    hunch1: document.getElementById("hunch1").value,
                    hunch1_level: document.getElementById("confidencePercent").value,
                    subjectId: localStorage.getItem("subject"),
                    finish_date_time: moment.utc().tz('America/Los_Angeles').format('YYYY-MM-DD h:mm:ss.ms')
                }
                const options = {
                    method: 'PUT',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' }
                }
                
                if (data.hunch1 == "") {
                    alert("please fill out the form");
                    return;
                }
                
                else {
                    try {
                        await fetch('/api/exit', options)
                        window.location.href = "/pages/exitInterview_3.html";
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
            break;
        // --------------FINAL EXIT INTERVIEW HUNCH 2------------------
        case 'exitInterview_3':
            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                let data = {
                    hunch2: document.getElementById("hunch").value,
                    hunch2_level: document.getElementById("confidencePercent").value,
                    subjectId: localStorage.getItem("subject"),
                    finish_date_time: moment.utc().tz('America/Los_Angeles').format('YYYY-MM-DD h:mm:ss.ms')
                }
                const options = {
                    method: 'PUT',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' }
                }
                
                if (data.hunch2 == "") {
                    alert("please fill out the form");
                    return;
                }
                else {
                    try {
                        await fetch('/api/exit', options)
                        window.location.href = "/pages/exitInterview_4.html";
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
            break;
        // --------------FINAL EXIT INTERVIEW HUNCH 3------------------
        case 'exitInterview_4':
            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                let data = {
                    hunch3: document.getElementById("hunch").value,
                    hunch3_level: document.getElementById("confidencePercent").value,
                    talked: form.elements["q1"].value === "1" ? true : false,
                    finish_date_time: moment.utc().tz('America/Los_Angeles').format('YYYY-MM-DD h:mm:ss.ms'),
                    subjectId: localStorage.getItem("subject")
                }
                const options = {
                    method: 'PUT',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' }
                }
                if (data.hunch3 == "") {
                    alert("please fill out your hunch");
                    return;
                } else if (!form.elements["q1"].value) {
                    alert("please choose yes or no if you talked to anyone");
                    return;
                }

                try {
                    await fetch('/api/exit', options)
                    localStorage.removeItem("gameVersion");
                    localStorage.removeItem("subject");
                    window.location.href = "/pages/final.html";
                } catch (err) {
                    console.error(err);
                }

            });
            break;
        // --------------FINAL EXIT QUESTIONS------------------
        case 'finalInterview':
            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                let data = {
                    onTask: form.elements["q1"].value,
                    playMethod: form.elements["q2"].value,
                    finish_date_time: moment.utc().tz('America/Los_Angeles').format('YYYY-MM-DD h:mm:ss.ms'),
                    subjectId: localStorage.getItem("subject")
                }
                const options = {
                    method: 'PUT',
                    body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' }
                }
                if (form.elements["q1"].value == "" || form.elements["q2"].value == "") {
                    alert("please fill out your hunch");
                    return;
                }

                try {
                    await fetch('/api/exit', options)
                    localStorage.removeItem("subject");
                    localStorage.removeItem("gameVersion");
                    window.location.href = "/pages/final.html";
                } catch (err) {
                    console.error(err);
                }

            });
            break;
        default:
        //do nothing
    }
})


// animate elements on
let ps = document.getElementsByTagName("form")
let pTag = document.getElementsByTagName("p")
let h2Tag = document.getElementsByTagName("h2")
let h1Tag = document.getElementsByTagName("h1")

slideOn(ps);
slideOn(pTag);
slideOn(h2Tag);
slideOn(h1Tag);