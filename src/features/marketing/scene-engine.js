// An explicit export surface keeps unrelated Three.js modules out of the lazy chunk.
export {
  WebGLRenderer,
  ACESFilmicToneMapping,
  Scene,
  OrthographicCamera,
  HemisphereLight,
  DirectionalLight,
  MeshStandardMaterial,
  Mesh,
  TorusGeometry,
  Group,
  Shape,
  Path,
  ExtrudeGeometry,
} from 'three'
export { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
