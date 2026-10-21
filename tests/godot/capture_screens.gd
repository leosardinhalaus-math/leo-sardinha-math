extends SceneTree

func _initialize() -> void:
	call_deferred("run")

func capture(screen_name: String) -> void:
	for frame in range(8):
		await process_frame
	await RenderingServer.frame_post_draw
	var status = root.get_texture().get_image().save_png("res://build/screens/%s.png" % screen_name)
	if status != OK:
		push_error("Could not save screenshot: " + screen_name)
		quit(1)

func run() -> void:
	await process_frame
	DirAccess.make_dir_recursive_absolute("res://build/screens")
	var menu = load("res://scenes/MainMenu.tscn").instantiate()
	root.add_child(menu)
	await capture("01-menu")
	menu.show_deck()
	await capture("02-deck")
	menu.queue_free()
	await process_frame
	var overworld = load("res://scenes/IslandOverworld.tscn").instantiate()
	root.add_child(overworld)
	await capture("03-islands")
	overworld.queue_free()
	await process_frame
	var game = root.get_node("Game")
	game.quick_battle = true
	var battle = load("res://scenes/BattleArena3D.tscn").instantiate()
	root.add_child(battle)
	await process_frame
	battle.frozen = true
	var cards = root.get_node("Cards")
	for index in range(4):
		battle._spawn(cards.card(index + 1), index % 2, index % 2, Vector3(-3 if index % 2 == 0 else 3, 0, -2 + index * 1.5))
	await capture("04-arena")
	battle.frozen = false
	battle.elixir = 10
	battle._request_card(0)
	await capture("05-math")
	print("Five rendered screenshots captured.")
	quit(0)
