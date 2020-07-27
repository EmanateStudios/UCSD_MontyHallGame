import '@babel/polyfill'
//----- THREE IMPORTS
import * as THREE from 'three';
import Stats from 'stats.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import doorGLTF from '../THREE/Assets/gltf_files/Door.gltf'
import chestGLTF from '../THREE/Assets/gltf_files/Treasure.gltf'
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
    console.log(`Started loading file: ${url} . Loaded ${itemsLoaded} of ${itemsTotal} files`)
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
const scene = new THREE.Scene();
const container = document.querySelector(".scene"); //<-- our DOM Reference to HTML Div class "scene". 

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
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// enable hdr settings
// renderer.physicallyCorrectLights = true;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;


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

// -----------SPOT LIGHT 2
const spotLight2 = new THREE.SpotLight(0xFFFFFF, 50, 300, 0.5, 0.8, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
spotLight2.position.set(50, 200, -100)
addShadows(spotLight2)


//------ POINT LIGHT
// const pointLight = new THREE.PointLight(0xffffff, 5, 160, 1.5); //color, intensity, distance, decay
// pointLight.position.set(50, 75, -100);
// scene.add(pointLight);

// const pointLightHelperSize = 25;
// const pointLightHelper = new THREE.PointLightHelper(pointLight, pointLightHelperSize, 0x000000);
// scene.add(pointLightHelper);


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

// loader.setMimeType("text/plain");
// manager.setMimeType("text/plain");
// manager.mimeType

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
//-- LOADING SINGLE TREASURE CHEST
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
    spotLight2.target = TreasureChest;
    scene.add(spotLight2)
    scene.add(spotLight2.target)
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



//============================= GAME CONTROL SECTION ====================================
//---------------------------------------------------------------------------------------

// -------------------- RAY CAST FOR BUTTON CLICK FUNCTION ------------------
const raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

let timeDown
const mousePressed = () => {
    timeDown = new Date().getTime();
}

const moveCamera = (x, y, z, door) => {
    gsap.timeline({ onComplete: openDoor, onCompleteParams: [door] }).to(camera.position, { duration: 1.5, x, y, z, ease: "Power2.easeInOut" })
}
const openDoor = (door) => {
    gsap.timeline()
        .to(door.object.rotation, { duration: 1.5, y: 1.8, ease: "circ.inOut" })
        .to(door.object.rotation, { duration: 1.5, y: 0, ease: "circ.inOut", onComplete: () => { TreasureChest.visible = false } })
        .to(camera.position, { duration: 1.2, x: 0, y: 80, z: 250 })
}

const victoryCheck = (pReward, xPosition) => {
    if (Math.random() <= pReward) {
        console.log('you won')
        setTimeout(() => { TreasureChest.visible = true; }, 1500)

        TreasureChest.position.x = xPosition;
    }
}
const GameClick = (event) => {
    event.preventDefault();

    // handling p(Reward here calculating when mouse was pressed and released);
    let mouseupTime = new Date().getTime();
    let timeDifference = mouseupTime - timeDown;
    let pReward = Math.min(0.8, (0.2 + (timeDifference / 1666))).toFixed(2)
    console.log(`pReward is: ${pReward}`)

    // setting up raycaster
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // handle all the logic depending on what was pressed and for how long
    let intersects = raycaster.intersectObjects(DoorGroup.children, true);
    for (let item of intersects) {
        if (item.object.name === "Door_01") {
            moveCamera(-200, 80, 200, item) //<-- door opens when this is finished
            victoryCheck(pReward, -200)
            break;
        }
        if (item.object.name === "Door_02") {
            moveCamera(0, 80, 200, item)
            victoryCheck(pReward, 0)
            break;
        }
        if (item.object.name === "Door_03") {
            moveCamera(200, 80, 200, item)
            victoryCheck(pReward, 200)
            break;
        }
    }

}

