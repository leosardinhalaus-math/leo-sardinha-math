@tool
extends Node3D

const Geo = preload("res://scripts/NativeGeometry.gd")
const THEMES = [
 {"grass":"4f866c","rock":"46576b","sand":"c5b082","leaf":"285e50","water":"174b62","accent":"87e2ce","sky":"102c40"},
 {"grass":"9c7858","rock":"644b65","sand":"d5b985","leaf":"706044","water":"293c59","accent":"d4a6f1","sky":"29273e"},
 {"grass":"53677c","rock":"354454","sand":"c6ae73","leaf":"304c64","water":"142f4c","accent":"ffe29a","sky":"152139"},
 {"grass":"4e9977","rock":"3f6b62","sand":"c9c29a","leaf":"23644f","water":"175d70","accent":"93f2cf","sky":"14384b"},
 {"grass":"68515d","rock":"443b50","sand":"b88b6b","leaf":"4e404e","water":"492735","accent":"ffb66e","sky":"271c30"}
]
const LOCATIONS = [Vector2(-6.0,1.2),Vector2(-3.8,-0.9),Vector2(-1.4,1.0),Vector2(1.2,-1.1),Vector2(3.7,1.1),Vector2(5.8,-0.8)]
@export_range(0,4) var preview_world = 0:
 set(value):
  preview_world = value
  if Engine.is_editor_hint() and is_inside_tree(): call_deferred("_refresh_editor")
var world_index = 0
var palette: Dictionary
var mission_points: Array[Vector3] = []
var mission_markers: Array[MeshInstance3D] = []
var terrain: MeshInstance3D

func _ready() -> void:
 if Engine.is_editor_hint(): _refresh_editor()

func _refresh_editor() -> void:
 build(preview_world)

func height_at(x: float,z: float) -> float:
 return 0.30 + 0.34*sin(x*0.55+world_index*0.5) + 0.17*cos(z*1.2) + 0.48*exp(-pow((x-3.2)/2.7,2)-pow((z+1.8)/1.8,2))

func _shore(angle: float) -> Vector2:
 var radius = 1.0+sin(angle*5.0+0.7)*0.045+cos(angle*7.0)*0.025
 return Vector2(cos(angle)*7.7,sin(angle)*3.55)*radius

func _vertex(surface: SurfaceTool,p: Vector3,color: Color) -> void:
 surface.set_color(color)
 surface.add_vertex(p)

func build(index: int) -> void:
 for child in get_children():
  remove_child(child)
  child.queue_free()
 mission_points.clear()
 mission_markers.clear()
 world_index = clampi(index,0,4)
 palette = THEMES[world_index]
 name = "IslandDiorama"
 set_meta("native_diorama",true)
 _terrain()
 _water()
 var stone = Geo.material(Color(palette.rock))
 var gold = Geo.material(Color(palette.sand),true)
 var glow = Geo.material(Color(palette.accent),false,true)
 for location in LOCATIONS:
  mission_points.append(Vector3(location.x,height_at(location.x,location.y),location.y))
 for index_in_path in range(5): _path(index_in_path,gold)
 for cave in range(6): _cave(cave,stone,gold,glow)
 _landmarks(stone,gold,glow)

func _terrain() -> void:
 var surface = SurfaceTool.new()
 surface.begin(Mesh.PRIMITIVE_TRIANGLES)
 surface.set_smooth_group(-1)
 var grass = Color(palette.grass)
 var rock = Color(palette.rock)
 for ring in range(9):
  var r0 = ring/9.0
  var r1 = (ring+1)/9.0
  for side in range(56):
   var shore_a = _shore(side*TAU/56)
   var shore_b = _shore((side+1)*TAU/56)
   var a = shore_a*r0
   var b = shore_a*r1
   var c = shore_b*r1
   var d = shore_b*r0
   var points = [Vector3(a.x,height_at(a.x,a.y),a.y),Vector3(b.x,height_at(b.x,b.y),b.y),Vector3(c.x,height_at(c.x,c.y),c.y),Vector3(d.x,height_at(d.x,d.y),d.y)]
   var tint = grass.lightened(0.025*sin(side*3.1+ring*1.7))
   if ring==8: tint = grass.lerp(Color(palette.sand),0.20)
   for vertex in [0,1,2,0,2,3]: _vertex(surface,points[vertex],tint)
 # Three irregular cliff strata make the island an actual solid volume.
 for level in range(3):
  for side in range(56):
   var a = _shore(side*TAU/56)
   var b = _shore((side+1)*TAU/56)
   var top_a = Vector3(a.x,height_at(a.x,a.y),a.y) if level==0 else Vector3(a.x*(1.0-level*0.05),-0.30-(level-1)*0.65,a.y*(1.0-level*0.05))
   var top_b = Vector3(b.x,height_at(b.x,b.y),b.y) if level==0 else Vector3(b.x*(1.0-level*0.05),-0.30-(level-1)*0.65,b.y*(1.0-level*0.05))
   var bottom_a = Vector3(a.x*(0.95-level*0.05),-0.30-level*0.65,a.y*(0.95-level*0.05))
   var bottom_b = Vector3(b.x*(0.95-level*0.05),-0.30-level*0.65,b.y*(0.95-level*0.05))
   var tint = rock.lightened(0.08 if level==0 else -level*0.07).lightened(sin(side*2.9)*0.04)
   for vertex in [top_a,bottom_a,bottom_b,top_a,bottom_b,top_b]: _vertex(surface,vertex,tint)
 surface.generate_normals()
 terrain = MeshInstance3D.new()
 terrain.name = "SculptedIsland"
 terrain.mesh = surface.commit()
 var mat = Geo.material(Color.WHITE).duplicate()
 mat.vertex_color_use_as_albedo = true
 terrain.material_override = mat
 add_child(terrain)

func _water() -> void:
 var plane = PlaneMesh.new()
 plane.size = Vector2(38,23)
 var ocean = MeshInstance3D.new()
 ocean.name = "Ocean"
 ocean.mesh = plane
 ocean.position.y = -1.72
 ocean.material_override = Geo.material(Color(palette.water),true)
 add_child(ocean)
 for wave in range(3):
  var points: Array[Vector3] = []
  for side in range(65):
   var angle = side*TAU/64
   points.append(Vector3(cos(angle)*(8.2+wave*0.50),-1.69,sin(angle)*(4.1+wave*0.30)))
  Geo.curve(self,points,0.012,Geo.material(Color(palette.water).lightened(0.15-wave*0.025)))

func _path(index: int,mat: Material) -> void:
 var transforms: Array[Transform3D] = []
 var start = LOCATIONS[index]
 var end = LOCATIONS[index+1]
 for step in range(1,17):
  var p = start.lerp(end,step/17.0)
  var scale_size = Vector3(0.13+(step%3)*0.015,0.045,0.12)
  transforms.append(Transform3D(Basis.from_scale(scale_size),Vector3(p.x,height_at(p.x,p.y)+0.035,p.y)))
 Geo.instances(self,"MissionTrail%d"%index,"cylinder",transforms,mat)

func _cave(index: int,stone: Material,gold: Material,glow: Material) -> void:
 var cave = Geo.pivot(self,"Cave%d"%(index+1),mission_points[index])
 var rock = Geo.part(cave,"RockMound","sphere",Vector3(0,0.32,-0.12),Vector3(0.73,0.60,0.53),stone)
 rock.rotation.z = -0.06 if index%2==0 else 0.05
 Geo.part(cave,"CaveMouth","sphere",Vector3(0,0.28,0.40),Vector3(0.30,0.34,0.035),Geo.material(Color("101b25")))
 for block in range(9):
  var angle = block*PI/8
  var frame = Geo.part(cave,"ArchStone","box",Vector3(cos(angle)*0.37,0.10+sin(angle)*0.52,0.41),Vector3(0.21,0.20,0.18),Geo.material(Color(palette.sand).darkened((block%2)*0.10)))
  frame.rotation.z = angle-PI/2
 Geo.part(cave,"Doorstep","box",Vector3(0,0.04,0.56),Vector3(0.86,0.10,0.44),gold)
 var marker = Geo.part(cave,"MissionBeacon","sphere",Vector3(0,1.02,0),Vector3.ONE*0.105,glow)
 mission_markers.append(marker)
 if index==5:
  for side in [-1.0,1.0]:
   Geo.part(cave,"GuardianTurret","cylinder",Vector3(side*0.57,0.57,-0.08),Vector3(0.20,1.14,0.20),stone)
   Geo.part(cave,"GuardianRoof","cone",Vector3(side*0.57,1.24,-0.08),Vector3(0.27,0.40,0.27),gold)
  var crown = Geo.part(cave,"GuardianCrown","ring",Vector3(0,0.95,-0.05),Vector3.ONE*0.23,gold)
  crown.rotation.x = PI/2

func _landmarks(stone: Material,gold: Material,glow: Material) -> void:
 var trees: Array[Vector2] = [Vector2(-6,-1.9),Vector2(-4.9,-2.1),Vector2(-1.5,-2.4),Vector2(0.0,2.5),Vector2(3.3,-2.2),Vector2(5.1,2.1)]
 for index in range(trees.size()):
  var p = trees[index]
  var base = Vector3(p.x,height_at(p.x,p.y),p.y)
  if world_index in [0,3]:
   Geo.segment(self,"TreeTrunk",base,base+Vector3(0,0.80,0),0.085,Geo.material(Color("675446")))
   for branch in [-1.0,1.0]:
    Geo.segment(self,"TreeBranch",base+Vector3(0,0.40,0),base+Vector3(branch*0.25,0.85,0),0.042,Geo.material(Color("675446")))
   Geo.part(self,"TreeCrown","sphere",base+Vector3(0,1.02,0),Vector3(0.43,0.55,0.40),Geo.material(Color(palette.leaf).lightened((index%3)*0.045)))
   Geo.part(self,"TreeCrown","sphere",base+Vector3(0.25,0.88,0.05),Vector3(0.29,0.34,0.28),Geo.material(Color(palette.leaf)))
  elif world_index==2:
   Geo.part(self,"AstralPlinth","cylinder",base+Vector3(0,0.20,0),Vector3(0.27,0.40,0.27),stone)
   for ring in range(3):
    var orbit = Geo.part(self,"AstralRing","ring",base+Vector3(0,0.84,0),Vector3.ONE*(0.38-ring*0.05),gold)
    orbit.rotation = Vector3(ring*0.8,ring*0.4,ring*0.6)
   Geo.part(self,"StarCore","sphere",base+Vector3(0,0.84,0),Vector3.ONE*0.10,glow)
  else:
   Geo.part(self,"RockSpire","cone",base+Vector3(0,0.70,0),Vector3(0.33,1.40,0.31),stone)
   Geo.part(self,"SpireCrystal","cone",base+Vector3(0.03,1.05,0),Vector3(0.16,0.75,0.15),glow)
   if world_index==1:
    for link in range(3):
     var chain = Geo.part(self,"ChainLink","ring",base+Vector3(0.2,0.4+link*0.22,0.05),Vector3.ONE*0.18,gold)
     chain.rotation.x = PI/2 if link%2==0 else 0.0
 # A waterfall (or lava fall) reveals the cliff height at the front shore.
 var fall_color = Color("ec9453") if world_index==4 else Color("72b5c6")
 var shore = _shore(1.27)
 var fall_top = height_at(shore.x,shore.y)+0.04
 var fall_bottom = -1.68
 for strip in range(5):
  Geo.part(self,"LavaFall" if world_index==4 else "Waterfall","box",Vector3(shore.x+(strip-2)*0.085,(fall_top+fall_bottom)/2,shore.y+0.045),Vector3(0.09,fall_top-fall_bottom,0.055),Geo.material(fall_color.lightened((strip%2)*0.10),false,world_index==4))
 var spray = Geo.part(self,"WaterfallFoam","ring",Vector3(shore.x,-1.68,shore.y+0.13),Vector3(0.40,0.09,0.24),Geo.material(fall_color.lightened(0.20)))
 spray.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF

func set_progress(completed: Array,unlocked: Array[bool]) -> void:
 for index in range(6):
  var color = Color(palette.accent) if unlocked[index] else Color("5d6872")
  if completed.has(world_index*6+index): color = Color("f3d38a")
  mission_markers[index].material_override = Geo.material(color,false,unlocked[index])
