// Import necessary Three.js components
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

class BlendJSObject {
    constructor(name, geometry, material) {
        this.name = name;
        this.geometry = geometry;
        this.material = material;
        this.object3D = new THREE.Mesh(geometry, material);
    }
}

class BlendJSMaterial {
    constructor(name, material) {
        this.name = name;
        this.material = material;
    }
}

class BlendJSMesh {
    constructor(name, geometry) {
        this.name = name;
        this.geometry = geometry;
    }
}

class BlendJSLight {
    constructor(name, light) {
        this.name = name;
        this.light = light;
    }
}

class BlendJSRenderer {
    constructor(name, renderer) {
        this.name = name;
        this.renderer = renderer;
    }
}

export class BlendJS {
    constructor(containerElement) {
        this.containerElement = containerElement;
        this.scene = new THREE.Scene();
        this.objects = {};
        this.materials = {};
        this.meshes = {};
        this.lights = {};
        this.renderers = {}; // New property to store renderers
        this.init();
    }
    init() {
        // Create a renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(this.containerElement.clientWidth, this.containerElement.clientHeight);
        this.addRenderer('MainRenderer', renderer);
        // Create a label renderer
        const labelRenderer = new CSS2DRenderer();
		labelRenderer.setSize(this.containerElement.clientWidth, this.containerElement.clientHeight);
		labelRenderer.domElement.style.position = 'absolute';
		labelRenderer.domElement.style.top = '0px';
		labelRenderer.domElement.style.pointerEvents = 'none';
        this.addRenderer('LabelRenderer', labelRenderer);
        // Create a camera
        this.camera = new THREE.PerspectiveCamera(50, this.containerElement.clientWidth / this.containerElement.clientHeight, 1, 500);
        // Create a light
        const light = new THREE.DirectionalLight( 0xffffff, 2.5 );
        this.addLight('MainLight', light);
        const ambientLight = new THREE.AmbientLight(0x404040, 10); // Soft white light
        this.addLight('AmbientLight', ambientLight);
        // OrbitControls for camera movement
        this.controls = new OrbitControls(this.camera, renderer.domElement);
        this.controls.enableDamping = true; // Enable smooth camera movements
        // Add event listener for window resize
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    addObject(name, geometry, material) {
        const object = new BlendJSObject(name, geometry, material);
        this.objects[name] = object;
        this.scene.add(object.object3D);
        return object;
    }

    // Methods for managing materials, meshes, lights, cameras
    addMaterial(name, material) {
        const mat = new BlendJSMaterial(name, material);
        this.materials[name] = mat;
        return mat;
    }

    addMesh(name, geometry) {
        const mesh = new BlendJSMesh(name, geometry);
        this.meshes[name] = mesh;
        return mesh;
    }

    addLight(name, light) {
        const lgt = new BlendJSLight(name, light);
        this.lights[name] = lgt;
        this.scene.add(lgt.light);
        return lgt;
    }

    // Method to add a renderer
    addRenderer(name, renderer) {
        this.containerElement.appendChild(renderer.domElement);
        const rndr = new BlendJSRenderer(name, renderer);
        this.renderers[name] = rndr;
        return rndr;
    }

    onWindowResize() {
        // Update the camera aspect ratio and the renderer size based on the container element
        this.camera.aspect = this.containerElement.clientWidth / this.containerElement.clientHeight;
        this.camera.updateProjectionMatrix();
        // loop through renderers to update their size
        Object.values(this.renderers).forEach(rndr => {
            rndr.renderer.setSize(this.containerElement.clientWidth, this.containerElement.clientHeight);
        });

    }

    render() {
        const animate = () => {
            requestAnimationFrame(animate);

            // Optional: Update controls
            this.controls.update();

            // loop through renderers to render the scene
            Object.values(this.renderers).forEach(rndr => {
                rndr.renderer.render(this.scene, this.camera);
            });
            };

        animate();
    }
}
