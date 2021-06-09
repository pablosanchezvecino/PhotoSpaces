import * as THREE from "/build/three.module.js";
import { PointerLockControls } from "/jsm/controls/PointerLockControls.js";
import { GLTFLoader } from "/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "/jsm/exporters/GLTFExporter.js";
import { RGBELoader } from "/jsm/loaders/RGBELoader.js";
import { GUI } from "/jsm/libs/dat.gui.module.js";

// HTML Elements
const inputField = document.getElementById("inputModel");
const canvas = document.getElementById("canvas");

const btnRender = document.getElementById("btnRender");
const btnLoading = document.getElementById("btnLoading");
const btnClear = document.getElementById("btnClear");
const chooseFileLabel = document.getElementById("chooseFileLabel");
const loadingModelLabel = document.getElementById("loadingModelLabel");

const optionsDiv = document.getElementById("optionsDiv");
const uploadDiv = document.getElementById("uploadDiv");
const clearDiv = document.getElementById("clearDiv");

const optionsFOV = document.getElementById("fovRange");
const fovValue = document.getElementById("fovValue");

const backgroundSelect = document.getElementById("backgroundSelect");

const link = document.createElement("a");
link.style.display = "none";
document.body.appendChild(link);

// Movement var.
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

const elementsDiv = document.getElementById("elementsDiv");
const lightsList = document.getElementById("lightsList");
let lights = 0;

// Scene
let scene, renderer;

const downloadImage = (body) => {
  const fileCN = inputField.files[0].name;
  const fileName =
    fileCN.substring(fileCN.length - 5, fileCN.length) === ".gltf"
      ? fileCN.substring(0, fileCN.length - 5)
      : fileCN.substring(fileCN.length - 4, fileCN.length) === ".glb"
      ? fileCN.substring(0, fileCN.length - 4)
      : "undefined";
  const fileStream = body.getReader();
  let chunks = [];
  fileStream
    .read()
    .then(function processData({ done, value }) {
      if (done) return;
      chunks.push(value);
      return fileStream.read().then(processData);
    })
    .then(() => {
      link.href = URL.createObjectURL(new Blob(chunks, { type: "image/png" }));
      link.download = `${fileName}.png`;
      link.click();
    });
};

// Send the model to backend
const sendModel = async (cam) => {
  const exporter = new GLTFExporter();
  const formData = new FormData();
  const quaternion = new THREE.Quaternion();
  quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  const newQ = quaternion.multiply(cam.quaternion);
  const camData = {
    lens: cam.getFocalLength(),
    clip_start: cam.near,
    clip_end: cam.far,
    location_x: cam.position.x,
    location_y: -cam.position.z,
    location_z: cam.position.y,
    qua_w: newQ.w,
    qua_x: newQ.x,
    qua_y: newQ.y,
    qua_z: newQ.z,
  };

  // Parse the input and generate the glTF output
  exporter.parse(
    scene,
    async (gltf) => {
      formData.append(
        "model",
        new Blob([JSON.stringify(gltf, null, 2)], { type: "text/plain" })
      );
      formData.append("data", JSON.stringify(camData));

      try {
        btnRender.style.display = "none";
        btnLoading.style.display = "block";
        const res = await fetch(
          "http://localhost:3030/render",
          //"https://photospaces-server.herokuapp.com/render",
          {
            method: "POST",
            body: formData,
          }
        );
        btnLoading.style.display = "none";
        btnRender.style.display = "block";
        downloadImage(res.body);
      } catch (e) {
        console.log(e);
      }
    },
    {
      //binary: true
    }
  );
};

const addModelToScene = (file, camera, render) => {
  const gltfLoader = new GLTFLoader();
  gltfLoader.parse(file, "./", (gltf) => {
    const root = gltf.scene;
    const cameras = root.children.filter(
      (obj) => obj.type === "PerspectiveCamera"
    );

    if (cameras.length > 0) {
      camera.position.set(
        cameras[0].position.x,
        cameras[0].position.y,
        cameras[0].position.z
      );
      camera.rotation.set(
        cameras[0].rotation.x,
        cameras[0].rotation.y,
        cameras[0].rotation.z
      );

      camera.aspect = cameras[0].aspect;
      camera.fov = cameras[0].fov;
      camera.far = cameras[0].far;
      camera.near = cameras[0].near;

      optionsFOV.value = camera.fov;
    }
    camera.updateProjectionMatrix();

    scene.add(root);

    // Initialize controls
    initializeControls(camera);

    requestAnimationFrame(render);
  });
};

const initializeControls = (camera) => {
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

  btnRender.addEventListener("click", () => sendModel(camera));
  btnClear.addEventListener("click", clear);

  optionsDiv.style.display = "block";
  uploadDiv.style.display = "none";
  clearDiv.style.display = "block";

  fovValue.innerHTML = `FOV: ${optionsFOV.value}`;

  optionsFOV.addEventListener("change", () => {
    camera.fov = optionsFOV.value;
    fovValue.innerHTML = `FOV: ${optionsFOV.value}`;
    camera.updateProjectionMatrix();
  });

  document.addEventListener("wheel", (e) => {
    controls.isLocked ? onScroll(e) : null;
  });
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
};

const makeXYZGUI = (gui, vector3, name, onChangeFn) => {
  const folder = gui.addFolder(name);
  folder.add(vector3, "x", -1000, 1000).onChange(onChangeFn);
  folder.add(vector3, "y", -1000, 1000).onChange(onChangeFn);
  folder.add(vector3, "z", -1000, 1000).onChange(onChangeFn);
  folder.open();
};

const removeLight = (name, gui) => {
  const lightToRemove = scene.getObjectByName(name);
  scene.remove(lightToRemove);
  gui.destroy();
  lightsList.removeChild(document.getElementById(name));
  lights--;
  if (lights === 0) elementsDiv.style.display = "none";
};

const addLightToDiv = (type, name, gui) => {
  if (lights === 1) elementsDiv.style.display = "block";

  const node = document.createElement("li");
  node.id = name;
  const span = document.createElement("span");
  span.textContent = type + " " + lights;
  span.style.display = "ruby";

  const img = document.createElement("img");
  img.src = "../img/trash.svg";
  img.className = "removeLight";
  img.style.width = "1.5rem";
  img.style.height = "1.5rem";
  img.style.marginLeft = "2rem";
  img.onclick = () => removeLight(name, gui);

  span.appendChild(img);
  node.appendChild(span);

  node.style.marginTop = "0.5rem";

  lightsList.appendChild(node);
};

// Only directional, point and spot lights are supported
const addLightToScene = (type) => {
  const color = 0xffffff;
  const intensity = 1;
  const gui = new GUI();
  let light, helper;

  lights++;

  if (type === "Directional") {
    light = new THREE.DirectionalLight(color, intensity);

    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    light.name = type + " " + lights;

    scene.add(light);
    scene.add(light.target);

    helper = new THREE.DirectionalLightHelper(light, 10, 0x000000);
  } else if (type === "Point") {
    light = new THREE.PointLight(color, intensity);

    light.position.set(0, 10, 0);
    light.name = type + " " + lights;

    scene.add(light);

    helper = new THREE.PointLightHelper(light, 10, 0x000000);
  }
  scene.add(helper);

  // On GUI change
  const updateLight = () => {
    helper.update();
  };

  updateLight();

  const mainFolder = gui.addFolder(type + " " + lights);
  mainFolder.add(light, "intensity", 0, 2, 0.01).onChange(updateLight);
  makeXYZGUI(mainFolder, light.position, "Position", updateLight);
  if (type === "Directional")
    makeXYZGUI(mainFolder, light.target.position, "Target", updateLight);

  addLightToDiv(type, light.name, gui);
};

const resizeRendererToDisplaySize = (renderer) => {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
};

// Load the model into the visualizer
const loadModel = (file) => {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );

  scene = new THREE.Scene();

  renderer.setPixelRatio(window.devicePixelRatio);
  /*
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  */

  const render = () => {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

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

  // Load the model
  addModelToScene(file, camera, render, renderer);
};

const clear = () => {
  scene = new THREE.Scene();
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
  moveUp = false;
  moveDown = false;
  speedMulti = 10.0;

  prevTime = performance.now();

  optionsDiv.style.display = "none";
  uploadDiv.style.display = "block";
  clearDiv.style.display = "none";
  chooseFileLabel.style.display = "block";
  loadingModelLabel.style.display = "none";

  inputField.value = "";
};

// HTML Events
inputField.onchange = (event) => {
  const file = event.target.files[0];

  if (
    file &&
    (file.name.substring(file.name.length - 5, file.name.length) === ".gltf" ||
      file.name.substring(file.name.length - 4, file.name.length) === ".glb")
  ) {
    // create a file reader
    const reader = new FileReader();

    // loading label
    chooseFileLabel.style.display = "none";
    loadingModelLabel.style.display = "block";

    // set on load handler for reader
    reader.onload = () => {
      loadModel(reader.result);
    };

    // read the file as text using the reader
    reader.readAsArrayBuffer(file);
  } else {
    alert("You need to choose a .glb or .gltf file!");
  }
};

const backgroundChange = (sel) => {
  if (sel === "") {
    scene.background = 0xffffff;
  } else {
    // ENV Background
    new RGBELoader()
      .setDataType(THREE.UnsignedByteType)
      .setPath("../img/")
      .load(sel, (texture) => {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        const envMap = pmremGenerator.fromEquirectangular(texture).texture;

        scene.background = envMap;

        texture.dispose();
        pmremGenerator.dispose();
      });
  }
};

$("#backgroundSelect").on("change", function () {
  backgroundChange(this.value);
});

backgroundSelect.selectedIndex = 0;

// Menu click-derecho
// TODO Hacer innacesible antes de cargar el modelo
const contextMenu = document.getElementById("context-menu");
const body = document.querySelector("body");
const addDirectional = document.getElementById("addDLight");
const addPoint = document.getElementById("addPLight");

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();

  const { clientX: mouseX, clientY: mouseY } = event;

  contextMenu.style.top = `${mouseY}px`;
  contextMenu.style.left = `${mouseX}px`;

  contextMenu.classList.add("visible");
});

body.addEventListener("click", (e) => {
  if (e.target.offsetParent != contextMenu) {
    contextMenu.classList.remove("visible");
  }
});

addDirectional.addEventListener("click", (e) => addLightToScene("Directional"));
addPoint.addEventListener("click", (e) => addLightToScene("Point"));
