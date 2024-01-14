import { covalentRadii } from "./atoms_data.js";

class Species {
    constructor(symbol, atomicNumber) {
        this.symbol = symbol;           // Symbol of the species (e.g., 'C', 'C_1' for carbon)
        this.atomicNumber = atomicNumber; // Atomic number of the species
    }
}

class Atom {
    constructor(species, position) {
        this.species = species; // Index of the species in the species array
        this.position = new Float32Array(position); // Position of the atom as a Float32Array
    }
}

class Atoms {
    constructor(data = null) {
        this.species = {};
        this.speciesArray = [];
        this.positions = [];
        this.cell = null;
        this.pbc = [true, true, true];
        this.properties = {};

        if (data) {
            this.initializeFromData(data);
        }
    }

    initializeFromData(data) {
        if (data.cell) {
            this.setCell(data.cell);
        }
        if (data.pbc) {
            this.setPBC(data.pbc);
        }
        if (data.species && typeof data.species === 'object') {
            // Iterate over each key-value pair in the species dictionary
            Object.entries(data.species).forEach(([symbol, atomicNumber]) => {
                this.addSpecies(symbol, atomicNumber);
            });
        }
        if (data.speciesArray && data.positions) {
            for (let i = 0; i < data.speciesArray.length; i++) {
                const speciesIndex = data.speciesArray[i];
                const position = data.positions[i];
                this.addAtom(new Atom(speciesIndex, position));
            }
        }
        // Initialize other properties if needed
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
        // Create a new Species and add it to the species object
        if (!this.species[symbol]) {
            this.species[symbol] = new Species(symbol, atomicNumber);
        }
    }

    addAtom(atom) {
        // Add an atom to the atoms
        if (!this.species[atom.species]) {
            throw new Error(`Species with index ${atom.species} not found.`);
        }
        this.positions.push(atom.position);
        this.speciesArray.push(atom.species);
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
                        const species = this.speciesArray[i];
                        const [x, y, z] = this.positions[i];

                        // Calculate new position considering the unit cell dimensions
                        const newX = x + ix * this.cell[0];
                        const newY = y + iy * this.cell[4];
                        const newZ = z + iz * this.cell[8];

                        // Add the new atom to the newAtoms
                        newAtoms.addAtom(new Atom(species, [newX, newY, newZ]));
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
