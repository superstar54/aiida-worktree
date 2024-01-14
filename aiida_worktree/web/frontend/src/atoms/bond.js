import * as THREE from 'three';
import { calculateBonds, createCylinderBetweenPoints} from './utils.js';
import {elementColors } from './atoms_data.js';


export function drawBonds(scene, atoms) {
    const bonds = calculateBonds(atoms);
    const radius = 0.05; // Radius of the cylinder


    bonds.forEach(([index1, index2]) => {
        const position1 = new THREE.Vector3(...atoms.positions[index1]);
        const position2 = new THREE.Vector3(...atoms.positions[index2]);
        const color1 = new THREE.Color(elementColors[atoms.species[atoms.speciesIndices[index1]].symbol]);
        const color2 = new THREE.Color(elementColors[atoms.species[atoms.speciesIndices[index2]].symbol]);
        const material1 = new THREE.MeshPhongMaterial({ color: color1 }); // First color
        const material2 = new THREE.MeshPhongMaterial({ color: color2 }); // Second color

        const bondMesh = createCylinderBetweenPoints(position1, position2, radius, material1, material2);
        scene.add(bondMesh);
    });
}
