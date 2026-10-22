extends CharacterBody3D
class_name RoyaleUnit

const CHARACTER_SCENE = preload("res://scenes/NativeCharacter.tscn")
const MOTION = preload("res://scripts/NativeMotion.gd")

signal defeated(unit: RoyaleUnit)

var arena
var team = 0
var lane = 0
var stats: Dictionary = {}
var hp = 100.0
var max_hp = 100.0
var damage = 12.0
var speed = 1.4
var attack_range = 0.9
var attack_clock = 0.0
var special_hits = 0
var shield = 0.0
var slow_timer = 0.0
var haste_timer = 0.0
var burn_timer = 0.0
var burn_clock = 0.0
var reflect_timer = 0.0
var is_tower = false
var is_king = false
var dead = false
var animation: AnimationPlayer
var visual: Node3D
var hp_fill: MeshInstance3D
var animation_state = ""
var animation_paused = false
var pending_target: WeakRef
var pending_power = false
var walk_path: Array[Vector3] = []
var path_step = 0
var path_revision = -1
var path_target_id = 0
var path_clock = 0.0

func configure(card: Dictionary, side: int, selected_lane: int, battle: Node3D, multiplier: float = 1.0) -> void:
	stats = card.duplicate(true)
	team = side
	lane = selected_lane
	arena = battle
	is_tower = bool(card.get("tower", false))
	is_king = bool(card.get("king", false))
	max_hp = float(card.get("hp", 110)) * multiplier
	hp = max_hp
	damage = float(card.get("damage", 12)) * multiplier
	speed = float(card.get("speed", 1.4))
	attack_range = float(card.get("range", 1.0))
	add_to_group("royale_units")
	_build_visual()
	play_animation("idle")

func _build_visual() -> void:
	visual = Node3D.new()
	add_child(visual)
	if is_tower:
		visual.add_child(arena.native_world.tower(team, is_king))
	else:
		var character = CHARACTER_SCENE.instantiate()
		visual.add_child(character)
		character.configure(stats)
		animation = character.animation
		character.strike.connect(_resolve_attack)
	var base = MeshInstance3D.new()
	var marker = TorusMesh.new()
	marker.inner_radius = 0.34
	marker.outer_radius = 0.43
	marker.rings = 16
	marker.ring_segments = 6
	base.mesh = marker
	base.position.y = 0.025
	base.material_override = material(Color("46c9d4") if team == 0 else Color("ec6d88"))
	add_child(base)
	hp_fill = MeshInstance3D.new()
	var bar = BoxMesh.new()
	bar.size = Vector3(0.8, 0.06, 0.08)
	hp_fill.mesh = bar
	hp_fill.position = Vector3(0, 2.55 if is_king else (1.95 if is_tower else 2.4), 0)
	hp_fill.material_override = material(Color("70efad"))
	add_child(hp_fill)

static func material(color: Color) -> StandardMaterial3D:
	var result = StandardMaterial3D.new()
	result.albedo_color = color
	result.roughness = 0.85
	return result

func _physics_process(delta: float) -> void:
	if dead or arena == null:
		return
	if arena.frozen or arena.finished:
		if animation and animation.is_playing():
			animation.pause()
			animation_paused = true
		return
	if animation_paused:
		animation.play()
		animation_paused = false
	slow_timer = maxf(0.0, slow_timer - delta)
	haste_timer = maxf(0.0, haste_timer - delta)
	reflect_timer = maxf(0.0, reflect_timer - delta)
	path_clock -= delta
	attack_clock -= delta
	if burn_timer > 0.0:
		burn_timer -= delta
		burn_clock -= delta
		if burn_clock <= 0.0:
			burn_clock = 1.0
			take_damage(4.0, null, true)
			if dead:
				return
	# An animation marker commits the hit; pause/resume cannot consume it early.
	if pending_target and animation and animation.current_animation_position >= animation.current_animation_length*MOTION.IMPACT_PHASE:
		_resolve_attack()
	if animation and animation.is_playing() and animation_state in ["attack","power","summon","hurt"]:
		return
	var target = arena.find_target(self) as RoyaleUnit
	if target == null:
		play_animation("idle")
		return
	var direction = target.position - position
	direction.y = 0.0
	if not is_tower and direction.length_squared()>0.001 and direction.length()<=attack_range:
		_face(direction,delta)
	if direction.length() > attack_range:
		if not is_tower:
			var multiplier = 0.55 if slow_timer > 0 else 1.0
			if haste_timer > 0:
				multiplier *= 1.5
			var waypoint: Vector3 = arena.walk_target(self, target)
			var travel = waypoint - position
			travel.y = 0
			_face(travel,delta)
			var next_position = position + travel.normalized() * minf(travel.length(), speed * multiplier * delta)
			var before_move = position
			position = arena.constrain_walk(next_position, position)
			var actual_speed = position.distance_to(before_move)/maxf(delta,0.0001)
			if actual_speed < 0.01:
				play_animation("idle")
			else:
				play_animation("run" if haste_timer>0 or actual_speed>1.45 else "walk")
				if animation:
					var actor = animation.get_parent()
					var stride_speed = MOTION.locomotion_speed(animation_state,actor.motion_profile)*actor.scale.y
					animation.speed_scale = clampf(actual_speed/maxf(0.01,stride_speed),0.1,3.0)
		else:
			play_animation("idle")
	else:
		if attack_clock <= 0.0:
			attack_clock = float(stats.get("interval", 1.05))
			if haste_timer > 0:
				attack_clock *= 0.7
			attack(target)
		elif animation == null or not animation.is_playing():
			play_animation("idle")

func _face(direction: Vector3,delta: float) -> void:
	if direction.length_squared()<0.00001: return
	var heading = atan2(-direction.x,-direction.z)
	rotation.y = lerp_angle(rotation.y,heading,1.0-exp(-delta*16.0)) if delta>0 else heading

func attack(target: RoyaleUnit) -> void:
	if dead or arena.frozen or arena.finished or not is_instance_valid(target) or target.dead or pending_target:
		return
	if animation and animation.is_playing() and animation_state in ["attack","power"]:
		return
	if position.distance_to(target.position) > attack_range+0.25: return
	pending_target = weakref(target)
	pending_power = not is_tower and (special_hits+1)%3==0
	play_animation("power" if pending_power else "attack",true)
	if animation:
		# Keep the whole recovery inside the current attack interval, also under haste.
		var interval = float(stats.get("interval",1.05))*(0.7 if haste_timer>0 else 1.0)
		animation.speed_scale = maxf(1.0,animation.current_animation_length/(interval*0.92))
	else:
		_resolve_attack()

func _resolve_attack() -> void:
	if not pending_target: return
	if arena.frozen and not arena.finished and not dead: return
	var target = pending_target.get_ref() as RoyaleUnit
	var use_power = pending_power
	pending_target = null
	pending_power = false
	if dead or arena.finished or not is_instance_valid(target) or target.dead: return
	if position.distance_to(target.position)>attack_range+0.25: return
	target.take_damage(damage,self,stats.get("ability_kind")=="pierce")
	arena.attack_effect(self,target)
	special_hits += 1
	# Reflection can kill the attacker at contact. Self buffs still survive a lethal hit.
	var affects_others = str(stats.get("ability_kind","strike")) in ["shield","heal","haste","reflect","chain"]
	if use_power and not dead and not arena.finished and (not target.dead or affects_others):
		arena.special(self,target)

func take_damage(amount: float, source: RoyaleUnit = null, pierce: bool = false) -> void:
	if dead:
		return
	var actual = amount
	if not pierce and shield > 0.0:
		var absorbed = minf(shield, actual)
		shield -= absorbed
		actual -= absorbed
	hp = maxf(0.0, hp - actual)
	hp_fill.scale.x = maxf(0.01, hp / max_hp)
	if reflect_timer > 0 and is_instance_valid(source) and not pierce:
		source.take_damage(amount * 0.3, null, true)
	if hp <= 0.0:
		dead = true
		pending_target = null
		pending_power = false
		play_animation("defeat", true)
		defeated.emit(self)
		var tween = create_tween()
		tween.tween_interval(0.5)
		tween.tween_property(visual, "scale", Vector3.ZERO, 0.3)
		tween.tween_callback(queue_free)

func heal(amount: float) -> void:
	if dead:
		return
	hp = minf(max_hp, hp + amount)
	hp_fill.scale.x = maxf(0.01, hp / max_hp)

func play_animation(state: String, force: bool = false) -> void:
	if animation == null or (state == animation_state and not force):
		return
	for animation_name in animation.get_animation_list():
		if str(animation_name).get_slice("/", str(animation_name).get_slice_count("/") - 1) == state:
			animation_state = state
			var clip = animation.get_animation(animation_name)
			clip.loop_mode = Animation.LOOP_LINEAR if state in ["idle", "walk", "run"] else Animation.LOOP_NONE
			animation.speed_scale = 1.0
			animation.play(animation_name, 0.10 if state in ["attack","power"] else 0.16)
			return
