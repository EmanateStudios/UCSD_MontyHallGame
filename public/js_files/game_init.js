import '@babel/polyfill'
//----- THREE IMPORTS
import * as THREE from 'three';
import Stats from 'stats.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// 3D assets to import
import doorGLTF from '../THREE/Assets/gltf_files/Door.gltf'
import chestGLTF from '../THREE/Assets/gltf_files/Treasure.gltf'
import rubbleGLTF from '../THREE/Assets/gltf_files/Rubble.gltf'
// audio assets to import
// import successSound from '../soundFX/quest-game-magic-loot-crate-op.wav'
// import failSound from '../soundFX/small-debris-and-plastic-debri.wav'
// import music from '../soundFX/morning-coffee-easy-listening-.wav'
//----- CUSTOM FUNCTION IMPORTS
import {gameSettings, disqualificationSettings,disqualifyAction,breakScreen,endScreen} from './gameSettings.js'
//----- GSAP IMPORTS
import gsap from 'gsap';

let version = localStorage.getItem("gameVersion")

// THREE.JS NEEDS AT MINIMUM THESE COMPONENTS:
// 1.)scene,2.) camera,3.) renderer (and animate function to actually utilize it),4.) object (4a: material, 4b: mesh, 4c: textures), 5.) and light(5a: type/intensity/color/properties,5b: shadows)

//---------------- LOADING MANAGER---------------------
// passing this manager into 3D assets as parameter
const startingScreen = document.getElementById('loader');
const manager = new THREE.LoadingManager();
manager.onStart = (url, itemsLoaded, itemsTotal) => {
}
//when finished loading enable game logic and remove black screen
manager.onLoad = () => {
    const startButton = document.createElement("BUTTON");
    startButton.innerHTML = "Start";
    startingScreen.innerHTML = '';
    const startFunction = () => {
        gsap.timeline({
            onComplete: () => {
                container.addEventListener('mouseup', ClickLocationTrack)
                container.addEventListener('mouseup', GameClick);
                container.addEventListener("mousedown", mousePressed);
            }
        })
            .to(startButton, {
                duration: 1.5, scale: 1.1, opacity: 0, onComplete: () => {
                    startButton.removeEventListener('click', startFunction)
                    startButton.remove()
                }
            })
            .to(startingScreen, { duration: 1.5, opacity: 0, onComplete: () => { startingScreen.remove() } }, "-=1.0")
    }
    startButton.addEventListener("click", startFunction);
    startingScreen.appendChild(startButton);
    animate();
}
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    startingScreen.innerHTML = `${(itemsLoaded / itemsTotal * 100).toFixed(0)} %`;
}
manager.onError = (url) => {
    console.log(`there was an error with ${url}`)
}


//--------------------- SCENE SETTINGS -----------------------------------------
const level_round = document.getElementById('level_round');
const scoreDisplay = document.getElementById('scoreDisplay');
const scene = new THREE.Scene();
const container = document.querySelector(".scene"); //<-- our DOM Reference to HTML Div class "scene". 


//--------------------- AUDIO SETTINGS -----------------------------------------

const {playSound, soundControl} = gameSettings
soundControl();

//--------------------- CAMERA SETTINGS -----------------------------------------
const nearClippingPlane = 0.06
const farClippingPlane = 10000
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, nearClippingPlane, farClippingPlane);
camera.position.set(0, 80, 250);

//--------------------- RENDERER SETTINGS -----------------------------------------

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
// enable shadow maps
renderer.shadowMap.enabled = true;
// add to dom
container.appendChild(renderer.domElement);
// view stats
// let stats
// stats = new Stats();
// container.appendChild(stats.dom);

//--------------------- LIGHT SETTINGS -----------------------------------------
const addShadows = (light) => {
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 0.01;
    light.shadow.camera.far = 10000
    light.shadow.bias = - 0.000001;
}
//------ "Sun" Light
const directionLight = new THREE.DirectionalLight(0xFFFFFF, 3);
directionLight.position.set(0, 1, 1)
// addShadows(directionLight)
scene.add(directionLight);

// ---hint of ambient light
var ambientLight = new THREE.AmbientLight(0x404040, 6); // soft white light
scene.add(ambientLight);

//------- DOOR SPOT LIGHTS
// left light
const doorLight_01 = new THREE.SpotLight(0xFFFFFF, 100, 400, 0.2, 1.0, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
doorLight_01.position.set(-200, 370, 80)
doorLight_01.target.position.set(-200, 40, -25)
addShadows(doorLight_01)
scene.add(doorLight_01)
scene.add(doorLight_01.target)
// middle light
const doorLight_02 = new THREE.SpotLight(0xFFFFFF, 100, 400, 0.2, 1.0, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
doorLight_02.position.set(0, 370, 80)
doorLight_02.target.position.set(0, 40, -25)
addShadows(doorLight_02)
scene.add(doorLight_02)
scene.add(doorLight_02.target)
// right light
const doorLight_03 = new THREE.SpotLight(0xFFFFFF, 100, 400, 0.2, 1.0, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
doorLight_03.position.set(200, 370, 80)
doorLight_03.target.position.set(200, 40, -25)
addShadows(doorLight_03)
scene.add(doorLight_03)
scene.add(doorLight_03.target)


//--------------------- CUSTOM FLOOR SETTINGS-----------------------------------
var floor = new THREE.PlaneBufferGeometry(2000, 2000);
floor.rotateX(- Math.PI / 2);
const shadowFloorMat = new THREE.ShadowMaterial();
shadowFloorMat.opacity = 0.1;

var floorMesh = new THREE.Mesh(floor, shadowFloorMat);
floorMesh.receiveShadow = true;
scene.add(floorMesh);


//--------------------- 3D ASSET LOADER SETTINGS-----------------------------------
const loader = new GLTFLoader(manager);

//---DRACO Compressions---
var dracoLoader = new DRACOLoader();
// dracoLoader.setDecoderPath( '/examples/js/libs/draco/' );
loader.setDRACOLoader(dracoLoader);

//--------------------- INVISIBLE WALL SETTINGS-----------------------------------
var wall = new THREE.PlaneBufferGeometry(2000, 2000);
const wallMaterial = new THREE.MeshBasicMaterial({color:0x00ff00});

var invisibleWallMesh = new THREE.Mesh(wall, wallMaterial);
invisibleWallMesh.visible = false
// adding this into door group

//========== LOADING DOOR AND ASSIGNING ALL 3 TO A DOOR GROUP ==========

let Door_01, Door_02, Door_03;
let DoorGroup = new THREE.Group();
DoorGroup.add(invisibleWallMesh);
loader.load(doorGLTF, (gltf) => {
    // assign shadow casting and recieving to all meshes in gltf object
    gltf.scene.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    })
    Door_02 = gltf.scene;
    Door_01 = Door_02.clone();
    Door_03 = Door_02.clone();
    Door_01.children[0].name = "Door_01";
    Door_02.children[0].name = "Door_02";
    Door_03.children[0].name = "Door_03";
    Door_01.position.set(-200, 0, 0);
    Door_03.position.set(200, 0, 0);
    DoorGroup.add(Door_01);
    DoorGroup.add(Door_02);
    DoorGroup.add(Door_03);
    DoorGroup.position.set(-50, 0, 0); //move all doors together with this group.
    scene.add(DoorGroup);
},
    (xhr) => {
        // this runs as object is loaded. due to multiple files this is handled by loading manager instead that manages all objects
    },
    (err) => {
        console.error(`error for door is: ${err}`);
    }
)
//=================== LOADING SINGLE TREASURE CHEST ===================
// --Treasure Lights
// spotlight 1
const treasureLightOne = new THREE.SpotLight(0xFFFFFF, 0, 300, 0.5, 0.8, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
treasureLightOne.position.set(70, 200, 0)
// spotlight 2
const treasureLightTwo = new THREE.SpotLight(0xFFFFFF, 0, 300, 0.5, 0.8, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
treasureLightTwo.position.set(-70, 200, 0)
// assign lights to a group that will rotate around the treasure chest
let TreasureLightGroup = new THREE.Group();
TreasureLightGroup.add(treasureLightOne)
TreasureLightGroup.add(treasureLightTwo)
TreasureLightGroup.position.set(0, 0, -70)
scene.add(TreasureLightGroup)
// keep this group always rotating - only adjust fade on and off
gsap.timeline().to(TreasureLightGroup.rotation, { duration: 4, y: 6.28, repeat: -1, ease: "none" })

let TreasureChest
loader.load(chestGLTF, (gltf) => {
    // assign shadow casting and recieving to all meshes in gltf object
    gltf.scene.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    })
    TreasureChest = gltf.scene.children[0];
    TreasureChest.position.set(0, 0, -60);
    TreasureChest.visible = false;
    scene.add(gltf.scene);
    treasureLightOne.target = TreasureChest;
    treasureLightTwo.target = TreasureChest;
    scene.add(treasureLightOne.target)
    scene.add(treasureLightTwo.target)
},
    (xhr) => {
        // this runs as object is loaded. due to multiple files this is handled by loading manager instead that manages all objects
    },
    (err) => {
        console.error(`error for chest is: ${err}`);
    }
)

//===================== LOADING AND POSITIONING RUBBLE =====================

let Rubble;
loader.load(rubbleGLTF, (gltf) => {
    // assign shadow casting and recieving to all meshes in gltf object
    gltf.scene.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    })
    Rubble = gltf.scene;
    Rubble.scale.set(0.6, 0.6, 0.6)
    Rubble.position.set(0, 0, -55);
    Rubble.visible = false;
    scene.add(Rubble);
},
    (xhr) => {
        // this runs as object is loaded. due to multiple files this is handled by loading manager instead that manages all objects
    },
    (err) => {
        console.error(`error for door is: ${err}`);
    }
)


//--------------------- ORBIT CONTROL SETTINGS -----------------------------------------
// const controls = new OrbitControls(camera, renderer.domElement);

//============================== ANIMATE/RUN THE RENDERER ==============================
// ************************ control how window reacts to render ************************
const animate = () => {

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    // stats.update();

}

// keep aspect ration when resizing window to fit on any device
let containerNormalized = container.getBoundingClientRect();

const onWindowResize = () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    containerNormalized = container.getBoundingClientRect();
}
window.addEventListener("resize", onWindowResize);



//======================================== GAME LOGIC / CONTROL SECTION =================================================
//-----------------------------------------------------------------------------------------------------------------------

// gameplay variables to track and record
let {currentLevel,trialIteration,totalLevels,isBreak,breakTime, currentRound,totalRounds, score,scoreIncrement,scoreDecrement , success,isGameOver} = gameSettings;
level_round.innerHTML = `Level : ${currentLevel}/${totalLevels}, Round : ${currentRound}/${totalRounds} `;//<--initialze round text

// -------- REWARD LIGHTS ON / OFF FUNCTION ------
const rewardLight = () => {
    gsap.timeline()
        .to(treasureLightOne, { duration: 2.5, intensity: 40 })
        .to(treasureLightOne, { duration: 2.5, intensity: 0 })
    gsap.timeline()
        .to(treasureLightTwo, { duration: 2.5, intensity: 40 })
        .to(treasureLightTwo, { duration: 2.5, intensity: 0 })
}

// -------------------- RAY CAST FOR BUTTON CLICK FUNCTION ------------------
const raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

let intersects //<---these are the objects that get hit by raycaster during mouse move

document.onmousemove = (event) => {
    event.preventDefault();

    raycaster.setFromCamera(mouse, camera);
    mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
    mouse.y = - ((event.clientY - containerNormalized.top) / container.clientHeight) * 2 + 1;
    intersects = raycaster.intersectObjects(DoorGroup.children, true);
}

// ******* MOUSE DOWN PRESS ***********
let TimeWhenPressed
const mousePressed = () => {
    TimeWhenPressed = new Date().getTime();
}

const moveCameraAndDoor = (x, y, z, door) => {
    // move camera in
    
    let cameraAnimation = gsap.timeline()
    cameraAnimation
        .to(camera.position, { duration: 1.5, x, y, z, ease: "Power2.easeInOut" })
        .to(camera.position, { delay: 1.8, duration: 1.2, x: 0, y: 80, z: 250, ease: "Power2.easeInOut" })
    // open door forward then close
    let doorOpenAnimation = gsap.timeline();
    doorOpenAnimation
        .to(door.object.rotation, { delay: 0.7, duration: 1.5, y: -1.8, ease: "circ.inOut" })
        .to(door.object.rotation, {
            duration: 1.5, y: 0, ease: "circ.inOut", onComplete: () => {
                TreasureChest.visible = false;
                Rubble.visible = false;
                if (!isGameOver){
                    container.addEventListener('mouseup', GameClick);
                    container.addEventListener("mousedown", mousePressed);
                }
            }
        })
   
}

const recordDataToDatabase = async(pr = null,clickCoordinates = [0,0],whichDoor = 0) =>{
    return new Promise((resolve,reject) =>{
        const pReward = pr
        // console.log(`pReward: ${pReward || 'no reward'}, TI: ${trialIteration}`)
        // ------- record trial into database ---------
        let data = {
            trialIteration ,
            level: currentLevel,
            round:currentRound,
            score,
            pReward,
            xClick:clickCoordinates[0],
            yClick:clickCoordinates[1],
            door: whichDoor,
            success: pReward ? success : null,
            subjectId: localStorage.getItem("subject"),
            abandonedPage:false,
            version
        }
        const options = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        }
        // console.log(`x: ${clickCoordinates[0]}, y:${clickCoordinates[1]}`)
        // fetch('http://localhost:5000/api/trial', options).then(()=>{resolve()}) //<--actual call to server 
        fetch('https://ucsd-mh-game.herokuapp.com/api/trial', options).then(()=>{resolve()}) //<--actual call to server
    })
}
//***** !!!! victory check also holds level and round logic !!! ***********
const victoryCheck = async (pr = null, xPosition = null,clickCoordinates = [0,0],whichDoor = 0) => {
    const pReward = pr
    
    //------- pReward logic to take if it is not null ---------
    if (pReward) {

        if (Math.random() <= pReward) {
            score += scoreIncrement;
            success = 1;
            scoreDisplay.innerHTML = `Your winnings so far : ${score} Gold`;
            setTimeout(() => {
                playSound(winSound);
                TreasureChest.visible = true;
            }, 1000)
            rewardLight()
            TreasureLightGroup.position.x = xPosition;
            TreasureChest.position.x = xPosition;
        }
        else {
            setTimeout(() => {
                Rubble.visible = true;
                playSound(loseSound);
            }, 1000)
            Rubble.position.x = xPosition;
            score -= scoreDecrement;
            success = 0;
            scoreDisplay.innerHTML = `Your winnings so far : ${score} Gold`;
        }
        // ---------level & round logic---------

        if (currentLevel == totalLevels && currentRound == totalRounds){
            // first record
            recordDataToDatabase(pReward,clickCoordinates,whichDoor);
            // FINISHED WHOLE GAME AND GAME OVER
            isBreak = true
            isGameOver = true;
            container.removeEventListener('mouseup', GameClick);
            container.removeEventListener("mouseup", ClickLocationTrack);
            container.removeEventListener("mousedown", mousePressed);
            level_round.innerHTML = `Level : ${currentLevel}/${totalLevels}, Round : ${currentRound}/${totalRounds}`;
            endScreen()
        } else if (currentLevel == totalLevels){
            // first record
            await recordDataToDatabase(pReward,clickCoordinates,whichDoor);
            // NEXT ROUND
            isBreak = true //<-- seems useless but it disables disqualification momentarily until the following line returns it to false when break is over.
            breakScreen(null,breakTime).then(val => isBreak = val); //<--when animations are done false is resolved from promise and we assign that to isBreak
            currentLevel = 1; //<-- back to 1 after you reach total levels for the round
            currentRound ++; //<-- next round
            trialIteration ++;
            level_round.innerHTML = `Level : ${currentLevel}/${totalLevels}, Round : ${currentRound}/${totalRounds}`;
        } else {
            // first record
            await recordDataToDatabase(pReward,clickCoordinates,whichDoor);
            // NEXT LEVEL
            currentLevel ++; //<-- next level
            trialIteration ++;
            level_round.innerHTML = `Level : ${currentLevel}/${totalLevels}, Round : ${currentRound}/${totalRounds}`;
        }
    }
    

    if (isGameOver) {
        let ExitData = {
            subjectId: parseInt(localStorage.getItem("subject")),
            aborted: false
        }
        const ExitOptions = {
            method: 'POST',
            body: JSON.stringify(ExitData),
            headers: { 'Content-Type': 'application/json' }
        }
        fetch('/api/exit', ExitOptions)
    }

    
}

const ClickLocationTrack = (event) => {
    event.preventDefault();
    intersects = raycaster.intersectObjects(DoorGroup.children, true);
    // victoryCheck(null,null , [intersects[0].point.x.toFixed(4), intersects[0].point.y.toFixed(4)]) 
    recordDataToDatabase(null,[intersects[0].point.x.toFixed(4), intersects[0].point.y.toFixed(4)]);
}

const pRewardCalc = (yPositionClick) => {
    if (yPositionClick > 100) { return 0.8 }
    if (yPositionClick <= 100) { return 0.2 }
}
// ******* MOUSE RELEASED ***********
const GameClick = (event) => {
    event.preventDefault();

    // handling p(Reward) here calculating when mouse was pressed and released);
    let TimeWhenReleased = new Date().getTime();
    let TimeHeldDown = TimeWhenReleased - TimeWhenPressed;
    // let pReward = Math.min(0.8, (0.2 + (TimeHeldDown / 1666))).toFixed(2)

    // handle all the logic depending on what was pressed and for how long
    intersects = raycaster.intersectObjects(DoorGroup.children, true);
    //save another door variable to make an animation check at the bottom of this function
    
    for (let item of intersects) {
        if (item.object.name === "Door_01") {
            container.removeEventListener('mouseup', GameClick);
            container.removeEventListener("mousedown", mousePressed);
            moveCameraAndDoor(-200, 80, 200, item)
            victoryCheck(pRewardCalc(item.point.y.toFixed(4)), -200, [item.point.x.toFixed(4),item.point.y.toFixed(4)],1)//<-- 2nd paramter is x position to put chest
            break;
        }
        if (item.object.name === "Door_02") {
            container.removeEventListener('mouseup', GameClick);
            container.removeEventListener("mousedown", mousePressed);
            moveCameraAndDoor(0, 80, 200, item)
            victoryCheck(pRewardCalc(item.point.y.toFixed(4)), 0,[item.point.x.toFixed(4),item.point.y.toFixed(4)],2)
            break;
        }
        if (item.object.name === "Door_03") {
            container.removeEventListener('mouseup', GameClick);
            container.removeEventListener("mousedown", mousePressed);
            moveCameraAndDoor(200, 80, 200, item)
            victoryCheck(pRewardCalc(item.point.y.toFixed(4)), 200,[item.point.x.toFixed(4),item.point.y.toFixed(4)],3)
            break;
        }
    }

}

//-------------------------- DISQUALIFICATION PARAMETERS ---------------------------

if (!localStorage.getItem("subject")) { 
    // IMMIDIATELY REDIRECT IF NOT A SUBJECT
    window.location.href = "/pages/disqualified.html"
} else {
    let {hidden, visibilityChange} = disqualificationSettings
    document.addEventListener(visibilityChange, () => {disqualifyAction(isBreak)}, false);
}


