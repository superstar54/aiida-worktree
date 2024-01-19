import * as THREE from 'three';
import {elementColors } from './atoms_data.js';
import {findNeighbors } from './utils.js';


export function drawBonds(scene, atoms) {
    const bonds = calculateBonds(atoms);
    const radius = 0.15; // Radius of the cylinder


    bonds.forEach(([index1, index2]) => {
        const position1 = new THREE.Vector3(...atoms.positions[index1]);
        const position2 = new THREE.Vector3(...atoms.positions[index2]);
        const color1 = new THREE.Color(elementColors[atoms.species[atoms.speciesArray[index1]].symbol]);
        const color2 = new THREE.Color(elementColors[atoms.species[atoms.speciesArray[index2]].symbol]);
        const material1 = new THREE.MeshPhongMaterial({ color: color1 }); // First color
        const material2 = new THREE.MeshPhongMaterial({ color: color2 }); // Second color

        const bondMesh = createCylinderBetweenPoints(position1, position2, radius, material1, material2);
        bondMesh.userData.type = 'bond';
        bondMesh.userData.symbol = index1 + '-' + index2;
        bondMesh.userData.uuid = atoms.uuid;
        scene.add(bondMesh);
    });
}



export function calculateBonds(atoms) {
    const neighbors = findNeighbors(atoms);
    const bondsData = buildBonds(neighbors);
    return bondsData;
}

export function buildBonds(neighbors) {
    const bonds = [];

    for (let i = 0; i < neighbors.length; i++) {
        for (const neighborIndex of neighbors[i]) {
            if (neighborIndex > i) {
                bonds.push([i, neighborIndex]); // Add a bond between atom i and its neighbor
            }
        }
    }

    return bonds;
}

export function createSingleBondSegment(start, end, radius, material) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const orientation = new THREE.Matrix4();
    orientation.lookAt(start, end, new THREE.Object3D().up);

    const edgeGeometry = new THREE.CylinderGeometry(radius, radius, direction.length(), 8, 1);
    const edge = new THREE.Mesh(edgeGeometry, material);
    edge.position.copy(new THREE.Vector3().addVectors(start, direction.multiplyScalar(0.5)));

    const axis = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
    const radians = Math.acos(new THREE.Vector3(0, 1, 0).dot(direction.normalize()));
    edge.quaternion.setFromAxisAngle(axis, radians);

    return edge;
}


export function createCylinderBetweenPoints(point1, point2, radius, material1, material2) {
    const midpoint = new THREE.Vector3().addVectors(point1, point2).multiplyScalar(0.5);
    const cylinder1 = createSingleBondSegment(point1, midpoint, radius, material1);
    const cylinder2 = createSingleBondSegment(midpoint, point2, radius, material2);

    const bondGroup = new THREE.Group();
    bondGroup.add(cylinder1);
    bondGroup.add(cylinder2);

    return bondGroup;
}
