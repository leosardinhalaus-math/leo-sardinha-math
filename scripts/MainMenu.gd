extends Control

var deck_overlay: PanelContainer
var deck_status: Label
var chosen: Array = []
var grid: GridContainer
var name_input: LineEdit
var class_input: OptionButton

func _ready() -> void:
	theme = RoyaleUI.theme()
	RoyaleUI.background(self)
	var background = TextureRect.new()
	background.texture = load("res://assets/islands/island_01.webp")
	background.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	background.modulate = Color(0.45, 0.6, 0.7, 0.35)
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background)
	RoyaleUI.full(background)
	var margin = RoyaleUI.margin(self, 42)
	var layout = HBoxContainer.new()
	margin.add_child(layout)
	var intro = VBoxContainer.new()
	intro.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	layout.add_child(intro)
	intro.add_child(RoyaleUI.label("LEO SARDINHA.MATH  /  GODOT 4", 17, RoyaleUI.MINT))
	intro.add_child(RoyaleUI.label("CALCULUS\nROYALE", 64, RoyaleUI.GOLD))
	intro.add_child(RoyaleUI.label("Matemática em Batalha", 30))
	intro.add_child(RoyaleUI.label("45 cartas. Cinco ilhas. Cada resposta abre caminho para a próxima conquista.", 23))
	intro.add_child(RoyaleUI.label("As batalhas param enquanto você resolve o desafio. Aqui, pensar faz parte da estratégia.", 18, Color("b4c8d4")))
	var space = Control.new()
	space.size_flags_vertical = Control.SIZE_EXPAND_FILL
	intro.add_child(space)
	intro.add_child(RoyaleUI.label("Progresso salvo neste aparelho · Sem conta ou conexão obrigatória", 16, RoyaleUI.MINT))
	var panel = PanelContainer.new()
	panel.custom_minimum_size.x = 410
	layout.add_child(panel)
	var menu = VBoxContainer.new()
	menu.add_theme_constant_override("separation",10)
	panel.add_child(menu)
	menu.add_child(RoyaleUI.label("Prepare seu calculante", 28, RoyaleUI.GOLD))
	name_input = LineEdit.new()
	name_input.placeholder_text = "Seu nome de jogador"
	name_input.text = Game.player_name
	name_input.max_length = 24
	name_input.custom_minimum_size.y = 54
	menu.add_child(name_input)
	class_input = OptionButton.new()
	for value in ["Calculante", "Arqueira", "Guardião"]:
		class_input.add_item(value)
		if value == Game.hero_class:
			class_input.select(class_input.item_count - 1)
	menu.add_child(class_input)
	menu.add_child(RoyaleUI.label("Identificação do perfil. A classe não altera os atributos das cartas.", 15, Color("b4c8d4")))
	menu.add_child(RoyaleUI.button("EXPLORAR AS ILHAS  →", start_adventure))
	menu.add_child(RoyaleUI.button("MINHAS CARTAS / DECK", show_deck))
	menu.add_child(RoyaleUI.button("GALERIA 3D · 45 PERSONAGENS", func(): get_tree().change_scene_to_file("res://scenes/CharacterGallery.tscn")))
	menu.add_child(RoyaleUI.button("BATALHA DE TREINO", func(): _save_identity(); Game.select_stage(0, true)))
	menu.add_child(RoyaleUI.button("TELA CHEIA", func(): DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED if DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN else DisplayServer.WINDOW_MODE_FULLSCREEN)))
	menu.add_child(RoyaleUI.label("%d / 30 missões  ·  %d moedas  ·  %d / 45 cartas" % [Game.completed.size(), Game.coins, Game.unlocked.size()], 18, RoyaleUI.MINT))
	var preview = HBoxContainer.new()
	menu.add_child(preview)
	for id in [1, 6, 14]:
		preview.add_child(RoyaleUI.card_button(id, show_deck, 80))
	_build_deck_overlay()

func _save_identity() -> void:
	Game.player_name = name_input.text.strip_edges().left(24)
	if Game.player_name.is_empty():
		Game.player_name = "Calculante"
	Game.hero_class = class_input.get_item_text(class_input.selected)
	Game.save_progress()

func start_adventure() -> void:
	_save_identity()
	Game.return_to_map()

func _build_deck_overlay() -> void:
	deck_overlay = PanelContainer.new()
	add_child(deck_overlay)
	deck_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	deck_overlay.offset_left = 24
	deck_overlay.offset_top = 24
	deck_overlay.offset_right = -24
	deck_overlay.offset_bottom = -24
	var column = VBoxContainer.new()
	deck_overlay.add_child(column)
	var header = HBoxContainer.new()
	column.add_child(header)
	deck_status = RoyaleUI.label("", 23, RoyaleUI.GOLD)
	deck_status.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(deck_status)
	header.add_child(RoyaleUI.button("SALVAR DECK", save_deck))
	header.add_child(RoyaleUI.button("FECHAR", func(): deck_overlay.hide()))
	column.add_child(RoyaleUI.label("Escolha exatamente oito cartas. As cartas bloqueadas são liberadas ao vencer novas missões.", 18))
	var scroll = ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	column.add_child(scroll)
	grid = GridContainer.new()
	grid.columns = 7
	scroll.add_child(grid)
	deck_overlay.hide()

func show_deck() -> void:
	chosen = Game.deck.duplicate()
	deck_overlay.show()
	_refresh_cards()

func _refresh_cards() -> void:
	for child in grid.get_children():
		grid.remove_child(child)
		child.queue_free()
	for card in Cards.entries:
		var id = int(card.id)
		var node = RoyaleUI.card_button(id, func(): toggle_card(id), 142)
		node.disabled = not Game.unlocked.has(id)
		node.modulate = Color.WHITE if chosen.has(id) else Color(0.55, 0.6, 0.65, 1)
		grid.add_child(node)
	deck_status.text = "DECK  %d / 8  ·  COLEÇÃO  %d / 45" % [chosen.size(), Game.unlocked.size()]

func toggle_card(id: int) -> void:
	if chosen.has(id):
		chosen.erase(id)
	elif chosen.size() < 8:
		chosen.append(id)
	_refresh_cards()

func save_deck() -> void:
	if Game.set_deck(chosen):
		deck_overlay.hide()
	else:
		deck_status.text = "Escolha oito cartas diferentes para salvar."
