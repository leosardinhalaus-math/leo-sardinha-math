extends SceneTree

# Compara a identidade dos personagens nativos sem precisar rodar o jogo inteiro.
var checks: int = 0
var failures: Array[String] = []

func check(ok: bool, message: String) -> void:
	checks += 1
	if not ok:
		failures.append(message)
		push_error(message)

func _initialize() -> void:
	call_deferred("run_checks")

func run_checks() -> void:
	await process_frame
	var cards = root.get_node("Cards")
	var character_scene = load("res://scenes/NativeCharacter.tscn")
	for key in ["slope", "power"]:
		var card: Dictionary = {}
		for entry in cards.entries:
			if str(entry.key) == key:
				card = entry
				break
		check(not card.is_empty(), "Card profile found: " + key)
		if card.is_empty():
			continue
		var model = character_scene.instantiate()
		root.add_child(model)
		model.configure(card)
		check(str(model.get_meta("card_key")) == key, "Correct 3D character identity: " + key)
		check(model.get_meta("native_godot_model") == true, "Character renders as Godot geometry: " + key)
		for animation_name in ["idle", "walk", "run", "jump", "summon", "attack", "power", "hurt", "victory", "defeat"]:
			check(model.animation.has_animation(animation_name), "Animation " + animation_name + " exists for " + key)
			model.animation.play(animation_name)
			model.animation.advance(0.2)
		check(model.find_child("CapeFollow", true, false) != null, "Cape cloth follow exists: " + key)
		if key == "slope":
			for node_name in ["SlopeGoldCorsetPiping", "SlopeCapeClasp", "Ponytail", "PonytailLocks", "HairFollow", "BowstringTop", "BowstringBottom", "Arrow"]:
				check(model.find_child(node_name, true, false) != null, "Arqueira detail: " + node_name)
			check(model.bow_links.size() > 0, "Arqueira draws bow with articulated arms")
		else:
			for node_name in ["SculptedBeard", "BeardFollow", "PowerStaffRunestone", "StaffGem", "CutCape", "CapeFollow"]:
				check(model.find_child(node_name, true, false) != null, "Mago detail: " + node_name)
		model.queue_free()
		await process_frame
	print("Godot character QA: %d assertions, %d failures" % [checks, failures.size()])
	quit(0 if failures.is_empty() else 1)
