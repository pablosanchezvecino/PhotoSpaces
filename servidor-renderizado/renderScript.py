# Run as: blender -b -P <this_script> -- <filename> <parameters JSON>
from pathlib import Path
import bpy, sys, mathutils, os, json

print(sys.argv)

# Monitor falso para Eevee
if os.environ.get("BLENDER_MAJOR") is not None:
    from pyvirtualdisplay import Display
    pyvirtualdisplay.Display().start()

argv_length = len(sys.argv)

filename = sys.argv[argv_length - 2]
parametersString = sys.argv[argv_length - 1]
parameters = json.loads(parametersString)

# ---------- BASICO PARA CUALQUIER MOTOR  ---------- #

# Borramos todos los objetos por defecto
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj)

# Importamos el modelo .glb/.gltf 
# publicFolder = os.path.abspath(os.getcwd()) + "/res/"
# publicFolder = os.environ.get("RES_PATH")
folder = os.path.abspath(os.getcwd()) + "/temp/"
print(folder)
print(folder)
print(folder)
bpy.ops.import_scene.gltf(filepath=(folder + filename))

# Creamos un objeto de datos de camara
camera_data = bpy.data.cameras.new(name="Camera")

# Modificamos los atributos de la camara
# > FOV (lens en radianes)
camera_data.lens_unit = "FOV"
camera_data.lens = float(parameters["lens"])

# > Clip Start
camera_data.clip_start = float(parameters["clip_start"])

# > Clip End
camera_data.clip_end = float(parameters["clip_end"])

# > Sensor Fit
camera_data.sensor_fit = "VERTICAL"
camera_data.sensor_width = 36
camera_data.sensor_height = 24

# Creamos el objeto de camara con los datos
camera_object = bpy.data.objects.new("Camera", camera_data)

# Cambiamos la camara activa
# > Localizacion
camera_object.location = mathutils.Vector(
    (float(parameters["location"]["x"]), float(parameters["location"]["y"]), float(parameters["location"]["z"])))

# > Rotacion (cuaterniones)
camera_object.rotation_mode = "QUATERNION"
camera_object.rotation_quaternion = mathutils.Quaternion(
    (float(parameters["qua"]["_w"]), float(parameters["qua"]["_x"]), float(parameters["qua"]["_y"]), float(parameters["qua"]["_z"])))

# Añadimos la camara a la escena
bpy.context.scene.collection.objects.link(camera_object)

# Ponemos la nueva camara como camara activa
bpy.context.scene.camera = camera_object

# Parametros de renderizado
# Transformacion del color filmica
bpy.context.scene.view_settings.view_transform = "Filmic"
bpy.context.scene.view_settings.look = "Medium Contrast"

bpy.context.scene.render.threads = 2

bpy.context.scene.render.engine = parameters["motor"]

# ---------- PARAMETROS SEGUN MOTOR  ---------- #
if parameters["motor"] == "BLENDER_EEVEE": 
    # Muestras 
    bpy.context.scene.eevee.taa_render_samples = 128
    bpy.context.scene.eevee.taa_samples = 132

    # Oclusion ambiental
    bpy.context.scene.eevee.use_gtao = parameters["gtao"]
    bpy.context.scene.eevee.sss_jitter_threshold = 0.5

    # Resplandor
    bpy.context.scene.eevee.use_bloom = parameters["bloom"]

    # SSGI
    bpy.context.scene.eevee.use_ssr = parameters["ssr"]
    bpy.context.scene.eevee.use_ssr_refraction = True
    bpy.context.scene.eevee.ssr_quality = 1
else:
    # Motor cycles y procesamiento GPU
    bpy.context.scene.cycles.device = "GPU"

    # Muestreo adaptativo
    bpy.context.scene.cycles.use_adaptive_sampling = True

    # Eliminacion de ruido
    bpy.context.scene.cycles.use_denoising = True
    bpy.context.scene.cycles.denoiser = "OPENIMAGEDENOISE"
    bpy.context.scene.cycles.use_preview_denoising = True
    bpy.context.scene.cycles.preview_denoising_input_passes = "RGB_ALBEDO_NORMAL"

    # Trayectoria de la luz, saltos
    bpy.context.scene.cycles.max_bounces = 4
    bpy.context.scene.cycles.diffuse_bounces = 2
    bpy.context.scene.cycles.glossy_bounces = 2
    bpy.context.scene.cycles.transparent_max_bounces = 4
    bpy.context.scene.cycles.transmission_bounces = 4
    bpy.context.scene.cycles.caustics_reflective = False
    bpy.context.scene.cycles.caustics_refractive = False

    # Simplificar el modelo 
    bpy.context.scene.render.use_simplify = True
    bpy.context.scene.cycles.use_camera_cull = True


# Donde guardar la imagen y renderizar
bpy.context.scene.render.filepath = folder + f"{Path(filename).stem}.png"
bpy.ops.render.render(write_still=True)
