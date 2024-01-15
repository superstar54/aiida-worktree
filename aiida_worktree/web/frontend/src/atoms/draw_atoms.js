import * as THREE from 'three';
import { covalentRadii, elementColors } from './atoms_data.js';

const defaultColor = 0xffffff;

export function drawAtoms(scene, atoms, scale=0.4) {
    // Create instanced meshes for each species
    let instancedMeshes = {};
    Object.entries(atoms.species).forEach(([symbol, species], speciesIndex) => {
        const radius = covalentRadii[symbol] || 1;
        const atomGeometry = new THREE.SphereGeometry(radius*scale, 32, 32);
        const color = symbol in elementColors ? elementColors[symbol] : defaultColor;
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: color,
            specular: 0x111111,
            shininess: 50,
        });

        // Count how many atoms of species there are
        const count = atoms.speciesArray.filter(index => atoms.species[index].symbol === symbol).length;
        const instancedMesh = new THREE.InstancedMesh(atomGeometry, sphereMaterial, count);
        // Set userData for the instanced mesh to identify it as an atom
        instancedMesh.userData.type = 'atom';
        instancedMesh.userData.symbol = symbol;
        instancedMesh.userData.uuid = atoms.uuid;
        instancedMeshes[symbol] = instancedMesh;
        scene.add(instancedMesh);
    });

    // Position each atom in the instanced meshes
    const speciesInstanceIndices = {};
    atoms.speciesArray.forEach((symbol, globalIndex) => {
        if (!(symbol in speciesInstanceIndices)) {
            speciesInstanceIndices[symbol] = 0;
        }

        const instancedMesh = instancedMeshes[symbol];
        const position = new THREE.Vector3(...atoms.positions[globalIndex]);
        const dummy = new THREE.Object3D();
        dummy.position.copy(position);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(speciesInstanceIndices[symbol], dummy.matrix);
        speciesInstanceIndices[symbol]++;
    });

    return instancedMeshes;
}
