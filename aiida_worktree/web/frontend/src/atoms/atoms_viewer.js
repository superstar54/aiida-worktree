import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { GUI } from 'dat.gui'
import { drawUnitCell, drawUnitCellVectors } from './cell.js';
import { drawBonds } from './bond.js';
import { drawAtoms } from './draw_atoms.js';
import { createViewpointButtons } from './viewpoint.js';
import { setupCameraGUI } from './camera.js';
import { clearObjects, createHighlight } from './utils.js';
import { drawAtomLabels } from './draw_label.js';
import {drawPolyhedra} from './polyhedra.js';

class AtomsViewer {
    constructor(tjs, atoms) {
        this.tjs = tjs
        this.atoms = atoms;
        this.uuid = THREE.MathUtils.generateUUID(); // Generate and assign a UUID
        this.atoms.uuid = this.uuid;
        this.selectedAtoms = new Set(); // Store selected atoms
        this.selectedAtomMesh = new THREE.Group(); // Create a group for highlighted atoms
        this.tjs.scene.add(this.selectedAtomMesh); // Add it to the scene
        this.init();
    }

    onMouseDown(event) {
        this.isMouseDown = true;
        this.mouseDownPosition.set(event.clientX, event.clientY);
    }

    onMouseUp(event) {
        this.isMouseDown = false;
    }

    onMouseClick(event) {
        // Calculate the distance the mouse moved
        const dx = event.clientX - this.mouseDownPosition.x;
        const dy = event.clientY - this.mouseDownPosition.y;
        const distanceMoved = Math.sqrt(dx * dx + dy * dy);

        // Check if the mouse was dragged (customize the threshold as needed)
        if (distanceMoved > 5) {
            return; // Ignore clicks that involve dragging
        }

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Calculate mouse position in normalized device coordinates
        const viewerRect = this.tjs.renderers["MainRenderer"].renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - viewerRect.left) / viewerRect.width) * 2 - 1;
        mouse.y = -((event.clientY - viewerRect.top) / viewerRect.height) * 2 + 1;

        // Update the picking ray
        raycaster.setFromCamera(mouse, this.tjs.camera);

        // Check for intersections with atom mesh
        const intersects = raycaster.intersectObject(this.instancedMesh);
        // Check if there are intersections
        if (intersects.length > 0) {
            // Get the first intersected object (atom)
            const selectedObject = intersects[0].object;

            // Check if the selected object is an atom
            if (selectedObject.userData && selectedObject.userData.type === 'atom') {
                // Get the instance index of the selected atom
                const instanceIndex = intersects[0].instanceId;
                if (this.selectedAtoms.has(instanceIndex)) {
                    // If the atom is already selected, skip
                    return;
                }
                // Add the instance index to the selectedAtoms set
                this.selectedAtoms.add(instanceIndex);

                // Get the position of the selected atom in the 3D space
                const matrix = new THREE.Matrix4();
                selectedObject.getMatrixAt(instanceIndex, matrix);
                const position = new THREE.Vector3();
                const quaternion = new THREE.Quaternion();
                const scale = new THREE.Vector3();
                matrix.decompose(position, quaternion, scale);
                // Display the symbol of the atom on top of it
                this.createAtomLabel(this.atoms.species[this.atoms.speciesArray[instanceIndex]].symbol, position);

                // Create a new mesh for the highlighted atom
                const highlightedAtomMesh = createHighlight(position, scale)
                // Add the highlighted atom mesh to the selectedAtomMesh group
                this.selectedAtomMesh.add(highlightedAtomMesh);
            } else {
                // Clear the HTML element when nothing is selected
                this.clearAtomLabel();
                this.selectedAtoms.clear();
                this.clearHighlight();
            }
        } else {
            // Clear the HTML element when nothing is selected
            this.clearAtomLabel();
            this.selectedAtoms.clear();
            this.clearHighlight();
        }
    }

    clearAtomLabel() {
        if (this.label) {
            this.label.element.textContent = '';
        }
    }

    clearHighlight() {
        // Remove highlighted atom meshes from the selectedAtomMesh group
        while (this.selectedAtomMesh.children.length > 0) {
            const child = this.selectedAtomMesh.children[0]; // Get the first child
            this.selectedAtomMesh.remove(child); // Remove the child from the group
        }
    }


    createAtomLabel(symbol, position) {
        // Create or update the HTML element for displaying the symbol
        if (!this.selectedAtomSymbolElement) {
            this.selectedAtomSymbolElement = document.createElement('div');
            this.selectedAtomSymbolElement.id = 'selectedAtomSymbol';
            this.selectedAtomSymbolElement.style.position = 'absolute';
            this.selectedAtomSymbolElement.style.color = 'white'; // Customize styles as needed
            this.selectedAtomSymbolElement.style.pointerEvents = 'none'; // Prevent the symbol from blocking mouse interactions
            this.tjs.containerElement.appendChild(this.selectedAtomSymbolElement);
        }
        // Create a new CSS2DObject with the label content
        this.label = new CSS2DObject(this.selectedAtomSymbolElement);
        this.label.position.copy(position);
        this.label.element.textContent = symbol;


        // Optionally, can style the label using CSS
        this.label.element.style.color = 'white';
        // label.element.style.fontSize = '14px';

        // Add the label to the scene
        this.tjs.scene.add(this.label);
    }

    updateLabels(value) {
        // Handle the logic to draw labels based on the selected option
        if (value === 'none') {
            this.atomLabels = drawAtomLabels(this.tjs.scene, this.atoms, 'none', this.atomLabels);
            // Remove labels
        } else if (value === 'symbol') {
            // Draw labels with symbols
            this.atomLabels = drawAtomLabels(this.tjs.scene, this.atoms, 'symbol', this.atomLabels);
        } else if (value === 'index') {
            // Draw labels with indices
            this.atomLabels = drawAtomLabels(this.tjs.scene, this.atoms, 'index', this.atomLabels);
        }
    }

    changeVizType( value ) {

        clearObjects(this.tjs.scene, this.uuid);

        drawUnitCell(this.tjs.scene, this.atoms);
        drawUnitCellVectors(this.tjs.scene, this.atoms.cell, this.tjs.camera);


        if ( value == 0 ) {
            this.instancedMesh = drawAtoms(this.tjs.scene, this.atoms, 1);
        }
        else if ( value == 1 ){
            this.instancedMesh = drawAtoms(this.tjs.scene, this.atoms, 0.4);
            drawBonds(this.tjs.scene, this.atoms);
        }
        else if ( value == 2 ){
            this.instancedMesh = drawAtoms(this.tjs.scene, this.atoms, 0.4);
            drawBonds(this.tjs.scene, this.atoms);
            drawPolyhedra(this.tjs.scene, this.atoms);
        }
        else {
            drawBonds(this.tjs.scene, this.atoms);
        }

    }

    // Method to update the scale of atoms
    updateAtomScale() {
        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        for (let species in this.instancedMesh) {
            let mesh = this.instancedMesh[species];
            for (let i = 0; i < mesh.count; i++) {
                const instanceMatrix = new THREE.Matrix4();
                mesh.getMatrixAt(i, instanceMatrix); // Get the original matrix of the instance

                // Decompose the original matrix into its components
                instanceMatrix.decompose(position, rotation, scale);

                // Set the scale to the new value
                scale.set(this.atomScale, this.atomScale, this.atomScale);

                // Recompose the matrix with the new scale
                instanceMatrix.compose(position, rotation, scale);

                mesh.setMatrixAt(i, instanceMatrix);
            }
            mesh.instanceMatrix.needsUpdate = true;
        }
        // Re-render the scene if necessary
    }

    // Method to delete selected atoms
    deleteSelectedAtoms() {
        // Remove the selected atoms from the scene and data
        this.atoms.deleteAtoms(Array.from(this.selectedAtoms));
        // Clear the selection
        this.selectedAtoms.clear();

        // Update the visualization
        this.changeVizType(this.vizType); // Reapply the visualization
        this.clearAtomLabel(); // Clear the atom label
        this.clearHighlight();
    }


    init() {
        this.atomLabels = [];
        this.VIZ_TYPE_MAP = {
            'Ball': 0,
            'Ball + Stick': 1,
            'Polyhedra': 2,
            'Stick': 3,
        };
        this.vizType = 1; // Default viz type
        this.labelType = 'none'; // Default label type
        this.atomScale = 0.4; // Default atom scale
        // Initialize Three.js scene, camera, and renderer
        // GUI
        // Create a div element for the GUI
        const guiContainer = document.createElement('div');
        guiContainer.style.position = 'absolute';
        guiContainer.style.top = '10px';
        guiContainer.style.left = '10px'; // Adjust the position as needed
        this.tjs.containerElement.appendChild(guiContainer);
        // Apply styles to the GUI container

        // Initialize the GUI inside the div element
        const gui = new GUI(); // Create a new dat.GUI instance
        guiContainer.appendChild(gui.domElement);

        // Append the dat.GUI's DOM element to container
        const atomsFolder = gui.addFolder('Atoms');
		atomsFolder.add( {vizType: this.vizType,}, 'vizType', this.VIZ_TYPE_MAP ).onChange( this.changeVizType.bind(this) ).name("Model Style");
        // Add Label Type Controller
        atomsFolder.add(this, 'labelType', ['none', 'symbol', 'index']).onChange(this.updateLabels.bind(this)).name('Atom Label');
        // Add Atom Scale Controller
        atomsFolder.add(this, 'atomScale', 0.1, 2.0).onChange(this.updateAtomScale.bind(this)).name('Atom Scale');
        // Add camera controls
        createViewpointButtons(gui, this.tjs.camera)
        setupCameraGUI(gui, this.tjs.camera, this.tjs.scene)
        //
        this.selectedAtomSymbolElement = document.createElement('div');
        this.selectedAtomSymbolElement.id = 'selectedAtomSymbol';
        this.tjs.containerElement.appendChild(this.selectedAtomSymbolElement);
        //
        // Add mouse state tracking
        this.isMouseDown = false;
        this.mouseDownPosition = new THREE.Vector2();
        // Bind event handlers
        this.tjs.containerElement.addEventListener('pointerdown', this.onMouseDown.bind(this), false);
        this.tjs.containerElement.addEventListener('pointerup', this.onMouseUp.bind(this), false);
        this.tjs.containerElement.addEventListener('click', this.onMouseClick.bind(this), false);
        // Add event listeners for keypress events
        document.addEventListener('keydown', event => {
            if (event.key === 'Delete') {
                // When 'X' key is pressed, delete selected atoms
                this.deleteSelectedAtoms();
            }
        });

        // Draw unit cell
        drawUnitCell(this.tjs.scene, this.atoms);
        drawUnitCellVectors(this.tjs.scene, this.atoms.cell, this.tjs.camera);

        this.changeVizType(this.vizType)

        drawAtomLabels(this.tjs.scene, this.atoms, 'none', this.atomLabels);

        // Set camera position
        this.tjs.camera.position.z = 5;

    }

}

export default AtomsViewer;
