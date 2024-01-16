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

    translate(t) {
        for (let i = 0; i < this.positions.length; i++) {
            this.positions[i][0] += t[0]; // Shift x-coordinate
            this.positions[i][1] += t[1]; // Shift y-coordinate
            this.positions[i][2] += t[2]; // Shift z-coordinate
        }
    }

    rotate(axis, angle, rotate_cell = false) {
        const angleRad = (angle * Math.PI) / 180;
        const norm = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
        const [u, v, w] = [axis[0] / norm, axis[1] / norm, axis[2] / norm]; // Normalized axis components

        // Rodrigues' rotation formula components
        const cosA = Math.cos(angleRad);
        const sinA = Math.sin(angleRad);
        const matrix = [
            cosA + u * u * (1 - cosA),         u * v * (1 - cosA) - w * sinA, u * w * (1 - cosA) + v * sinA,
            v * u * (1 - cosA) + w * sinA,     cosA + v * v * (1 - cosA),     v * w * (1 - cosA) - u * sinA,
            w * u * (1 - cosA) - v * sinA,     w * v * (1 - cosA) + u * sinA, cosA + w * w * (1 - cosA)
        ];

        for (let i = 0; i < this.positions.length; i++) {
            const [x, y, z] = this.positions[i];
            this.positions[i][0] = matrix[0] * x + matrix[1] * y + matrix[2] * z;
            this.positions[i][1] = matrix[3] * x + matrix[4] * y + matrix[5] * z;
            this.positions[i][2] = matrix[6] * x + matrix[7] * y + matrix[8] * z;
        }

        if (rotate_cell && this.cell) {
            const newCell = new Float32Array(9);
            for (let i = 0; i < 3; i++) {
                const cellVec = [this.cell[i * 3], this.cell[i * 3 + 1], this.cell[i * 3 + 2]];
                newCell[i * 3] = matrix[0] * cellVec[0] + matrix[1] * cellVec[1] + matrix[2] * cellVec[2];
                newCell[i * 3 + 1] = matrix[3] * cellVec[0] + matrix[4] * cellVec[1] + matrix[5] * cellVec[2];
                newCell[i * 3 + 2] = matrix[6] * cellVec[0] + matrix[7] * cellVec[1] + matrix[8] * cellVec[2];
            }
            this.cell = newCell;
        }
    }

    center(vacuum=null, axis=(0, 1, 2), about=null) {
        if (!this.cell) {
            throw new Error("Cell is not defined.");
        }

        // Calculate current center of mass or geometry
        let centerOfMass = [0, 0, 0];
        for (let i = 0; i < this.positions.length; i++) {
            centerOfMass[0] += this.positions[i][0];
            centerOfMass[1] += this.positions[i][1];
            centerOfMass[2] += this.positions[i][2];
        }
        centerOfMass = centerOfMass.map(x => x / this.positions.length);

        // Determine target center point
        let targetCenter = [0, 0, 0];
        if (about) {
            targetCenter = about;
        } else {
            for (let i = 0; i < 3; i++) {
                if (axis.includes(i)) {
                    targetCenter[i] = this.cell[i * 3 + i] / 2;
                }
            }
        }

        // Translate atoms to the target center
        const translationVector = targetCenter.map((x, i) => x - centerOfMass[i]);
        this.translate(...translationVector);

        // Adjust cell size if vacuum padding is specified
        if (vacuum !== null) {
            for (let i = 0; i < 3; i++) {
                if (axis.includes(i)) {
                    this.cell[i * 3 + i] += 2 * vacuum; // Increase the cell dimension
                }
            }
        }
    }
    deleteAtoms(indices) {
        // Sort the indices in descending order to avoid index shifting
        indices.sort((a, b) => b - a);

        for (const index of indices) {
            if (index >= 0 && index < this.positions.length) {
                this.positions.splice(index, 1); // Remove the atom's position data
                this.speciesArray.splice(index, 1); // Remove the atom's species index
            }
        }
    }
    replaceAtoms(indices, newSpeciesSymbol) {
        for (const index of indices) {
            if (index >= 0 && index < this.speciesArray.length) {
                // Replace the species of the atom at the specified index
                this.speciesArray[index] = this.species[newSpeciesSymbol].atomicNumber;
            }
        }
    }

}


export { Species, Atom, Atoms };
