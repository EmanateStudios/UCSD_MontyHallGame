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
const loaderCounter = document.getElementById('loader');
// loaderCounter.innerHTML = 'hello';
const manager = new THREE.LoadingManager();
manager.onStart = (url, itemsLoaded, itemsTotal) => {
    console.log(`Started loading file: ${url} . Loaded ${itemsLoaded} of ${itemsTotal} files`)
}
manager.onLoad = () => {
    console.log(`loading complete!`);
}
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    // console.log(`loading file: ${url} . Loaded ${itemsLoaded} of ${itemsTotal} files`)
    loaderCounter.innerHTML = `${itemsLoaded / itemsTotal * 100} %`;
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
camera.position.set(0, 100, 300);

//--------------------- RENDERER SETTINGS -----------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// enable shadow maps
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// enable hdr settings
// renderer.physicallyCorrectLights = true;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;

const container = document.querySelector(".scene"); //<-- our DOM Reference to HTML Div class "scene". 
container.appendChild(renderer.domElement);

//--------------------- LIGHT SETTINGS -----------------------------------------
//------  DIRECTION LIGHT 1
// const directionLight = new THREE.DirectionalLight(0xFFFFFF, 1);
// directionLight.position.set(0, 100, 100)
// scene.add(directionLight);

// const dirLightHelper = new THREE.DirectionalLightHelper(directionLight, 7)
// scene.add(dirLightHelper)

// var ambientLight = new THREE.AmbientLight(0x404040, 20); // soft white light
// scene.add(ambientLight);

//------- SPOT LIGHT 1
const spotLight = new THREE.SpotLight(0xFFFFFF, 80, 400, 0.5, 0.8, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
spotLight.position.set(100, 300, 110)
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 0.01;
spotLight.shadow.camera.far = 10000
spotLight.shadow.bias = - 0.000001;
scene.add(spotLight)

// const sphereSize = 20;
// const lightHelper = new THREE.SpotLightHelper(spotLight, sphereSize)
// scene.add(lightHelper)

// -----------SPOT LIGHT 2
const spotLight2 = new THREE.SpotLight(0xFFFFFF, 50, 300, 0.5, 0.8, 2.0) //color,intensity,distance,angle(radian),penumbra(0.0-1.0),decay(realistic =2)
spotLight2.position.set(50, 200, -100)
spotLight2.castShadow = true;
spotLight2.shadow.mapSize.width = 1024;
spotLight2.shadow.mapSize.height = 1024;
spotLight2.shadow.camera.near = 0.01;
spotLight2.shadow.camera.far = 10000
spotLight2.shadow.bias = - 0.000001;



const sphereSize2 = 20;
const lightHelper2 = new THREE.SpotLightHelper(spotLight2, sphereSize2)


//------ POINT LIGHT
const pointLight = new THREE.PointLight(0xffffff, 5, 160, 1.5); //color, intensity, distance, decay
pointLight.position.set(50, 75, -100);
scene.add(pointLight);

const pointLightHelperSize = 25;
const pointLightHelper = new THREE.PointLightHelper(pointLight, pointLightHelperSize, 0x000000);
scene.add(pointLightHelper);


//--------------------- CUSTOM FLOOR SETTINGS-----------------------------------
var floor = new THREE.PlaneBufferGeometry(2000, 2000);
floor.rotateX(- Math.PI / 2);
const shadowFloorMat = new THREE.ShadowMaterial();
shadowFloorMat.opacity = 0.5;

var floorMesh = new THREE.Mesh(floor, shadowFloorMat);
floorMesh.receiveShadow = true;
scene.add(floorMesh);


//--------------------- 3D ASSET LOADER SETTINGS-----------------------------------
let MainDoor1, MainDoor2
let Frame1, Frame2
const loader = new GLTFLoader(manager);
let doorMain;
let doorFrame;
let loaded = false
// load door
loader.load(doorGLTF, (gltf) => {
    // assign shadow casting and recieving to all meshes in gltf object
    gltf.scene.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    })
    doorMain = gltf.scene.children[1];
    MainDoor1 = doorMain.clone();
    MainDoor2 = doorMain.clone();
    MainDoor1.position.set(200, 0, 0);
    MainDoor2.position.set(-200, 0, 0);
    scene.add(MainDoor1);
    scene.add(MainDoor2);
    doorFrame = gltf.scene.children[0];
    Frame1 = doorFrame.clone();
    Frame2 = doorFrame.clone();
    Frame1.position.set(200, 0, 0);
    Frame2.position.set(-200, 0, 0);
    scene.add(Frame1);
    scene.add(Frame2);
    loaded = true;
    scene.add(gltf.scene);
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
    TreasureChest.position.set(75, 0, -150);
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