import { Species, Atom, Atoms } from './atoms.js';


function parseXYZ(xyzString) {
    const lines = xyzString.trim().split('\n');

    if (lines.length < 3) {
        throw new Error('Invalid XYZ file format');
    }

    const atomCount = parseInt(lines[0].trim());
    if (isNaN(atomCount)) {
        throw new Error('Invalid atom count in XYZ file');
    }

    const atoms = new Atoms();
    const speciesMap = new Map(); // To track species and their indices

    for (let i = 2; i < lines.length; i++) {
        const parts = lines[i].trim().split(/\s+/);
        if (parts.length !== 4) {
            continue; // Skip lines that don't have exactly 4 parts
        }

        const [element, x, y, z] = parts;
        let speciesIndex = speciesMap.get(element);

        if (speciesIndex === undefined) {
            speciesIndex = atoms.getSpeciesCount();
            atoms.addSpecies(element, 0); // Assuming atomic number is not available in XYZ
            speciesMap.set(element, speciesIndex);
        }

        const position = [parseFloat(x), parseFloat(y), parseFloat(z)];
        const atom = new Atom(speciesIndex, position);
        atoms.addAtom(atom);
    }

    if (atoms.getAtomsCount() !== atomCount) {
        throw new Error('Atom count mismatch in XYZ file');
    }

    return atoms;
}


export { parseXYZ };
