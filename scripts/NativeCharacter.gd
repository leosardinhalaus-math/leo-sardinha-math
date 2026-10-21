@tool
extends Node3D

const Geo = preload("res://scripts/NativeGeometry.gd")
@export_enum("slope","limit","power","sine","euler","chain","ln","implicit","rate","cauchy","taylor","newton","opt","area","ftc","cavalieri","fractal","sub","parts","trap","improper","continuity","quotient","secant","bernoulli","inverse","expchain","root","mirror","mean","growth","taylor2","miner","average","volume","surface","gabriel","cavalieri-advanced","surface-flux","parts2","simpson","compare","series","simpson-advanced","comparison")
var preview_key: String = "slope":
	set(value):
		preview_key = value
		if Engine.is_editor_hint() and is_inside_tree():
			call_deferred("_refresh_editor")

var profile: Dictionary = {}
var animation: AnimationPlayer
var rig: Node3D
var head: Node3D
var left_arm: Node3D
var right_arm: Node3D
var left_leg: Node3D
var right_leg: Node3D
var gear: Node3D
var cloth: Material
var gold: Material
var skin: Material
var hair: Material
var glow: Material
var steel: Material
var dark: Material
var pivots: Array[Node3D] = []

func _ready() -> void:
	if Engine.is_editor_hint():
		_refresh_editor()

func _refresh_editor() -> void:
	var data = JSON.parse_string(FileAccess.get_file_as_string("res://data/native_visuals.json"))
	if data is Dictionary and data.has(preview_key):
		configure({"key":preview_key,"visual":data[preview_key]})

func configure(card: Dictionary) -> void:
	for child in get_children():
		remove_child(child)
		child.queue_free()
	pivots.clear()
	left_arm = null
	right_arm = null
	left_leg = null
	right_leg = null
	profile = card.get("visual", {}).duplicate(true)
	name = "Character_" + str(card.get("key", "native"))
	set_meta("card_key", str(card.get("key", "")))
	set_meta("weapon", str(profile.get("weapon", "staff")))
	set_meta("native_godot_model", true)
	cloth = Geo.material(Color(profile.get("color", "#294975")))
	gold = Geo.material(Color(profile.get("trim", "#d4ac59")), true)
	skin = Geo.material(Color(profile.get("skin", "#e4b98f")))
	hair = Geo.material(Color(profile.get("hair", "#30251f")))
	glow = Geo.material(Color(profile.get("glow", "#8defff")), false, true)
	steel = Geo.material(Color("899aaa"), true)
	dark = Geo.material(Color("142032"))
	rig = Geo.pivot(self, "Rig", Vector3.ZERO)
	gear = Geo.pivot(rig, "Gear", Vector3.ZERO)
	pivots.append(rig)
	if profile.get("gender") == "relic":
		_relic()
	else:
		_humanoid()
	_weapons()
	_build_animations()
	var height = float(profile.get("height", 1.85))
	scale *= height / 1.85
	animation.play("idle")

func _p(parent: Node3D, label: String, kind: String, point: Vector3, dimensions: Vector3, mat: Material, detail: bool = false) -> MeshInstance3D:
	return Geo.part(parent, label, kind, point, dimensions, mat, detail)

func _humanoid() -> void:
	var outfit = str(profile.get("outfit", "robe"))
	var armored = outfit in ["armor", "stone"]
	var female = profile.get("gender") == "female"
	var broad = 1.35 if profile.get("gender") == "golem" else (0.9 if female else 1.0)
	var body = Geo.pivot(rig, "Body", Vector3(0, 1.03, 0))
	pivots.append(body)
	_p(body, "Torso", "sphere", Vector3(0, 0.12, 0), Vector3(0.29 * broad, 0.34, 0.19), steel if armored else cloth)
	_p(body, "Waist", "sphere", Vector3(0, -0.12, 0), Vector3(0.23 * broad, 0.18, 0.17), cloth)
	_p(body, "Breastplate", "sphere", Vector3(0, 0.16, -0.13), Vector3(0.25 * broad, 0.25, 0.10), cloth if armored else gold)
	_p(body, "Belt", "cylinder", Vector3(0, -0.12, 0), Vector3(0.25 * broad, 0.075, 0.19), gold)
	_p(body, "Buckle", "box", Vector3(0, -0.12, -0.20), Vector3(0.11, 0.11, 0.035), glow)
	if outfit in ["robe", "dress", "coat"]:
		_p(body, "CoatSkirt", "cone", Vector3(0, -0.28, 0), Vector3(0.38, 0.95, 0.27), cloth)
		_p(body, "VestFront", "box", Vector3(0, -0.1, -0.20), Vector3(0.075, 0.55, 0.025), gold)
	if profile.get("detail") in ["cape", "beard", "wings"] or outfit == "armor":
		var cape = _p(body, "Cape", "sphere", Vector3(0, -0.12, 0.24), Vector3(0.36, 0.56, 0.07), cloth)
		cape.rotation.x = -0.18
		_p(body, "CapeClasp", "sphere", Vector3(0, 0.27, -0.22), Vector3(0.07, 0.07, 0.035), glow)
	for side in [-1.0, 1.0]:
		var leg = Geo.pivot(rig, "LeftLeg" if side < 0 else "RightLeg", Vector3(side * 0.14, 0.64, 0))
		pivots.append(leg)
		_p(leg, "Leg", "sphere", Vector3(0, -0.18, 0), Vector3(0.11 * broad, 0.26, 0.115), dark)
		_p(leg, "Boot", "sphere", Vector3(0, -0.48, -0.035), Vector3(0.125 * broad, 0.17, 0.17), steel if armored else hair)
		_p(leg, "BootTrim", "cylinder", Vector3(0, -0.37, 0), Vector3(0.13 * broad, 0.06, 0.12), gold)
		var arm = Geo.pivot(body, "LeftArm" if side < 0 else "RightArm", Vector3(side * 0.30 * broad, 0.26, 0))
		pivots.append(arm)
		_p(arm, "UpperArm", "sphere", Vector3(0, -0.16, 0), Vector3(0.105 * broad, 0.23, 0.11), skin if outfit in ["leather", "dress"] else cloth)
		_p(arm, "Forearm", "sphere", Vector3(0, -0.43, -0.035), Vector3(0.10 * broad, 0.18, 0.11), steel if armored else cloth)
		_p(arm, "GauntletTrim", "cylinder", Vector3(0, -0.46, -0.035), Vector3(0.108 * broad, 0.065, 0.118), gold)
		_p(arm, "Hand", "sphere", Vector3(0, -0.58, -0.05), Vector3(0.10, 0.105, 0.09), steel if armored else skin)
		if armored:
			_p(arm, "Pauldron", "sphere", Vector3(side * 0.035, -0.015, 0), Vector3(0.18 * broad, 0.15, 0.21), gold if profile.get("gender") != "golem" else steel)
			_p(arm, "PauldronGem", "sphere", Vector3(side * 0.09, -0.02, -0.16), Vector3(0.06, 0.06, 0.035), glow)
		if side < 0:
			left_arm = arm
			left_leg = leg
		else:
			right_arm = arm
			right_leg = leg
	head = Geo.pivot(body, "Head", Vector3(0, 0.56, 0))
	pivots.append(head)
	_p(head, "Neck", "cylinder", Vector3(0, -0.20, 0), Vector3(0.10, 0.18, 0.10), skin)
	var helmet = profile.get("hair_style") == "helmet"
	_p(head, "Face", "sphere", Vector3.ZERO, Vector3(0.235, 0.28, 0.215), steel if helmet else skin)
	for side in [-1.0, 1.0]:
		_p(head, "Ear", "sphere", Vector3(side * 0.23, 0, 0), Vector3(0.055, 0.09, 0.055), skin, true)
		_p(head, "Eye", "sphere", Vector3(side * 0.085, 0.045, -0.194), Vector3(0.055, 0.035, 0.025), glow if helmet else Geo.material(Color("f7f0dc")), true)
		_p(head, "Pupil", "sphere", Vector3(side * 0.085, 0.045, -0.216), Vector3(0.024, 0.028, 0.012), dark, true)
		var brow = _p(head, "Brow", "box", Vector3(side * 0.085, 0.10, -0.19), Vector3(0.12, 0.025, 0.025), hair, true)
		brow.rotation.z = side * -0.1
	_p(head, "Nose", "sphere", Vector3(0, -0.01, -0.216), Vector3(0.039, 0.065, 0.04), skin, true)
	_p(head, "Mouth", "box", Vector3(0, -0.11, -0.195), Vector3(0.075, 0.015, 0.013), Geo.material(Color("8a5148")), true)
	_hair(helmet)
	if profile.get("detail") == "beard":
		_p(head, "Beard", "sphere", Vector3(0, -0.18, -0.12), Vector3(0.18, 0.21 if profile.get("hair_style") == "long" or profile.get("hair_style") == "hood" else 0.12, 0.14), hair)
	if profile.get("detail") in ["glasses", "goggles"]:
		for side in [-1.0, 1.0]:
			var ring = _p(head, "LensRim", "ring", Vector3(side * 0.11, 0.045 if profile.get("detail") == "glasses" else 0.23, -0.205), Vector3.ONE * 0.08, gold)
			ring.rotation.x = PI / 2
	if profile.get("detail") == "crown":
		_p(head, "Diadem", "cylinder", Vector3(0, 0.18, 0), Vector3(0.24, 0.045, 0.22), gold)
		_p(head, "DiademGem", "sphere", Vector3(0, 0.19, -0.23), Vector3(0.05, 0.08, 0.035), glow)
	if profile.get("detail") == "ruff":
		_p(head, "Ruff", "sphere", Vector3(0, -0.25, -0.09), Vector3(0.22, 0.1, 0.19), Geo.material(Color("e9e6dc")))
	if profile.get("detail") == "wings":
		for side in [-1.0, 1.0]:
			for feather in range(5):
				var wing = _p(body, "WingFeather", "sphere", Vector3(side * (0.36 + feather * 0.09), 0.24 - feather * 0.07, 0.18), Vector3(0.09, 0.37 - feather * 0.025, 0.045), Geo.material(Color("eee5ce")))
				wing.rotation.z = side * -0.7
	if profile.get("gender") == "golem":
		_p(body, "Core", "sphere", Vector3(0, 0.15, -0.23), Vector3(0.12, 0.15, 0.04), glow)
		for side in [-1.0, 1.0]:
			Geo.segment(body, "Crack", Vector3(0, 0.17, -0.24), Vector3(side * 0.25, -0.07, -0.19), 0.012, glow)

func _hair(helmet: bool) -> void:
	var style = str(profile.get("hair_style", "short"))
	if helmet:
		_p(head, "Visor", "box", Vector3(0, 0.06, -0.21), Vector3(0.40, 0.075, 0.04), dark)
		_p(head, "NoseGuard", "box", Vector3(0, -0.03, -0.24), Vector3(0.045, 0.24, 0.04), gold)
		_p(head, "HelmetCrest", "cone", Vector3(0, 0.28, 0), Vector3(0.13, 0.30, 0.13), cloth)
	elif style == "hood":
		_p(head, "HoodBack", "sphere", Vector3(0, 0.04, 0.07), Vector3(0.29, 0.33, 0.20), cloth)
		for side in [-1.0, 1.0]:
			_p(head, "HoodEdge", "sphere", Vector3(side * 0.235, 0.0, -0.07), Vector3(0.067, 0.3, 0.12), cloth)
		_p(head, "HoodPeak", "sphere", Vector3(0, 0.27, -0.05), Vector3(0.23, 0.09, 0.20), cloth)
	else:
		_p(head, "HairCap", "sphere", Vector3(0, 0.17, 0.015), Vector3(0.245, 0.16, 0.22), hair)
		for index in range(5):
			var lock = _p(head, "HairLock", "sphere", Vector3(-0.16 + index * 0.08, 0.18, -0.15), Vector3(0.08, 0.16 if index % 2 else 0.12, 0.055), hair)
			lock.rotation.z = 0.4
		if style == "long":
			for side in [-1.0, 1.0]:
				_p(head, "LongHair", "sphere", Vector3(side * 0.2, -0.15, 0.07), Vector3(0.09, 0.36, 0.13), hair)
		elif style == "ponytail":
			var tail = _p(head, "Ponytail", "sphere", Vector3(0, 0.23, 0.24), Vector3(0.12, 0.30, 0.12), hair)
			tail.rotation.x = -0.8
		elif style == "braid":
			for side in [-1.0, 1.0]:
				for index in range(4):
					_p(head, "Braid", "sphere", Vector3(side * 0.23, -0.02 - index * 0.10, 0.04), Vector3(0.07, 0.075, 0.08), hair)

func _ring(point: Vector3, radius: float, mat: Material, rotation_value: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var node = _p(gear, "ArcaneRing", "ring", point, Vector3.ONE * radius, mat)
	node.rotation = rotation_value
	return node

func _blade(point: Vector3, tint: Material, length: float = 0.68) -> void:
	var sword = Geo.pivot(gear, "Blade", point)
	_p(sword, "Grip", "cylinder", Vector3.ZERO, Vector3(0.035, 0.23, 0.035), hair)
	_p(sword, "Guard", "box", Vector3(0, 0.13, 0), Vector3(0.25, 0.045, 0.08), gold)
	var edge = _p(sword, "Edge", "cone", Vector3(0, 0.13 + length / 2, 0), Vector3(0.085, length, 0.022), tint)
	edge.rotation.x = 0.0
	sword.rotation.x = -0.6
	sword.rotation.z = -0.45 if point.x > 0 else 0.45

func _book(point: Vector3, open_book: bool = true) -> void:
	var book = Geo.pivot(gear, "Spellbook", point)
	book.rotation.x = -0.4
	_p(book, "Cover", "box", Vector3.ZERO, Vector3(0.48, 0.06, 0.33), cloth)
	_p(book, "Pages", "box", Vector3(0, 0.045, 0), Vector3(0.44, 0.04, 0.29), Geo.material(Color("f3dfb0")))
	if open_book:
		_p(book, "Spine", "box", Vector3(0, 0.075, 0), Vector3(0.025, 0.045, 0.30), gold)
		for line in range(3):
			_p(book, "Ink", "box", Vector3(0, 0.07, -0.09 + line * 0.075), Vector3(0.31, 0.006, 0.012), glow, true)

func _shield(point: Vector3) -> void:
	var shield = _p(gear, "Shield", "sphere", point, Vector3(0.30, 0.43, 0.09), gold)
	_p(gear, "ShieldFace", "sphere", point + Vector3(0, 0, -0.06), Vector3(0.25, 0.36, 0.06), cloth)
	Geo.segment(gear, "ShieldRune", point + Vector3(0, -0.22, -0.12), point + Vector3(0, 0.22, -0.12), 0.022, glow)
	shield.rotation.z = -0.1 if point.x < 0 else 0.1

func _relic() -> void:
	_p(rig, "Pedestal", "cylinder", Vector3(0, 0.17, 0), Vector3(0.37, 0.22, 0.37), dark)
	_p(rig, "PlinthTrim", "cylinder", Vector3(0, 0.3, 0), Vector3(0.4, 0.055, 0.4), gold)

func _weapons() -> void:
	var weapon = str(profile.get("weapon", "staff"))
	match weapon:
		"bow":
			var points: Array[Vector3] = []
			for i in range(13):
				var t = float(i) / 12 * PI
				points.append(Vector3(-0.48 - sin(t) * 0.20, 0.75 + cos(t) * 0.58, -0.36))
			Geo.curve(gear, points, 0.028, gold)
			Geo.segment(gear, "Bowstring", points.front(), points.back(), 0.009, glow)
			Geo.segment(gear, "Arrow", Vector3(-0.48, 0.75, 0.0), Vector3(-0.48, 0.75, -0.85), 0.012, gold)
			left_arm.rotation.x = 1.15
			right_arm.rotation.x = 0.85
		"shield_sword", "shield_pair", "sword":
			_shield(Vector3(-0.49, 1.0, -0.18))
			if weapon == "shield_pair":
				_shield(Vector3(0.49, 1.0, -0.18))
			else:
				_blade(Vector3(0.43, 0.76, -0.26), glow)
		"daggers", "twin_blades":
			_blade(Vector3(-0.43, 0.81, -0.24), glow, 0.45 if weapon == "daggers" else 0.8)
			_blade(Vector3(0.43, 0.81, -0.24), gold, 0.45 if weapon == "daggers" else 0.8)
		"staff", "staff_book", "halberd", "root_hammer", "pickaxe", "mirror_staff":
			Geo.segment(gear, "Shaft", Vector3(0.5, 0.12, -0.14), Vector3(0.5, 1.87, -0.14), 0.035, gold)
			if weapon in ["root_hammer", "pickaxe", "halberd"]:
				_p(gear, "ToolHead", "box", Vector3(0.5, 1.70, -0.14), Vector3(0.63, 0.20 if weapon == "root_hammer" else 0.08, 0.19), glow if weapon != "halberd" else steel)
			elif weapon == "mirror_staff":
				_ring(Vector3(0.5, 1.80, -0.14), 0.27, gold, Vector3(PI/2, 0, 0)).scale.y *= 1.3
			else:
				_p(gear, "StaffGem", "sphere", Vector3(0.5, 1.89, -0.14), Vector3(0.16, 0.22, 0.16), glow)
				_ring(Vector3(0.5, 1.89, -0.14), 0.25, gold, Vector3(PI/2, 0, 0))
			if weapon == "staff_book":
				_book(Vector3(-0.4, 1.02, -0.28))
		"book", "scroll", "wave_plot", "navigation", "twin_persona":
			_book(Vector3(0, 0.94, -0.4))
			if weapon in ["wave_plot", "navigation"]:
				var points: Array[Vector3] = []
				for i in range(17):
					var x = -0.5 + i / 16.0
					points.append(Vector3(x, 1.05 + sin(x * 5) * 0.22, -0.43))
				Geo.curve(gear, points, 0.018, glow)
			if weapon == "twin_persona":
				var echo = _p(gear, "SecondPersona", "sphere", Vector3(-0.34, 1.61, 0.22), Vector3(0.2, 0.26, 0.2), cloth)
				echo.rotation.y = PI
		"clock", "scales", "simpson_rig", "wireframe":
			if weapon == "clock":
				_ring(Vector3(-0.39, 0.94, -0.2), 0.30, gold, Vector3(PI/2, 0, 0))
				_p(gear, "ClockFace", "sphere", Vector3(-0.39, 0.94, -0.19), Vector3(0.27, 0.27, 0.025), Geo.material(Color("f0d398")))
				Geo.segment(gear, "ClockHand", Vector3(-0.39,0.94,-0.23), Vector3(-0.39,1.13,-0.23),0.013,dark)
				Geo.segment(gear, "ClockHand", Vector3(-0.39,0.94,-0.23), Vector3(-0.22,0.88,-0.23),0.012,dark)
			else:
				Geo.segment(gear,"Beam",Vector3(-0.48,1.35,-0.34),Vector3(0.48,1.35,-0.34),0.02,gold)
				for side in [-1.0,1.0]:
					Geo.segment(gear,"Hanger",Vector3(side*0.43,1.35,-0.34),Vector3(side*0.43,0.97,-0.34),0.011,gold)
					_p(gear,"Pan", "cylinder",Vector3(side*0.43,0.96,-0.34),Vector3(0.17,0.03,0.17),gold)
					_p(gear,"Sample", "sphere",Vector3(side*0.43,1.06,-0.34),Vector3.ONE*0.09,glow)
				if weapon == "wireframe":
					Geo.segment(gear,"Trapezoid",Vector3(-0.48,0.96,-0.34),Vector3(0.48,0.96,-0.34),0.013,glow)
				if weapon == "simpson_rig":
					_p(gear,"ThirdSample", "sphere",Vector3(0,1.23,-0.34),Vector3.ONE*0.10,glow)
		"trumpet":
			Geo.segment(gear,"HornTube",Vector3(0.1,1.51,-0.18),Vector3(0.1,1.51,-0.90),0.045,gold)
			var bell = _p(gear,"HornBell","cone",Vector3(0.1,1.51,-0.94),Vector3(0.22,0.30,0.22),gold)
			bell.rotation.x = -PI/2
			_ring(Vector3(0.1,1.51,-1.08),0.22,glow,Vector3(PI/2,0,0))
		"fists":
			for side in [-1.0,1.0]:
				_p(gear,"StoneFist","sphere",Vector3(side*0.47,0.79,-0.15),Vector3(0.19,0.19,0.20),steel)
		"gesture":
			_p(gear,"RootSpark","sphere",Vector3(0.47,1.21,-0.31),Vector3.ONE*0.1,glow)
		_:
			_arcana(weapon)

func _arcana(weapon: String) -> void:
	var center = Vector3(0, 1.10, -0.34)
	if weapon == "seed":
		_p(gear,"EmeraldCore","sphere",center,Vector3(0.23,0.36,0.23),glow)
		for index in range(7):
			var angle = index * TAU / 7.0
			var leaf = _p(gear,"CrystalLeaf","sphere",center+Vector3(cos(angle)*0.23,-0.2,sin(angle)*0.23),Vector3(0.12,0.40,0.10),cloth)
			leaf.rotation.z = cos(angle) * -0.8
	elif weapon in ["ribbons","flow_orb"]:
		for ribbon in range(3):
			var points: Array[Vector3] = []
			for index in range(25):
				var phase = index*TAU/24
				points.append(center+Vector3(cos(phase)*(0.44+ribbon*0.06),sin(phase*2+ribbon)*0.20+(ribbon-1)*0.18,sin(phase)*0.3))
			Geo.curve(gear,points,0.016,glow)
	elif weapon == "orbs":
		for side in [-1.0,1.0]:
			_p(gear,"ComparisonOrb","sphere",center+Vector3(side*0.38,0,0),Vector3.ONE*0.17,glow if side<0 else gold)
			_ring(center+Vector3(side*0.38,0,0),0.23,gold,Vector3(PI/2,0,0))
	elif weapon == "mirror":
		var frame = _ring(center,0.62,gold,Vector3(PI/2,0,0))
		frame.scale.z *= 1.32
		_p(gear,"MirrorGlass","sphere",center,Vector3(0.51,0.71,0.045),Geo.material(Color("5eb8dc"),true,true))
		_p(gear,"MirrorJewel","sphere",center+Vector3(0,-0.69,0),Vector3(0.12,0.20,0.08),glow)
	elif weapon in ["helix", "chain"]:
		for i in range(5):
			_ring(center+Vector3((i-2)*0.19,(i-2)*0.12,0),0.19,gold,Vector3(PI/2,0,i*0.65))
			_p(gear,"LinkCore","sphere",center+Vector3((i-2)*0.19,(i-2)*0.12,0),Vector3.ONE*0.06,glow)
	elif weapon == "orrery" or weapon == "compass":
		_p(gear,"ArcaneCore","sphere",center,Vector3.ONE*0.22,glow)
		for index in range(3):
			_ring(center,0.48+index*0.04,gold,Vector3(index*0.8,0,index*0.6))
		if weapon == "compass":
			for index in range(4):
				var point = _p(gear,"CompassPoint","cone",center,Vector3(0.10,0.85,0.08),cloth)
				point.rotation.z = index * PI/2
	elif weapon == "sections":
		for side in [-1.0,1.0]:
			for level in range(4):
				_ring(Vector3(side*0.46,0.98+level*0.12,-0.3),0.20+level*0.02,glow)
	elif weapon == "flasks":
		for side in [-1.0,1.0]:
			_p(gear,"Flask","sphere",Vector3(side*0.46,0.99,-0.3),Vector3(0.16,0.20,0.16),glow if side<0 else Geo.material(Color("65b8ef"),false,true))
			_p(gear,"FlaskNeck","cylinder",Vector3(side*0.46,1.19,-0.3),Vector3(0.055,0.18,0.055),gold)
	else:
		var orb = _p(gear,"SpellCore","sphere",center,Vector3.ONE*0.22,glow)
		if weapon == "barrier":
			orb.scale = Vector3(0.53,0.68,0.06)
			orb.material_override = Geo.material(Color(Color(profile.glow),0.22),false,true)
		for index in range(3):
			_ring(center,0.36+index*0.08,glow,Vector3(0.3+index*0.5,0.2,index*0.4))

func _track(clip: Animation, node: Node3D, property: String, values: Array, duration: float) -> void:
	var path = NodePath(str(get_path_to(node)) + ":" + property)
	var previous = clip.find_track(path, Animation.TYPE_VALUE)
	if previous >= 0:
		clip.remove_track(previous)
	var index = clip.add_track(Animation.TYPE_VALUE)
	clip.track_set_path(index, path)
	for key in range(values.size()):
		clip.track_insert_key(index, duration * key / maxf(1, values.size()-1), values[key])

func _build_animations() -> void:
	animation = AnimationPlayer.new()
	animation.name = "AnimationPlayer"
	add_child(animation)
	var library = AnimationLibrary.new()
	for state in ["idle","walk","run","jump","summon","attack","power","hurt","victory","defeat"]:
		var clip = Animation.new()
		clip.length = 1.6 if state == "idle" else (0.75 if state in ["walk","run"] else 0.6)
		clip.loop_mode = Animation.LOOP_LINEAR if state in ["idle","walk","run"] else Animation.LOOP_NONE
		# Reset all animated pivots on each state; blends never leave limbs in the previous attack pose.
		for pivot in pivots:
			_track(clip,pivot,"rotation",[pivot.rotation,pivot.rotation],clip.length)
		_track(clip,rig,"scale",[Vector3.ONE,Vector3.ONE],clip.length)
		var base_y = 0.08 if profile.get("gender") == "relic" else 0.0
		_track(clip,rig,"position",[Vector3(0,base_y,0),Vector3(0,base_y,0)],clip.length)
		match state:
			"idle": _track(clip,rig,"position",[Vector3(0,base_y,0),Vector3(0,base_y+0.035,0),Vector3(0,base_y,0)],clip.length)
			"walk", "run":
				_track(clip,rig,"position",[Vector3(0,base_y,0),Vector3(0,base_y+0.06,0),Vector3(0,base_y,0)],clip.length)
				if left_leg:
					_track(clip,left_leg,"rotation",[Vector3(0.52,0,0),Vector3(-0.52,0,0),Vector3(0.52,0,0)],clip.length)
					_track(clip,right_leg,"rotation",[Vector3(-0.52,0,0),Vector3(0.52,0,0),Vector3(-0.52,0,0)],clip.length)
					_track(clip,left_arm,"rotation",[left_arm.rotation+Vector3(-0.22,0,0),left_arm.rotation+Vector3(0.22,0,0),left_arm.rotation+Vector3(-0.22,0,0)],clip.length)
					_track(clip,right_arm,"rotation",[right_arm.rotation+Vector3(0.22,0,0),right_arm.rotation+Vector3(-0.22,0,0),right_arm.rotation+Vector3(0.22,0,0)],clip.length)
			"summon", "jump":
				_track(clip,rig,"position",[Vector3(0,-0.1,0),Vector3(0,0.45,0),Vector3(0,base_y,0)],clip.length)
				_track(clip,rig,"scale",[Vector3(0.8,1.1,0.8),Vector3(1.1,0.9,1.1),Vector3.ONE],clip.length)
			"attack", "power":
				_track(clip,rig,"position",[Vector3(0,base_y,0),Vector3(0,base_y,-0.12),Vector3(0,base_y,0)],clip.length)
				_track(clip,rig,"rotation",[Vector3(0,-0.16,0),Vector3(0,0.20,0),Vector3.ZERO],clip.length)
				if right_arm:
					_track(clip,right_arm,"rotation",[right_arm.rotation,Vector3(1.55,0,-0.2),right_arm.rotation],clip.length)
			"hurt": _track(clip,rig,"rotation",[Vector3.ZERO,Vector3(-0.18,0,0),Vector3.ZERO],clip.length)
			"victory":
				_track(clip,rig,"position",[Vector3.ZERO,Vector3(0,0.2,0),Vector3.ZERO],clip.length)
				if left_arm: _track(clip,left_arm,"rotation",[left_arm.rotation,Vector3(0,0,2.5),left_arm.rotation],clip.length)
			"defeat": _track(clip,rig,"rotation",[Vector3.ZERO,Vector3(0,0,1.5)],clip.length)
		library.add_animation(state,clip)
	animation.add_animation_library("",library)
