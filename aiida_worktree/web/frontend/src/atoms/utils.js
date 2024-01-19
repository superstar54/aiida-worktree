import * as THREE from 'three';
import {covalentRadii } from './atoms_data.js';

export function findNeighbors(atoms) {
    const neighbors = new Array(atoms.positions.length);
    for (let i = 0; i < neighbors.length; i++) {
        neighbors[i] = [];
    }

    for (let i = 0; i < atoms.positions.length; i++) {
        for (let j = i + 1; j < atoms.positions.length; j++) {
            const index1 = i;
            const index2 = j;

            const species1 = atoms.species[atoms.speciesArray[index1]].symbol;
            const species2 = atoms.species[atoms.speciesArray[index2]].symbol;

            const pos1 = new Float32Array(atoms.positions[index1]);
            const pos2 = new Float32Array(atoms.positions[index2]);

            const distance = Math.sqrt(
                Math.pow(pos1[0] - pos2[0], 2) +
                Math.pow(pos1[1] - pos2[1], 2) +
                Math.pow(pos1[2] - pos2[2], 2)
            );

            const radius1 = covalentRadii[species1] * 1.1 || 1;
            const radius2 = covalentRadii[species2] * 1.1 || 1;

            if (distance < radius1 + radius2) {
                neighbors[index1].push(index2); // Add index2 as a neighbor of index1
                neighbors[index2].push(index1); // Add index1 as a neighbor of index2
            }
        }
    }

    return neighbors;
}

export function clearObjects(scene, uuid=null) {
    // Clone the children array since we'll be modifying it as we go
    const children = [...scene.children];

    children.forEach(child => {
        // If uuid is specified, only remove objects with matching uuid
        if (uuid !== null && (!child.userData || child.userData.uuid !== uuid)) {
            return; // Skip this object
        }

        // Check if the object is not a camera or a light
        if (!(child instanceof THREE.Camera) && !(child instanceof THREE.Light)) {
            scene.remove(child);

            // Dispose geometry and material if they exist
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
    });
}


export function createHighlight(position, scale) {
    const highlightGeometry = new THREE.SphereGeometry(1, 32, 32); // Unit sphere
    const highlightMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xffff00), // Yellow color
        transparent: true, // Make it transparent
        opacity: 0.2, // Set the transparency level (0.0 to 1.0)
    });
    const scaleMultiplier = 1.1; // Adjust the scale factor as needed (1.1 makes it slightly larger)
    const highlightedAtomMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightedAtomMesh.position.copy(position)
    // Scale the highlighted atom mesh
    highlightedAtomMesh.scale.set(
        scale.x * scaleMultiplier,
        scale.y * scaleMultiplier,
        scale.z * scaleMultiplier
    );
    console.log("highlightedAtomMesh: ", highlightedAtomMesh)
    return highlightedAtomMesh
}
