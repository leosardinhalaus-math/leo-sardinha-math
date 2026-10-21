@tool
extends RefCounted

# Shared low-poly meshes/materials keep native characters small and reusable.
static var meshes: Dictionary = {}
static var materials: Dictionary = {}

static func material(color: Color, metal: bool = false, luminous: bool = false) -> StandardMaterial3D:
	var key = color.to_html() + str(metal) + str(luminous)
	if not materials.has(key):
		var mat = StandardMaterial3D.new()
		mat.albedo_color = color
		mat.metallic = 0.65 if metal else 0.0
		mat.roughness = 0.38 if metal else 0.85
		if color.a < 1.0:
			mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
			mat.cull_mode = BaseMaterial3D.CULL_DISABLED
		if luminous:
			mat.emission_enabled = true
			mat.emission = Color(color, 1.0)
			mat.emission_energy_multiplier = 0.65
		materials[key] = mat
	return materials[key]

static func primitive(kind: String) -> Mesh:
	if not meshes.has(kind):
		match kind:
			"sphere":
				var shape = SphereMesh.new()
				shape.radius = 1.0
				shape.height = 2.0
				shape.radial_segments = 12
				shape.rings = 8
				meshes[kind] = shape
			"cylinder", "cone":
				var shape = CylinderMesh.new()
				shape.top_radius = 0.0 if kind == "cone" else 1.0
				shape.bottom_radius = 1.0
				shape.height = 1.0
				shape.radial_segments = 12
				meshes[kind] = shape
			"ring":
				var shape = TorusMesh.new()
				shape.inner_radius = 0.86
				shape.outer_radius = 1.0
				shape.rings = 20
				shape.ring_segments = 6
				meshes[kind] = shape
			_:
				meshes[kind] = BoxMesh.new()
	return meshes[kind]

static func part(parent: Node3D, label: String, kind: String, point: Vector3, dimensions: Vector3, mat: Material, detail: bool = false) -> MeshInstance3D:
	var mesh = MeshInstance3D.new()
	mesh.name = label
	mesh.mesh = primitive(kind)
	mesh.position = point
	mesh.scale = dimensions
	mesh.material_override = mat
	if detail:
		mesh.visibility_range_end = 14.0
		mesh.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	parent.add_child(mesh)
	return mesh

static func segment(parent: Node3D, label: String, start: Vector3, end: Vector3, radius: float, mat: Material) -> MeshInstance3D:
	var mesh = part(parent, label, "cylinder", (start + end) / 2.0, Vector3(radius, start.distance_to(end), radius), mat)
	var direction = (end - start).normalized()
	if direction.length_squared() > 0.01:
		mesh.quaternion = Quaternion(Vector3.UP, direction)
	return mesh

static func pivot(parent: Node3D, label: String, point: Vector3) -> Node3D:
	var node = Node3D.new()
	node.name = label
	node.position = point
	parent.add_child(node)
	return node

static func curve(parent: Node3D, points: Array[Vector3], radius: float, mat: Material) -> void:
	if points.size() < 2: return
	var surface = SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for index in range(points.size()-1):
		var tangent = (points[index+1]-points[index]).normalized()
		var normal = tangent.cross(Vector3.FORWARD)
		if normal.length_squared() < 0.01: normal = tangent.cross(Vector3.UP)
		normal = normal.normalized()
		var binormal = tangent.cross(normal).normalized()
		for side in range(6):
			var angle_a = side*TAU/6
			var angle_b = (side+1)*TAU/6
			var offset_a = (normal*cos(angle_a)+binormal*sin(angle_a))*radius
			var offset_b = (normal*cos(angle_b)+binormal*sin(angle_b))*radius
			for vertex in [points[index]+offset_a,points[index+1]+offset_a,points[index+1]+offset_b,points[index]+offset_a,points[index+1]+offset_b,points[index]+offset_b]:
				surface.add_vertex(vertex)
	surface.generate_normals()
	var mesh = MeshInstance3D.new()
	mesh.name = "ArcaneFilament"
	mesh.mesh = surface.commit()
	mesh.material_override = mat
	parent.add_child(mesh)
