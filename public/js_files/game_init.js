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
// audio assets to import
// import successSound from '../soundFX/quest-game-magic-loot-crate-op.wav'
// import failSound from '../soundFX/small-debris-and-plastic-debri.wav'
// import music from '../soundFX/morning-coffee-easy-listening-.wav'
//----- CUSTOM FUNCTION IMPORTS
//----- GSAP IMPORTS
import gsap from 'gsap';




// THREE.JS NEEDS AT MINIMUM THESE COMPONENTS:
// 1.)scene,2.) camera,3.) renderer (and animate function to actually utilize it),4.) object (4a: material, 4b: mesh, 4c: textures), 5.) and light(5a: type/intensity/color/properties,5b: shadows)

//---------------- LOADING MANAGER---------------------
// passing this manager into 3D assets as parameter
const startingScreen = document.getElementById('loader');
const manager = new THREE.LoadingManager();
manager.onStart = (url, itemsLoaded, itemsTotal) => {
    // console.log(`Started loading file: ${url} . Loaded ${itemsLoaded} of ${itemsTotal} files`)
}
//when finished loading enable game logic and remove black screen
manager.onLoad = () => {
    const startButton = document.createElement("BUTTON");
    startButton.innerHTML = "Start";
    startingScreen.innerHTML = '';
    const startFunction = () => {
        gsap.timeline({
            onComplete: () => {
                container.addEventListener('mouseup', GameClick);
                container.addEventListener("mousedown", mousePressed);
                musicSound.play();
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
const infoBar = document.getElementById('infoBar');
const scoreDisplay = document.getElementById('scoreDisplay');
const scene = new THREE.Scene();
const container = document.querySelector(".scene"); //<-- our DOM Reference to HTML Div class "scene". 

//--------------------- AUDIO SETTINGS -----------------------------------------
// const winSound = new Audio(successSound);
// const loseSound = new Audio(failSound);
// const musicSound = new Audio(music);
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');
const musicSound = document.getElementById('musicSound');
musicSound.loop = true;

const playSound = (soundToPlay) => {
    soundToPlay.play();
}
const musicCheckBox = document.getElementById('music')
musicCheckBox.addEventListener('change', () => {
    if (musicCheckBox.checked) {
        musicSound.play();
    } else {
        musicSound.pause();
    }
})

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
let stats
stats = new Stats();
container.appendChild(stats.dom);

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
const directionLight = new THREE.DirectionalLight(0xFFFFFF, 2);
directionLight.position.set(-50, 100, 100)
addShadows(directionLight)
scene.add(directionLight);

// ---hint of ambient light
var ambientLight = new THREE.AmbientLight(0x404040, 4); // soft white light
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
const doorLight_02 = new THREE.SpotLight(0xFFFFFF, 100, 400, .2, 1.0, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
doorLight_02.position.set(0, 370, 80)
doorLight_02.target.position.set(0, 40, -25)
addShadows(doorLight_02)
scene.add(doorLight_02)
scene.add(doorLight_02.target)
// right light
const doorLight_03 = new THREE.SpotLight(0xFFFFFF, 100, 400, .2, 1.0, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
doorLight_03.position.set(200, 370, 80)
doorLight_03.target.position.set(200, 40, -25)
addShadows(doorLight_03)
scene.add(doorLight_03)
scene.add(doorLight_03.target)


//--------------------- CUSTOM FLOOR SETTINGS-----------------------------------
var floor = new THREE.PlaneBufferGeometry(2000, 2000);
floor.rotateX(- Math.PI / 2);
const shadowFloorMat = new THREE.ShadowMaterial();
shadowFloorMat.opacity = 0.5;

var floorMesh = new THREE.Mesh(floor, shadowFloorMat);
floorMesh.receiveShadow = true;
scene.add(floorMesh);


//--------------------- 3D ASSET LOADER SETTINGS-----------------------------------
const loader = new GLTFLoader(manager);

//---DRACO Compressions---
var dracoLoader = new DRACOLoader();
// dracoLoader.setDecoderPath( '/examples/js/libs/draco/' );
loader.setDRACOLoader(dracoLoader);

let Door_01, Door_02, Door_03;
// --LOADING DOOR AND ASSIGNING ALL 3 TO A DOOR GROUP
let DoorGroup = new THREE.Group();
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
//----- LOADING SINGLE TREASURE CHEST

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
TreasureLightGroup.position.set(0, 0, -130)
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
    TreasureChest.position.set(0, 0, -120);
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


//--------------------- ORBIT CONTROL SETTINGS -----------------------------------------
// const controls = new OrbitControls(camera, renderer.domElement);

//------------------ ANIMATE/RUN THE RENDERER ----------------------------
const animate = () => {

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    // renderer();
    stats.update();

}

// keep aspect ration when resizing window to fit on any device
const onWindowResize = () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
}
window.addEventListener("resize", onWindowResize);



//======================================== GAME LOGIC / CONTROL SECTION =================================================
//-----------------------------------------------------------------------------------------------------------------------

// gameplay variables to track and record
let score = 0;
// door animation timeline:
let doorGSAPTimeline = gsap.timeline();

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
// setting up raycaster


let intersects //<---these are the objects that get hit by raycaster during mouse down and up


document.onmousemove = (event) => {
    event.preventDefault();

    raycaster.setFromCamera(mouse, camera);
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    intersects = raycaster.intersectObjects(DoorGroup.children, true);
}



let TimeWhenPressed
let DoorSaveToClose
const mousePressed = () => {
    TimeWhenPressed = new Date().getTime();

    for (let item of intersects) {
        if (item.object.name === "Door_01" || item.object.name === "Door_02" || item.object.name === "Door_03") {
            DoorSaveToClose = item
            doorGSAPTimeline
                .clear()
                .to(item.object.rotation, { duration: 1.5, y: 0.08 })
            break;
        }
    }
}

const moveCameraAndDoor = (x, y, z, door) => {
    // camera starts move, door starts to open, camera reaches end, door reaches end, door closes, camera moves.
    let cameraAnimation = gsap.timeline()
    cameraAnimation
        .to(camera.position, { duration: 1.5, x, y, z, ease: "Power2.easeInOut" })
        .to(camera.position, { delay: 1.8, duration: 1.2, x: 0, y: 80, z: 250, ease: "Power2.easeInOut" })

    let doorOpenAnimation = gsap.timeline();
    doorOpenAnimation
        .to(door.object.rotation, { delay: 0.7, duration: 1.5, y: 1.8, ease: "circ.inOut" })
        .to(door.object.rotation, {
            duration: 1.5, y: 0, ease: "circ.inOut", onComplete: () => {
                TreasureChest.visible = false;
                container.addEventListener('mouseup', GameClick);
                container.addEventListener("mousedown", mousePressed);
            }
        })
}

const victoryCheck = (pReward, xPosition) => {
    if (Math.random() <= pReward) {
        score += 20;
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
            playSound(loseSound);
        }, 1000)
        score -= 10
        scoreDisplay.innerHTML = `Your winnings so far : ${score} Gold`;
    }
}
const GameClick = (event) => {
    event.preventDefault();

    // handling p(Reward) here calculating when mouse was pressed and released);
    let TimeWhenReleased = new Date().getTime();
    let TimeHeldDown = TimeWhenReleased - TimeWhenPressed;
    let pReward = Math.min(0.8, (0.2 + (TimeHeldDown / 1666))).toFixed(2)
    console.log(`pReward is: ${pReward}`)


    // handle all the logic depending on what was pressed and for how long
    intersects = raycaster.intersectObjects(DoorGroup.children, true);
    //save another door variable to make an animation check at the bottom of this function
    let currentDoor
    for (let item of intersects) {
        currentDoor = item
        if (item.object.name === "Door_01") {
            container.removeEventListener('mouseup', GameClick);
            container.removeEventListener("mousedown", mousePressed);
            moveCameraAndDoor(-200, 80, 200, item)
            victoryCheck(pReward, -200)//<-- 2nd paramter is x position to put chest
            break;
        }
        if (item.object.name === "Door_02") {
            container.removeEventListener('mouseup', GameClick);
            container.removeEventListener("mousedown", mousePressed);
            moveCameraAndDoor(0, 80, 200, item)
            victoryCheck(pReward, 0)
            break;
        }
        if (item.object.name === "Door_03") {
            container.removeEventListener('mouseup', GameClick);
            container.removeEventListener("mousedown", mousePressed);
            moveCameraAndDoor(200, 80, 200, item)
            victoryCheck(pReward, 200)
            break;
        }
    }
    // if a door has been pressed but released away from door
    // below we check 3 places for release after a door is clicked:
    // 1) another door, 2)same doog, 3)on nothing
    if (DoorSaveToClose) {
        try {
            if (intersects[0].object.name !== DoorSaveToClose.object.name) {
                doorGSAPTimeline.clear();
                doorGSAPTimeline.to(DoorSaveToClose.object.rotation, { duration: 1, y: 0.0 })
                return;
            } else {
                doorGSAPTimeline.clear();
                return;
            }
        } catch (err) {
            // log error if we want
        }
        doorGSAPTimeline.clear();
        doorGSAPTimeline.to(DoorSaveToClose.object.rotation, { duration: 1, y: 0.0 })

    }


}

