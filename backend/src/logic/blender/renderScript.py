# Run as: blender -b -P <this_script> -- <filename> <parameters JSON>
import bpy, sys, mathutils, os, json

# Only for the Docker build
if os.environ.get("BLENDER_MAJOR") is not None:
    from pyvirtualdisplay import Display
    Display().start()

argv_length = len(sys.argv)

filename = sys.argv[argv_length - 2]
parametersString = sys.argv[argv_length - 1]
parameters = json.loads(parametersString)

# In ThreeJS camera position => x, y, z
# In Blender camera position => x, -z, y

# ---------- BASICO PARA CUALQUIER MOTOR  ---------- #

# Delete the default objects
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj)

# Import .glb/.gltf model
publicFolder = os.path.abspath(os.getcwd()) + "/public/"

bpy.ops.import_scene.gltf(filepath=publicFolder + filename + ".gltf")

# Create a new camera
camera_data = bpy.data.cameras.new(name="Camera")

# Change camera_data attr.
# > FOV (lens in radians)
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

# Create camera object with the data
camera_object = bpy.data.objects.new("Camera", camera_data)

# Change the active camera attr.
# > Location
camera_object.location = mathutils.Vector(
    (float(parameters["location"]["x"]), float(parameters["location"]["y"]), float(parameters["location"]["z"])))

# > Rotation
camera_object.rotation_mode = "QUATERNION"
camera_object.rotation_quaternion = mathutils.Quaternion(
    (float(parameters["qua"]["_w"]), float(parameters["qua"]["_x"]), float(parameters["qua"]["_y"]), float(parameters["qua"]["_z"])))

# Add the camera to the scene
bpy.context.scene.collection.objects.link(camera_object)

# Change active camera: bpy.context.scene.camera = bpy.data.objects["Camera"]
bpy.context.scene.camera = camera_object

# Render settings
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
bpy.context.scene.render.filepath = publicFolder + filename + ".png"
bpy.ops.render.render(write_still=True)
