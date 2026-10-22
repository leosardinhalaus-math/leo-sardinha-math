@tool
extends Node3D

const Geo = preload("res://scripts/NativeGeometry.gd")
const HALF_WIDTH = 6.15
const HALF_LENGTH = 9.15
const RIVER_EDGE = 0.92
const BRIDGE_X = 3.0
const BRIDGE_HALF_WIDTH = 0.63
const THEMES = [
	{"name":"Cidadela da Derivada", "stone":"27364d", "floor":"36475f", "accent":"78cbe5", "water":"184b71", "banner":"234a78", "motif":"crystal"},
	{"name":"Fortaleza da Cadeia", "stone":"362e49", "floor":"51405e", "accent":"bc8df2", "water":"30295b", "banner":"634084", "motif":"chain"},
	{"name":"Observatório Dourado", "stone":"323944", "floor":"5a5141", "accent":"e3bd6b", "water":"204c64", "banner":"233d60", "motif":"orrery"},
	{"name":"Jardim da Integral", "stone":"28463e", "floor":"426052", "accent":"81dbb1", "water":"145668", "banner":"1d6854", "motif":"tree"},
	{"name":"Forja da Antiderivada", "stone":"382f3a", "floor":"4d3b43", "accent":"e8b064", "water":"702f34", "banner":"682f50", "motif":"flame"}
]
@export_range(0,4) var preview_world = 0:
	set(value):
		preview_world = value
		if Engine.is_editor_hint() and is_inside_tree():
			call_deferred("_refresh_editor")

func _ready() -> void:
	if Engine.is_editor_hint(): _refresh_editor()

func _refresh_editor() -> void:
	for child in get_children():
		remove_child(child)
		child.queue_free()
	obstacles.clear()
	build(preview_world,0)

var theme: Dictionary
var obstacles: Array = []

func build(world_index: int, stage_index: int) -> void:
	name = "NativeArena"
	theme = THEMES[clampi(world_index,0,4)]
	set_meta("theme_name",theme.name)
	var floor_mat = Geo.material(Color(theme.floor))
	var stone = Geo.material(Color(theme.stone))
	var trim = Geo.material(Color("a1895d"),true)
	var accent = Geo.material(Color(theme.accent),false,true)
	var water = Geo.material(Color(theme.water),true)
	Geo.part(self,"FloatingFoundation","box",Vector3(0,-0.66,0),Vector3(14.2,1.2,20.3),stone)
	# Keep the river channel open: a single floor slab would conceal the water.
	for side in [-1.0,1.0]:
		Geo.part(self,"BattleFloor","box",Vector3(0,-0.08,side*5.285),Vector3(13.2,0.14,8.73),floor_mat)
	Geo.part(self,"River","box",Vector3(0,-0.035,0),Vector3(13.1,0.035,RIVER_EDGE*2),water)
	_floor_details(stage_index,stone,trim,accent)
	# Thin inlaid tiles replace the old white road strips.
	for lane_x in [-3.0,3.0]:
		for index in range(18):
			var z = -8.5 + index
			if absf(z) < 1.0: continue
			Geo.part(self,"PathTile","box",Vector3(lane_x,0.008,z),Vector3(1.25,0.025,0.91),Geo.material(Color(theme.floor).lightened(0.06 if index%2 else 0.11)))
		_bridge(lane_x,stone,trim,accent)
	for side in [-1.0,1.0]:
		Geo.part(self,"OuterCoping","box",Vector3(side*6.73,0.13,0),Vector3(0.27,0.37,20.1),stone)
		Geo.part(self,"GoldInlay","box",Vector3(side*6.73,0.33,0),Vector3(0.28,0.04,20.15),trim)
		Geo.part(self,"BackCoping","box",Vector3(0,0.12,side*9.94),Vector3(13.5,0.35,0.28),stone)
		for z in [-8.5,-4.5,4.5,8.5]:
			_pillar(Vector3(side*6.7,0,z),stone,trim,accent)
		for z in [-6.5,6.5]:
			Geo.part(self,"BannerPole","cylinder",Vector3(side*6.45,1.6,z),Vector3(0.025,2.4,0.025),trim)
			Geo.part(self,"Banner","box",Vector3(side*6.22,2.10,z),Vector3(0.48,0.72,0.025),Geo.material(Color(theme.banner)))
			Geo.part(self,"BannerRune","box",Vector3(side*6.22,2.10,z-0.02),Vector3(0.04,0.40,0.025),accent)
		for index in range(3):
			_decoration(Vector3(side*5.6,0,-7.5+index*7.5),str(theme.motif),stone,trim,accent)
	# Team boundaries and a central mathematical seal are actual geometry.
	for side in [-1.0,1.0]:
		Geo.part(self,"TerritoryLine","box",Vector3(0,0.014,side*1.02),Vector3(12.2,0.02,0.035),Geo.material(Color("57abac") if side>0 else Color("ad657d")))
		var seal = Geo.part(self,"KingSeal","ring",Vector3(0,0.017,side*7.0),Vector3(1.15,0.035,1.15),trim)
		seal.rotation.y = stage_index * 0.13
		Geo.part(self,"RearRune","box",Vector3(0,0.018,side*8.85),Vector3(0.05,0.02,0.35),accent)

func _floor_details(stage_index: int, stone: Material, trim: Material, accent: Material) -> void:
	# Repeated floor geometry is batched, keeping draw calls independent of tile count.
	for tint in range(3):
		var slabs: Array[Transform3D] = []
		for x in range(-6,7):
			for z in range(-9,10):
				if abs(z)<2 or (abs(x*7+z*11)%3)!=tint: continue
				slabs.append(Transform3D(Basis.from_scale(Vector3(0.94,0.018,0.94)),Vector3(x,0.003,z)))
		Geo.instances(self,"Flagstones%d"%tint,"box",slabs,Geo.material(Color(theme.floor).lightened(0.015+tint*0.022)))
	# A stepped foundation, ribbed banks and horizontal river filaments give depth.
	Geo.part(self,"FoundationCornice","box",Vector3(0,-0.22,0),Vector3(14.3,0.12,20.4),trim)
	Geo.part(self,"LowerFoundation","box",Vector3(0,-1.20,0),Vector3(13.4,0.25,19.5),stone)
	var ripples: Array[Transform3D] = []
	for index in range(23):
		var x = -6.0+index*0.54
		if abs(abs(x)-3.0)<1.0: continue
		var z = sin(index*2.7)*0.52
		ripples.append(Transform3D(Basis.from_scale(Vector3(0.28+index%3*0.10,0.012,0.018)),Vector3(x,-0.015,z)))
	Geo.instances(self,"RiverFilaments","box",ripples,Geo.material(Color(theme.water).lightened(0.20)))
	for side in [-1.0,1.0]:
		# Mosaics sit flush on the floor, so placement and walking stay unobstructed.
		var center = Vector3(0,0.03,side*4.0)
		Geo.part(self,"MosaicRim","ring",center,Vector3(1.25,0.018,1.25),trim)
		Geo.part(self,"MosaicInnerRim","ring",center,Vector3(1.12,0.018,1.12),Geo.material(Color(theme.floor).lightened(0.12)))
		var curve: Array[Vector3] = []
		for index in range(17):
			var t = index/16.0
			curve.append(center+Vector3(sin(t*TAU)*0.25,0.0,(t-0.5)*1.45))
		Geo.curve(self,curve,0.014,trim)
		for i in range(8):
			var angle = i*TAU/8+stage_index*0.1
			Geo.part(self,"MosaicStud","cylinder",center+Vector3(cos(angle)*1.18,0,sin(angle)*1.18),Vector3(0.026,0.015,0.026),accent)
		for x in [-1.0,1.0]:
			var point = Vector3(x*6.78,0,side*9.55)
			Geo.loft(self,"CornerSpire",point,[Vector3(0.24,0,0.24),Vector3(0.21,0.65,0.21),Vector3(0.13,0.85,0.13)],stone,8)
			Geo.part(self,"SpireCap","cone",point+Vector3(0,1.05,0),Vector3(0.24,0.42,0.24),Geo.material(Color(theme.banner)))
	# Island-specific floor inlays reinforce the five native environments.
	if theme.motif == "tree":
		for side in [-1.0,1.0]:
			for z in [-8.0,-5.0,5.0,8.0]:
				Geo.part(self,"GardenBed","box",Vector3(side*4.8,0.01,z),Vector3(0.8,0.025,1.6),Geo.material(Color("305340")))
				for leaf in range(3):
					Geo.part(self,"GardenLeaf","sphere",Vector3(side*4.8,0.04,z-0.5+leaf*0.5),Vector3(0.17,0.025,0.24),Geo.material(Color("477857")))
	elif theme.motif == "orrery":
		for side in [-1.0,1.0]:
			for z in [-6.0,6.0]:
				Geo.part(self,"CelestialDial","ring",Vector3(side*4.5,0.032,z),Vector3(0.58,0.017,0.58),trim)
				for rotation_index in range(4):
					var spoke = Geo.part(self,"DialSpoke","box",Vector3(side*4.5,0.034,z),Vector3(0.035,0.015,1.1),trim)
					spoke.rotation.y = rotation_index*PI/4
	elif theme.motif == "flame":
		for side in [-1.0,1.0]:
			for z in [-8.0,-6.0,-4.0,4.0,6.0,8.0]:
				Geo.part(self,"ForgeInlay","box",Vector3(side*4.8,0.026,z),Vector3(0.55,0.018,0.035),accent)
	elif theme.motif == "chain":
		var links: Array[Transform3D] = []
		for side in [-1.0,1.0]:
			for z in range(-8,9):
				if abs(z)<2: continue
				links.append(Transform3D(Basis.from_scale(Vector3(0.17,0.015,0.29)),Vector3(side*4.7,0.025,z)))
		Geo.instances(self,"ChainInlays","ring",links,trim)

func _bridge(x: float, stone: Material, trim: Material, accent: Material) -> void:
	var bridge = Geo.pivot(self,"StoneBridge",Vector3(0,-0.21,0))
	Geo.part(bridge,"BridgeArch","box",Vector3(x,0.08,0),Vector3(1.9,0.20,2.1),stone)
	for step in range(5):
		Geo.part(bridge,"BridgePaving","box",Vector3(x,0.195,-0.85+step*0.42),Vector3(1.6,0.035,0.38),trim)
	for side in [-1.0,1.0]:
		for end in [-1.0,1.0]:
			Geo.part(bridge,"BridgePost","box",Vector3(x+side*0.85,0.48,end*0.85),Vector3(0.15,0.65,0.15),stone)
			Geo.part(bridge,"BridgeCrystal","sphere",Vector3(x+side*0.85,0.85,end*0.85),Vector3(0.08,0.12,0.08),accent)
		Geo.part(bridge,"BridgeRail","box",Vector3(x+side*0.85,0.60,0),Vector3(0.07,0.075,1.8),trim)

func _pillar(point: Vector3, stone: Material, trim: Material, accent: Material) -> void:
	Geo.part(self,"Buttress","box",point+Vector3(0,0.47,0),Vector3(0.51,0.95,0.51),stone)
	Geo.part(self,"PillarCap","box",point+Vector3(0,0.98,0),Vector3(0.63,0.10,0.63),trim)
	Geo.part(self,"Lantern","sphere",point+Vector3(0,1.16,0),Vector3(0.12,0.18,0.12),accent)

func _decoration(point: Vector3, motif: String, stone: Material, trim: Material, accent: Material) -> void:
	obstacles.append({"point":point,"radius":0.50})
	Geo.part(self,"DisplayPlinth","cylinder",point+Vector3(0,0.14,0),Vector3(0.38,0.28,0.38),stone)
	match motif:
		"tree":
			Geo.part(self,"Trunk","cylinder",point+Vector3(0,0.64,0),Vector3(0.1,1.0,0.1),trim)
			for side in [-1.0,1.0]:
				Geo.part(self,"Leaves","sphere",point+Vector3(side*0.14,1.1,0),Vector3(0.31,0.41,0.30),Geo.material(Color("285a46")))
		"orrery", "chain":
			for index in range(3):
				var ring = Geo.part(self,"CelestialRing","ring",point+Vector3(0,0.85+index*0.15,0),Vector3.ONE*(0.31 if motif=="orrery" else 0.23),trim)
				ring.rotation = Vector3(index*0.7,0,index*0.9)
			Geo.part(self,"OrbCore","sphere",point+Vector3(0,0.97,0),Vector3.ONE*0.12,accent)
		_:
			var gem = Geo.part(self,"Crystal","cone",point+Vector3(0,0.90,0),Vector3(0.25,1.0,0.25),accent)
			gem.rotation.z = 0.1
			if motif == "flame":
				Geo.part(self,"Brazier","sphere",point+Vector3(0,0.47,0),Vector3(0.37,0.12,0.37),trim)

func tower(team: int, king: bool) -> Node3D:
	var root = Node3D.new()
	root.name = "KingCitadel" if king else "SentinelTower"
	var stone = Geo.material(Color("41546c") if team==0 else Color("5a4054"))
	var gold = Geo.material(Color("c8a65a"),true)
	var banner = Geo.material(Color("24557e") if team==0 else Color("7d304c"))
	var light = Geo.material(Color("6be6e8") if team==0 else Color("ee8daa"),false,true)
	var width = 0.69 if king else 0.49
	var height = 1.7 if king else 1.24
	Geo.part(root,"Foundation","cylinder",Vector3(0,0.13,0),Vector3(width+0.16,0.26,width+0.16),stone)
	Geo.part(root,"Keep","cylinder",Vector3(0,height/2,0),Vector3(width,height,width),stone)
	for y in [0.25,height*0.62,height]:
		Geo.part(root,"MasonryBand","cylinder",Vector3(0,y,0),Vector3(width+0.04,0.09,width+0.04),gold)
	for index in range(6):
		var angle = index*TAU/6
		Geo.part(root,"Battlement","box",Vector3(cos(angle)*width,height+0.13,sin(angle)*width),Vector3(0.21,0.27,0.22),stone)
	Geo.part(root,"Roof","cone",Vector3(0,height+0.24,0),Vector3(width*0.82,0.60,width*0.82),banner)
	Geo.part(root,"CrownCrystal","sphere",Vector3(0,height+0.60,0),Vector3(0.14,0.19,0.14),light)
	for direction in [-1.0,1.0]:
		Geo.part(root,"Window","box",Vector3(direction*0.27,height*0.62,-width+0.01),Vector3(0.11,0.28,0.04),light)
	Geo.part(root,"Gate","sphere",Vector3(0,0.42,-width+0.02),Vector3(0.19,0.34,0.04),Geo.material(Color("121c2b")))
	Geo.part(root,"HeraldicBanner","box",Vector3(0,height*0.71,width+0.015),Vector3(0.37,0.52,0.035),banner)
	Geo.part(root,"HeraldicRune","box",Vector3(0,height*0.71,width+0.04),Vector3(0.045,0.28,0.025),gold)
	root.rotation.y = 0.0 if team == 0 else PI
	return root
