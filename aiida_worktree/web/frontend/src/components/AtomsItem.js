// AtomsItem.js

import React, { useEffect } from 'react';
import {Atom, Atoms } from '../atoms/atoms.js';
import AtomsViewer from '../atoms/atoms_three.js';
import { parseXYZ } from '../atoms/parser_xyz.js';

function AtomsItem() {
  useEffect(() => {
    // Your non-React code goes here

    // Create an instance of Atoms and add atoms as needed
    // Usage example
    const xyzData = `
    3
    Water molecule
    O 1.0 1.0 1.0
    H 1.0 0.3 1.0
    H 1.0 1.7 1.0
    `;

    const atoms = parseXYZ(xyzData);
    atoms.setCell([3, 3, 3]);
    let atoms1 = atoms.multiply(1, 1, 1);
    console.log(atoms1)
    const containerElement = document.getElementById('atoms');

    // Create an instance of AtomsViewer and pass the Atoms object to it
    const viewer = new AtomsViewer(containerElement, atoms1);

    // Call the render method to start the visualization
    viewer.render();
  }, []);

  return (
    <div>
      <h1>Atoms Viewer</h1>
      <div id="atoms" style={{position: "relative", width: '600px', height: '600px' }}></div>
    </div>
  );
}

export default AtomsItem;
