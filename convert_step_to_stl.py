import sys
import os
import traceback

def log(msg):
    print(str(msg), file=sys.stderr, flush=True)

def import_freecad_modules():
    # Docker also sets this, but keep it here for safety.
    candidates = [
        "/usr/lib/freecad-python3/lib",
        "/usr/lib/freecad/lib",
        "/usr/lib/freecad-daily/lib",
    ]
    for p in candidates:
        if os.path.exists(p) and p not in sys.path:
            sys.path.insert(0, p)

    import FreeCAD
    import Part
    import Mesh

    try:
        import MeshPart
    except Exception:
        MeshPart = None

    return FreeCAD, Part, Mesh, MeshPart

def mesh_shape_to_stl(shape, output_path, linear_deflection=0.12):
    FreeCAD, Part, Mesh, MeshPart = import_freecad_modules()

    if shape is None or shape.isNull():
        raise Exception("Shape is empty/null")

    if MeshPart is not None:
        try:
            mesh = MeshPart.meshFromShape(
                Shape=shape,
                LinearDeflection=linear_deflection,
                AngularDeflection=0.35,
                Relative=False
            )
            mesh.write(output_path)
            return
        except Exception as e:
            log("MeshPart failed, fallback tessellate used: " + str(e))

    verts, faces = shape.tessellate(linear_deflection)
    if not verts or not faces:
        raise Exception("Tessellate produced no vertices/faces")

    mesh = Mesh.Mesh()
    for face in faces:
        if len(face) >= 3:
            for i in range(1, len(face) - 1):
                mesh.addFacet(verts[face[0]], verts[face[i]], verts[face[i + 1]])
    mesh.write(output_path)

def read_step_shape(input_path):
    FreeCAD, Part, Mesh, MeshPart = import_freecad_modules()
    shape = Part.Shape()
    shape.read(input_path)
    if shape.isNull():
        raise Exception("Part.Shape.read returned null shape")
    return shape

def main():
    if len(sys.argv) >= 2 and sys.argv[1] == "HEALTH":
        try:
            FreeCAD, Part, Mesh, MeshPart = import_freecad_modules()
            log("FreeCAD Python libs OK; MeshPart=" + str(MeshPart is not None))
            return 0
        except Exception:
            log("FreeCAD Python health check failed:")
            log(traceback.format_exc())
            return 20

    if len(sys.argv) < 3:
        log("Usage: python3 convert_step_to_stl.py input.step output.stl")
        return 2

    input_path = os.path.abspath(sys.argv[1])
    output_path = os.path.abspath(sys.argv[2])

    if not os.path.exists(input_path):
        log("Input not found: " + input_path)
        return 3

    log("Input extension: " + os.path.splitext(input_path)[1])

    try:
        shape = read_step_shape(input_path)

        try:
            bbox = shape.BoundBox
            log(f"Shape bbox mm: X={bbox.XLength:.3f} Y={bbox.YLength:.3f} Z={bbox.ZLength:.3f}")
        except Exception:
            pass

        mesh_shape_to_stl(shape, output_path)

        if not os.path.exists(output_path):
            log("Output STL was not created")
            return 5

        size = os.path.getsize(output_path)
        if size < 100:
            log("Output STL too small: " + str(size) + " bytes")
            return 6

        log("STEP converted successfully to STL: " + output_path + " size=" + str(size))
        return 0

    except Exception:
        log("Exception during STEP conversion:")
        log(traceback.format_exc())
        return 10

if __name__ == "__main__":
    raise SystemExit(main())
