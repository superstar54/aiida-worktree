/// AtomsItem.js

import React, { useEffect, useRef } from 'react';
import { Atoms } from '../atoms/atoms.js';
import AtomsViewer from '../atoms/atoms_viewer.js';
import { BlendJS } from '../atoms/blendjs.js';

function AtomsItem({ data }) {
  const atomsContainerRef = useRef(null);

  useEffect(() => {

    console.log("data: ", data)
    const atoms = new Atoms(data);

    if (atomsContainerRef.current) {
      const bjs = new BlendJS(atomsContainerRef.current);
      // Create an instance of AtomsViewer and pass the Atoms object to it
      const avr = new AtomsViewer(bjs, atoms);
      // Call the render method to start the visualization
      bjs.render();

      // Cleanup function to be called when the component unmounts
      return () => {
        // Assuming AtomsViewer provides a cleanup or destroy method
        // viewer.destroy();
      };
    }
  }, [data]); // Include data in the dependency array

  return (
    <div>
      <h1>Atoms Viewer</h1>
      <div ref={atomsContainerRef} style={{ position: "relative", width: '600px', height: '600px' }}></div>
    </div>
  );
}

export default AtomsItem;
