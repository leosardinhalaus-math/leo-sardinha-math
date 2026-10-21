extends CharacterBody3D
class_name RoyaleUnit

const CHARACTER_SCENE = preload("res://scenes/NativeCharacter.tscn")

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
	if arena.frozen:
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
	var target = arena.find_target(self) as RoyaleUnit
	if target == null:
		play_animation("idle")
		return
	var direction = target.position - position
	direction.y = 0.0
	if direction.length() > attack_range:
		if not is_tower:
			var multiplier = 0.55 if slow_timer > 0 else 1.0
			if haste_timer > 0:
				multiplier *= 1.5
			var waypoint: Vector3 = arena.walk_target(self, target)
			var travel = waypoint - position
			travel.y = 0
			var next_position = position + travel.normalized() * minf(travel.length(), speed * multiplier * delta)
			position = arena.constrain_walk(next_position, position)
			if direction.length_squared() > 0.001:
				look_at(position + direction, Vector3.UP)
			play_animation("walk")
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

func attack(target: RoyaleUnit) -> void:
	if not is_instance_valid(target) or target.dead:
		return
	play_animation("attack", true)
	target.take_damage(damage, self, stats.get("ability_kind") == "pierce")
	arena.attack_effect(self,target)
	special_hits += 1
	if not is_tower and special_hits % 3 == 0 and not target.dead:
		play_animation("power", true)
		arena.special(self, target)

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
			animation.play(animation_name, 0.12)
			return
