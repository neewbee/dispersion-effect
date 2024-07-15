import {useMemo, useRef} from 'react'
import './App.css'
import {OrbitControls, useFBO} from "@react-three/drei";
import * as THREE from "three";
import {Canvas, useFrame} from "@react-three/fiber";
import { Leva, folder, useControls } from "leva";

import fragment from './GLSL/fragment.glsl?raw';
import vertex from './GLSL/vertex.glsl?raw';
import {range} from "./utils.js";

const Geometries = () => {
  const mesh = useRef(null);
  const backgroundRef = useRef(null);
  const mainRenderTarget = useFBO();

  const {
    iorR,
    iorY,
    iorG,
    iorC,
    iorB,
    iorP,
    saturation,
    chromaticAberration,
    refraction
  } = useControls({
    ior: folder({
      iorR: { min: 1.0, max: 2.333, step: 0.001, value: 1.15 },
      iorY: { min: 1.0, max: 2.333, step: 0.001, value: 1.16 },
      iorG: { min: 1.0, max: 2.333, step: 0.001, value: 1.18 },
      iorC: { min: 1.0, max: 2.333, step: 0.001, value: 1.22 },
      iorB: { min: 1.0, max: 2.333, step: 0.001, value: 1.22 },
      iorP: { min: 1.0, max: 2.333, step: 0.001, value: 1.22 },
    }),
    chromaticAberration: {
      value: 0.5,
      min: 0,
      max: 1.5,
      step: 0.01,
    },
    refraction: {
      value: 0.4,
      min: 0,
      max: 1,
      step: 0.01,
    },
    saturation: { value: 1.06, min: 1, max: 1.25, step: 0.01 },
  })

  const uniforms = useMemo(() => ({
    uTexture: {
      value: null
    },
    uIorR: { value: 1.0 },
    uIorY: { value: 1.0 },
    uIorG: { value: 1.0 },
    uIorC: { value: 1.0 },
    uIorB: { value: 1.0 },
    uIorP: { value: 1.0 },
    uSaturation: { value: 0.0 },
    uRefractPower: {
      value: 0.2,
    },
    uChromaticAberration: {
      value: 1.0
    },
    winResolution: {
      value: new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      ).multiplyScalar(Math.min(window.devicePixelRatio, 2)),
    }
  }), [])

  useFrame((state) => {
    const {gl, scene, camera} = state;
    mesh.current.visible = false;
    gl.setRenderTarget(mainRenderTarget);
    gl.render(scene, camera);
    mesh.current.material.uniforms.uTexture.value = mainRenderTarget.texture;
    gl.setRenderTarget(null);
    mesh.current.visible = true;

    mesh.current.material.uniforms.uIorR.value = iorR;
    mesh.current.material.uniforms.uIorY.value = iorY;
    mesh.current.material.uniforms.uIorG.value = iorG;
    mesh.current.material.uniforms.uIorC.value = iorC;
    mesh.current.material.uniforms.uIorB.value = iorB;
    mesh.current.material.uniforms.uIorP.value = iorP;

    mesh.current.material.uniforms.uSaturation.value = saturation;
    mesh.current.material.uniforms.uChromaticAberration.value = chromaticAberration;
    mesh.current.material.uniforms.uRefractPower.value = refraction;
  })


  const columns = range(-12.5, 27.5, 2.5)
  const rows = range(-12.5, 27.5, 2.5)

  return (
    <>
      <color attach="background" args={["black"]}></color>
      <group ref={backgroundRef}>
        {columns.map((column, i) => {
          return rows.map((row, j) => {
            return <mesh position={[column, row, -4]} key={`${i}-${j}`}>
              <icosahedronGeometry args={[0.333, 8]}></icosahedronGeometry>
              {/*<meshStandardMaterial color='white'></meshStandardMaterial>*/}
              <meshBasicMaterial color="white"/>

            </mesh>
          })
        })}
      </group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[2.84, 5]}></icosahedronGeometry>
        <shaderMaterial
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={uniforms}
        >
        </shaderMaterial>
      </mesh>
    </>

  )
}


function Scene() {
  return <>
    <Leva collapsed />
    <Canvas camera={{position: [0, 0, 6]}} dpr={[1, 2]}>
    <ambientLight intensity={1.0}/>
    <Geometries></Geometries>
    <OrbitControls></OrbitControls>
  </Canvas></>
}

function App() {
  return (
    <Scene></Scene>
  )
}

export default App
