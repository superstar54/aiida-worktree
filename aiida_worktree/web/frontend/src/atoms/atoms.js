import { covalentRadii } from "./atoms_data.js";

class Species {
    constructor(symbol, atomicNumber) {
        this.symbol = symbol;           // Symbol of the species (e.g., 'C', 'C_1' for carbon)
        this.atomicNumber = atomicNumber; // Atomic number of the species
    }
}

class Atom {
    constructor(speciesIndex, position) {
        this.speciesIndex = speciesIndex; // Index of the species in the species array
        this.position = new Float32Array(position); // Position of the atom as a Float32Array
    }
}

class Atoms {
    constructor() {
        this.species = [];     // Array to store Species objects
        this.speciesIndices = []; // New array to store species indices
        this.positions = [];   // Typed array for atom positions [speciesIndex1, x1, y1, z1, speciesIndex2, x2, y2, z2, ...]
        this.cell = null;      // 3x3 matrix for unit cell dimensions (default: null)
        this.pbc = [true, true, true]; // Array for periodic boundary conditions (default: true in all dimensions)
        this.properties = {};  // Object for additional properties (e.g., charge, mass, etc.)
    }

    setCell(cell) {
        if (cell.length === 9) { // 3x3 matrix
            this.cell = new Float32Array(cell);
        } else if (cell.length === 6) { // 1x6 array [a, b, c, alpha, beta, gamma]
            this.cell = this.convertToMatrixFromABCAlphaBetaGamma(cell);
        } else if (cell.length === 3) { // 1x3 array [a, b, c], assuming 90-degree angles
            const [a, b, c] = cell;
            this.cell = this.convertToMatrixFromABCAlphaBetaGamma([a, b, c, 90, 90, 90]);
        } else {
            throw new Error("Invalid cell dimensions provided. Expected 3x3 matrix, 1x6, or 1x3 array.");
        }
    }

    convertToMatrixFromABCAlphaBetaGamma(abcAlphaBetaGamma) {
        const [a, b, c, alpha, beta, gamma] = abcAlphaBetaGamma;
        // Convert angles to radians
        const alphaRad = (alpha * Math.PI) / 180;
        const betaRad = (beta * Math.PI) / 180;
        const gammaRad = (gamma * Math.PI) / 180;

        // Calculate components of the cell matrix
        // Assuming orthorhombic cell (right angles) for simplicity
        // For triclinic or other cell types, the calculation will be more complex
        const ax = a;
        const ay = 0;
        const az = 0;
        const bx = b * Math.cos(gammaRad);
        const by = b * Math.sin(gammaRad);
        const bz = 0;
        const cx = c * Math.cos(betaRad);
        const cy = c * (Math.cos(alphaRad) - Math.cos(betaRad) * Math.cos(gammaRad)) / Math.sin(gammaRad);
        const cz = Math.sqrt(c * c - cx * cx - cy * cy);

        return new Float32Array([ax, ay, az, bx, by, bz, cx, cy, cz]);
    }

    setPBC(pbc) {
        // Set periodic boundary conditions (e.g., [true, true, true])
        this.pbc = pbc;
    }

    addSpecies(symbol, atomicNumber) {
        // Create a new Species and add it to the list
        this.species.push(new Species(symbol, atomicNumber));
    }

    addAtom(atom) {
        // Add an atom to the atoms
        this.positions.push(atom.position);
        this.speciesIndices.push(atom.speciesIndex);
    }

    removeAtom(index) {
        // Remove an atom from the atoms by its index
        this.positions.splice(index * 4, 4);
    }

    getSpeciesCount() {
        // Get the number of species in the atoms
        return this.species.length;
    }

    getAtomsCount() {
        // Get the number of atoms in the atoms
        return this.positions.length; // Each atom uses 4 values (species index + x, y, z)
    }

    // Overload the "+" operator to concatenate two Atoms objects
    add(otherAtoms) {
        const result = new Atoms();

        // Concatenate species
        result.species = [...this.species, ...otherAtoms.species];

        // Concatenate positions
        result.positions = new Float32Array([...this.positions, ...otherAtoms.positions]);

        // Additional properties can be handled here if needed

        return result;
    }

    // Overload the "+=" operator to concatenate another Atoms object
    addToSelf(otherAtoms) {
        // Concatenate species
        this.species.push(...otherAtoms.species);

        // Concatenate positions
        this.positions = new Float32Array([...this.positions, ...otherAtoms.positions]);

        // Additional properties can be handled here if needed
    }

    multiply(mx, my, mz) {
        const newAtoms = new Atoms();

        // Update unit cell
        if (this.cell) {
            const [ax, ay, az, bx, by, bz, cx, cy, cz] = this.cell;
            newAtoms.setCell([
                ax * mx, ay * my, az * mz,
                bx * mx, by * my, bz * mz,
                cx * mx, cy * my, cz * mz
            ]);
        }

        // Replicate atoms
        for (let ix = 0; ix < mx; ix++) {
            for (let iy = 0; iy < my; iy++) {
                for (let iz = 0; iz < mz; iz++) {
                    for (let i = 0; i < this.getAtomsCount(); i++) {
                        const speciesIndex = this.speciesIndices[i];
                        const [x, y, z] = this.positions[i];

                        // Calculate new position considering the unit cell dimensions
                        const newX = x + ix * this.cell[0];
                        const newY = y + iy * this.cell[4];
                        const newZ = z + iz * this.cell[8];

                        // Add the new atom to the newAtoms
                        newAtoms.addAtom(new Atom(speciesIndex, [newX, newY, newZ]));
                    }
                }
            }
        }

        // Copy species array
        newAtoms.species = Array.from(this.species);

        // Return the new Atoms object
        return newAtoms;
    }


}


export { Species, Atom, Atoms };
