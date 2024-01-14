import * as THREE from 'three';
import {covalentRadii, elementColors } from './atoms_data.js';

export function drawAtoms(scene, atoms) {
    // Create instanced meshes for each species
    let instancedMeshes = {};
    atoms.species.forEach((species, speciesIndex) => {
        const radius = covalentRadii[species.symbol] || 1;
        const atomGeometry = new THREE.SphereGeometry(radius/4, 32, 32);
        const defaultColor = 0xffffff;
        const color = species.symbol in elementColors ? elementColors[species.symbol] : defaultColor;
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: color,
            specular: 0x111111,
            shininess: 50,
        });

        // Count how many atoms of species there are
        const count = atoms.speciesIndices.filter(index => index === speciesIndex).length;
        const instancedMesh = new THREE.InstancedMesh(atomGeometry, sphereMaterial, count);
        // Set userData for the instanced mesh to identify it as an atom
        instancedMesh.userData.type = 'atom';
        instancedMesh.userData.symbol = species.symbol;
        instancedMeshes[speciesIndex] = instancedMesh;
        scene.add(instancedMesh);
    });

    // Position each atom in the instanced meshes
    const speciesInstanceIndices = {};
    atoms.speciesIndices.forEach((speciesIndex, globalIndex) => {
        if (!(speciesIndex in speciesInstanceIndices)) {
            speciesInstanceIndices[speciesIndex] = 0;
        }

        const instancedMesh = instancedMeshes[speciesIndex];
        const position = new THREE.Vector3(...atoms.positions[globalIndex]);
        const dummy = new THREE.Object3D();
        dummy.position.copy(position);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(speciesInstanceIndices[speciesIndex], dummy.matrix);
        speciesInstanceIndices[speciesIndex]++;
    });
    return instancedMeshes;
}
