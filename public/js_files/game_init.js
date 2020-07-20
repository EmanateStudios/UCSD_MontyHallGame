//----- THREE IMPORTS
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import doorGLTF from '../THREE/Assets/gltf_files/Door.gltf'
import chestGLTF from '../THREE/Assets/gltf_files/Treasure.gltf'
//----- CUSTOM FUNCTION IMPORTS
//----- GSAP IMPORTS
import gsap from 'gsap';




// Setting up the environment with 'THREE.js' (name of library not a count) assets
// export const init = (item) => {

// THREE.JS NEEDS AT MINIMUM THESE COMPONENTS:
// 1.)scene,2.) camera,3.) renderer (and animate function to actually utilize it),4.) object (4a: material, 4b: mesh, 4c: textures), 5.) and light(5a: type/intensity/color/properties,5b: shadows)

//-------- LOADING MANAGER---------
// passing this manager into 3D assets as parameter
const startingScreen = document.getElementById('loader');
const manager = new THREE.LoadingManager();
manager.onStart = (url, itemsLoaded, itemsTotal) => {
    console.log(`Started loading file: ${url} . Loaded ${itemsLoaded} of ${itemsTotal} files`)
}
manager.onLoad = () => {
    console.log(`loading complete!`);
}
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    // console.log(`loading file: ${url} . Loaded ${itemsLoaded} of ${itemsTotal} files`)
    startingScreen.innerHTML = `${itemsLoaded / itemsTotal * 100} %`;
}
manager.onError = (url) => {
    console.log(`there was an error with ${url}`)
}

//--------------------- SCENE SETTINGS -----------------------------------------
const scene = new THREE.Scene();
//--------------------- CAMERA SETTINGS -----------------------------------------
const nearClippingPlane = 0.06
const farClippingPlane = 10000
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, nearClippingPlane, farClippingPlane);
camera.position.set(0, 80, 250);

//--------------------- RENDERER SETTINGS -----------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// enable shadow maps
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// enable hdr settings
// renderer.physicallyCorrectLights = true;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;

const container = document.querySelector(".scene"); //<-- our DOM Reference to HTML Div class "scene". 
container.appendChild(renderer.domElement);

//--------------------- LIGHT SETTINGS -----------------------------------------
//------ "Sun" Light
const directionLight = new THREE.DirectionalLight(0xFFFFFF, 2);
directionLight.position.set(-50, 100, 100)
directionLight.castShadow = true;
directionLight.shadow.mapSize.width = 1024;
directionLight.shadow.mapSize.height = 1024;
directionLight.shadow.camera.near = 0.01;
directionLight.shadow.camera.far = 10000
directionLight.shadow.bias = - 0.000001;

scene.add(directionLight);

// ---hint of ambient light
var ambientLight = new THREE.AmbientLight(0x404040, 4); // soft white light
scene.add(ambientLight);

//------- DOOR SPOT LIGHTS
// left light
const doorLight_01 = new THREE.SpotLight(0xFFFFFF, 100, 400, 0.2, 1.0, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
doorLight_01.position.set(-200, 370, 80)
doorLight_01.target.position.set(-200, 40, -25)
doorLight_01.castShadow = true;
doorLight_01.shadow.mapSize.width = 1024;
doorLight_01.shadow.mapSize.height = 1024;
doorLight_01.shadow.camera.near = 0.01;
doorLight_01.shadow.camera.far = 10000
doorLight_01.shadow.bias = - 0.000001;
scene.add(doorLight_01)
scene.add(doorLight_01.target)
// middle light
const doorLight_02 = new THREE.SpotLight(0xFFFFFF, 100, 400, .2, 1.0, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
doorLight_02.position.set(0, 370, 80)
doorLight_02.target.position.set(0, 40, -25)
doorLight_02.castShadow = true;
doorLight_02.shadow.mapSize.width = 1024;
doorLight_02.shadow.mapSize.height = 1024;
doorLight_02.shadow.camera.near = 0.01;
doorLight_02.shadow.camera.far = 10000
doorLight_02.shadow.bias = - 0.000001;
scene.add(doorLight_02)
scene.add(doorLight_02.target)
// right light
const doorLight_03 = new THREE.SpotLight(0xFFFFFF, 100, 400, .2, 1.0, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
doorLight_03.position.set(200, 370, 80)
doorLight_03.target.position.set(200, 40, -25)
doorLight_03.castShadow = true;
doorLight_03.shadow.mapSize.width = 1024;
doorLight_03.shadow.mapSize.height = 1024;
doorLight_03.shadow.camera.near = 0.01;
doorLight_03.shadow.camera.far = 10000
doorLight_03.shadow.bias = - 0.000001;
scene.add(doorLight_03)
scene.add(doorLight_03.target)

// -----------SPOT LIGHT 2
const spotLight2 = new THREE.SpotLight(0xFFFFFF, 50, 300, 0.5, 0.8, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
spotLight2.position.set(50, 200, -100)
spotLight2.castShadow = true;
spotLight2.shadow.mapSize.width = 1024;
spotLight2.shadow.mapSize.height = 1024;
spotLight2.shadow.camera.near = 0.01;
spotLight2.shadow.camera.far = 10000
spotLight2.shadow.bias = - 0.000001;


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
let Door_01, Door_02, Door_03;
let loaded = false
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
    Door_01 = gltf.scene;
    Door_02 = Door_01.clone();
    Door_03 = Door_01.clone();
    Door_02.position.set(200, 0, 0);
    Door_03.position.set(-200, 0, 0);
    DoorGroup.add(Door_01);
    DoorGroup.add(Door_02);
    DoorGroup.add(Door_03);
    DoorGroup.position.set(-50, 0, 0); //move all doors together with this group.
    // scene.add(Door_01);
    // scene.add(Door_02);
    scene.add(DoorGroup);
    loaded = true;
    animate(loaded);
},
    (xhr) => {
        // this runs as object is loaded. due to multiple files this is handled by loading manager instead that manages all objects
    },
    (err) => {
        console.error('An error occured. Try again later');
    }
)
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
    // TreasureChest.position.set(75, 0, -150);
    scene.add(gltf.scene);
    spotLight2.target = TreasureChest;
    scene.add(spotLight2)
    scene.add(spotLight2.target)
},
    (xhr) => {
        // this runs as object is loaded. due to multiple files this is handled by loading manager instead that manages all objects
    },
    (err) => {
        console.error('An error occured. Try again later');
    }
)


//--------------------- ORBIT CONTROL SETTINGS -----------------------------------------
// const controls = new OrbitControls(camera, renderer.domElement);

//------------------ ANIMATE/RUN THE RENDERER ----------------------------
const animate = (loaded) => {
    if (loaded) {
        requestAnimationFrame(animate);
        // controls.update();
        renderer.render(scene, camera);
    }
}


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
const GameClick = (event) => {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;



    raycaster.setFromCamera(mouse, camera);

    // intersects returns array of what is clicked with ray cast
    let intersects = raycaster.intersectObjects(scene.children, true);
    console.log(intersects);
    intersects.map(item => {
        if (item.object.name === "main") {
            gsap.timeline()
                .to(item.object.rotation, { duration: 1, y: -1.8, ease: "circ.inOut" })
        }
    })

}

window.addEventListener('click', GameClick);