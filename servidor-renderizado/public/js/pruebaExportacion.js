/*
 * Camera Buttons
 */

var CameraButtons = function(blueprint3d) {

	var orbitControls = blueprint3d.three.controls;
	var three = blueprint3d.three;

	var panSpeed = 30;
	var directions = {
		UP : 1,
		DOWN : 2,
		LEFT : 3,
		RIGHT : 4
	}

	function init() {
		// Camera controls
		$("#zoom-in").click(zoomIn);
		$("#zoom-out").click(zoomOut);
		$("#zoom-in").dblclick(preventDefault);
		$("#zoom-out").dblclick(preventDefault);

		$("#reset-view").click(three.centerCamera)

		$("#move-left").click(function() {
			pan(directions.LEFT)
		})
		$("#move-right").click(function() {
			pan(directions.RIGHT)
		})
		$("#move-up").click(function() {
			pan(directions.UP)
		})
		$("#move-down").click(function() {
			pan(directions.DOWN)
		})

		$("#move-left").dblclick(preventDefault);
		$("#move-right").dblclick(preventDefault);
		$("#move-up").dblclick(preventDefault);
		$("#move-down").dblclick(preventDefault);
	}

	function preventDefault(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	function pan(direction) {
		switch (direction) {
		case directions.UP:
			orbitControls.panXY(0, panSpeed);
			break;
		case directions.DOWN:
			orbitControls.panXY(0, -panSpeed);
			break;
		case directions.LEFT:
			orbitControls.panXY(panSpeed, 0);
			break;
		case directions.RIGHT:
			orbitControls.panXY(-panSpeed, 0);
			break;
		}
	}

	function zoomIn(e) {
		e.preventDefault();
		orbitControls.dollyIn(1.1);
		orbitControls.update();
	}

	function zoomOut(e) {
		e.preventDefault;
		orbitControls.dollyOut(1.1);
		orbitControls.update();
	}

	init();
}


var mainControls = function(blueprint3d) {
	var blueprint3d = blueprint3d;
	var texturaData = "";
	var texturaName = "";
	var jsData = "";
	var jsName = "";

	function newDesign() {
		blueprint3d.model
				.loadSerialized('{"floorplan":{"corners":{"f90da5e3-9e0e-eba7-173d-eb0b071e838e":{"x":204.85099999999989,"y":289.052},"da026c08-d76a-a944-8e7b-096b752da9ed":{"x":672.2109999999999,"y":289.052},"4e3d65cb-54c0-0681-28bf-bddcc7bdb571":{"x":672.2109999999999,"y":-178.308},"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2":{"x":204.85099999999989,"y":-178.308}},"walls":[{"corner1":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","corner2":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","corner2":"da026c08-d76a-a944-8e7b-096b752da9ed","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"da026c08-d76a-a944-8e7b-096b752da9ed","corner2":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","corner2":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}}],"wallTextures":[],"floorTextures":{},"newFloorTextures":{}},"items":[]}');
	}

	function loadFile() {
		files = $("#loadFile").get(0).files;
		var reader = new FileReader();
		reader.onload = function(event) {
			jsData = event.target.result;
			jsName = files[0].name;
			console.log("jsName="+jsName);
		}
		reader.readAsText(files[0]);
	}

	function loadTexture() {
		files = $("#loadTexture").get(0).files;
		var reader = new FileReader();
		reader.onload = function(event) {
			texturaData = event.target.result;
			texturaName = files[0].name;	
			document.getElementById("previsualizar").disabled = false;
		}
		reader.readAsDataURL(files[0]);

	}
//	
//	function previewEdit(){
//		alert("Edito")
//	}

	function preview() {
		$("#previsualizacion").show();
		
				
		
//		console.log("texturaData="+texturaData)
//		console.log("jsData="+jsData)

//		if (texturaData != "" && jsData != "") {
			
			// Creo la escena
			blueprint3d.model
					.loadSerialized('{"floorplan":{"corners":{"f90da5e3-9e0e-eba7-173d-eb0b071e838e":{"x":-104.0130000000003,"y":331.7239999999996},"da026c08-d76a-a944-8e7b-096b752da9ed":{"x":406.0189999999998,"y":331.7239999999996},"4e3d65cb-54c0-0681-28bf-bddcc7bdb571":{"x":406.0189999999998,"y":-178.308},"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2":{"x":-104.0130000000003,"y":-178.308}},"walls":[{"corner1":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","corner2":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","corner2":"da026c08-d76a-a944-8e7b-096b752da9ed","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"da026c08-d76a-a944-8e7b-096b752da9ed","corner2":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","corner2":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}}],"wallTextures":[],"floorTextures":{},"newFloorTextures":{}},"items":[]}');

			
//		} else {		
//			alert("Debes seleccionar un fichero .js/.json y una textura");
//		}

	}

	function init() {
		$("#loadFile").change(loadFile);
		$("#loadTexture").change(loadTexture);
		$("#previsualizar").click(preview);
	}

	init();
}

/*
 * Controller for item
 */

var ItemController = function(blueprint3d) {

	var selectedItem;
	var three = blueprint3d.three;

	function init() {
		three.itemSelectedCallbacks.add(itemSelected);
		three.itemUnselectedCallbacks.add(itemUnselected);

	}

	function itemSelected(item) {
		selectedItem = item;

		$("#ancho").val(selectedItem.getWidth().toFixed(0));
		$("#alto").val(selectedItem.getHeight().toFixed(0));
		$("#profundidad").val(selectedItem.getDepth().toFixed(0));

	}

	function itemUnselected() {
		three.keyControl.controls.noKeys = false;
		selectedItem = null;
	}

	init();
}
/*
function checkId(){
	var id = $("#id").val();
	
	if (id!=null && id!=""){	
		// Creo los archivos y lanzo la previsualizacion
		$.post("checkId.jsp", {
			idPieza : id
		}, function(data) {
			if (data == 0){
				//ID disponible
//				alert("no")
			}else{
				//ID ocupado
				alert("Este ID ya existe");
			}
		});
	}
}
*/

/*
 * Initialize!
 */

$(document).ready(function() {

        console.log("Estoy en pruebaExportacion.js");
	// main setup
	var opts = {
		floorplannerElement : 'floorplanner-canvas',
		threeElement : '#viewer',
		threeCanvasElement : 'three-canvas',
		textureDir : "models/temp/",
		widget : false
	}
	var blueprint3d = new Blueprint3d(opts);
	var itemController = new ItemController(blueprint3d);
	var cameraButtons = new CameraButtons(blueprint3d);
	mainControls(blueprint3d);
	blueprint3d.three.rotacion = false;
       
        // Cargar ambos archivos en paralelo
        const promesaEscena = cargarArchivo('assets/escena.txt?0002');
        const promesaCamera = cargarArchivo('assets/camera.txt');

        Promise.all([promesaEscena, promesaCamera])
          .then(resultados => {
            const escena = resultados[0];
            const camera = resultados[1];
            
            //pruebaObtenerModelos();
            cargarEscena(blueprint3d,escena,camera);
          })
          .catch(error => {
            console.error('Hubo un error al cargar los archivos:', error);
          });    
        
        //const exportador = blueprint3d.three.GLTFExporter();
    //blueprint3d.model.loadSerialized('{"floorplan":{"corners":{"f90da5e3-9e0e-eba7-173d-eb0b071e838e":{"x":-104.0130000000003,"y":331.7239999999996},"da026c08-d76a-a944-8e7b-096b752da9ed":{"x":406.0189999999998,"y":331.7239999999996},"4e3d65cb-54c0-0681-28bf-bddcc7bdb571":{"x":406.0189999999998,"y":-178.308},"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2":{"x":-104.0130000000003,"y":-178.308}},"walls":[{"corner1":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","corner2":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","corner2":"da026c08-d76a-a944-8e7b-096b752da9ed","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"da026c08-d76a-a944-8e7b-096b752da9ed","corner2":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","corner2":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}}],"wallTextures":[],"floorTextures":{},"newFloorTextures":{}},"items":[]}');
        
        

});

    
function cargarArchivo(url) {
  return fetch(url)
    .then(response => response.text())
    .catch(error => {
      console.error(`Error al cargar ${url}:`, error);
      throw error;
    });
}

async function cargarEscena(blueprint3d,modelo,camera) {
    blueprint3d.model.scene.setCargandoEscena(true);
    
    cargarDisenio(blueprint3d, modelo);

    while (blueprint3d.model.scene.getCargandoEscena() === true) {
        console.log(blueprint3d.model.scene.getCargandoEscena()); 
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    exportarModelo(blueprint3d,camera);
    console.log("Exportacion finalizada");
}

function cargarDisenio(blueprint3d, data) {
    console.log(data);
    var modelo = JSON.parse(data);
    blueprint3d.model.loadSerialized(JSON.stringify(modelo));
    console.log("Inicializo estados");
    
}

function downloadDesign_link(data,name) {
            var a = window.document.createElement('a');
            a.setAttribute("id", "tosave");
            var blob = new Blob([ data ], {
                    type : 'text'
            });
            a.href = window.URL.createObjectURL(blob);
            a.download = name;
            document.body.appendChild(a);
            a.click();
			document.body.removeChild(a);
			window.close()

        }

function exportarModelo(blueprint3d,camera) {
   
   // Comentado para exportar la cámara, no necesario ahora
   var camera2 = blueprint3d.three.getCamera();
   //downloadDesign_link(JSON.stringify(camera),'camera');
   var cameraData = JSON.parse(camera);
   const loadedCamera = blueprint3d.three.PerspectiveCamera();
   //loadedCamera.copy(cameraData);
   blueprint3d.model.exportSerializedGLTF_TFG(camera2);
	
}

function pruebaObtenerModelos() {
    // URL del archivo que deseas obtener
/*const fileUrl = 'https://atriospaces.fra1.digitaloceanspaces.com/models/js/M-1225.js';

    // Realiza una solicitud GET para obtener el archivo
    fetch(fileUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al obtener el archivo: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then(data => {
        console.log('Contenido del archivo:', data);
      })
      .catch(error => {
        console.error('Hubo un error:', error);
      });*/
    // digitalOcean.js

}

