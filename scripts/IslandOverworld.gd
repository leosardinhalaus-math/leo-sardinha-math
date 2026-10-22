extends Control

var selected_world = 0
var map_image: TextureRect
var title: Label
var subtitle: Label
var cave_layer: Control
var tabs: Array[Button] = []
var description: Label
var viewport: SubViewport
var diorama: Node3D
var map_camera: Camera3D
var map_settings: Environment
var yaw = 0.0
var dragging = false
var touch_id = -1

func _ready() -> void:
	theme = RoyaleUI.theme()
	RoyaleUI.background(self)
	selected_world = clampi(Game.active_stage / 6, 0, 4)
	var content = VBoxContainer.new()
	RoyaleUI.margin(self, 26).add_child(content)
	var header = HBoxContainer.new()
	content.add_child(header)
	header.add_child(RoyaleUI.button("← MENU / DECK", func(): get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")))
	var name_label = RoyaleUI.label("A JORNADA DE %s" % Game.player_name.to_upper(), 22, RoyaleUI.GOLD)
	name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(name_label)
	var progress_label = RoyaleUI.label("%d / 30  ·  %d moedas" % [Game.completed.size(), Game.coins], 18, RoyaleUI.MINT)
	progress_label.autowrap_mode = TextServer.AUTOWRAP_OFF
	header.add_child(progress_label)
	var islands_row = HBoxContainer.new()
	content.add_child(islands_row)
	for index in range(5):
		var button = RoyaleUI.button("ILHA %d" % (index + 1), func(): select_world(index), Vector2(170, 48))
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		islands_row.add_child(button)
		tabs.append(button)
	title = RoyaleUI.label("", 34, RoyaleUI.GOLD)
	subtitle = RoyaleUI.label("", 18)
	content.add_child(title)
	content.add_child(subtitle)
	var map_panel = PanelContainer.new()
	map_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content.add_child(map_panel)
	var surface = Control.new()
	surface.custom_minimum_size.y = 330
	map_panel.add_child(surface)
	map_image = TextureRect.new()
	map_image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	map_image.stretch_mode = TextureRect.STRETCH_SCALE
	map_image.mouse_filter = Control.MOUSE_FILTER_STOP
	map_image.gui_input.connect(_drag_map)
	surface.add_child(map_image)
	RoyaleUI.full(map_image)
	_build_viewport()
	cave_layer = Control.new()
	cave_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	surface.add_child(cave_layer)
	RoyaleUI.full(cave_layer)
	description = RoyaleUI.label("", 18, RoyaleUI.MINT)
	content.add_child(description)
	select_world(selected_world)

func select_world(index: int) -> void:
	selected_world = index
	var world = Islands.island(index)
	title.text = "%02d  /  %s" % [index + 1, world.title]
	subtitle.text = world.focus
	diorama.build(index)
	map_settings.background_color = Color(diorama.palette.sky)
	var unlocked_missions: Array[bool] = []
	for cave in range(6): unlocked_missions.append(Game.is_unlocked(index*6+cave))
	diorama.set_progress(Game.completed,unlocked_missions)
	yaw = 0.0
	for tab_index in range(tabs.size()):
		tabs[tab_index].modulate = RoyaleUI.GOLD if tab_index == index else Color.WHITE
	for child in cave_layer.get_children():
		cave_layer.remove_child(child)
		child.queue_free()
	for cave in range(6):
		var stage = index * 6 + cave
		var cleared = Game.completed.has(stage)
		var unlocked = Game.is_unlocked(stage)
		var caption = ("✓ " if cleared else "") + ("GUARDIÃO" if cave == 5 else "CAVERNA %d" % (cave + 1))
		var button = RoyaleUI.button(caption, func(): Game.select_stage(stage), Vector2(112, 44))
		button.add_theme_font_size_override("font_size",16)
		for state in ["normal","hover","pressed","disabled"]:
			var style = theme.get_stylebox(state,"Button").duplicate()
			style.content_margin_left = 10
			style.content_margin_right = 10
			style.content_margin_top = 8
			style.content_margin_bottom = 8
			button.add_theme_stylebox_override(state,style)
		button.disabled = not unlocked
		button.tooltip_text = str(world.chapters[cave]) + ("\nVença a caverna anterior para liberar." if not unlocked else "\nClique para iniciar a batalha.")
		cave_layer.add_child(button)
		if cleared:
			button.modulate = RoyaleUI.MINT
	description.text = "Arraste a ilha para observar o relevo. Conquiste as seis cavernas em ordem; o guardião libera a ilha seguinte."

func _build_viewport() -> void:
	viewport = SubViewport.new()
	viewport.size = Vector2i(1152,400)
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	add_child(viewport)
	var world = Node3D.new()
	viewport.add_child(world)
	var environment = WorldEnvironment.new()
	map_settings = Environment.new()
	map_settings.background_mode = Environment.BG_COLOR
	map_settings.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	map_settings.ambient_light_color = Color("afc5df")
	map_settings.ambient_light_energy = 0.45
	environment.environment = map_settings
	world.add_child(environment)
	var sun = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-48,-35,0)
	sun.light_color = Color("ffe7c1")
	sun.light_energy = 0.95
	sun.shadow_enabled = true
	world.add_child(sun)
	diorama = preload("res://scenes/IslandDiorama.tscn").instantiate()
	world.add_child(diorama)
	map_camera = Camera3D.new()
	map_camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	map_camera.current = true
	world.add_child(map_camera)
	map_image.texture = viewport.get_texture()

func _process(_delta: float) -> void:
	if not is_instance_valid(cave_layer) or cave_layer.size.y < 10: return
	viewport.size = Vector2i(maxi(64,int(map_image.size.x)),maxi(64,int(map_image.size.y)))
	map_camera.size = maxf(7.3,17.6*viewport.size.y/float(viewport.size.x))
	map_camera.position = Vector3(sin(yaw)*15.0,11.5,cos(yaw)*15.0)
	map_camera.look_at(Vector3(0,0,0))
	for index in range(cave_layer.get_child_count()):
		var button = cave_layer.get_child(index)
		var projected = map_camera.unproject_position(diorama.mission_points[index]+Vector3(0,0,0.80))
		projected *= cave_layer.size/Vector2(viewport.size)
		button.position = Vector2(clampf(projected.x-button.size.x/2,0,cave_layer.size.x-button.size.x),clampf(projected.y+6,0,cave_layer.size.y-button.size.y))

func _drag_map(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		if event.pressed and touch_id == -1: touch_id = event.index
		elif not event.pressed and event.index == touch_id: touch_id = -1
	elif event is InputEventScreenDrag and event.index == touch_id:
		yaw = clampf(yaw-event.relative.x*0.002,-0.24,0.24)
	elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.device != InputEvent.DEVICE_ID_EMULATION:
		dragging = event.pressed
	elif event is InputEventMouseMotion and dragging and event.device != InputEvent.DEVICE_ID_EMULATION:
		yaw = clampf(yaw-event.relative.x*0.002,-0.24,0.24)
