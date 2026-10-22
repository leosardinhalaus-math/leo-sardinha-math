@tool
extends RefCounted

# Motion alone: geometry, palettes and the visual profiles remain in NativeCharacter.
const STATES = ["idle","walk","run","jump","summon","attack","power","hurt","victory","defeat"]
const IMPACT_PHASE = 0.44
static var libraries: Dictionary = {}

static func personality(card: Dictionary) -> Dictionary:
	var visual: Dictionary = card.get("visual",{})
	var key = str(card.get("key","native"))
	var seed_value = 0
	for index in range(key.length()): seed_value += key.unicode_at(index)*(index+3)
	var family = str(card.get("archetype","mage"))
	var weapon = str(visual.get("weapon","staff"))
	if visual.get("gender") == "relic": family = "relic"
	elif weapon == "bow": family = "archer"
	elif weapon in ["daggers","twin_blades"]: family = "rogue"
	elif visual.get("gender") == "golem" or family == "titan": family = "heavy"
	elif weapon in ["shield_sword","shield_pair","sword","root_hammer","halberd"]: family = "guardian"
	var rhythms = {"archer":2.9,"rogue":2.35,"guardian":3.5,"heavy":4.4,"dancer":2.7,"engineer":3.05,"mage":3.9,"priest":4.1,"angel":3.8,"relic":4.5}
	var descriptions = {"archer":"Alerta, precisa e leve","rogue":"Ágil, inquieto e elástico","guardian":"Firme, atento e defensivo","heavy":"Pesado, lento e imponente","dancer":"Fluido, rítmico e expressivo","engineer":"Curioso e metódico","mage":"Contemplativo, com gestos amplos","priest":"Sereno e acolhedor","angel":"Solene e leve","relic":"Suspensão e órbitas suaves"}
	return {"family":family,"weapon":weapon,"period":float(rhythms.get(family,3.6))+(seed_value%13)*0.025,"phase":(seed_value%97)/97.0*TAU,"sway":(0.026 if family in ["rogue","dancer"] else 0.017)*(0.90+(seed_value%9)*0.025),"breath":0.007+(seed_value%5)*0.0007,"stride":0.20 if family in ["heavy","guardian"] else 0.23,"walk":1.0+(seed_value%7)*0.015,"attack":0.94 if family=="heavy" else (0.68 if family=="rogue" else 0.84),"sign":-1.0 if seed_value%2==0 else 1.0,"description":descriptions.get(family,"Equilibrado e expressivo")}

static func _ease(a: float,b: float,t: float) -> float:
	return lerpf(a,b,t*t*(3.0-2.0*t))

static func _curve(u: float,values: Array) -> float:
	var times = [0.0,0.18,0.30,0.44,0.54,0.75,1.0]
	for index in range(times.size()-1):
		if u <= times[index+1]: return _ease(values[index],values[index+1],clampf((u-times[index])/(times[index+1]-times[index]),0,1))
	return float(values[-1])

static func duration(state: String,p: Dictionary) -> float:
	match state:
		"idle": return p.period
		"walk": return p.walk
		"run": return p.walk*0.65
		"attack": return p.attack
		"power": return p.attack*1.08
		"defeat": return 0.72
		"victory": return 1.7
		"hurt": return 0.46
		_: return 0.88

static func locomotion_speed(state: String,p: Dictionary) -> float:
	var stride = p.stride*(1.12 if state=="run" else 1.0)
	return 2.0*stride/((0.40 if state=="run" else 0.48)*duration(state,p))

static func _pose(state: String,t: float,p: Dictionary) -> Dictionary:
	var length = duration(state,p)
	var looping = state in ["idle","walk","run"]
	var u = fposmod(t,length)/length if looping else clampf(t/length,0,1)
	var phase = u*TAU
	var f = str(p.family)
	var breath = sin(phase+p.phase)
	var hip = sin(phase)*p.sway
	var pose = {"rig_p":Vector3.ZERO,"rig_r":Vector3.ZERO,"rig_s":Vector3.ONE,"body_p":Vector3(hip,-0.009,0),"body_r":Vector3(0.018+breath*0.009,0.015*sin(phase+0.4),-hip*0.65),"body_s":Vector3(1.0+breath*p.breath,1.0+breath*p.breath*0.45,1.0+breath*p.breath),"head_r":Vector3(-breath*0.012,sin(phase+0.8)*0.026,hip*0.35),"la_r":Vector3(0.014*breath,0.012*sin(phase),-0.016*breath),"ra_r":Vector3(-0.012*breath,-0.016*sin(phase+0.3),0.02*breath),"lw_r":Vector3.ZERO,"rw_r":Vector3.ZERO,"le_r":Vector3(0.035+breath*0.012,0,0),"re_r":Vector3(0.045-breath*0.015,0,0),"ll_r":Vector3.ZERO,"rl_r":Vector3.ZERO,"lk_r":Vector3.ZERO,"rk_r":Vector3.ZERO,"lf_r":Vector3.ZERO,"rf_r":Vector3.ZERO,"ll_p":Vector3.ZERO,"rl_p":Vector3.ZERO,"gear_r":Vector3.ZERO}
	if f == "dancer":
		pose.body_r.y += sin(phase)*0.045
		pose.la_r.z -= 0.035*(1+sin(phase+0.5))
		pose.ra_r.z += 0.035*(1+sin(phase-0.5))
	elif f == "rogue":
		pose.body_r.x += 0.07
		pose.head_r.x -= 0.06
	elif f == "heavy":
		pose.body_r *= 0.55
		pose.head_r *= 0.55
	elif f == "archer":
		pose.head_r.y -= 0.07
		pose.la_r *= 0.4
		pose.ra_r *= 0.4
	if f == "relic":
		pose.rig_p.y = 0.08+sin(phase)*0.045
		pose.gear_r = Vector3(sin(phase)*0.035,sin(phase)*0.07,cos(phase)*0.035)
	elif state == "idle":
		# Counter rotation keeps both soles on the floor during the weight shift.
		var roll = -asin(clampf(hip/0.635,-1,1))
		pose.ll_r.z = roll
		pose.rl_r.z = roll
		pose.ll_p = Vector3(hip,0.635*(cos(roll)-1),0)
		pose.rl_p = pose.ll_p
		pose.lf_r.z = -roll
		pose.rf_r.z = -roll
	if state in ["walk","run"]:
		var running = state=="run"
		var drop = -0.078 + 0.008*cos(phase*2)
		var contact_fraction = 0.40 if running else 0.48
		pose.body_p = Vector3(hip,drop,0)
		pose.body_r = Vector3(0.18 if running else 0.065,0.035*sin(phase),-hip*0.6)
		pose.head_r = Vector3(-0.10 if running else -0.035,-pose.body_r.y*0.65,0)
		for side in range(2):
			var step_phase = fposmod(u+side*0.5,1.0)
			var stride = p.stride*(1.12 if running else 1.0)
			var z: float
			var lift = 0.0
			if step_phase < contact_fraction:
				z = lerpf(-stride,stride,step_phase/contact_fraction)
			else:
				var swing = (step_phase-contact_fraction)/(1.0-contact_fraction)
				z = _ease(stride,-stride,swing)
				lift = sin(swing*PI)*(0.13 if running else 0.075)
			var y = -0.55-drop+lift
			var knee = -acos(clampf((z*z+y*y-0.29*0.29-0.26*0.26)/(2*0.29*0.26),-1,1))
			var thigh = atan2(-z,-y)-atan2(0.26*sin(knee),0.29+0.26*cos(knee))
			var prefix = "l" if side==0 else "r"
			pose[prefix+"l_r"] = Vector3(thigh,0,0)
			pose[prefix+"k_r"] = Vector3(knee,0,0)
			pose[prefix+"f_r"] = Vector3(-thigh-knee,0,0)
			pose[prefix+"l_p"] = Vector3(0,drop,0)
		var swing_amount = 0.10 if f in ["archer","mage","priest"] else (0.30 if running else 0.22)
		pose.la_r.x += sin(phase)*swing_amount
		pose.ra_r.x -= sin(phase)*swing_amount
		pose.le_r.x += 0.15 if running else 0.035
		pose.re_r.x += 0.15 if running else 0.035
	elif state in ["attack","power"]:
		var wind = _curve(u,[0,0.7,1,0,0,0,0])
		var hit = _curve(u,[0,0,0,1,0.75,0.18,0])
		var twist = (0.13 if f in ["mage","priest","archer"] else 0.24)*p.sign
		pose.body_p = Vector3(0,-0.009-wind*0.02,wind*0.035-hit*0.065)
		pose.body_r = Vector3(0.02-wind*0.05+hit*0.11,twist*(-wind+hit),-hit*0.025*p.sign)
		pose.head_r = Vector3(-pose.body_r.x*0.4,-pose.body_r.y*0.65,0)
		pose.la_r = Vector3.ZERO
		pose.ra_r = Vector3.ZERO
		pose.le_r = Vector3.ZERO
		pose.re_r = Vector3.ZERO
		if f == "archer":
			pose.la_r = Vector3(hit*0.025,-wind*0.035,0)
			pose.ra_r = Vector3(wind*0.12-hit*0.07,0,-wind*0.20+hit*0.055)
			pose.re_r.x = wind*0.24-hit*0.025
		elif f == "rogue":
			pose.ra_r = Vector3(-wind*0.45+hit*1.0,wind*0.2-hit*0.18,-hit*0.15)
			pose.la_r = Vector3(wind*0.18+hit*0.65,-wind*0.13,hit*0.12)
			pose.re_r.x = wind*0.4+hit*0.10
			pose.rw_r.x = -hit*0.85
			pose.lw_r.x = -hit*0.65
			pose.le_r.x = wind*0.2+hit*0.12
		elif f in ["guardian","heavy"]:
			pose.ra_r = Vector3(-wind*0.60+hit*1.05,-wind*0.10,-hit*0.14)
			pose.re_r.x = wind*0.38+hit*0.16
			if p.weapon in ["sword","shield_sword","twin_blades"]:
				pose.rw_r.x = wind*0.20-hit*1.50
			elif p.weapon in ["halberd","root_hammer"]:
				pose.rw_r.x = wind*0.15-hit*2.0
			pose.la_r = Vector3(hit*0.10,-wind*0.04,hit*0.08)
		else:
			pose.ra_r = Vector3(wind*0.13+hit*0.36,-wind*0.08+hit*0.05,-hit*0.18)
			pose.la_r = Vector3(wind*0.06+hit*0.25,wind*0.05,hit*0.16)
			pose.re_r.x = wind*0.18+hit*0.18
			pose.le_r.x = hit*0.12
		if state=="power":
			pose.body_r.y *= 1.15
			pose.la_r *= 1.2
			pose.ra_r *= 1.2
		pose.gear_r += Vector3(-wind*0.06+hit*0.12,hit*0.08,0)
	elif state in ["summon","jump"]:
		var crouch = _curve(u,[0,1,0.8,0,0,0.3,0])
		var rise = _curve(u,[0,0,0.4,1,0.85,0,0])
		pose.rig_p.y += rise*0.32-crouch*0.035
		pose.body_p.y -= crouch*0.025
		pose.body_r.x += crouch*0.10
		pose.la_r.z -= rise*0.22
		pose.ra_r.z += rise*0.22
	elif state=="hurt":
		var flinch = _curve(u,[0,1,0.8,0.3,0.10,0.02,0])
		pose.body_r.x -= flinch*0.18
		pose.head_r.x += flinch*0.10
	elif state=="victory":
		var celebrate = sin(u*PI)*sin(u*PI)
		pose.body_r.y += celebrate*0.10*p.sign
		pose.ra_r = Vector3(0,0,-celebrate*1.8)
		pose.re_r.x += celebrate*0.35
	elif state=="defeat":
		var fall = _ease(0,1,u)
		pose.rig_r.z = fall*1.5
		pose.body_r.x += fall*0.25
	return pose

static func _secondary(kind: String,pose: Dictionary) -> Vector3:
	match kind:
		"hair","beard": return pose.rig_r+pose.body_r+pose.head_r
		"grip_left": return pose.rig_r+pose.body_r+pose.la_r+pose.le_r+pose.lw_r
		"grip_right": return pose.rig_r+pose.body_r+pose.ra_r+pose.re_r+pose.rw_r
		"magic": return pose.rig_r+pose.gear_r
		_: return pose.rig_r+pose.body_r

static func build(character: Node3D,card: Dictionary) -> void:
	var p = personality(card)
	character.motion_profile = p
	var player = AnimationPlayer.new()
	player.name = "AnimationPlayer"
	player.callback_mode_method = AnimationMixer.ANIMATION_CALLBACK_MODE_METHOD_IMMEDIATE
	character.add_child(player)
	character.animation = player
	# Card-specific rest poses and the same generated hierarchy are reusable per unit.
	var cache_key = str(card.get("key",""))+str(card.get("visual",{}))+str(card.get("archetype",""))
	if libraries.has(cache_key):
		player.add_animation_library("",libraries[cache_key])
		return
	var library = AnimationLibrary.new()
	var bindings: Array = []
	var roles = {"rig":character.rig,"body":character.body,"head":character.head,"la":character.left_arm,"ra":character.right_arm,"le":character.left_elbow,"re":character.right_elbow,"lw":character.left_wrist,"rw":character.right_wrist,"ll":character.left_leg,"rl":character.right_leg,"lk":character.left_knee,"rk":character.right_knee,"lf":character.left_foot,"rf":character.right_foot,"gear":character.gear}
	for role in roles:
		var node = roles[role]
		if node == null: continue
		bindings.append({"node":node,"property":"rotation","key":role+"_r","rest":node.rotation})
		if role in ["rig","body","ll","rl"]: bindings.append({"node":node,"property":"position","key":role+"_p","rest":node.position})
		if role in ["rig","body"]: bindings.append({"node":node,"property":"scale","key":role+"_s","rest":node.scale})
	for state in STATES:
		var clip = Animation.new()
		clip.length = duration(state,p)
		clip.loop_mode = Animation.LOOP_LINEAR if state in ["idle","walk","run"] else Animation.LOOP_NONE
		var samples: Array[float] = []
		for sample in range(33): samples.append(sample/32.0)
		if state in ["attack","power"]:
			for phase in [0.18,0.30,0.44,0.54,0.75]:
				if not samples.has(phase): samples.append(phase)
			samples.sort()
		for binding in bindings:
			var track = clip.add_track(Animation.TYPE_VALUE)
			clip.track_set_path(track,NodePath(str(character.get_path_to(binding.node))+":"+binding.property))
			for phase in samples:
				var pose = _pose(state,phase*clip.length,p)
				var value: Vector3 = pose.get(binding.key,Vector3.ZERO)
				value = binding.rest*value if binding.property=="scale" else binding.rest+value
				clip.track_insert_key(track,phase*clip.length,value)
		for follow in character.follow_parts:
			var track = clip.add_track(Animation.TYPE_VALUE)
			clip.track_set_path(track,NodePath(str(character.get_path_to(follow.node))+":rotation"))
			for phase in samples:
				var time = phase*clip.length
				var pose = _pose(state,time,p)
				var earlier = _pose(state,time-follow.delay,p)
				var older = _pose(state,time-follow.delay*2,p)
				var now_r = _secondary(follow.kind,pose)
				var then_r = _secondary(follow.kind,earlier)
				var lag = (then_r-now_r)*follow.amount+(then_r-_secondary(follow.kind,older))*follow.amount*0.18
				lag += Vector3((earlier.body_p.z-pose.body_p.z)*1.4,0,(earlier.body_p.x-pose.body_p.x)*1.6)*follow.amount
				lag = lag.clamp(Vector3.ONE*-0.16,Vector3.ONE*0.16)
				clip.track_insert_key(track,time,lag)
		if state in ["attack","power"]:
			var marker = clip.add_track(Animation.TYPE_METHOD)
			clip.track_set_path(marker,NodePath("."))
			clip.track_insert_key(marker,clip.length*IMPACT_PHASE,{"method":"_motion_impact","args":[]})
		library.add_animation(state,clip)
	libraries[cache_key] = library
	player.add_animation_library("",library)
