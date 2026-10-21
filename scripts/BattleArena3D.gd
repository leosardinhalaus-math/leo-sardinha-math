extends Node3D

const UNIT_SCENE = preload("res://scenes/Unit3D.tscn")
const LIMIT_UNITS = 26
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
var hand_row: HBoxContainer
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
	_refresh_hand()
	_update_status()

func _build_world() -> void:
	var environment = WorldEnvironment.new()
	var settings = Environment.new()
	settings.background_mode = Environment.BG_COLOR
	settings.background_color = Color("0a1a2c")
	settings.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	settings.ambient_light_color = Color("c1d9e4")
	settings.ambient_light_energy = 0.65
	environment.environment = settings
	add_child(environment)
	var light = DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-55, -25, 0)
	light.light_energy = 1.25
	light.shadow_enabled = true
	add_child(light)
	camera = Camera3D.new()
	camera.position = Vector3(0, 16.5, 12.5)
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = 21.0
	add_child(camera)
	camera.look_at(Vector3(0, 0, 0))
	camera.current = true
	var colors = [Color("315c4a"), Color("624b75"), Color("355c63"), Color("294f70"), Color("75523c")]
	_box(Vector3(14, 0.6, 17), Vector3(0, -0.35, 0), colors[world_index])
	_box(Vector3(13.7, 0.045, 1.3), Vector3(0, 0.015, 0), Color("329eae"))
	for lane_x in [-3.0, 3.0]:
		_box(Vector3(1.7, 0.13, 2.05), Vector3(lane_x, 0.08, 0), Color("be985c"))
		_box(Vector3(1.1, 0.012, 13.5), Vector3(lane_x, 0.005, 0), Color(0.7, 0.73, 0.59, 0.5))
	var scenery_rng = RandomNumberGenerator.new()
	scenery_rng.seed = 101 + Game.active_stage
	for index in range(12):
		var side = -1.0 if index % 2 else 1.0
		var stone = MeshInstance3D.new()
		var rock = PrismMesh.new()
		rock.size = Vector3(0.7, scenery_rng.randf_range(0.6, 1.8), 0.8)
		stone.mesh = rock
		stone.position = Vector3(side * scenery_rng.randf_range(5.6, 6.5), rock.size.y / 2.0, scenery_rng.randf_range(-7.5, 7.5))
		stone.material_override = RoyaleUnit.material(colors[world_index].lightened(0.13))
		add_child(stone)

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
	var column = VBoxContainer.new()
	column.mouse_filter = Control.MOUSE_FILTER_IGNORE
	RoyaleUI.margin(ui, 18).add_child(column)
	var header = HBoxContainer.new()
	column.add_child(header)
	var pause = RoyaleUI.button("PAUSAR", _pause, Vector2(140, 48))
	header.add_child(pause)
	top_status = RoyaleUI.label("", 22, RoyaleUI.GOLD)
	top_status.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(top_status)
	header.add_child(RoyaleUI.label("SUL → NORTE", 17, RoyaleUI.MINT))
	column.add_child(RoyaleUI.label(Islands.title_for(Game.active_stage), 18))
	var center = Control.new()
	center.size_flags_vertical = Control.SIZE_EXPAND_FILL
	center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	column.add_child(center)
	info = RoyaleUI.label("Escolha uma rota e uma carta. Resolva o desafio para invocar seu personagem.", 19, RoyaleUI.MINT)
	column.add_child(info)
	var footer = HBoxContainer.new()
	column.add_child(footer)
	var controls = VBoxContainer.new()
	controls.custom_minimum_size.x = 245
	footer.add_child(controls)
	elixir_label = RoyaleUI.label("", 28, RoyaleUI.GOLD)
	controls.add_child(elixir_label)
	for lane in range(2):
		var node = RoyaleUI.button("ROTA ESQUERDA" if lane == 0 else "ROTA DIREITA", func(): _select_lane(lane), Vector2(230, 48))
		controls.add_child(node)
		lane_buttons.append(node)
	hand_row = HBoxContainer.new()
	hand_row.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	footer.add_child(hand_row)
	_select_lane(0)

func _select_lane(lane: int) -> void:
	selected_lane = lane
	for index in range(lane_buttons.size()):
		lane_buttons[index].modulate = RoyaleUI.GOLD if index == lane else Color.WHITE

func _refresh_hand() -> void:
	for child in hand_row.get_children():
		hand_row.remove_child(child)
		child.queue_free()
	for index in range(hand.size()):
		var card = Cards.card(int(hand[index]))
		var cell = VBoxContainer.new()
		hand_row.add_child(cell)
		var button = RoyaleUI.card_button(int(card.id), func(): _request_card(index), 122)
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
	var lane = rng.randi_range(0, 1)
	_spawn(card, 1, lane, Vector3(-3.0 if lane == 0 else 3.0, 0, -3.5), 0.65 + Game.active_stage * 0.018)

func _request_card(index: int) -> void:
	if frozen or finished:
		return
	var card = Cards.card(int(hand[index]))
	if elixir < float(card.cost):
		info.text = "Essa carta precisa de %d de elixir. O elixir se recupera sozinho." % card.cost
		return
	if units().size() >= LIMIT_UNITS:
		info.text = "A arena está cheia. Aguarde uma unidade concluir seu combate."
		return
	selected_card = index
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
	if answer_locked:
		return
	answer_locked = true
	answers += 1
	var correct = value == int(quiz.answer)
	if correct:
		correct_answers += 1
	var body = _popup_body()
	body.add_child(RoyaleUI.label("RESPOSTA CORRETA" if correct else "VAMOS REVISAR", 28, RoyaleUI.MINT if correct else RoyaleUI.GOLD))
	body.add_child(RoyaleUI.label(str(quiz.explanation), 24))
	if correct:
		body.add_child(RoyaleUI.button("INVOCAR PERSONAGEM  →", _summon_selected))
	else:
		elixir = maxf(0.0, elixir - 1.0)
		body.add_child(RoyaleUI.label("Você perdeu 1 de elixir. Sua carta continua na mão; tente novamente.", 18))
		body.add_child(RoyaleUI.button("CONTINUAR", _close_popup))

func _summon_selected() -> void:
	if selected_card < 0 or selected_card >= hand.size():
		return
	var id = int(hand[selected_card])
	var card = Cards.card(id)
	elixir = maxf(0.0, elixir - float(card.cost))
	var unit = _spawn(card, 0, selected_lane, Vector3(-3.0 if selected_lane == 0 else 3.0, 0, 3.3))
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

func _close_popup() -> void:
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
