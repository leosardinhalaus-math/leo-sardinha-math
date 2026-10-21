extends RefCounted
class_name RoyaleUI

const INK = Color("071421")
const PANEL = Color("102638")
const GOLD = Color("efd083")
const MINT = Color("65e2cf")
const TEXT = Color("edf5f8")

static func box(color: Color = PANEL, radius: int = 18, border: Color = Color("284354")) -> StyleBoxFlat:
	var style = StyleBoxFlat.new()
	style.bg_color = color
	style.set_corner_radius_all(radius)
	style.set_border_width_all(1)
	style.border_color = border
	style.content_margin_left = 18
	style.content_margin_right = 18
	style.content_margin_top = 12
	style.content_margin_bottom = 12
	return style

static func theme() -> Theme:
	var result = Theme.new()
	result.default_font_size = 20
	result.set_color("font_color", "Label", TEXT)
	result.set_color("font_color", "Button", TEXT)
	result.set_stylebox("normal", "Button", box())
	result.set_stylebox("hover", "Button", box(Color("1d4454"), 18, MINT))
	result.set_stylebox("pressed", "Button", box(Color("236375"), 18, GOLD))
	result.set_stylebox("disabled", "Button", box(Color("101e29")))
	result.set_stylebox("panel", "PanelContainer", box())
	result.set_stylebox("normal", "LineEdit", box(Color("091a27")))
	result.set_color("font_color", "LineEdit", TEXT)
	result.set_constant("separation", "VBoxContainer", 14)
	result.set_constant("separation", "HBoxContainer", 12)
	return result

static func label(text: String, size: int = 20, color: Color = TEXT) -> Label:
	var node = Label.new()
	node.text = text
	node.add_theme_font_size_override("font_size", size)
	node.add_theme_color_override("font_color", color)
	node.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	return node

static func button(text: String, callback: Callable, minimum: Vector2 = Vector2(150, 52)) -> Button:
	var node = Button.new()
	node.text = text
	node.custom_minimum_size = minimum
	node.pressed.connect(callback)
	return node

static func full(node: Control) -> void:
	node.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)

static func background(parent: Control) -> void:
	var color = ColorRect.new()
	color.color = INK
	color.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(color)
	full(color)

static func margin(parent: Control, amount: int = 28) -> MarginContainer:
	var node = MarginContainer.new()
	parent.add_child(node)
	full(node)
	for edge in ["left", "right", "top", "bottom"]:
		node.add_theme_constant_override("margin_" + edge, amount)
	return node

static func card_button(id: int, callback: Callable, width: float = 150.0) -> Button:
	var card = Cards.card(id)
	var button_node = button("", callback, Vector2(width, width * 1.35))
	button_node.tooltip_text = "%s\n%s\n%s\nElixir: %d" % [card.name, card.formula, card.ability, card.cost]
	var image = TextureRect.new()
	image.texture = Cards.texture(id)
	image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	image.mouse_filter = Control.MOUSE_FILTER_IGNORE
	button_node.add_child(image)
	full(image)
	image.offset_left = 5
	image.offset_top = 5
	image.offset_right = -5
	image.offset_bottom = -5
	return button_node
