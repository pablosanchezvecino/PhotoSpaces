import { requestHandlingMicroserviceUrl } from "./constants/parameters.js";
import { PointerLockControls } from "/jsm/controls/PointerLockControls.js";
import { GLTFExporter } from "/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "/jsm/loaders/RGBELoader.js";
import { wait, msToTime } from "./logic/timeLogic.js";
import { GUI } from "/jsm/libs/dat.gui.module.js";
import { isEmail } from "./logic/emailLogic.js";
import * as THREE from "/build/three.module.js";

// > Elementos HTML
const inputField = document.getElementById("input-model");
const canvas = document.getElementById("canvas");

const btnRender = document.getElementById("btn-render");
const btnLoading = document.getElementById("btn-loading");
const btnClear = document.getElementById("btn-clear");
const btnDownload = document.getElementById("btn-download");
const chooseFileLabel = document.getElementById("choose-file-label");
const loadingModelLabel = document.getElementById("loading-model-label");

const optionsDiv = document.getElementById("options-div");
const loadModelDiv = document.getElementById("load-model-div");
const clearDiv = document.getElementById("clear-div");

const optionsFOV = document.getElementById("fov-range");
const fovValue = document.getElementById("fov-value");

const dracoCompressionLevelRange = document.getElementById("draco-compression-level-range");

const backgroundSelect = document.getElementById("background-select");

// - Parámetros de renderización
const resolutionSelect = document.getElementById("resolution-select");
const eeveeEngine = document.getElementById("eevee");
const cyclesEngine = document.getElementById("cycles");
const gtao = document.getElementById("gtao");
const bloom = document.getElementById("bloom");
const ssr = document.getElementById("ssr");

// - Parámetros de obtención de la imagen renderizada
const sendEmail = document.getElementById("send-email");
const browserDownload = document.getElementById("browser-download");
const emailInput = document.getElementById("email-input");

// - Parámetro Draco
const dracoSwitch = document.getElementById("draco-switch");
const dracoLabel = document.getElementById("draco-label");

// - Parámetros de exportación de la escena
const glbExport = document.getElementById("glb-export");

// Etiqueta opcional para la petición
const requestLabelInput = document.getElementById("request-label-input");

// - Enlace para la descarga de la imagen
const link = document.createElement("a");
link.style.display = "none";
document.body.appendChild(link);

// - Luces
const elementsDiv = document.getElementById("elements-div");
const lightsList = document.getElementById("lights-list");
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

// > Escena y renderizador
let scene, renderer, camera;
btnRender.addEventListener("click", async () => await sendModel(camera));

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

  camera = new THREE.PerspectiveCamera(
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
  btnClear.addEventListener("click", clear);


  optionsDiv.style.display = "block";
  loadModelDiv.style.display = "none";
  clearDiv.style.display = "block";

  fovValue.innerText = `FOV: ${optionsFOV.value}`;

  optionsFOV.addEventListener("change", () => {
    camera.fov = optionsFOV.value;
    fovValue.innerText = `FOV: ${optionsFOV.value}`;
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
  img.src = "../img/svg/trash.svg";
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





// Exporta y envía el modelo al servidor
const sendModel = async (cam) => {
  const email = emailInput.value;

  // Si se ha solicitado descarga en el navegador o envío por email con una dirección válida
  if (browserDownload.checked || isEmail(email)) {

    btnRender.disabled = true;
    btnRender.style.display = "none";
    btnLoading.innerText = "Enviando...";
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
      resolution: resolutionSelect.value
    };


    // Exportamos la escena y la convertimos en un Blob para enviarla
    exporter.parse(scene, async (scene) => {
      
      
      if (glbExport.checked) {
        // Exportación GLB
        formData.append("model", new Blob([scene], { type: "model/gltf-binary" }));
      } else {
        // Exportación glTF
        formData.append("model", new Blob([JSON.stringify(scene, null)], { type: "model/gltf+json" }));
      }
      
      
      formData.append("data", JSON.stringify(camData));
      
      // Si se solicita envío por email
      if (sendEmail.checked) {
        formData.append("email", email);
      }
      
      // Si se solicita compresión con Draco
      if (dracoSwitch.checked) {
        formData.append("dracoCompressionLevel", dracoCompressionLevelRange.value);
      }

      // Si se especifica etiqueta
      if (requestLabelInput.value) {
        formData.append("requestLabel", requestLabelInput.value);
      }

      try {
        const response = await fetch(
          `${requestHandlingMicroserviceUrl}/requests`,
          {
            method: "POST",
            body: formData
          }
        );

        if (response.ok) {
          btnLoading.innerText = "Renderizando...";
          if (browserDownload.checked) {
            const jsonContent = await response.json();
            await requestPolling(jsonContent.requestId, jsonContent.requestStatus);
          } else {
            btnRender.disabled = false;
            alert(`Petición recibida: Se enviará la imagen renderizada a ${email}`);
          }
        } else {
          alert(`Error al recibir la petición. Recibido código ${response.status}. Error: ${(await response.json()).error}`);
        }
        btnLoading.style.display = "none";
        btnRender.style.display = "block";
  
          
      } catch (error) {
        console.error(error);
      }
    },
    { binary: glbExport.checked });
  } else {
    alert("EL correo especificado debe ser válido");
  }
};

const requestPolling = async (requestId, requestStatus) => {
  const currentRequestStatus = document.getElementById("current-request-status");
  const currentQueuePosition = document.getElementById("current-queue-position");
  const oldestProcessingRequestEstimatedTime = document.getElementById("oldest-processing-request-estimated-time");
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
      `${requestHandlingMicroserviceUrl}/requests/${requestId}/info`,
      { method: "GET" }
    );

    if (response.ok) {
      const jsonContent = await response.json();
  
      requestStatus = jsonContent.requestStatus;
  
      // Petición pasa de "enqueued" a "processing"
      if (requestStatus === "processing" && wasEnqueuedBefore) {
        wasEnqueuedBefore = false;
        oldestProcessingRequestEstimatedTime.textContent = "";
        queuePositionParagraph.style.display = "none";
        currentRequestStatus.textContent = "Enviada a servidor";
        estimatedTimeTitle.textContent = "Tiempo de espera estimado: ";
        await wait(2000);
      }
  
      let estimatedRemainingTime = jsonContent.processingRequestEstimatedRemainingProcessingTime;
  
      if (estimatedRemainingTime === null || estimatedRemainingTime === undefined) {
        oldestProcessingRequestEstimatedTime.textContent = "N/A";
      } else {
        estimatedRemainingTime = msToTime(estimatedRemainingTime);
        oldestProcessingRequestEstimatedTime.textContent =  estimatedRemainingTime === "00:00:00" ? "N/A (Finalizando...)" : estimatedRemainingTime;
      }
      currentQueuePosition.textContent = jsonContent.requestQueuePosition;

    }

    await wait(2000);
  }

  currentRequestStatus.textContent = "Finalizada";
  oldestProcessingRequestEstimatedTime.textContent = "";
  currentQueuePosition.textContent = "";

  try {
    const response = await fetch(
      `${requestHandlingMicroserviceUrl}/requests/${requestId}/rendered-image`,
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
      .setPath("../img/backgrounds/")
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

backgroundSelect.addEventListener(
  "change",
  () => backgroundChange(backgroundSelect.value)
);

backgroundSelect.selectedIndex = 0;

const eeveeDiv = document.getElementById("eevee-div");
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

const emailDiv = document.getElementById("email-div");
sendEmail.addEventListener("change", () => (emailDiv.style.display = "block"));

const dracoDiv = document.getElementById("draco-div");
dracoDiv.style.display = "none";

dracoSwitch.addEventListener("change", () => {
  dracoDiv.style.display = dracoSwitch.checked ? "block" : "none";
  
  dracoLabel.innerText = `Compresión con Draco: ${dracoSwitch.checked ? dracoCompressionLevelRange.value : "No"}`;
});

dracoCompressionLevelRange.addEventListener("change", () => {
  dracoLabel.innerText = `Compresión con Draco: ${dracoCompressionLevelRange.value === null ? "No" : dracoCompressionLevelRange.value}`;
});

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
const addDirectional = document.getElementById("add-directional-light");
const addPoint = document.getElementById("add-point-light");

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

addDirectional.addEventListener("click", () => addLightToScene("Directional"));
addPoint.addEventListener("click", () => addLightToScene("Point"));
