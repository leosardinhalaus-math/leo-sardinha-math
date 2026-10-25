@tool
extends Node3D

const Geo = preload("res://scripts/NativeGeometry.gd")
const Motion = preload("res://scripts/NativeMotion.gd")
signal strike
@export_enum("slope","limit","power","sine","euler","chain","ln","implicit","rate","cauchy","taylor","newton","opt","area","ftc","cavalieri","fractal","sub","parts","trap","improper","continuity","quotient","secant","bernoulli","inverse","expchain","root","mirror","mean","growth","taylor2","miner","average","volume","surface","gabriel","cavalieri-advanced","surface-flux","parts2","simpson","compare","series","simpson-advanced","comparison")
var preview_key: String = "slope":
	set(value):
		preview_key = value
		if Engine.is_editor_hint() and is_inside_tree():
			call_deferred("_refresh_editor")

var profile: Dictionary = {}
var animation: AnimationPlayer
var rig: Node3D
var body: Node3D
var head: Node3D
var left_elbow: Node3D
var right_elbow: Node3D
var left_wrist: Node3D
var right_wrist: Node3D
var left_knee: Node3D
var right_knee: Node3D
var left_foot: Node3D
var right_foot: Node3D
var follow_parts: Array = []
var motion_profile: Dictionary = {}
var bow_links: Dictionary = {}
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
	follow_parts.clear()
	bow_links.clear()
	body = null
	head = null
	left_elbow = null
	right_elbow = null
	left_wrist = null
	right_wrist = null
	left_knee = null
	right_knee = null
	left_foot = null
	right_foot = null
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
	hair = Geo.material(Color(profile.get("hair", "#30251f")).darkened(0.06))
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
	_bind_equipment()
	_articulate()
	Motion.build(self,card)
	var height = float(profile.get("height", 1.85))
	scale = Vector3.ONE * height / 1.85
	animation.play("idle")

func _p(parent: Node3D, label: String, kind: String, point: Vector3, dimensions: Vector3, mat: Material, detail: bool = false) -> MeshInstance3D:
	var node = Geo.part(parent, label, kind, point, dimensions, mat, detail)
	node.set_meta("motion_piece",label)
	return node

func _humanoid() -> void:
	var outfit = str(profile.get("outfit", "robe"))
	var armored = outfit in ["armor", "stone"]
	var golem = profile.get("gender") == "golem"
	var female = profile.get("gender") == "female"
	var broad = 1.48 if golem else (0.9 if female else 1.0)
	body = Geo.pivot(rig, "Body", Vector3(0, 1.03, 0))
	pivots.append(body)
	var shell = steel if armored else cloth
	if armored and str(get_meta("card_key")) not in ["limit","cauchy","comparison","implicit"]: shell = Geo.material(Color(profile.get("color","#294975")).lightened(0.08),true)
	if str(get_meta("card_key")) == "ftc": shell = gold
	var leather = Geo.material(Color("342c36"))
	if outfit == "leather":
		# O corpete da Arqueira é azul-escuro nas cartas; a capa e as ombreiras ficam rubras.
		shell = Geo.material(Color("20324a")) if str(get_meta("card_key")) == "slope" else leather
	Geo.loft(body,"TailoredTorso",Vector3.ZERO,[Vector3(0.21*broad,-0.16,0.145),Vector3(0.22*broad,0.02,0.16),Vector3(0.30*broad,0.27,0.19),Vector3(0.23*broad,0.37,0.15)],shell)
	Geo.loft(body,"Belt",Vector3.ZERO,[Vector3(0.23*broad,-0.16,0.17),Vector3(0.235*broad,-0.09,0.17)],leather)
	_p(body,"Buckle","box",Vector3(0,-0.12,-0.176),Vector3(0.095,0.085,0.032),gold)
	_p(body,"BuckleInset","box",Vector3(0,-0.12,-0.197),Vector3(0.052,0.039,0.018),glow,true)
	# Clothing has its own cut: separate coat tails, pleated robes and fitted leather.
	if outfit in ["robe","dress"]:
		Geo.pleated_robe(body,cloth)
		for side in [-1.0,1.0]:
			Geo.segment(body,"EmbroideredHem",Vector3(side*0.09,-0.18,-0.17),Vector3(side*0.20,-0.87,-0.27),0.009,gold)
			Geo.panel(body,"Collar",Vector3(0,0,-0.18),PackedVector2Array([Vector2(side*0.08,0.35),Vector2(side*0.22,0.29),Vector2(side*0.06,-0.06)]),0.025,gold)
	elif outfit == "coat":
		_p(body,"Waistcoat","box",Vector3(0,0.10,-0.175),Vector3(0.18,0.36,0.03),Geo.material(Color("d8c7a4")))
		for side in [-1.0,1.0]:
			Geo.panel(body,"CoatTail",Vector3(side*0.07,0,0.12),PackedVector2Array([Vector2(side*0.08,-0.12),Vector2(side*0.21,-0.12),Vector2(side*0.32,-0.76),Vector2(side*0.07,-0.67)]),0.08,cloth).set_meta("motion_piece","CoatTail")
			Geo.panel(body,"Lapel",Vector3(0,0,-0.20),PackedVector2Array([Vector2(side*0.08,0.35),Vector2(side*0.24,0.27),Vector2(side*0.09,-0.01),Vector2(side*0.04,0.15)]),0.025,cloth)
		for index in range(3): _p(body,"CoatButton","sphere",Vector3(0,0.23-index*0.09,-0.20),Vector3.ONE*0.016,gold,true)
	elif armored:
		Geo.loft(body,"Cuirass",Vector3(0,0,-0.035),[Vector3(0.22*broad,-0.06,0.16),Vector3(0.30*broad,0.21,0.185),Vector3(0.25*broad,0.32,0.17)],shell,8)
		for side in [-1.0,1.0]:
			Geo.panel(body,"Tasset",Vector3(side*0.12*broad,-0.22,-0.12),PackedVector2Array([Vector2(-0.10,0.06),Vector2(0.10,0.06),Vector2(0.12,-0.21),Vector2(0,-0.25),Vector2(-0.12,-0.21)]),0.065,shell)
			Geo.segment(body,"CuirassRidge",Vector3(side*0.22*broad,0.28,-0.17),Vector3(0,0.10,-0.23),0.013,gold)
	else:
		for side in [-1.0,1.0]:
			Geo.panel(body,"RedLeatherPanel",Vector3(0,0,-0.18),PackedVector2Array([Vector2(side*0.08,-0.08),Vector2(side*0.21,-0.05),Vector2(side*0.29,0.28),Vector2(side*0.18,0.35)]),0.035,cloth)
		Geo.segment(body,"LeatherStrap",Vector3(-0.21,0.32,-0.19),Vector3(0.17,-0.06,-0.18),0.025,gold)
		if str(get_meta("card_key")) == "slope":
			for side in [-1.0,1.0]:
				Geo.segment(body,"SlopeGoldCorsetPiping",Vector3(side*0.19,0.34,-0.20),Vector3(side*0.15,-0.14,-0.20),0.013,gold)
				_p(body,"SlopeCapeClasp","sphere",Vector3(side*0.22,0.28,-0.20),Vector3(0.045,0.035,0.03),gold,true)
	if profile.get("detail") in ["cape","beard","wings"] or outfit == "armor":
		var cape_mat = Geo.material(Color("e4e0ce")) if str(get_meta("card_key")) == "area" else cloth
		Geo.panel(body,"CutCape",Vector3(0,0,0.22),PackedVector2Array([Vector2(-0.24,0.29),Vector2(0.24,0.29),Vector2(0.36,-0.51),Vector2(0.22,-0.63),Vector2(0,-0.55),Vector2(-0.22,-0.63),Vector2(-0.36,-0.51)]),0.045,cape_mat).rotation.x = -0.18
		_p(body,"CapeClasp","sphere",Vector3(0,0.28,-0.20),Vector3(0.045,0.045,0.025),gold)
	for side in [-1.0,1.0]:
		var leg = Geo.pivot(rig,"LeftLeg" if side<0 else "RightLeg",Vector3(side*0.135*broad,0.66,0))
		pivots.append(leg)
		Geo.loft(leg,"TrouserLeg",Vector3.ZERO,[Vector3(0.076*broad,-0.37,0.08),Vector3(0.09*broad,-0.17,0.105),Vector3(0.105*broad,0.02,0.12)],dark)
		Geo.loft(leg,"BootShaft",Vector3.ZERO,[Vector3(0.085*broad,-0.56,0.09),Vector3(0.09*broad,-0.31,0.095)],shell if armored else leather)
		Geo.loft(leg,"BootToe",Vector3(0,-0.575,-0.05),[Vector3(0.09*broad,-0.06,0.13),Vector3(0.095*broad,0.015,0.135),Vector3(0.07*broad,0.06,0.105)],shell if armored else leather,12)
		_p(leg,"Sole","box",Vector3(0,-0.635,-0.05),Vector3(0.20*broad,0.035,0.28),dark)
		if armored:
			Geo.loft(leg,"KneeGuard",Vector3(0,-0.23,-0.04),[Vector3(0.07,-0.09,0.075),Vector3(0.12,0.0,0.09),Vector3(0.09,0.08,0.08)],gold,6)
		var arm = Geo.pivot(body,"LeftArm" if side<0 else "RightArm",Vector3(side*0.30*broad,0.26,0))
		pivots.append(arm)
		var sleeve = skin if outfit in ["leather","dress"] else cloth
		Geo.loft(arm,"UpperSleeve",Vector3.ZERO,[Vector3(0.075*broad,-0.32,0.075),Vector3(0.105*broad,-0.07,0.115),Vector3(0.08*broad,0.03,0.09)],shell if armored else sleeve)
		_p(arm,"Elbow","sphere",Vector3(0,-0.31,0),Vector3(0.08*broad,0.08,0.08),shell if armored else sleeve)
		Geo.loft(arm,"Bracer",Vector3(0,0,-0.025),[Vector3(0.075*broad,-0.51,0.08),Vector3(0.10*broad,-0.33,0.10)],shell if armored else leather)
		_p(arm,"BracerEdge","cylinder",Vector3(0,-0.49,-0.025),Vector3(0.081*broad,0.035,0.085),gold)
		_p(arm,"Hand","sphere",Vector3(0,-0.58,-0.035),Vector3(0.075,0.10,0.07),steel if armored else skin)
		_p(arm,"Thumb","sphere",Vector3(-side*0.055,-0.55,-0.075),Vector3(0.035,0.05,0.035),steel if armored else skin,true)
		if armored:
			Geo.loft(arm,"Pauldron",Vector3(side*0.025,0,0),[Vector3(0.16*broad,-0.11,0.17),Vector3(0.20*broad,0.02,0.18),Vector3(0.12*broad,0.12,0.12)],shell,8)
			Geo.segment(arm,"ShoulderRim",Vector3(-0.12*broad,-0.08,-0.16),Vector3(0.12*broad,-0.08,-0.16),0.018,gold)
			_p(arm,"PauldronGem","sphere",Vector3(side*0.09,-0.02,-0.17),Vector3(0.04,0.055,0.022),glow)
		if side<0:
			left_arm = arm
			left_leg = leg
		else:
			right_arm = arm
			right_leg = leg
	head = Geo.pivot(body,"Head",Vector3(0,0.56,0))
	pivots.append(head)
	var helmet = profile.get("hair_style") == "helmet"
	_p(head,"Neck","cylinder",Vector3(0,-0.22,0),Vector3(0.08,0.18,0.08),steel if helmet else skin)
	Geo.sculpted_head(head,steel if helmet else skin)
	for side in [-1.0,1.0]:
		if not helmet:
			_p(head,"Ear","sphere",Vector3(side*0.196,-0.01,0),Vector3(0.028,0.055,0.035),skin,true)
			_p(head,"EarInset","sphere",Vector3(side*0.213,-0.01,-0.015),Vector3(0.011,0.032,0.014),Geo.material(Color(profile.get("skin","#e4b98f")).darkened(0.20)),true)
		_p(head,"Eye","sphere",Vector3(side*0.077,0.038,-0.153 if not helmet else -0.199),Vector3(0.028,0.013,0.018),glow if helmet else Geo.material(Color("d9d2bf")),true)
		_p(head,"Iris","sphere",Vector3(side*0.077,0.038,-0.169),Vector3(0.010,0.012,0.005),Geo.material(Color("536a6c")),true)
		_p(head,"Pupil","sphere",Vector3(side*0.077,0.038,-0.174),Vector3(0.005,0.009,0.003),dark,true)
		var lid: Array[Vector3] = [Vector3(side*0.05,0.042,-0.162),Vector3(side*0.077,0.054,-0.166),Vector3(side*0.106,0.043,-0.154)]
		Geo.curve(head,lid,0.006,steel if helmet else skin)
		var brow: Array[Vector3] = [Vector3(side*0.045,0.083,-0.166),Vector3(side*0.079,0.09,-0.169),Vector3(side*0.115,0.077,-0.147)]
		Geo.locks(head,"Eyebrow",[brow],0.012,hair)
	Geo.loft(head,"NoseBridge",Vector3(0,-0.005,-0.17),[Vector3(0.023,-0.056,0.031),Vector3(0.019,0.02,0.018),Vector3(0.014,0.065,0.009)],steel if helmet else skin,12)
	_p(head,"NoseTip","sphere",Vector3(0,-0.055,-0.198),Vector3(0.028,0.023,0.025),steel if helmet else skin,true)
	_p(head,"LowerLip","sphere",Vector3(0,-0.119,-0.151),Vector3(0.033,0.008,0.010),Geo.material(Color(profile.get("skin","#e4b98f")).darkened(0.22)),true)
	Geo.curve(head,[Vector3(-0.028,-0.111,-0.155),Vector3(0,-0.113,-0.161),Vector3(0.028,-0.111,-0.155)],0.0035,Geo.material(Color("855447")))
	_hair(helmet)
	if profile.get("detail") == "beard":
		var long_beard = profile.get("hair_style") in ["long","hood"]
		_p(head,"BeardVolume","sphere",Vector3(0,-0.15,-0.15),Vector3(0.145,0.09,0.095),hair)
		var beard_paths: Array = []
		for index in range(7):
			var x = (index-3)*0.041
			var length = (0.41 if str(get_meta("card_key")) == "power" else (0.29 if long_beard else 0.14))*(1.0-absf(x)*2.2)
			beard_paths.append([Vector3(x,-0.078,-0.16+absf(x)*0.2),Vector3(x*0.95,-0.15,-0.205),Vector3(x*0.74,-0.19-length*0.35,-0.217),Vector3(x*0.45,-0.17-length,-0.17)])
		Geo.locks(head,"SculptedBeard",beard_paths,0.044,hair)
		var moustache_paths: Array = []
		for side in [-1.0,1.0]:
			moustache_paths.append([Vector3(side*0.014,-0.079,-0.193),Vector3(side*0.06,-0.087,-0.208),Vector3(side*0.11,-0.115,-0.181)])
		Geo.locks(head,"Moustache",moustache_paths,0.023,hair)
	if profile.get("detail") in ["glasses","goggles"]:
		var lens_y = 0.04 if profile.get("detail") == "glasses" else 0.19
		for side in [-1.0,1.0]:
			var ring = _p(head,"LensRim","ring",Vector3(side*0.085,lens_y,-0.18),Vector3.ONE*0.064,gold)
			ring.rotation.x = PI/2
		Geo.segment(head,"SpectacleBridge",Vector3(-0.025,lens_y,-0.185),Vector3(0.025,lens_y,-0.185),0.009,gold)
	if profile.get("detail") == "crown":
		var diadem = _p(head,"Diadem","ring",Vector3(0,0.16,0),Vector3(0.21,0.21,0.18),gold)
		_p(head,"DiademGem","sphere",Vector3(0,0.17,-0.19),Vector3(0.035,0.065,0.025),glow)
	if profile.get("detail") == "ruff":
		Geo.loft(head,"RuffCollar",Vector3(0,-0.29,0),[Vector3(0.12,-0.02,0.12),Vector3(0.21,0.035,0.18),Vector3(0.12,0.08,0.11)],Geo.material(Color("e9e6dc")),12)
	if profile.get("detail") == "wings":
		for side in [-1.0,1.0]:
			for index in range(7):
				var wing = Geo.loft(body,"TaperedFeather",Vector3(side*(0.30+index*0.065),0.22-index*0.025,0.24),[Vector3(0.007,-0.38+index*0.018,0.01),Vector3(0.07,0.02,0.035),Vector3(0.025,0.21,0.025)],Geo.material(Color("e9e5d6")),6)
				wing.rotation.z = side*-0.8
				wing.set_meta("motion_piece","TaperedFeather")
	if golem:
		Geo.loft(body,"StoneCore",Vector3(0,0,-0.24),[Vector3(0.02,-0.03,0.025),Vector3(0.11,0.14,0.04),Vector3(0.02,0.29,0.025)],glow,6)
		for side in [-1.0,1.0]: Geo.segment(body,"Crack",Vector3(0,0.17,-0.25),Vector3(side*0.29,-0.03,-0.18),0.012,glow)

func _hair(helmet: bool) -> void:
	var style = str(profile.get("hair_style","short"))
	if helmet:
		Geo.panel(head,"Visor",Vector3(0,0,-0.18),PackedVector2Array([Vector2(-0.18,0.11),Vector2(0,0.08),Vector2(0.18,0.11),Vector2(0.14,0.005),Vector2(0,-0.035),Vector2(-0.14,0.005)]),0.025,dark)
		Geo.panel(head,"NoseGuard",Vector3(0,0,-0.207),PackedVector2Array([Vector2(-0.025,0.12),Vector2(0.025,0.12),Vector2(0.023,-0.15),Vector2(0,-0.20),Vector2(-0.023,-0.15)]),0.025,gold)
		for side in [-1.0,1.0]:
			Geo.panel(head,"CheekGuard",Vector3(0,0,-0.167),PackedVector2Array([Vector2(side*0.17,0.0),Vector2(side*0.19,-0.05),Vector2(side*0.08,-0.23),Vector2(side*0.045,-0.16)]),0.045,steel)
		Geo.loft(head,"HelmetRidge",Vector3(0,0.27,0),[Vector3(0.08,-0.05,0.19),Vector3(0.025,0.15,0.08)],steel,6)
	elif style == "hood":
		Geo.cowl(head,cloth,gold)
	else:
		_p(head,"HairCap","sphere",Vector3(0,0.16,0.018),Vector3(0.207,0.13,0.178),hair)
		var swept_paths: Array = []
		for index in range(7):
			var x = -0.16+index*0.05
			swept_paths.append([Vector3(x,0.23,-0.045),Vector3(x+0.025,0.215,-0.12),Vector3(x+0.04,0.155,-0.17),Vector3(x+0.025,0.10+index*0.007,-0.17)])
		Geo.locks(head,"SweptLocks",swept_paths,0.033,hair)
		if style == "long":
			for side in [-1.0,1.0]:
				var long_paths: Array = []
				for index in range(4):
					var x = side*(0.16+index*0.015)
					var z = 0.015+index*0.04
					long_paths.append([Vector3(x,0.17,z),Vector3(side*0.214,-0.01,z),Vector3(side*0.236,-0.23,z+0.02),Vector3(side*(0.22+index*0.015),-0.40+index*0.025,z-0.02)])
				Geo.locks(head,"LongLocks",long_paths,0.034,hair).set_meta("motion_piece","LongLocks")
		elif style == "ponytail":
			var tail = Geo.loft(head,"Ponytail",Vector3(0,0.14,0.23),[Vector3(0.015,-0.30,0.025),Vector3(0.08,-0.04,0.08),Vector3(0.055,0.13,0.065)],hair,8)
			tail.rotation.x = -0.8
			_p(head,"HairTie","sphere",Vector3(0,0.14,0.21),Vector3(0.07,0.06,0.07),gold)
			var swept_tail: Array = []
			for strand in range(4):
				var x = (strand-1.5)*0.039
				swept_tail.append([Vector3(x,0.16,0.25),Vector3(x+0.027,0.04,0.31),Vector3(x+0.05,-0.17,0.37),Vector3(x+0.073,-0.38,0.43)])
			Geo.locks(head,"PonytailLocks",swept_tail,0.028,hair).set_meta("motion_piece","PonytailLocks")
		elif style == "braid":
			for side in [-1.0,1.0]:
				for index in range(5): _p(head,"Braid","sphere",Vector3(side*(0.20+sin(index*PI/2)*0.012),-0.02-index*0.075,0.035),Vector3(0.048-index*0.004,0.065,0.05),hair)
				_p(head,"BraidTie","cylinder",Vector3(side*0.20,-0.34,0.035),Vector3(0.038,0.04,0.04),gold)

func _bind_equipment() -> void:
	if not left_arm: return
	var weapon = str(profile.get("weapon",""))
	# Preserve the designed rest pose, then let the arm animation carry the equipment.
	for node in gear.get_children():
		var arm: Node3D = null
		if weapon == "bow": arm = left_arm
		elif weapon in ["shield_sword","shield_pair","sword","daggers","twin_blades","fists"]: arm = left_arm if node.position.x<0 else right_arm
		elif weapon in ["staff","staff_book","halberd","root_hammer","pickaxe","mirror_staff"]: arm = left_arm if node.name=="Spellbook" else right_arm
		elif weapon in ["book","scroll","navigation","wave_plot","twin_persona","clock","scales","wireframe","simpson_rig"]: arm = left_arm
		elif weapon == "trumpet": arm = right_arm
		if arm: node.reparent(arm,true)

func _ring(point: Vector3, radius: float, mat: Material, rotation_value: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var node = _p(gear, "ArcaneRing", "ring", point, Vector3.ONE * radius, mat)
	node.rotation = rotation_value
	return node

func _blade(point: Vector3, tint: Material, length: float = 0.68) -> void:
	var sword = Geo.pivot(gear, "Blade", point)
	_p(sword, "Grip", "cylinder", Vector3.ZERO, Vector3(0.035, 0.23, 0.035), hair)
	_p(sword, "Guard", "box", Vector3(0, 0.13, 0), Vector3(0.25, 0.045, 0.08), gold)
	Geo.panel(sword,"ForgedBlade",Vector3(0,0.15,0),PackedVector2Array([Vector2(-0.055,0),Vector2(-0.07,length*0.7),Vector2(0,length),Vector2(0.07,length*0.7),Vector2(0.055,0)]),0.04,steel)
	Geo.segment(sword,"BladeFuller",Vector3(0,0.19,-0.024),Vector3(0,0.13+length*0.87,-0.024),0.009,tint)
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
	var shield = Geo.pivot(gear,"Shield",point)
	var outline = PackedVector2Array([Vector2(-0.29,0.29),Vector2(0,0.41),Vector2(0.29,0.29),Vector2(0.26,-0.12),Vector2(0,-0.44),Vector2(-0.26,-0.12)])
	Geo.panel(shield,"ShieldRim",Vector3.ZERO,outline,0.09,gold)
	Geo.panel(shield,"ShieldFace",Vector3(0,0,-0.055),outline,0.04,cloth).scale = Vector3(0.86,0.88,1)
	Geo.segment(shield,"ShieldRune",Vector3(0,-0.25,-0.085),Vector3(0,0.23,-0.085),0.018,glow)
	for side in [-1.0,1.0]: Geo.segment(shield,"ShieldChevron",Vector3(side*0.20,0.12,-0.085),Vector3(0,0.21,-0.085),0.014,steel)
	shield.rotation.z = -0.1 if point.x<0 else 0.1

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
				points.append(Vector3(-0.14 - sin(t) * 0.18, 1.05 + cos(t) * 0.58, -0.53))
			Geo.curve(gear, points, 0.028, gold)
			Geo.segment(gear, "BowstringTop", points.front(), Vector3(-0.24,1.09,-0.18), 0.008, glow)
			Geo.segment(gear, "BowstringBottom", Vector3(-0.24,1.09,-0.18), points.back(), 0.008, glow)
			Geo.segment(gear, "Arrow", Vector3(-0.24,1.09,-0.18), Vector3(-0.32,1.05,-0.95), 0.012, gold)
			left_arm.rotation.x = 1.15
			right_arm.rotation = Vector3(0.30,0,-1.2)
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
			if weapon == "root_hammer":
				_p(gear,"HammerHead","box",Vector3(0.5,1.70,-0.14),Vector3(0.60,0.26,0.25),steel)
				_p(gear,"HammerCore","box",Vector3(0.5,1.70,-0.275),Vector3(0.19,0.17,0.025),glow)
			elif weapon == "pickaxe":
				for side in [-1.0,1.0]:
					var pick = Geo.loft(gear,"PickBlade",Vector3(0.5,1.70,-0.14),[Vector3(0.065,0,0.055),Vector3(0.04,0.20,0.04),Vector3(0.005,0.40,0.005)],steel,6)
					pick.rotation.z = side*1.9
				_p(gear,"PickGem","sphere",Vector3(0.5,1.70,-0.21),Vector3.ONE*0.075,glow)
			elif weapon == "halberd":
				Geo.panel(gear,"HalberdBlade",Vector3(0.5,1.70,-0.14),PackedVector2Array([Vector2(0,0.28),Vector2(0.15,0.15),Vector2(0.34,0.18),Vector2(0.29,-0.18),Vector2(0.12,-0.13),Vector2(0,-0.17)]),0.05,steel)
				_p(gear,"HalberdSpike","cone",Vector3(0.5,1.99,-0.14),Vector3(0.06,0.32,0.06),glow)
			elif weapon == "mirror_staff":
				_ring(Vector3(0.5, 1.80, -0.14), 0.27, gold, Vector3(PI/2, 0, 0)).scale.y *= 1.3
			else:
				_p(gear, "StaffGem", "sphere", Vector3(0.5, 1.89, -0.14), Vector3(0.16, 0.22, 0.16), glow)
				_ring(Vector3(0.5, 1.89, -0.14), 0.25, gold, Vector3(PI/2, 0, 0))
				if str(get_meta("card_key")) == "power":
					var helix: Array[Vector3] = []
					for step in range(31):
						var t = float(step)/30.0
						var angle = t*TAU*2.5
						helix.append(Vector3(0.5+cos(angle)*(.07+t*.10),1.35+t*.70,-0.14+sin(angle)*(.07+t*.10)))
					Geo.curve(gear,helix,0.023,glow)
					_p(gear,"PowerStaffRunestone","sphere",Vector3(0.5,2.03,-0.14),Vector3(0.11,0.13,0.11),gold,true)
			if weapon == "staff_book":
				_book(Vector3(-0.4, 1.02, -0.28))
		"book", "scroll", "wave_plot", "navigation", "twin_persona":
			if weapon == "scroll":
				_p(gear,"Parchment","box",Vector3(0,1.0,-0.4),Vector3(0.52,0.42,0.025),Geo.material(Color("eddaaf")))
				for y in [0.78,1.22]:
					var roll = _p(gear,"ScrollRoll","cylinder",Vector3(0,y,-0.4),Vector3(0.055,0.61,0.055),gold)
					roll.rotation.z = PI/2
				for line in range(4): _p(gear,"ScrollInk","box",Vector3(0,0.89+line*0.065,-0.42),Vector3(0.36,0.014,0.009),dark,true)
			else: _book(Vector3(0, 0.94, -0.4))
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

	# Rest poses place the wrists next to the corresponding physical equipment.
	if left_arm and weapon != "bow":
		match weapon:
			"staff", "staff_book", "halberd", "root_hammer", "pickaxe", "mirror_staff":
				right_arm.rotation = Vector3(0.10,0,0.32)
				if weapon == "staff_book": left_arm.rotation = Vector3(0.65,0,-0.15)
			"shield_sword", "shield_pair", "sword", "daggers", "twin_blades":
				left_arm.rotation = Vector3(0.35,0,-0.22)
				right_arm.rotation = Vector3(0.35,0,0.22)
			"book", "scroll", "navigation", "wave_plot", "twin_persona":
				left_arm.rotation = Vector3(0.80,0,0.12)
				right_arm.rotation = Vector3(0.80,0,-0.12)
			"trumpet":
				right_arm.quaternion = Quaternion(Vector3(0,-0.58,-0.035).normalized(),Vector3(-0.20,0.22,-0.50).normalized())
			"clock", "scales", "simpson_rig", "wireframe":
				left_arm.rotation = Vector3(0.6,0,-0.15)
				right_arm.rotation = Vector3(0.6,0,0.15)
			_:
				left_arm.rotation = Vector3(0.9,0,0.05)
				right_arm.rotation = Vector3(0.9,0,-0.05)

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

# Inserting joints preserves every mesh's authored rest transform.
func _joint(parent: Node3D,label: String,point: Vector3,pieces: Array) -> Node3D:
	var joint = Geo.pivot(parent,label,point)
	for node in pieces: node.reparent(joint,true)
	return joint

func _follow(parent: Node3D,label: String,point: Vector3,prefixes: Array,kind: String,delay: float,amount: float) -> void:
	var pieces: Array = []
	for node in parent.get_children():
		var piece_name = str(node.get_meta("motion_piece",node.name))
		for prefix in prefixes:
			if piece_name.begins_with(prefix):
				pieces.append(node)
				break
	if pieces.is_empty(): return
	var joint = _joint(parent,label,point,pieces)
	follow_parts.append({"node":joint,"kind":kind,"delay":delay,"amount":amount})

func _articulate() -> void:
	if not body:
		_follow(gear,"OrbitFollow",Vector3(0,1.1,0),["Arcane","Spell","Link","Mirror","Compass","Crystal","Fractal","Leaf"],"magic",0.09,0.5)
		return
	for side in range(2):
		var arm = left_arm if side==0 else right_arm
		var leg = left_leg if side==0 else right_leg
		var lower_arm: Array = []
		var held: Array = []
		for node in arm.get_children():
			if str(node.name) in ["Bracer","BracerEdge","Hand","Thumb"]: lower_arm.append(node)
			elif str(node.name) not in ["UpperSleeve","Elbow","Pauldron","ShoulderRim","PauldronGem"]: held.append(node)
		var elbow = _joint(arm,"ElbowJoint",Vector3(0,-0.31,0),lower_arm)
		var palm: Array = []
		for node in elbow.get_children():
			if str(node.name) in ["Hand","Thumb"]: palm.append(node)
		var wrist = _joint(elbow,"WristJoint",Vector3(0,-0.27,-0.035),palm)
		if not held.is_empty():
			var grip = _joint(wrist,"GripFollow",Vector3.ZERO,held)
			follow_parts.append({"node":grip,"kind":"grip_left" if side==0 else "grip_right","delay":0.035,"amount":0.12})
		var lower_leg: Array = []
		for node in leg.get_children():
			if str(node.name) in ["BootShaft","KneeGuard","BootToe","Sole"]: lower_leg.append(node)
		var knee = _joint(leg,"KneeJoint",Vector3(0,-0.29,0),lower_leg)
		var shoe: Array = []
		for node in knee.get_children():
			if str(node.name) in ["BootToe","Sole"]: shoe.append(node)
		var foot = _joint(knee,"AnkleJoint",Vector3(0,-0.26,0),shoe)
		if side==0:
			left_elbow = elbow
			left_wrist = wrist
			left_knee = knee
			left_foot = foot
		else:
			right_elbow = elbow
			right_wrist = wrist
			right_knee = knee
			right_foot = foot
	if profile.get("weapon")=="bow":
		var top = find_child("BowstringTop",true,false)
		var bottom = find_child("BowstringBottom",true,false)
		var arrow = find_child("Arrow",true,false)
		var frame = top.get_parent().get_node_or_null("ArcaneFilament") if top else null
		if top and bottom and arrow and frame:
			bow_links = {"top":top,"bottom":bottom,"arrow":arrow,"frame":frame,"hand":right_wrist.get_node("Hand")}
	_follow(head,"HairFollow",Vector3(0,0.12,0.04),["LongLock","Ponytail","PonytailLocks","HairTie","Braid"],"hair",0.085,0.8)
	_follow(head,"BeardFollow",Vector3(0,-0.08,-0.16),["SculptedBeard","BeardVolume","Moustache"],"beard",0.07,0.55)
	_follow(body,"CapeFollow",Vector3(0,0.29,0.22),["CutCape"],"cape",0.11,0.9)
	_follow(body,"RobeFollow",Vector3(0,-0.15,0),["PleatedRobe"],"robe",0.07,0.38)
	_follow(body,"TailFollow",Vector3(0,-0.12,0.12),["CoatTail"],"tail",0.095,0.75)
	_follow(body,"WingFollow",Vector3(0,0.20,0.24),["TaperedFeather"],"wings",0.09,0.4)
	# Unheld magical accessories trail the gesture without changing their design.
	_follow(gear,"MagicFollow",Vector3(0,1.1,0),["Arcane","Spell","Link","Flask","Ribbon","Solid","Flow"],"magic",0.075,0.55)

func _motion_impact() -> void:
	strike.emit()

# The nock follows the drawing hand; the existing string and arrow meshes stay intact.
func _process(_delta: float) -> void:
	if bow_links.is_empty(): return
	var frame: Node3D = bow_links.frame
	var hand: Vector3 = bow_links.hand.global_position
	_fit_bow_segment(bow_links.top,frame.to_global(Vector3(-0.14,1.63,-0.53)),hand,0.008)
	_fit_bow_segment(bow_links.bottom,hand,frame.to_global(Vector3(-0.14,0.47,-0.53)),0.008)
	_fit_bow_segment(bow_links.arrow,hand,frame.to_global(Vector3(-0.32,1.05,-0.95)),0.012)

func _fit_bow_segment(node: Node3D,start: Vector3,end: Vector3,radius: float) -> void:
	var direction = end-start
	if direction.length_squared()<0.00001: return
	var turn = Basis(Quaternion(Vector3.UP,direction.normalized()))
	var width = radius*global_basis.get_scale().y
	node.global_transform = Transform3D(turn*Basis.from_scale(Vector3(width,direction.length(),width)),(start+end)/2)
