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
		mat.vertex_color_use_as_albedo = true
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

# Closed, tailored cross sections: x/z are half widths and y is the height.
# Meshes are cached across every card that shares the same silhouette.
static func loft(parent: Node3D, label: String, point: Vector3, sections: Array[Vector3], mat: Material, sides: int = 10) -> MeshInstance3D:
	var key = "loft:" + str(sections) + ":" + str(sides)
	if not meshes.has(key):
		var surface = SurfaceTool.new()
		surface.begin(Mesh.PRIMITIVE_TRIANGLES)
		for row in range(sections.size()-1):
			var a = sections[row]
			var b = sections[row+1]
			for side in range(sides):
				var angle = (side+0.5)*TAU/sides
				var next = (side+1.5)*TAU/sides
				var vertices = [Vector3(cos(angle)*a.x,a.y,sin(angle)*a.z),Vector3(cos(angle)*b.x,b.y,sin(angle)*b.z),Vector3(cos(next)*b.x,b.y,sin(next)*b.z),Vector3(cos(next)*a.x,a.y,sin(next)*a.z)]
				for index in [0,2,1,0,3,2]: surface.add_vertex(vertices[index])
		surface.set_smooth_group(-1)
		for cap in [0,sections.size()-1]:
			var row = sections[cap]
			for side in range(sides):
				var a = (side+0.5)*TAU/sides
				var b = (side+1.5)*TAU/sides
				var ring_a = Vector3(cos(a)*row.x,row.y,sin(a)*row.z)
				var ring_b = Vector3(cos(b)*row.x,row.y,sin(b)*row.z)
				for vertex in [Vector3(0,row.y,0),ring_b if cap==0 else ring_a,ring_a if cap==0 else ring_b]: surface.add_vertex(vertex)
		surface.generate_normals()
		meshes[key] = surface.commit()
	var node = MeshInstance3D.new()
	node.name = label
	node.mesh = meshes[key]
	node.position = point
	node.material_override = mat
	parent.add_child(node)
	return node

# Extruded front silhouette, used for kite shields, cloth panels and lapels.
# Outline points follow the perimeter clockwise when looking at the front (-Z).
static func panel(parent: Node3D, label: String, point: Vector3, outline: PackedVector2Array, depth: float, mat: Material) -> MeshInstance3D:
	var key = "panel:" + str(outline) + ":" + str(depth)
	if not meshes.has(key):
		var surface = SurfaceTool.new()
		surface.begin(Mesh.PRIMITIVE_TRIANGLES)
		surface.set_smooth_group(-1)
		var triangles = Geometry2D.triangulate_polygon(outline)
		for face in [-1.0,1.0]:
			for i in range(0,triangles.size(),3):
				var order = [0,1,2] if face<0 else [2,1,0]
				for j in order:
					var v = outline[triangles[i+j]]
					surface.add_vertex(Vector3(v.x,v.y,face*depth/2))
		for i in range(outline.size()):
			var a = outline[i]
			var b = outline[(i+1)%outline.size()]
			var vertices = [Vector3(a.x,a.y,-depth/2),Vector3(a.x,a.y,depth/2),Vector3(b.x,b.y,depth/2),Vector3(b.x,b.y,-depth/2)]
			for index in [0,2,1,0,3,2]: surface.add_vertex(vertices[index])
		surface.generate_normals()
		meshes[key] = surface.commit()
	var node = MeshInstance3D.new()
	node.name = label
	node.mesh = meshes[key]
	node.position = point
	node.material_override = mat
	parent.add_child(node)
	return node

static func instances(parent: Node3D, label: String, kind: String, transforms: Array[Transform3D], mat: Material) -> MultiMeshInstance3D:
	var multi = MultiMesh.new()
	multi.transform_format = MultiMesh.TRANSFORM_3D
	multi.mesh = primitive(kind)
	multi.instance_count = transforms.size()
	for index in range(transforms.size()): multi.set_instance_transform(index,transforms[index])
	var node = MultiMeshInstance3D.new()
	node.name = label
	node.multimesh = multi
	node.material_override = mat
	parent.add_child(node)
	return node

# Sculpted meshes share topology but carry their own relief and material shading.
static func sculpted_head(parent: Node3D, mat: Material) -> MeshInstance3D:
	var key = "anatomical_head_v1"
	if not meshes.has(key):
		var sections = [Vector3(0.045,-0.235,0.055),Vector3(0.12,-0.195,0.11),Vector3(0.162,-0.12,0.145),Vector3(0.194,-0.035,0.163),Vector3(0.19,0.045,0.17),Vector3(0.188,0.12,0.167),Vector3(0.163,0.20,0.14),Vector3(0.085,0.25,0.075),Vector3(0.008,0.27,0.008)]
		var rows: Array = []
		for section in sections:
			var row: Array[Vector3] = []
			for side in range(32):
				var angle = side*TAU/32
				var x = cos(angle)*section.x
				var y = section.y
				var z = sin(angle)*section.z
				if z < 0:
					# Eye sockets, cheekbones and the bridge are part of the mesh.
					var socket = exp(-pow((absf(x)-0.078)/0.036,2)-pow((y-0.045)/0.055,2))
					var cheek = exp(-pow((absf(x)-0.105)/0.05,2)-pow((y+0.045)/0.06,2))
					z += 0.018*socket-0.014*cheek-0.014*exp(-pow(x/0.035,2)-pow(y/0.10,2))
				row.append(Vector3(x,y,z))
			rows.append(row)
		var surface = SurfaceTool.new()
		surface.begin(Mesh.PRIMITIVE_TRIANGLES)
		for row in range(rows.size()-1):
			for side in range(32):
				var next = (side+1)%32
				for v in [rows[row][side],rows[row+1][next],rows[row+1][side],rows[row][side],rows[row][next],rows[row+1][next]]:
					var shade = 1.0-0.12*exp(-pow((v.y+0.19)/0.055,2))
					surface.set_color(Color(shade,shade,shade))
					surface.add_vertex(v)
		surface.generate_normals()
		meshes[key] = surface.commit()
	var node = MeshInstance3D.new()
	node.name = "SculptedFace"
	node.mesh = meshes[key]
	node.material_override = mat
	parent.add_child(node)
	return node

static func pleated_robe(parent: Node3D, mat: Material) -> MeshInstance3D:
	var key = "pleated_robe_v1"
	if not meshes.has(key):
		var rows = [Vector3(0.40,-0.91,0.29),Vector3(0.385,-0.80,0.28),Vector3(0.35,-0.62,0.255),Vector3(0.29,-0.38,0.21),Vector3(0.25,-0.25,0.18),Vector3(0.22,-0.15,0.16)]
		var surface = SurfaceTool.new()
		surface.begin(Mesh.PRIMITIVE_TRIANGLES)
		for row in range(rows.size()-1):
			for side in range(48):
				for offset in [Vector2i(0,0),Vector2i(1,1),Vector2i(1,0),Vector2i(0,0),Vector2i(0,1),Vector2i(1,1)]:
					var section = rows[row+offset.x]
					var angle = (side+offset.y)*TAU/48
					var fold = cos(angle*8)
					var radius = 1.0+fold*lerpf(0.10,0.025,(section.y+0.91)/0.76)
					var shade = 0.91+fold*0.09
					surface.set_color(Color(shade,shade,shade))
					surface.add_vertex(Vector3(cos(angle)*section.x*radius,section.y,sin(angle)*section.z*radius))
		surface.generate_normals()
		meshes[key] = surface.commit()
	var node = MeshInstance3D.new()
	node.name = "PleatedRobe"
	node.mesh = meshes[key]
	node.material_override = mat
	parent.add_child(node)
	return node

static func cowl(parent: Node3D, mat: Material, trim: Material) -> void:
	var key = "tailored_cowl_v1"
	if not meshes.has(key):
		# Elliptical opening, rolled edge, shoulders and closed back.
		var rings = [Vector4(0.211,0.276,-0.178,0.018),Vector4(0.248,0.312,-0.197,0.018),Vector4(0.295,0.355,-0.025,0.025),Vector4(0.245,0.31,0.155,0.04),Vector4(0.005,0.005,0.24,0.065)]
		var surface = SurfaceTool.new()
		surface.begin(Mesh.PRIMITIVE_TRIANGLES)
		for row in range(rings.size()-1):
			for side in range(32):
				for offset in [Vector2i(0,0),Vector2i(1,0),Vector2i(1,1),Vector2i(0,0),Vector2i(1,1),Vector2i(0,1)]:
					var ring = rings[row+offset.x]
					var angle = (side+offset.y)*TAU/32
					var shade = [0.40,1.0,0.86,0.75,0.75][row+offset.x]
					surface.set_color(Color(shade,shade,shade))
					surface.add_vertex(Vector3(cos(angle)*ring.x,ring.w+sin(angle)*ring.y,ring.z))
		surface.generate_normals()
		meshes[key] = surface.commit()
	var node = MeshInstance3D.new()
	node.name = "TailoredCowl"
	node.mesh = meshes[key]
	node.material_override = mat
	parent.add_child(node)
	var points: Array[Vector3] = []
	for side in range(49):
		var angle = side*TAU/48
		points.append(Vector3(cos(angle)*0.231,0.018+sin(angle)*0.295,-0.20))
	curve(parent,points,0.006,trim)

# Curved, tapering locks are merged into one draw surface per hair/beard bundle.
static func locks(parent: Node3D, label: String, paths: Array, radius: float, mat: Material) -> MeshInstance3D:
	var surface = SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for path in paths:
		for row in range(path.size()-1):
			for side in range(8):
				for offset in [Vector2i(0,0),Vector2i(1,0),Vector2i(1,1),Vector2i(0,0),Vector2i(1,1),Vector2i(0,1)]:
					var at = row+offset.x
					var tangent = (path[mini(at+1,path.size()-1)]-path[maxi(at-1,0)]).normalized()
					var normal = tangent.cross(Vector3.FORWARD)
					if normal.length_squared()<0.01: normal = tangent.cross(Vector3.UP)
					normal = normal.normalized()
					var binormal = tangent.cross(normal).normalized()
					var progress = float(at)/(path.size()-1)
					var width = radius*maxf(0.035,1.0-pow(progress,1.6))
					var angle = (side+offset.y)*TAU/8
					var shade = 0.9+0.1*cos(angle)
					surface.set_color(Color(shade,shade,shade))
					surface.add_vertex(path[row+offset.x]+(normal*cos(angle)+binormal*sin(angle))*width)
	surface.generate_normals()
	var node = MeshInstance3D.new()
	node.name = label
	node.mesh = surface.commit()
	node.material_override = mat
	parent.add_child(node)
	return node
