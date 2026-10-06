import { readFile, writeFile } from 'node:fs/promises'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { LoopSubdivision } from 'three-subdivide'

const sourcePath = new URL('../public/assets/models/baymax/baymax-white.obj', import.meta.url)
const outputPath = new URL('../public/assets/models/baymax/baymax-optimized.glb', import.meta.url)

class NodeFileReader {
  result = null
  onloadend = null

  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result
      this.onloadend?.()
    })
  }
}

globalThis.FileReader = NodeFileReader

const source = await readFile(sourcePath, 'utf8')
const model = new OBJLoader().parse(source)
const material = new THREE.MeshStandardMaterial({ color: 0xffffff })

model.traverse((object) => {
  if (!object.isMesh) return

  const isArm = object.name === 'LeftArm' || object.name === 'RightArm'
  const sourceGeometry = object.geometry
  const cleanGeometry = sourceGeometry.clone()
  cleanGeometry.deleteAttribute('normal')
  cleanGeometry.deleteAttribute('uv')

  const weldedGeometry = mergeVertices(cleanGeometry, 1e-4)
  weldedGeometry.computeVertexNormals()
  const subdividedGeometry = LoopSubdivision.modify(weldedGeometry, object.name === 'Stamp' ? 1 : 2, {
    split: true,
    uvSmooth: false,
    preserveEdges: object.name === 'Stamp' || isArm,
    weight: 1,
    maxTriangles: 120000,
  })

  subdividedGeometry.deleteAttribute('normal')
  object.geometry = mergeVertices(subdividedGeometry, 1e-4)
  object.geometry.computeVertexNormals()
  object.material = material

  subdividedGeometry.dispose()
  weldedGeometry.dispose()
  cleanGeometry.dispose()
  sourceGeometry.dispose()
})

const exporter = new GLTFExporter()
const glb = await exporter.parseAsync(model, {
  binary: true,
  onlyVisible: true,
  includeCustomExtensions: false,
})

await writeFile(outputPath, Buffer.from(glb))
console.log(`Wrote ${outputPath.pathname} (${(glb.byteLength / 1024).toFixed(1)} KiB)`)
