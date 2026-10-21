extends Control

const Geo = preload("res://scripts/NativeGeometry.gd")
const CHARACTER = preload("res://scenes/NativeCharacter.tscn")
var selected = 0
var character: Node3D
var world: Node3D
var viewport: SubViewport
var portrait: TextureRect
var heading: Label
var description: Label
var scene_label: Label
var state_menu: OptionButton
var card_menu: OptionButton
var drag_mouse = false

func _ready() -> void:
	theme = RoyaleUI.theme()
	RoyaleUI.background(self)
	var column = VBoxContainer.new()
	RoyaleUI.margin(self,24).add_child(column)
	var header = HBoxContainer.new()
	column.add_child(header)
	header.add_child(RoyaleUI.button("← MENU",func(): get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")))
	heading = RoyaleUI.label("",26,RoyaleUI.GOLD)
	heading.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(heading)
	card_menu = OptionButton.new()
	for card in Cards.entries:
		card_menu.add_item("%02d · %s" % [int(card.id),card.name])
	card_menu.item_selected.connect(show_card)
	header.add_child(card_menu)
	var content = HBoxContainer.new()
	content.size_flags_vertical = Control.SIZE_EXPAND_FILL
	column.add_child(content)
	var reference = VBoxContainer.new()
	reference.custom_minimum_size.x = 285
	content.add_child(reference)
	reference.add_child(RoyaleUI.label("CARTA DE REFERÊNCIA",18,RoyaleUI.MINT))
	portrait = TextureRect.new()
	portrait.custom_minimum_size = Vector2(255,357)
	portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	reference.add_child(portrait)
	description = RoyaleUI.label("",17)
	reference.add_child(description)
	var preview_panel = PanelContainer.new()
	preview_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_child(preview_panel)
	viewport = SubViewport.new()
	viewport.size = Vector2i(780,620)
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	add_child(viewport)
	world = Node3D.new()
	viewport.add_child(world)
	var env = WorldEnvironment.new()
	var settings = Environment.new()
	settings.background_mode = Environment.BG_COLOR
	settings.background_color = Color("102538")
	settings.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	settings.ambient_light_color = Color("dce5ef")
	settings.ambient_light_energy = 0.65
	env.environment = settings
	world.add_child(env)
	Geo.part(world,"DisplayStand","cylinder",Vector3(0,-0.08,0),Vector3(0.72,0.12,0.72),Geo.material(Color("233c50")))
	var light = DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-35,-35,0)
	light.light_energy = 0.8
	world.add_child(light)
	var camera = Camera3D.new()
	world.add_child(camera)
	camera.position = Vector3(0,1.65,-4.5)
	camera.look_at(Vector3(0,1.0,0))
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = 2.75
	camera.current = true
	var image = TextureRect.new()
	image.texture = viewport.get_texture()
	image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	image.gui_input.connect(_drag)
	preview_panel.add_child(image)
	var footer = HBoxContainer.new()
	column.add_child(footer)
	footer.add_child(RoyaleUI.button("← ANTERIOR",func(): show_card(posmod(selected-1,45))))
	state_menu = OptionButton.new()
	for state in ["idle","walk","run","jump","summon","attack","power","hurt","victory","defeat"]:
		state_menu.add_item(state)
	state_menu.item_selected.connect(func(index): character.animation.play(state_menu.get_item_text(index)))
	footer.add_child(state_menu)
	scene_label = RoyaleUI.label("Arraste para girar o personagem. Modelos 3D nativos do Godot.",17,RoyaleUI.MINT)
	scene_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	footer.add_child(scene_label)
	footer.add_child(RoyaleUI.button("PRÓXIMO →",func(): show_card(posmod(selected+1,45))))
	show_card(0)

func show_card(index: int) -> void:
	selected = clampi(index,0,44)
	var card = Cards.entries[selected]
	if is_instance_valid(character):
		world.remove_child(character)
		character.queue_free()
	character = CHARACTER.instantiate()
	world.add_child(character)
	character.configure(card)
	character.rotation.y = -0.15
	portrait.texture = Cards.texture(int(card.id))
	heading.text = "%02d / 45 · %s" % [int(card.id),card.name]
	description.text = str(card.visual.notes) + "\n\nEspecial: " + str(card.ability)
	card_menu.select(selected)
	state_menu.select(0)

func _drag(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		drag_mouse = event.pressed
	if event is InputEventMouseMotion and drag_mouse:
		character.rotate_y(event.relative.x * 0.012)
	elif event is InputEventScreenDrag:
		character.rotate_y(event.relative.x * 0.012)
