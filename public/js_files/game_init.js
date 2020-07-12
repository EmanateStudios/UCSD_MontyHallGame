//Variables for setup
import * as THREE from '../../node_modules/three';
import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import doorGLTF from '../THREE/Assets/gltf_files/Door.gltf'
console.log("inside game_init")

let container;
let camera;
let renderer;
let scene;
let door;

function init() {
    container = document.querySelector(".scene");

    //Create scene
    scene = new THREE.Scene();

    const fov = 35;
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 1000;

    //Camera setup
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 3);

    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(50, 50, 100);
    scene.add(light);
    //Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

    //Load Model

    {
        const loader = new GLTFLoader();
        loader.load(doorGLTF, (gltf) => {

            scene.add(gltf.scene);
            door = gltf.scene.children[0];
            animate();

        });
    }

}

function animate() {
    requestAnimationFrame(animate);
    door.rotation.y += 0.005;
    renderer.render(scene, camera);
}

init();

function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize);


