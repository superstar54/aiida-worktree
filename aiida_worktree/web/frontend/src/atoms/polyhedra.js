import {elementsWithPolyhedra } from './atoms_data.js';
import * as THREE from 'three';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { elementColors } from './atoms_data.js';
import { findNeighbors } from './utils.js';

const defaultColor = 0xffffff;

export function drawPolyhedra(scene, atoms) {
    const polyhedraData = calculateCoordinationPolyhedra(atoms);

    for (const polyhedra of polyhedraData) {
        const vertices = [];

        // Assuming neighbors.length is the number of vertices
        for (const neighbor of polyhedra.neighbors) {
            const vertex = new THREE.Vector3(...atoms.positions[neighbor]);
			vertices.push( vertex );
        }

        const geometry = new ConvexGeometry( vertices );
        const symbol = atoms.speciesArray[polyhedra.atomIndex];
        const color = symbol in elementColors ? elementColors[symbol] : defaultColor;
		const material = new THREE.MeshPhongMaterial({
            color: color,
            specular: 0x111111,
            shininess: 50,
            transparent: true, // Enable transparency
            opacity: 0.8,      // Set the opacity value (0.0 to 1.0, where 0.0 is fully transparent and 1.0 is fully opaque)
        });
		const mesh = new THREE.Mesh( geometry, material );
        mesh.userData.type = 'bond';
        mesh.userData.symbol = symbol;
        mesh.userData.uuid = atoms.uuid;
		scene.add( mesh );
    }
}


export function calculateCoordinationPolyhedra(atoms) {
    const coordinationPolyhedra = [];
    const neighbors = findNeighbors(atoms);

    for (let i = 0; i < atoms.getAtomsCount(); i++) {
        const position = atoms.positions[i];
        // if species is not in elementsWithPolyhedra (a list), skip
        if (!elementsWithPolyhedra.includes(atoms.speciesArray[i])) {
            continue;
        }
        if (neighbors[i].length < 4) {
            // If the number of neighbors is less than 4, skip
            continue;
        }
        coordinationPolyhedra.push({
            atomIndex: i,
            neighbors: neighbors[i],
        });
    }

    return coordinationPolyhedra;
}
