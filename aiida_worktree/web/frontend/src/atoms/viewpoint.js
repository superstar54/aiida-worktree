


export function createViewpointButtons(gui, camera) {
    // Create a folder for the viewpoint buttons
    const viewpointFolder = gui.addFolder('Viewpoint');

    // Create buttons for different viewpoints
    const viewpoints = {
        Top: () => {
            // Set the camera to the top viewpoint (adjust these values accordingly)
            camera.position.set(0, 10, 0);
            camera.lookAt(0, 0, 0);
        },
        Bottom: () => {
            // Set the camera to the bottom viewpoint (adjust these values accordingly)
            camera.position.set(0, -10, 0);
            camera.lookAt(0, 0, 0);
        },
        Left: () => {
            // Set the camera to the left viewpoint (adjust these values accordingly)
            camera.position.set(-10, 0, 0);
            camera.lookAt(0, 0, 0);
        },
        Right: () => {
            // Set the camera to the right viewpoint (adjust these values accordingly)
            camera.position.set(10, 0, 0);
            camera.lookAt(0, 0, 0);
        },
        Front: () => {
            // Set the camera to the front viewpoint (adjust these values accordingly)
            camera.position.set(0, 0, 10);
            camera.lookAt(0, 0, 0);
        },
        Back: () => {
            // Set the camera to the back viewpoint (adjust these values accordingly)
            camera.position.set(0, 0, -10);
            camera.lookAt(0, 0, 0);
        },
    };

    // Add a button for each viewpoint

    for (const viewpoint in viewpoints) {
        viewpointFolder.add(viewpoints, viewpoint).name(viewpoint);
    }
}
