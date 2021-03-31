import bpy

bpy.ops.import_scene.gltf(
    filepath="C:\\Users\\Jose\\Documents\\Clase\\4o Año\\2o Semestre\\TFG\\Resources\\Scenes\\escena_completa.glb")
bpy.context.scene.render.filepath = 'C:\\Users\\Jose\\Documents\\Clase\\4o Año\\2o Semestre\\TFG\\Resources\\Scenes\\test.png'
bpy.ops.render.render(write_still=True)
