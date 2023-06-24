import * as THREE from "/build/three.module.js";
import { PointerLockControls } from "/jsm/controls/PointerLockControls.js";
import { GLTFLoader } from "/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "/jsm/exporters/GLTFExporter.js";
import { RGBELoader } from "/jsm/loaders/RGBELoader.js";
import { GUI } from "/jsm/libs/dat.gui.module.js";
import {
  requestHandlingMicroserviceIp,
  requestHandlingMicroservicePort,
} from "./constants/parameters.js";

// > Elementos HTML
const inputField = document.getElementById("inputModel");
const canvas = document.getElementById("canvas");

const btnRender = document.getElementById("btnRender");
const btnLoading = document.getElementById("btnLoading");
const btnClear = document.getElementById("btnClear");
const btnDownload = document.getElementById("btnDownload");
const chooseFileLabel = document.getElementById("chooseFileLabel");
const loadingModelLabel = document.getElementById("loadingModelLabel");

const optionsDiv = document.getElementById("optionsDiv");
const loadModelDiv = document.getElementById("loadModelDiv");
const clearDiv = document.getElementById("clearDiv");

const optionsFOV = document.getElementById("fovRange");
const fovValue = document.getElementById("fovValue");

const backgroundSelect = document.getElementById("backgroundSelect");

// - Parámetros de renderización
const eeveeEngine = document.getElementById("eevee");
const cyclesEngine = document.getElementById("cycles");
const gtao = document.getElementById("gtao");
const bloom = document.getElementById("bloom");
const ssr = document.getElementById("ssr");

// - Parámetros de obtención de la imagen renderizada
const sendEmail = document.getElementById("send-email");
const browserDownload = document.getElementById("browser-download");
const emailInput = document.getElementById("email-input");

// - Enlace para la descarga de la imagen
const link = document.createElement("a");
link.style.display = "none";
document.body.appendChild(link);

// - Luces
const elementsDiv = document.getElementById("elementsDiv");
const lightsList = document.getElementById("lightsList");
let lights = 0;
let fileCN;

// > Variables de movimiento
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

// > Escena, renderizador e intervalo de actualizacion
let scene, renderer, intervalUpdate;

// Validar y asignar un nuevo archivo
const handleNewFile = (file) => {
  if (
    file &&
    (file.name.substring(file.name.length - 5, file.name.length) === ".gltf" ||
      file.name.substring(file.name.length - 4, file.name.length) === ".glb")
  ) {
    // create a file reader
    const reader = new FileReader();
    fileCN = file.name;

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
    alert("Es necesario seleccionar un archivo .gltf or .glb");
  }
};

// Cargar el modelo en el visor
const loadModel = (file) => {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  renderer.physicallyCorrectLights = true;

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );

  scene = new THREE.Scene();

  renderer.setPixelRatio(window.devicePixelRatio);

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

  // Añadir el modelo a la escena
  addModelToScene(file, camera, render, renderer);
};

// Añadir el modelo a la escena
const addModelToScene = (file, camera, render) => {
  const gltfLoader = new GLTFLoader();

  // Importamos el modelo y usamos la cámara si la tiene
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

    // Añadimos el modelo a la escena
    scene.add(root);

    // Inicializamos los controles
    initializeControls(camera);

    // Actualizamos el renderizador
    requestAnimationFrame(render);
  });
};

// Inizialización de los controles con los listeners para los elementos
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

  btnRender.addEventListener("click", async () => await sendModel(camera));
  btnClear.addEventListener("click", clear);

  optionsDiv.style.display = "block";
  loadModelDiv.style.display = "none";
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

// Reestablecer tamaño del renderizador si se modifica el tamaño
// de la ventana
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

// Añadir luces a la escena dependiendo de la opción seleccionada
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

    light.children[0] = light.target;

    scene.add(light);
    scene.add(light.target);

    helper = new THREE.DirectionalLightHelper(light, 1, 0x000000);
  } else if (type === "Point") {
    light = new THREE.PointLight(color, intensity);

    light.position.set(0, 10, 0);
    light.name = type + " " + lights;
    light.decay = 2;

    scene.add(light);

    helper = new THREE.PointLightHelper(light, 1, 0x000000);
  }

  helper.name = light.name + "Helper";
  scene.add(helper);

  // On GUI change
  const updateLight = () => {
    helper.update();
    if (light.type === "DirectionalLight") {
      scene.remove(light.target);
      scene.add(light.target);
    }
  };

  updateLight();

  const mainFolder = gui.addFolder(type + " " + lights);
  mainFolder.add(light, "intensity", 0, 1000, 0.01).onChange(updateLight);
  makeXYZGUI(mainFolder, light.position, "Position", updateLight);
  if (type === "Directional")
    makeXYZGUI(mainFolder, light.target.position, "Target", updateLight);

  addLightToDiv(type, light.name, gui);
};

// Creación de la carpeta de posición para las luces
const makeXYZGUI = (gui, vector3, name, onChangeFn) => {
  const folder = gui.addFolder(name);
  folder.add(vector3, "x", -1000, 1000).onChange(onChangeFn);
  folder.add(vector3, "y", -1000, 1000).onChange(onChangeFn);
  folder.add(vector3, "z", -1000, 1000).onChange(onChangeFn);
  folder.open();
};

// Eliminar los objetos de luces de la escena
const removeLight = (name, gui) => {
  const lightToRemove = scene.getObjectByName(name);
  const helperToRemove = scene.getObjectByName(name + "Helper");

  scene.remove(lightToRemove);
  scene.remove(helperToRemove);

  gui.destroy();

  lightsList.removeChild(document.getElementById(name));
  lights--;
  if (lights === 0) elementsDiv.style.display = "none";
};

// Añadir luces al elemento del div
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

const isEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Exporta y envía el modelo al servidor
const sendModel = async (cam) => {

const email = emailInput.value;

// Si se ha solicitado descarga en el navegador o envío por email con una dirección válida
if (browserDownload.checked || isEmail(email)) {

    btnRender.disabled = true;
    btnRender.style.display = "none";
    btnLoading.style.display = "block";

    const exporter = new GLTFExporter();
    const formData = new FormData();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    const newQ = quaternion.multiply(cam.quaternion);

    // Datos de la cámara y parámetros de renderizado
    const camData = {
      lens: cam.getFocalLength(),
      clip_start: cam.near,
      clip_end: cam.far,
      location: { x: cam.position.x, y: -cam.position.z, z: cam.position.y },
      qua: newQ,
      engine: eeveeEngine.checked ? "BLENDER_EEVEE" : "CYCLES",
      gtao: gtao.checked,
      bloom: bloom.checked,
      ssr: ssr.checked,
    };

    // Exportamos la escena y la convertimos en un Blob para enviarla
    exporter.parse(scene, async (gltf) => {
      console.log(fileCN)
      const mimeType = fileCN.endsWith(".gltf") ? "model/gltf+json" : "model/gltf-binary"

      formData.append("model", new Blob([JSON.stringify(gltf, null)], { type: mimeType }));
      formData.append("data", JSON.stringify(camData));

      if (sendEmail.checked) {
        formData.append("email", email);
      }


      try {
        const response = await fetch(
          `http://${requestHandlingMicroserviceIp}:${requestHandlingMicroservicePort}/requests`,
          {
            method: "POST",
            body: formData,
          }
        );

        btnLoading.style.display = "none";
        btnRender.style.display = "block";

        if (browserDownload.checked) {
          const jsonContent = await response.json();
          await requestPolling(jsonContent.requestId, jsonContent.requestStatus);
        } else {
          btnRender.disabled = false;
          alert(`Petición recibida: Se enviará la imagen renderizada a ${email}`);
        }
      } catch (error) {
        console.error(error);
      }
    });
  } else {
    alert("EL correo especificado debe ser válido");
  }
};

const msToTime = (duration) => {
  if (!duration && duration !== 0) {
    return "N/A";
  } else {
    let seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor(duration / (1000 * 60 * 60));
    console.log([hours, minutes, seconds]);
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
  }
};

const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const requestPolling = async (requestId, requestStatus) => {
  const currentRequestStatus = document.getElementById("currentRequestStatus");
  const currentQueuePosition = document.getElementById("currentQueuePosition");
  const oldestProcessingRequestEstimatedTime = document.getElementById("oldestProcessingRequestEstimatedTime");
  const estimatedTimeTitle = document.getElementById("estimated-time-title");
  const queuePositionParagraph = document.getElementById("queue-position-paragraph");

  let wasEnqueuedBefore = requestStatus === "enqueued";

  // Mostrar estado inicial de la petición
  currentRequestStatus.textContent =
    requestStatus === "enqueued" ? "En cola" : "Enviada a servidor";

  currentQueuePosition.textContent = "";
  oldestProcessingRequestEstimatedTime.textContent = "";

  $("#renderInfoModal").modal("show");

  // Mostrar posición en la cola solo si la petición se encuentra encolada
  queuePositionParagraph.style.display =
    requestStatus === "enqueued" ? "block" : "none";
  
    estimatedTimeTitle.textContent =
    requestStatus === "enqueued"
      ? "Tiempo de espera estimado para avance en la cola: "
      : "Tiempo de espera estimado: ";

  // Esperar un poco antes de comenzar el polling
  await wait(2000);

  while (requestStatus !== "fulfilled") {

    const response = await fetch(
      `http://${requestHandlingMicroserviceIp}:${requestHandlingMicroservicePort}/requests/${requestId}/info`,
      { method: "GET" }
    );

    const jsonContent = await response.json();

    requestStatus = jsonContent.requestStatus;

    // Petición pasa de "enqueued" a "processing"
    if (requestStatus === "processing" && wasEnqueuedBefore) {
      wasEnqueuedBefore = false;
      queuePositionParagraph.style.display = "none";
      currentRequestStatus.textContent = "Enviada a servidor";
      estimatedTimeTitle.textContent = "Tiempo de espera estimado: ";
      await wait(5000);
    }

    console.log(jsonContent);
    // if (jsonContent.processingRequestEstimatedRemainingProcessingTime) {
      oldestProcessingRequestEstimatedTime.textContent = msToTime(jsonContent.processingRequestEstimatedRemainingProcessingTime);
    // }
    currentQueuePosition.textContent = jsonContent.requestQueuePosition;

    await wait(2000);
  }

  currentRequestStatus.textContent = "Finalizada";
  oldestProcessingRequestEstimatedTime.textContent = "";
  currentQueuePosition.textContent = "";

  try {
    const response = await fetch(
      `http://${requestHandlingMicroserviceIp}:${requestHandlingMicroservicePort}/requests/${requestId}`,
      { method: "GET" }
    );

    btnRender.disabled = false;

    if (response.ok) {
      downloadImage(response.body);
    } else {
      alert("Error en la obtención de la imagen renderizada");
    }

  } catch (error) {
    console.error(error);
    alert("Error en la obtención de la imagen renderizada");
  }
};

// Proceso de descarga de la imagen en respuesta
const downloadImage = (body) => {
  // Nombre del archivo
  const fileName =
    fileCN.substring(fileCN.length - 5, fileCN.length) === ".gltf"
      ? fileCN.substring(0, fileCN.length - 5)
      : fileCN.substring(fileCN.length - 4, fileCN.length) === ".glb"
      ? fileCN.substring(0, fileCN.length - 4)
      : "undefined";

  // Flujo de datos
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
      btnDownload.style.display = "block";

      // Creamos el enlace de descarga
      link.href = URL.createObjectURL(new Blob(chunks, { type: "image/png" }));
      link.download = `${fileName}.png`;

      btnDownload.onclick = () => link.click();

      // clearInterval(intervalUpdate);

      // Ocultamos la ventana de información de renderizado
      $("#renderInfoModal").modal("hide");
    });
};

// Limpiar el visor
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
  loadModelDiv.style.display = "";
  clearDiv.style.display = "none";
  chooseFileLabel.style.display = "block";
  loadingModelLabel.style.display = "none";

  inputField.value = "";

  // Renovar el canvas <canvas id="canvas"></canvas>
  renderer.clear();
  canvas.addEventListener("click", () => {});
  canvas.addEventListener("contextmenu", () => {});
};

// ---- Eventos de los elementos HTML ----
inputField.onchange = (event) => {
  const file = event.target.files[0];
  handleNewFile(file);
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

const eeveeDiv = document.getElementById("eeveeDiv");
eeveeEngine.addEventListener(
  "change",
  () => (eeveeDiv.style.display = "block")
);

if (eeveeEngine.checked) eeveeDiv.style.display = "block";
else eeveeDiv.style.display = "none";

cyclesEngine.addEventListener(
  "change",
  () => (eeveeDiv.style.display = "none")
);

const emailDiv = document.getElementById("emailDiv");
sendEmail.addEventListener("change", () => (emailDiv.style.display = "block"));

browserDownload.addEventListener(
  "change",
  () => (emailDiv.style.display = "none")
);

// Drag & Drop
const preventDefaults = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  loadModelDiv.addEventListener(eventName, preventDefaults, false);
});

loadModelDiv.addEventListener(
  "drop",
  (e) => handleNewFile(e.dataTransfer.files[0]),
  false
);

// Menu click-derecho
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
