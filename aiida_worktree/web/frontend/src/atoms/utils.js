import * as THREE from 'three';
import {covalentRadii } from './atoms_data.js';

export function calculateBonds(atoms) {
    const bonds = [];
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

            const radius1 = covalentRadii[species1]*1.1 || 1;
            const radius2 = covalentRadii[species2]*1.1 || 1;
            if (distance < radius1 + radius2) {
                bonds.push([i, j]);
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
