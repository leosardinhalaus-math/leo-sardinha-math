extends Node3D

const UNIT_SCENE = preload("res://scenes/Unit3D.tscn")
const LIMIT_UNITS = 26
const WORLD_SCENE = preload("res://scripts/NativeArena.gd")
const Geo = preload("res://scripts/NativeGeometry.gd")
const NAVIGATION = preload("res://scripts/NativeNavigation.gd")
var navigation = NAVIGATION.new()
var native_world: Node3D
var placing = false
var touch_placing = false
var summon_authorized = false
var selected_spawn = Vector3.ZERO
var candidate_position = Vector3.ZERO
var candidate_valid = false
var spawn_marker: Node3D
var spawn_zone: MeshInstance3D
var cancel_button: Button
var rng = RandomNumberGenerator.new()
var frozen = false
var finished = false
var elixir = 5.0
var enemy_elixir = 4.0
var remaining = 180.0
var enemy_clock = 5.0
var world_index = 0
var stage_index = 0
var selected_lane = 0
var hand: Array = []
var draw_queue: Array = []
var player_king: RoyaleUnit
var enemy_king: RoyaleUnit
var camera: Camera3D
var ui: Control
var top_status: Label
var info: Label
var elixir_label: Label
var hand_row: GridContainer
var lane_buttons: Array[Button] = []
var popup: PanelContainer
var quiz: Dictionary = {}
var selected_card = -1
var answers = 0
var correct_answers = 0
var answer_locked = false

func _ready() -> void:
	rng.randomize()
	world_index = Game.active_stage / 6
	stage_index = Game.active_stage % 6
	hand = Game.deck.slice(0, 4)
	draw_queue = Game.deck.slice(4, 8)
	_build_world()
	_build_interface()
	_spawn_towers()
	navigation.configure(self)
	_refresh_hand()
	_update_status()

func _build_world() -> void:
	var environment = WorldEnvironment.new()
	var settings = Environment.new()
	settings.background_mode = Environment.BG_COLOR
	settings.background_color = Color("0a1a2c")
	settings.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	settings.ambient_light_color = Color("c1d9e4")
	settings.ambient_light_energy = 0.55
	environment.environment = settings
	add_child(environment)
	var light = DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-55, -25, 0)
	light.light_energy = 0.85
	light.shadow_enabled = true
	add_child(light)
	camera = Camera3D.new()
	camera.position = Vector3(0, 16.5, 12.5)
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = 21.8
	camera.h_offset = -4.0
	add_child(camera)
	camera.look_at(Vector3(0, 0, 0))
	camera.current = true
	native_world = WORLD_SCENE.new()
	add_child(native_world)
	native_world.build(world_index, stage_index)
	_build_spawn_marker()

func _box(size: Vector3, location: Vector3, color: Color) -> void:
	var mesh = MeshInstance3D.new()
	var box = BoxMesh.new()
	box.size = size
	mesh.mesh = box
	mesh.position = location
	mesh.material_override = RoyaleUnit.material(color)
	add_child(mesh)

func _spawn_towers() -> void:
	for side in range(2):
		var direction = 1.0 if side == 0 else -1.0
		var hp = 700.0 if side == 0 else 380.0 + Game.active_stage * 18.0
		var king = _spawn({"tower": true, "king": true, "hp": hp, "damage": 13, "range": 3.2, "interval": 1.2}, side, -1, Vector3(0, 0, direction * 7.0))
		if side == 0:
			player_king = king
		else:
			enemy_king = king
		for lane in range(2):
			_spawn({"tower": true, "hp": hp * 0.45, "damage": 9, "range": 2.8, "interval": 1.1}, side, lane, Vector3(-3.0 if lane == 0 else 3.0, 0, direction * 4.4))

func _spawn(card: Dictionary, side: int, lane: int, location: Vector3, multiplier: float = 1.0) -> RoyaleUnit:
	var unit = UNIT_SCENE.instantiate() as RoyaleUnit
	add_child(unit)
	unit.position = location
	unit.configure(card, side, lane, self, multiplier)
	unit.defeated.connect(_on_defeated)
	return unit

func _build_interface() -> void:
	var canvas = CanvasLayer.new()
	add_child(canvas)
	ui = Control.new()
	ui.theme = RoyaleUI.theme()
	ui.mouse_filter = Control.MOUSE_FILTER_IGNORE
	canvas.add_child(ui)
	RoyaleUI.full(ui)
	var header = HBoxContainer.new()
	header.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui.add_child(header)
	header.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	header.offset_left = 18
	header.offset_top = 18
	header.offset_right = -18
	header.add_child(RoyaleUI.button("PAUSAR", _pause, Vector2(140,48)))
	top_status = RoyaleUI.label("",22,RoyaleUI.GOLD)
	top_status.autowrap_mode = TextServer.AUTOWRAP_OFF
	top_status.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(top_status)
	var direction_label = RoyaleUI.label("SUL → NORTE",17,RoyaleUI.MINT)
	direction_label.autowrap_mode = TextServer.AUTOWRAP_OFF
	header.add_child(direction_label)
	var mission = RoyaleUI.label(Islands.title_for(Game.active_stage),18)
	ui.add_child(mission)
	mission.position = Vector2(20,76)
	mission.size.x = 520
	var panel = PanelContainer.new()
	ui.add_child(panel)
	panel.anchor_bottom = 1.0
	panel.offset_left = 18
	panel.offset_right = 356
	panel.offset_top = 112
	panel.offset_bottom = -58
	var controls = VBoxContainer.new()
	panel.add_child(controls)
	elixir_label = RoyaleUI.label("",27,RoyaleUI.GOLD)
	controls.add_child(elixir_label)
	controls.add_child(RoyaleUI.label("Escolha uma carta. Toque ou clique no seu campo para marcar onde ela nasce.",17))
	cancel_button = RoyaleUI.button("CANCELAR ESCOLHA", _cancel_placement,Vector2(200,42))
	controls.add_child(cancel_button)
	cancel_button.hide()
	hand_row = GridContainer.new()
	hand_row.columns = 2
	hand_row.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	controls.add_child(hand_row)
	info = RoyaleUI.label("Invoque em qualquer ponto livre do seu campo, inclusive atrás e ao lado das torres.",18,RoyaleUI.MINT)
	ui.add_child(info)
	info.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	info.offset_left = 20
	info.offset_right = -20
	info.offset_top = -43
	info.offset_bottom = -10

func _refresh_hand() -> void:
	for child in hand_row.get_children():
		hand_row.remove_child(child)
		child.queue_free()
	for index in range(hand.size()):
		var card = Cards.card(int(hand[index]))
		var cell = VBoxContainer.new()
		hand_row.add_child(cell)
		var button = RoyaleUI.card_button(int(card.id), func(): _request_card(index), 117)
		if index == selected_card:
			button.add_theme_stylebox_override("normal",RoyaleUI.box(Color("204c58"),18,RoyaleUI.GOLD))
		cell.add_child(button)
		var cost = RoyaleUI.label("%d ELIXIR" % card.cost, 16, RoyaleUI.GOLD)
		cost.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		cell.add_child(cost)

func _process(delta: float) -> void:
	if frozen or finished:
		return
	remaining = maxf(0.0, remaining - delta)
	elixir = minf(10.0, elixir + delta * (0.6 if remaining > 60 else 1.05))
	enemy_elixir = minf(10.0, enemy_elixir + delta * 0.62)
	enemy_clock -= delta
	if enemy_clock <= 0.0:
		enemy_clock = maxf(3.4, 7.0 - Game.active_stage * 0.1)
		_enemy_play()
	_update_status()
	if remaining <= 0.0:
		_finish(player_king.hp / player_king.max_hp > enemy_king.hp / enemy_king.max_hp)

func _update_status() -> void:
	if not is_instance_valid(player_king) or not is_instance_valid(enemy_king):
		return
	top_status.text = "%02d:%02d  ·  SEU REINO %d  /  RIVAL %d" % [int(remaining) / 60, int(remaining) % 60, int(player_king.hp), int(enemy_king.hp)]
	elixir_label.text = "ELIXIR  %d / 10" % int(elixir)

func units() -> Array[Node]:
	return get_tree().get_nodes_in_group("royale_units")

func find_target(source: RoyaleUnit) -> RoyaleUnit:
	var closest: RoyaleUnit = null
	var closest_distance = INF
	for candidate in units():
		if candidate.dead or candidate.team == source.team:
			continue
		var distance = source.position.distance_squared_to(candidate.position)
		if not source.is_king and not candidate.is_king and candidate.lane != source.lane and distance > 3.0:
			continue
		if distance < closest_distance:
			closest = candidate
			closest_distance = distance
	return closest

func _enemy_play() -> void:
	if units().size() >= LIMIT_UNITS:
		return
	var available = mini(45, 10 + world_index * 8 + stage_index)
	var card = Cards.card(rng.randi_range(1, available))
	if enemy_elixir < float(card.cost):
		return
	enemy_elixir -= float(card.cost)
	for attempt in range(16):
		var point = Vector3(rng.randf_range(-5.3,5.3),0,rng.randf_range(-8.8,-1.25))
		if spawn_error(point,1).is_empty():
			_spawn(card,1,0 if point.x < 0 else 1,point,0.65 + Game.active_stage * 0.018)
			return
	enemy_elixir += float(card.cost)

func _request_card(index: int) -> void:
	if finished or (frozen and not placing) or index < 0 or index >= hand.size():
		return
	if placing:
		_cancel_placement()
	var card = Cards.card(int(hand[index]))
	if elixir < float(card.cost):
		info.text = "Essa carta precisa de %d de elixir. O elixir se recupera sozinho." % card.cost
		return
	if units().size() >= LIMIT_UNITS:
		info.text = "A arena está cheia. Aguarde uma unidade concluir seu combate."
		return
	selected_card = index
	summon_authorized = false
	candidate_valid = false
	placing = true
	frozen = true
	spawn_marker.hide()
	spawn_zone.show()
	cancel_button.show()
	info.text = "%s: toque em um ponto livre do seu campo. Os dois exércitos estão pausados." % card.name
	_refresh_hand()

func _open_math() -> void:
	placing = false
	touch_placing = false
	spawn_zone.hide()
	var card = Cards.card(int(hand[selected_card]))
	quiz = MathChallenge.make(world_index, stage_index, rng)
	answer_locked = false
	frozen = true
	var body = _popup_body()
	body.add_child(RoyaleUI.label(str(card.name).to_upper(), 18, RoyaleUI.MINT))
	body.add_child(RoyaleUI.label(str(quiz.question), 28, RoyaleUI.GOLD))
	body.add_child(RoyaleUI.label("O tempo e os dois exércitos estão pausados enquanto você pensa.", 17))
	var options = GridContainer.new()
	options.columns = 2
	body.add_child(options)
	for value in quiz.options:
		options.add_child(RoyaleUI.button(str(value), func(): _answer(int(value)), Vector2(300, 62)))
	body.add_child(RoyaleUI.button("VOLTAR SEM JOGAR", _close_popup))

func _answer(value: int) -> void:
	if answer_locked or selected_card < 0 or placing or not is_instance_valid(popup):
		return
	answer_locked = true
	answers += 1
	var correct = value == int(quiz.answer)
	if correct:
		correct_answers += 1
		summon_authorized = true
	var body = _popup_body()
	body.add_child(RoyaleUI.label("RESPOSTA CORRETA" if correct else "VAMOS REVISAR", 28, RoyaleUI.MINT if correct else RoyaleUI.GOLD))
	body.add_child(RoyaleUI.label(str(quiz.explanation), 24))
	if correct:
		body.add_child(RoyaleUI.button("INVOCAR NESTE PONTO  →", _summon_selected))
	else:
		elixir = maxf(0.0, elixir - 1.0)
		body.add_child(RoyaleUI.label("Você perdeu 1 de elixir. Sua carta continua na mão; tente novamente.", 18))
		body.add_child(RoyaleUI.button("CONTINUAR", _close_popup))

func _summon_selected() -> void:
	if not summon_authorized or selected_card < 0 or selected_card >= hand.size() or finished:
		return
	var id = int(hand[selected_card])
	var card = Cards.card(id)
	if not spawn_error(selected_spawn).is_empty() or elixir < float(card.cost) or units().size() >= LIMIT_UNITS:
		_cancel_placement()
		info.text = "O local deixou de estar livre. Escolha novamente; nenhum elixir foi gasto."
		return
	summon_authorized = false
	elixir = maxf(0.0, elixir - float(card.cost))
	var unit = _spawn(card, 0, selected_lane, selected_spawn)
	unit.play_animation("summon", true)
	hand[selected_card] = draw_queue.pop_front()
	draw_queue.append(id)
	selected_card = -1
	info.text = "%s entrou em campo. Especial: %s." % [card.name, card.ability]
	_refresh_hand()
	_close_popup()

func _popup_body() -> VBoxContainer:
	if is_instance_valid(popup):
		ui.remove_child(popup)
		popup.queue_free()
	popup = PanelContainer.new()
	ui.add_child(popup)
	popup.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	popup.offset_left = -355
	popup.offset_right = 355
	popup.offset_top = -210
	popup.offset_bottom = 210
	var body = VBoxContainer.new()
	popup.add_child(body)
	return body

func _cancel_placement() -> void:
	_close_popup()

func _close_popup() -> void:
	placing = false
	touch_placing = false
	summon_authorized = false
	selected_card = -1
	candidate_valid = false
	spawn_zone.hide()
	spawn_marker.hide()
	cancel_button.hide()
	_refresh_hand()
	if is_instance_valid(popup):
		ui.remove_child(popup)
		popup.queue_free()
		popup = null
	frozen = false
	_update_status()

func _pause() -> void:
	if frozen or finished:
		return
	frozen = true
	var body = _popup_body()
	body.add_child(RoyaleUI.label("TEMPO PARA PENSAR", 32, RoyaleUI.GOLD))
	body.add_child(RoyaleUI.label("A batalha está pausada. Seu progresso nas ilhas está preservado.", 22))
	body.add_child(RoyaleUI.button("CONTINUAR BATALHA", _close_popup))
	body.add_child(RoyaleUI.button("VOLTAR ÀS ILHAS", Game.return_to_map))

func _on_defeated(unit: RoyaleUnit) -> void:
	if unit.is_tower:
		navigation.rebuild()
	if unit.is_king:
		_finish(unit.team == 1)

func _finish(victory: bool) -> void:
	if finished:
		return
	finished = true
	frozen = true
	var score = 1
	if answers > 0 and float(correct_answers) / answers >= 0.75:
		score += 1
	if is_instance_valid(player_king) and player_king.hp > player_king.max_hp * 0.55:
		score += 1
	var reward = Game.complete_battle(victory, score)
	var body = _popup_body()
	body.add_child(RoyaleUI.label("VITÓRIA DO CONHECIMENTO" if victory else "A JORNADA CONTINUA", 32, RoyaleUI.GOLD))
	body.add_child(RoyaleUI.label("%d acertos em %d desafios. %d moeda(s) recebida(s)." % [correct_answers, answers, reward.coins], 23))
	if not reward.cards.is_empty():
		var names: Array[String] = []
		for id in reward.cards:
			names.append(str(Cards.card(int(id)).name))
		body.add_child(RoyaleUI.label("Novas cartas: " + ", ".join(names), 20, RoyaleUI.MINT))
	if not Game.save_error.is_empty():
		body.add_child(RoyaleUI.label(Game.save_error, 18, Color("ffaaa0")))
	body.add_child(RoyaleUI.button("VOLTAR AO MAPA", Game.return_to_map))
	body.add_child(RoyaleUI.button("JOGAR NOVAMENTE", func(): Game.select_stage(Game.active_stage, Game.quick_battle)))

func special(source: RoyaleUnit, target: RoyaleUnit) -> void:
	var kind = str(source.stats.get("ability_kind", "strike"))
	match kind:
		"shield": source.shield += 28
		"heal":
			for ally in units():
				if ally.team == source.team and not ally.dead and ally.position.distance_to(source.position) < 4.5:
					ally.heal(20)
		"slow": target.slow_timer = 4.0
		"burn": target.burn_timer = 4.0
		"haste":
			for ally in units():
				if ally.team == source.team and not ally.dead:
					ally.haste_timer = 4.0
		"chain":
			for other in units():
				if other.team != source.team and not other.dead and other.position.distance_to(target.position) < 2.5:
					other.take_damage(source.damage * 0.5, source)
		"reflect": source.reflect_timer = 5.0
		"double": target.take_damage(source.damage * 0.8, source)
		"pierce": target.take_damage(source.damage * 0.9, source, true)
		_: target.take_damage(source.damage * 1.15, source)
	info.text = "%s — %s" % [source.stats.get("name", "Carta"), source.stats.get("ability", "Especial")]

func effect(start: Vector3, end: Vector3, color: Color) -> void:
	var mesh = MeshInstance3D.new()
	var beam = ImmediateMesh.new()
	mesh.mesh = beam
	var mat = RoyaleUnit.material(color)
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	beam.surface_begin(Mesh.PRIMITIVE_LINES, mat)
	beam.surface_add_vertex(start)
	beam.surface_add_vertex(end)
	beam.surface_end()
	add_child(mesh)
	var timer = get_tree().create_timer(0.14)
	timer.timeout.connect(mesh.queue_free)

func _build_spawn_marker() -> void:
	spawn_zone = Geo.part(self,"DeploymentTerritory","box",Vector3(0,0.027,5.0),Vector3(12.3,0.01,8.25),Geo.material(Color(0.17,0.75,0.66,0.13)))
	spawn_zone.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	spawn_zone.hide()
	spawn_marker = Node3D.new()
	spawn_marker.name = "SpawnMarker"
	add_child(spawn_marker)
	Geo.part(spawn_marker,"TargetRing","ring",Vector3(0,0.07,0),Vector3(0.55,0.12,0.55),Geo.material(RoyaleUI.MINT,false,true))
	Geo.part(spawn_marker,"CrossX","box",Vector3(0,0.07,0),Vector3(0.70,0.025,0.035),Geo.material(RoyaleUI.MINT,false,true))
	Geo.part(spawn_marker,"CrossZ","box",Vector3(0,0.07,0),Vector3(0.035,0.025,0.70),Geo.material(RoyaleUI.MINT,false,true))
	spawn_marker.hide()

func spawn_error(point: Vector3, team: int = 0) -> String:
	if not point.is_finite() or absf(point.y) > 0.3 or absf(point.x) > WORLD_SCENE.HALF_WIDTH or absf(point.z) > WORLD_SCENE.HALF_LENGTH:
		return "Escolha um ponto dentro da arena."
	if absf(point.z) < WORLD_SCENE.RIVER_EDGE:
		return "Não é possível nascer no rio nem nas pontes."
	if (team == 0 and point.z < WORLD_SCENE.RIVER_EDGE) or (team == 1 and point.z > -WORLD_SCENE.RIVER_EDGE):
		return "Escolha um ponto no seu campo, ao sul do rio."
	for obstacle in native_world.obstacles:
		if point.distance_to(obstacle.point) < float(obstacle.radius):
			return "Esse ponto contém um elemento do cenário. Escolha um espaço livre."
	for unit in units():
		if unit.dead: continue
		var radius = (1.05 if unit.is_king else 0.84) if unit.is_tower else 0.53
		var offset = unit.position - point
		offset.y = 0
		if offset.length() < radius:
			return "Esse ponto está ocupado. Toque ao lado da unidade ou da torre."
	return ""

func _input(event: InputEvent) -> void:
	# End a drag even when its release is consumed by a HUD control.
	if event is InputEventScreenTouch and event.index == 0 and (event.canceled or (not event.pressed and not _screen_is_board(event.position))):
		touch_placing = false
		candidate_valid = false
		if is_instance_valid(spawn_marker): spawn_marker.hide()

func _unhandled_input(event: InputEvent) -> void:
	if not placing or finished: return
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		_cancel_placement()
		get_viewport().set_input_as_handled()
		return
	if event is InputEventScreenTouch and event.index == 0:
		if not _screen_is_board(event.position): return
		if event.canceled:
			touch_placing = false
			return
		if event.pressed:
			touch_placing = true
			_preview_screen(event.position)
		elif touch_placing:
			touch_placing = false
			_pick_screen(event.position)
		get_viewport().set_input_as_handled()
	elif event is InputEventScreenDrag and event.index == 0 and touch_placing:
		_preview_screen(event.position)
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton and event.device != InputEvent.DEVICE_ID_EMULATION and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		_pick_screen(event.position)
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseMotion and event.device != InputEvent.DEVICE_ID_EMULATION and not touch_placing:
		_preview_screen(event.position)

func _world_point(screen_position: Vector2) -> Variant:
	return Plane(Vector3.UP,0).intersects_ray(camera.project_ray_origin(screen_position),camera.project_ray_normal(screen_position))

func _preview_screen(screen_position: Vector2) -> bool:
	if not _screen_is_board(screen_position):
		spawn_marker.hide()
		return false
	var point = _world_point(screen_position)
	candidate_valid = false
	if point == null:
		spawn_marker.hide()
		return false
	candidate_position = point
	var error = spawn_error(point)
	candidate_valid = error.is_empty()
	spawn_marker.position = point
	spawn_marker.visible = absf(point.x) < 7.0 and absf(point.z) < 10.0
	var tint = RoyaleUI.MINT if candidate_valid else Color("f07182")
	for part in spawn_marker.get_children():
		part.material_override = Geo.material(tint,false,true)
	info.text = "Clique ou solte o toque para confirmar este local e resolver o desafio." if candidate_valid else error
	return candidate_valid

func _pick_screen(screen_position: Vector2) -> bool:
	if not placing or finished:
		return false
	# GUI events normally stop before _unhandled_input. This guard also handles
	# native touch events that arrive alongside emulated mouse clicks on the HUD.
	if not _screen_is_board(screen_position):
		return false
	if not _preview_screen(screen_position):
		return false
	selected_spawn = candidate_position
	selected_spawn.y = 0
	selected_lane = 0 if selected_spawn.x < 0 else 1
	_open_math()
	return true

func walk_target(source: RoyaleUnit, target: RoyaleUnit) -> Vector3:
	if source.path_clock <= 0 or source.path_revision != navigation.revision or source.path_target_id != target.get_instance_id() or source.walk_path.is_empty():
		source.walk_path = navigation.path_between(source.position,target.position)
		source.path_step = 1 if source.walk_path.size()>1 else 0
		source.path_revision = navigation.revision
		source.path_target_id = target.get_instance_id()
		source.path_clock = 0.85
	if source.walk_path.is_empty(): return source.position
	while source.path_step < source.walk_path.size()-1 and source.position.distance_to(source.walk_path[source.path_step]) < 0.17:
		source.path_step += 1
	if source.path_step == source.walk_path.size()-1 and source.position.distance_to(source.walk_path[source.path_step]) < 0.17:
		return target.position
	return source.walk_path[source.path_step]

func constrain_walk(next_position: Vector3, previous: Vector3) -> Vector3:
	var result = next_position
	result.x = clampf(result.x,-WORLD_SCENE.HALF_WIDTH,WORLD_SCENE.HALF_WIDTH)
	result.z = clampf(result.z,-WORLD_SCENE.HALF_LENGTH,WORLD_SCENE.HALF_LENGTH)
	result.y = 0
	if absf(result.z) < WORLD_SCENE.RIVER_EDGE and absf(absf(result.x) - WORLD_SCENE.BRIDGE_X) > WORLD_SCENE.BRIDGE_HALF_WIDTH:
		result.z = WORLD_SCENE.RIVER_EDGE if previous.z >= 0 else -WORLD_SCENE.RIVER_EDGE
	return result

func _screen_is_board(point: Vector2) -> bool:
	return point.x >= 374 and point.y >= 100 and point.y <= get_viewport().get_visible_rect().size.y-48

func attack_effect(source: RoyaleUnit, target: RoyaleUnit) -> void:
	var color = Color(source.stats.get("glow","#e4cc81"))
	var from = source.position+Vector3(0,1.1,0)
	var to = target.position+Vector3(0,1.1,0)
	if source.stats.get("visual",{}).get("weapon") == "bow":
		var arrow = Node3D.new()
		add_child(arrow)
		arrow.position = from
		arrow.look_at(to)
		Geo.segment(arrow,"ArrowShaft",Vector3.ZERO,Vector3(0,0,-0.55),0.018,Geo.material(Color("c9a95f"),true))
		var tip = Geo.part(arrow,"ArrowTip","cone",Vector3(0,0,-0.63),Vector3(0.06,0.20,0.06),Geo.material(color,false,true))
		tip.rotation.x = -PI/2
		var flight = create_tween()
		flight.tween_property(arrow,"position",to,0.18)
		flight.tween_callback(arrow.queue_free)
	else:
		effect(from,to,color)
