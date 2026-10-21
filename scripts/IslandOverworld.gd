extends Control

var selected_world = 0
var map_image: TextureRect
var title: Label
var subtitle: Label
var cave_layer: Control
var tabs: Array[Button] = []
var description: Label

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
	header.add_child(RoyaleUI.label("%d / 30  ·  %d moedas" % [Game.completed.size(), Game.coins], 18, RoyaleUI.MINT))
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
	map_image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	map_image.mouse_filter = Control.MOUSE_FILTER_IGNORE
	surface.add_child(map_image)
	RoyaleUI.full(map_image)
	cave_layer = Control.new()
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
	map_image.texture = load(world.image)
	for tab_index in range(tabs.size()):
		tabs[tab_index].modulate = RoyaleUI.GOLD if tab_index == index else Color.WHITE
	for child in cave_layer.get_children():
		cave_layer.remove_child(child)
		child.queue_free()
	var positions = [Vector2(0.06, 0.65), Vector2(0.22, 0.36), Vector2(0.38, 0.61), Vector2(0.55, 0.27), Vector2(0.71, 0.56), Vector2(0.85, 0.2)]
	for cave in range(6):
		var stage = index * 6 + cave
		var cleared = Game.completed.has(stage)
		var unlocked = Game.is_unlocked(stage)
		var caption = ("✓ " if cleared else "") + ("GUARDIÃO" if cave == 5 else "CAVERNA %d" % (cave + 1))
		var button = RoyaleUI.button(caption, func(): Game.select_stage(stage), Vector2(135, 76))
		button.disabled = not unlocked
		button.tooltip_text = str(world.chapters[cave]) + ("\nVença a caverna anterior para liberar." if not unlocked else "\nClique para iniciar a batalha.")
		cave_layer.add_child(button)
		button.anchor_left = positions[cave].x
		button.anchor_top = positions[cave].y
		button.anchor_right = positions[cave].x
		button.anchor_bottom = positions[cave].y
		button.offset_left = -20
		button.offset_top = -20
		if cleared:
			button.modulate = RoyaleUI.MINT
	description.text = "Conquiste as seis cavernas desta ilha em ordem. O guardião libera a ilha seguinte. Nenhuma missão é pulada."
