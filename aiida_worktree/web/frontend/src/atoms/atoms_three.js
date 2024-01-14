import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { GUI } from 'dat.gui'
import { drawUnitCell, drawUnitCellVectors } from './cell.js';
import { drawBonds } from './bond.js';
import { drawAtoms } from './draw_atoms.js';
import { createViewpointButtons } from './viewpoint.js';
import { setupCameraGUI } from './camera.js';
import { clearObjects } from './utils.js';
import { drawAtomLabels } from './draw_label.js';

class AtomsViewer {
    constructor(containerElement, atoms) {
        this.containerElement = containerElement;
        this.atoms = atoms;
        this.init();
    }

    onWindowResize() {
        // Update the camera aspect ratio and the renderer size based on the container element
        this.camera.aspect = this.containerElement.clientWidth / this.containerElement.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.containerElement.clientWidth, this.containerElement.clientHeight);
		this.labelRenderer.setSize(this.containerElement.clientWidth, this.containerElement.clientHeight);

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
        const viewerRect = this.renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - viewerRect.left) / viewerRect.width) * 2 - 1;
        mouse.y = -((event.clientY - viewerRect.top) / viewerRect.height) * 2 + 1;

        // Update the picking ray
        raycaster.setFromCamera(mouse, this.camera);

        // Check for intersections with atom meshes
        const atomMeshes = Object.values(this.instancedMeshes);
        const intersects = raycaster.intersectObjects(atomMeshes);
        // console.log("intersects: ", intersects)
        // Check if there are intersections
        if (intersects.length > 0) {
            // Get the first intersected object (atom)
            const selectedObject = intersects[0].object;

            // Check if the selected object is an atom
            if (selectedObject.userData && selectedObject.userData.type === 'atom') {
                // Get the instance index of the selected atom
                const instanceIndex = intersects[0].instanceId;

                // Get the position of the selected atom in the 3D space
                const matrix = new THREE.Matrix4();
                selectedObject.getMatrixAt(instanceIndex, matrix);
                const position = new THREE.Vector3();
                const quaternion = new THREE.Quaternion();
                const scale = new THREE.Vector3();
                matrix.decompose(position, quaternion, scale);

                // Display the symbol of the atom on top of it
                this.createAtomLabel(selectedObject.userData.symbol, position);
            } else {
                // Clear the HTML element when nothing is selected
                this.clearAtomLabel();
            }
        } else {
            // Clear the HTML element when nothing is selected
            this.clearAtomLabel();
        }
    }

    clearAtomLabel() {
        if (this.label) {
            this.label.element.textContent = '';
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
            this.containerElement.appendChild(this.selectedAtomSymbolElement);
        }
        // Create a new CSS2DObject with the label content
        this.label = new CSS2DObject(this.selectedAtomSymbolElement);
        this.label.position.copy(position);
        this.label.element.textContent = symbol;


        // Optionally, can style the label using CSS
        this.label.element.style.color = 'white';
        // label.element.style.fontSize = '14px';

        // Add the label to the scene
        this.scene.add(this.label);
    }

    updateLabels(value) {
        // Handle the logic to draw labels based on the selected option
        if (value === 'none') {
            this.atomLabels = drawAtomLabels(this.scene, this.atoms, 'none', this.atomLabels);
            // Remove labels
        } else if (value === 'symbol') {
            // Draw labels with symbols
            this.atomLabels = drawAtomLabels(this.scene, this.atoms, 'symbol', this.atomLabels);
        } else if (value === 'index') {
            // Draw labels with indices
            this.atomLabels = drawAtomLabels(this.scene, this.atoms, 'index', this.atomLabels);
        }
        console.log("this.atomLabels: ", this.atomLabels)
    }

    changeVizType( value ) {

        clearObjects(this.scene);

        drawUnitCell(this.scene, this.atoms.cell);
        drawUnitCellVectors(this.scene, this.atoms.cell, this.camera);


        if ( value == 0 ) {
            console.log("value: ", value)
            console.log("this.scene: ", this.scene)
            console.log("this.atoms: ", this.atoms)
            drawAtoms(this.scene, this.atoms, 1);
        }
        else if ( value == 1 ){
            drawAtoms(this.scene, this.atoms, 0.4);
            drawBonds(this.scene, this.atoms);
        }
        else {
            drawBonds(this.scene, this.atoms);
        }

    }

    init() {
		this.objects = [];
        this.atomLabels = [];
        this.VIZ_TYPE = {
            'Ball': 0,
            'Ball + Stick': 1,
            'Stick': 2,
        };
        this.labelType = 'none'; // Default label type
        // Initialize Three.js scene, camera, and renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(25, this.containerElement.clientWidth / this.containerElement.clientHeight, 0.1, 100);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.containerElement.clientWidth, this.containerElement.clientHeight);
        this.containerElement.appendChild(this.renderer.domElement);
        //
        this.labelRenderer = new CSS2DRenderer();
		this.labelRenderer.setSize(this.containerElement.clientWidth, this.containerElement.clientHeight);
		this.labelRenderer.domElement.style.position = 'absolute';
		this.labelRenderer.domElement.style.top = '0px';
		this.labelRenderer.domElement.style.pointerEvents = 'none';
		this.containerElement.appendChild(this.labelRenderer.domElement );
        // GUI
        // Create a div element for the GUI
        const guiContainer = document.createElement('div');
        guiContainer.style.position = 'absolute';
        guiContainer.style.top = '10px';
        guiContainer.style.left = '10px'; // Adjust the position as needed
        this.containerElement.appendChild(guiContainer);
        // Apply styles to the GUI container

        // Initialize the GUI inside the div element
        const gui = new GUI(); // Create a new dat.GUI instance
        guiContainer.appendChild(gui.domElement);

        // Append the dat.GUI's DOM element to container
        const atomsFolder = gui.addFolder('Atoms');
		atomsFolder.add( {vizType: 1,}, 'vizType', this.VIZ_TYPE ).onChange( this.changeVizType.bind(this) ).name("Model Style");
        // Add Label Type Controller
        atomsFolder.add(this, 'labelType', ['none', 'symbol', 'index']).onChange(this.updateLabels.bind(this)).name('Atom Label');
        // Add camera controls
        createViewpointButtons(gui, this.camera)
        setupCameraGUI(gui, this.camera, this.scene)
        //
        this.selectedAtomSymbolElement = document.createElement('div');
        this.selectedAtomSymbolElement.id = 'selectedAtomSymbol';
        this.containerElement.appendChild(this.selectedAtomSymbolElement);
        //
        // Add mouse state tracking
        this.isMouseDown = false;
        this.mouseDownPosition = new THREE.Vector2();
        // Bind event handlers
        document.addEventListener('pointerdown', this.onMouseDown.bind(this), false);
        document.addEventListener('pointerup', this.onMouseUp.bind(this), false);
        document.addEventListener('click', this.onMouseClick.bind(this), false);

        window.addEventListener('resize', this.onWindowResize.bind(this), false);


        // Add lighting
		const light1 = new THREE.DirectionalLight( 0xffffff, 2.5 );
        light1.position.set(1, 1, 1);
        this.scene.add(light1);
        const light2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
        light2.position.set(-1, -1, 1);
        this.scene.add(light2);

        const ambientLight = new THREE.AmbientLight(0x404040, 10); // Soft white light
        this.scene.add(ambientLight);

        // OrbitControls for camera movement
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // Enable smooth camera movements


        // Draw unit cell
        drawUnitCell(this.scene, this.atoms.cell);
        drawUnitCellVectors(this.scene, this.atoms.cell, this.camera);

        // Draw atoms
        this.instancedMeshes = drawAtoms(this.scene, this.atoms);

        // Draw bonds
        drawBonds(this.scene, this.atoms);

        drawAtomLabels(this.scene, this.atoms, 'none', this.atomLabels);

        // Set camera position
        this.camera.position.z = 5;

        // Update the instance matrix after all changes
        Object.values(this.instancedMeshes).forEach(instancedMesh => instancedMesh.instanceMatrix.needsUpdate = true);

        // Add event listeners or additional visualization elements as needed
    }

    render() {
        const animate = () => {
            requestAnimationFrame(animate);

            // Optional: Update controls
            this.controls.update();

            // Render the scene
            this.renderer.render(this.scene, this.camera);
			this.labelRenderer.render(this.scene, this.camera );
            };

        animate();
    }
}

export default AtomsViewer;
