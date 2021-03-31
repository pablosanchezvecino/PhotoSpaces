import * as THREE from "/build/three.module.js";
import { PointerLockControls } from "/jsm/controls/PointerLockControls.js";
import { GLTFLoader } from "/jsm/loaders/GLTFLoader.js";

const inputField = document.getElementById("inputModel");
const canvas = document.getElementById("canvas");
const btnRender = document.getElementById("btnRender");

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

let speedMulti = 10.0;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime = performance.now();
let controls;

const sendModel = async (cam) => {
  const formData = new FormData();
  const model = inputField.files[0];

  formData.append("model", model);

  console.log(cam);

  try {
    const res = await fetch("http://localhost:3030/render", {
      method: "POST",
      body: formData,
    });
    console.log("HTTP response code:", res.status);
  } catch (e) {
    console.log(e);
  }
};

const loadModel = async (file) => {
  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({ canvas });
  const scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  scene.background = new THREE.Color("white");

  {
    const gltfLoader = new GLTFLoader();
    gltfLoader.parse(file, "./", (gltf) => {
      const root = gltf.scene;
      const cameras = root.children.filter(
        (obj) => obj.type === "PerspectiveCamera"
      );
      console.log(cameras);

      if (cameras.length > 0) {
        camera.position.x = cameras[0].parent.position.x;
        camera.position.y = cameras[0].parent.position.y;
        camera.position.z = cameras[0].parent.position.z;

        camera.aspect = cameras[0].aspect;
        camera.fov = cameras[0].fov;
        camera.far = cameras[0].far;
        camera.near = cameras[0].near;
      }

      scene.add(root);
    });

    btnRender.addEventListener("click", () => sendModel(camera));
    btnRender.style.display = "block";
  }

  {
    controls = new PointerLockControls(camera, canvas);
    scene.add(controls.getObject());

    const onKeyDown = (event) => {
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

    const onKeyUp = (event) => {
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

    // event.deltaY => UP: - ; DOWN: +
    const onScroll = (event) => {
      if (event.deltaY > 0 && speedMulti < 200.0) {
        speedMulti += 1.0;
      } else if (event.deltaY < 0 && speedMulti > 1.0) {
        speedMulti -= 1.0;
      }
    };

    canvas.addEventListener("click", () => {
      controls.isLocked ? controls.unlock() : controls.lock();
    });

    document.addEventListener("wheel", (e) => {
      controls.isLocked ? onScroll(e) : null;
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

      // Wait for the camera to load!
      console.log(camera);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    //renderer.render(scene, camera);
    requestAnimationFrame(render);

    const time = performance.now();
    if (controls.isLocked === true) {
      const delta = (time - prevTime) / 1000;

      velocity.x -= velocity.x * speedMulti * delta;
      velocity.z -= velocity.z * speedMulti * delta;
      velocity.y -= velocity.y * speedMulti * delta;

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.y = Number(moveDown) - Number(moveUp);
      direction.normalize();

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

btnRender.style.display = "none";

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
