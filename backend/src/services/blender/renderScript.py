# Run as: blender -b -P <this_script> -- <lens> <clip_start> <clip_end> <location_x> <location_y> <location_z> <qua_w> <qua_x> <qua_y> <qua_z>
import bpy
import sys
import mathutils

argv_length = len(sys.argv)

# In ThreeJS camera position => x, y, z
# In Blender camera position => x, -z, y

# Delete the default objects
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj)

# Import .glb/.gltf model
bpy.ops.import_scene.gltf(
    filepath="C:\\Users\\Jose\\Documents\\Clase\\4o Año\\2o Semestre\\TFG\\Resources\\Scenes\\escena_completa.glb")

# Create a new camera
camera_data = bpy.data.cameras.new(name="Camera")

# Change camera_data attr.
# > FOV (lens in radians)
camera_data.lens_unit = "FOV"
camera_data.lens = float(sys.argv[argv_length-10])

# > Clip Start
camera_data.clip_start = float(sys.argv[argv_length-9])

# > Clip End
camera_data.clip_end = float(sys.argv[argv_length-8])

# > Sensor Fit
camera_data.sensor_fit = "VERTICAL"
camera_data.sensor_width = 36
camera_data.sensor_height = 24

# Create camera object with the data
camera_object = bpy.data.objects.new("Camera", camera_data)

# Change the active camera attr.
# > Location
camera_object.location = mathutils.Vector(
    (float(sys.argv[argv_length-7]), float(sys.argv[argv_length-6]), float(sys.argv[argv_length-5])))

# > Rotation
camera_object.rotation_mode = "QUATERNION"
camera_object.rotation_quaternion = mathutils.Quaternion(
    (float(sys.argv[argv_length-4]), float(sys.argv[argv_length-3]), float(sys.argv[argv_length-2]), float(sys.argv[argv_length-1])))

# Add the camera to the scene
bpy.context.scene.collection.objects.link(camera_object)

# Change active camera: bpy.context.scene.camera = bpy.data.objects["Camera"]
bpy.context.scene.camera = camera_object


bpy.context.scene.render.filepath = "C:\\Users\\Jose\\Documents\\Clase\\4o Año\\2o Semestre\\TFG\\Resources\\Scenes\\test.png"
bpy.ops.render.render(write_still=True)
