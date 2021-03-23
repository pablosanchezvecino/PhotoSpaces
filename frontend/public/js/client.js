import * as THREE from "/build/three.module.js";
import { OrbitControls } from "/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "/jsm/controls/PointerLockControls.js";
import { GLTFLoader } from "/jsm/loaders/GLTFLoader.js";

const inputField = document.getElementById("inputModel");
const canvas = document.getElementById("canvas");

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime = performance.now();
let controls;

const loadModel = async (file) => {
  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({ canvas });

  const fov = 75;
  const aspect = window.innerWidth / window.innerHeight; // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 5);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("white");

  {
    controls = new PointerLockControls(camera, canvas);
    scene.add(controls.getObject());

    const onKeyDown = function (event) {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          moveForward = true;
          break;

        case "ArrowLeft":
        case "KeyA":
          moveLeft = true;
          break;

        case "ArrowDown":
        case "KeyS":
          moveBackward = true;
          break;

        case "ArrowRight":
        case "KeyD":
          moveRight = true;
          break;

        case "Space":
          moveUp = true;
          break;

        case "ShiftLeft":
          moveDown = true;
          break;
      }
    };

    const onKeyUp = function (event) {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          moveForward = false;
          break;

        case "ArrowLeft":
        case "KeyA":
          moveLeft = false;
          break;

        case "ArrowDown":
        case "KeyS":
          moveBackward = false;
          break;

        case "ArrowRight":
        case "KeyD":
          moveRight = false;
          break;

        case "Space":
          moveUp = false;
          break;

        case "ShiftLeft":
          moveDown = false;
          break;
      }
    };

    canvas.addEventListener("click", () => {
      controls.isLocked ? controls.unlock() : controls.lock();
    });
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
  }

  {
    const skyColor = 0xb1e1ff; // light blue
    const groundColor = 0xb97a20; // brownish orange
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(light.target);
  }

  {
    const gltfLoader = new GLTFLoader();
    gltfLoader.parse(file, "./", (gltf) => {
      const root = gltf.scene;
      scene.add(root);
    });
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  const render = () => {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    //renderer.render(scene, camera);
    requestAnimationFrame(render);

    const time = performance.now();
    if (controls.isLocked === true) {
      const delta = (time - prevTime) / 1000;

      velocity.x -= velocity.x * 5.0 * delta;
      velocity.z -= velocity.z * 5.0 * delta;
      velocity.y -= velocity.y * 5.0 * delta;

      //velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.y = Number(moveDown) - Number(moveUp);
      direction.normalize(); // this ensures consistent movements in all directions

      if (moveForward || moveBackward)
        velocity.z -= direction.z * 400.0 * delta;
      if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;
      if (moveUp || moveDown) velocity.y -= direction.y * 400.0 * delta;

      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);

      controls.getObject().position.y += velocity.y * delta; // new behavior
    }
    prevTime = time;

    renderer.render(scene, camera);
  };

  requestAnimationFrame(render);
};

inputField.onchange = (event) => {
  const file = event.target.files[0];

  if (
    file.name.substring(file.name.length - 5, file.name.length) === ".gltf" ||
    file.name.substring(file.name.length - 4, file.name.length) === ".glb"
  ) {
    // create a file reader
    const reader = new FileReader();

    // set on load handler for reader
    reader.onload = () => loadModel(reader.result);

    // read the file as text using the reader
    //reader.readAsDataURL(file, encoding);
    reader.readAsArrayBuffer(file);
  } else {
    alert("You need to choose a .glb or .gltf file!");
  }
};
