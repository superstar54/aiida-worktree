import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export function createLabel(text, position, color = 'black') {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'axis-label';
    labelDiv.textContent = text;
    labelDiv.style.color = color;
    labelDiv.style.fontSize = '14px';

    const label = new CSS2DObject(labelDiv);
    label.position.copy(position);

    return label;
}

export function drawAtomLabels(scene, atoms, type = 'symbol', labels = []) {
    // Iterate over atoms and update labels
    console.log("labels", labels)
    // Clear existing labels
    if (labels && labels.length > 0) {
        labels.forEach(label => {
            scene.remove(label);
            if (label.geometry) label.geometry.dispose();
            if (label.material) label.material.dispose();
        });
        labels.length = 0; // Clear the array
    } else {
        labels = []; // Initialize the storage if it's not provided
    }
    var symbol
    for (let i = 0; i < atoms.positions.length; i++) {
        const position = new THREE.Vector3(...atoms.positions[i]);
        if (type === 'symbol') {
            symbol = atoms.species[atoms.speciesArray[i]].symbol;
        }
        else if (type === 'index') {
            symbol = i;
        }
        else if (type === 'none') {
            return;
        }
        else {
            console.warn(`Invalid label type: ${type}`);
            return;
        }
        // Create or update the label for each atom
        const label = createLabel(symbol, position, 'white');
        scene.add(label);
        labels.push(label); // Store the label for future reference
    }
    return labels;
}
