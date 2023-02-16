// TODO: Hacer fetch del estado del sistema periódicamente para actualizar interfaz de usuario
const periodicUpdate = () => {
  // setInterval(() => {
  //     console.log("ey");
  // }, 2000);
};

// Intenta añadir el servidor correspondiente a la IP introducida en el formulario
const addServer = (event) => {
  event.preventDefault();

  // Obtener IP introducida en el formulario
  const ipInput = document.getElementById("ipInput");
  const serverIP = ipInput.value;
  console.log(serverIP);

  // Realizar consulta al servidor para saber sus especificaciones y si tiene Blender instalado
  fetch(`http://${serverIP}:9000/servers`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ip: serverIP }),
  })
    .then((response) => response.json())
    .then((serverSpecs) => {
      alert("Servidor añadido correctamente");
      addServerCard(serverSpecs);
    })
    .catch((error) => {
      console.log(error);
      alert("Error: No se ha obtenido respuesta del servidor");
    });
};

// Añade tarjeta correspondiente al servidor cuya información recibe como parámetro
addServerCard = (serverSpecs) => {
  const row = document.createElement("div");
  row.className = "row";

  const card = document.createElement("div");
  card.className = "card";
  card.style = "width: 20rem";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const cardTitle = document.createElement("h5");
  cardTitle.className = "card-title";
  cardTitle.innerText = "SERVER";

  const cardTextOS = document.createElement("p");
  cardTextOS.className = "card-text";
  cardTextOS.innerHTML =
    "<strong>Sistema Operativo: </strong>" + serverSpecs.os;

  const cardTextCPU = document.createElement("p");
  cardTextCPU.className = "card-text";
  cardTextCPU.innerHTML = "<strong>CPU: </strong>" + serverSpecs.cpu;

  const cardTextGPU = document.createElement("p");
  cardTextGPU.className = "card-text";
  cardTextGPU.innerHTML = "<strong>GPU: </strong>" + serverSpecs.gpu;

  const cardTextBlenderVersion = document.createElement("p");
  cardTextBlenderVersion.className = "card-text";
  cardTextBlenderVersion.innerHTML =
    "<strong>Versión de Blender: </strong>" + serverSpecs.blender_version;

  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardTextOS);
  cardBody.appendChild(cardTextCPU);
  cardBody.appendChild(cardTextGPU);
  cardBody.appendChild(cardTextBlenderVersion);

  card.appendChild(cardBody);

  row.appendChild(card);

  document.body.appendChild(row);
};
