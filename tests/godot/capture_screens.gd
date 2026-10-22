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
	for island in range(1,5):
		overworld.select_world(island)
		await capture("island-%d" % (island+1))
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
	battle._preview_screen(battle.camera.unproject_position(Vector3(-4.5,0,8.7)))
	await capture("05-placement")
	battle._pick_screen(battle.camera.unproject_position(Vector3(-4.5,0,8.7)))
	await capture("06-math")
	battle._cancel_placement()
	battle.frozen = true
	for unit in battle.units():
		if unit.is_tower and not unit.is_king and unit.team == 1 and unit.lane == 0:
			unit.take_damage(99999,null,true)
	await create_timer(0.9).timeout
	battle.frozen = false
	battle.elixir = 10
	battle._request_card(0)
	battle._preview_screen(battle.camera.unproject_position(Vector3(-4,0,-6.8)))
	await capture("07-conquered-left")
	battle._preview_screen(battle.camera.unproject_position(Vector3(4,0,-6.8)))
	await capture("08-protected-right")
	for unit in battle.units():
		if unit.is_tower and not unit.is_king and unit.team == 1 and unit.lane == 1:
			unit.take_damage(99999,null,true)
	await create_timer(0.9).timeout
	battle._preview_screen(battle.camera.unproject_position(Vector3(4,0,-6.8)))
	await capture("09-conquered-both")
	battle.enemy_king.take_damage(99999,null,true)
	await capture("10-victory")
	battle.queue_free()
	await process_frame
	game.result_claimed = false
	var timed = load("res://scenes/BattleArena3D.tscn").instantiate()
	root.add_child(timed)
	await process_frame
	timed.remaining = 0.01
	timed._process(0.02)
	await capture("11-timeout-draw")
	timed.queue_free()
	await process_frame
	var gallery = load("res://scenes/CharacterGallery.tscn").instantiate()
	root.add_child(gallery)
	for index in [0,1,2,3,4,7,10,11,13,14,16,18,28,32,36]:
		gallery.show_card(index)
		await capture("native-%02d" % (index+1))
	gallery.show_card(1)
	gallery.character.animation.play("attack")
	gallery.character.animation.advance(0.3)
	gallery.character.animation.pause()
	await capture("native-02-attack")
	gallery.character.rotation.y = PI/2
	await capture("native-02-side")
	for index in [0,1,2]:
		gallery.show_card(index)
		for state in ["idle","walk","attack"]:
			gallery.character.animation.play(state)
			gallery.character.animation.pause()
			for phase in [0.0,0.18,0.30,0.44,0.60,0.85]:
				gallery.character.animation.seek(gallery.character.animation.current_animation_length*phase,true)
				await capture("motion-%02d-%s-%02d" % [index+1,state,int(phase*100)])
	gallery.queue_free()
	await process_frame
	for world in range(1,5):
		game.active_stage = world*6
		var themed = load("res://scenes/BattleArena3D.tscn").instantiate()
		root.add_child(themed)
		await process_frame
		themed.frozen = true
		await capture("arena-world-%d" % (world+1))
		themed.queue_free()
		await process_frame
	print("Native characters, touch placement, five arenas and gallery captured.")
	quit(0)
