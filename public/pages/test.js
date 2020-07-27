import * as THREE from '../build/three.module.js';

var camera, scene, renderer;
var cube, sphere, torus, material;

var count = 0, cubeCamera1, cubeCamera2, cubeRenderTarget1, cubeRenderTarget2;

var onPointerDownPointerX, onPointerDownPointerY, onPointerDownLon, onPointerDownLat;

var lon = 0, lat = 0;
var phi = 0, theta = 0;

var textureLoader = new THREE.TextureLoader();

textureLoader.load('textures/2294472375_24a3b8ef46_o.jpg', function (texture) {

    texture.mapping = THREE.UVMapping;

    init(texture);
    animate();

});

function init(texture) {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);

    // background

    var options = {
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter
    };

    scene.background = new THREE.WebGLCubeRenderTarget(1024, options).fromEquirectangularTexture(renderer, texture);

    //

    cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget(256, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    cubeCamera1 = new THREE.CubeCamera(1, 1000, cubeRenderTarget1);
    scene.add(cubeCamera1);

    cubeRenderTarget2 = new THREE.WebGLCubeRenderTarget(256, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    cubeCamera2 = new THREE.CubeCamera(1, 1000, cubeRenderTarget2);
    scene.add(cubeCamera2);

    document.body.appendChild(renderer.domElement);

    //

    material = new THREE.MeshBasicMaterial({
        envMap: cubeRenderTarget2.texture
    });

    sphere = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(20, 3), material);
    scene.add(sphere);

    cube = new THREE.Mesh(new THREE.BoxBufferGeometry(20, 20, 20), material);
    scene.add(cube);

    torus = new THREE.Mesh(new THREE.TorusKnotBufferGeometry(10, 5, 100, 25), material);
    scene.add(torus);

    //

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('wheel', onDocumentMouseWheel, false);

    window.addEventListener('resize', onWindowResized, false);

}

function onWindowResized() {

    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

}

function onDocumentMouseDown(event) {

    event.preventDefault();

    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;

    onPointerDownLon = lon;
    onPointerDownLat = lat;

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);

}

function onDocumentMouseMove(event) {

    lon = (event.clientX - onPointerDownPointerX) * 0.1 + onPointerDownLon;
    lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;

}

function onDocumentMouseUp() {

    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);

}

function onDocumentMouseWheel(event) {

    var fov = camera.fov + event.deltaY * 0.05;

    camera.fov = THREE.MathUtils.clamp(fov, 10, 75);

    camera.updateProjectionMatrix();

}

function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {

    var time = Date.now();

    lon += .15;

    lat = Math.max(- 85, Math.min(85, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);

    cube.position.x = Math.cos(time * 0.001) * 30;
    cube.position.y = Math.sin(time * 0.001) * 30;
    cube.position.z = Math.sin(time * 0.001) * 30;

    cube.rotation.x += 0.02;
    cube.rotation.y += 0.03;

    torus.position.x = Math.cos(time * 0.001 + 10) * 30;
    torus.position.y = Math.sin(time * 0.001 + 10) * 30;
    torus.position.z = Math.sin(time * 0.001 + 10) * 30;

    torus.rotation.x += 0.02;
    torus.rotation.y += 0.03;

    camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
    camera.position.y = 100 * Math.cos(phi);
    camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);

    camera.lookAt(scene.position);

    // pingpong

    if (count % 2 === 0) {

        cubeCamera1.update(renderer, scene);
        material.envMap = cubeRenderTarget1.texture;

    } else {

        cubeCamera2.update(renderer, scene);
        material.envMap = cubeRenderTarget2.texture;

    }

    count++;

    renderer.render(scene, camera);

}

// "heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm install && npm run build"