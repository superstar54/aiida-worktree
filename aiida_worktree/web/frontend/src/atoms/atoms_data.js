// Define a color mapping for elements using the CPK color scheme
const elementColors = {
    H: 0xffffff,   // Hydrogen - White
    He: 0xd9ffff,  // Helium - Light Cyan
    Li: 0xcc80ff,  // Lithium - Light Purple
    Be: 0xc2ff00,  // Beryllium - Lime Green
    B: 0xffb5b5,   // Boron - Light Salmon
    C: 0x808080,   // Carbon - Grey (not from CPK)
    N: 0x0000ff,   // Nitrogen - Blue
    O: 0xff0000,   // Oxygen - Red
    F: 0xff00ff,   // Fluorine - Magenta
    Ne: 0xb3e0f2,  // Neon - Light Blue
    Na: 0xab5cf2,  // Sodium - Purple
    Mg: 0x8aff00,  // Magnesium - Bright Green
    Al: 0xbf3a3a,  // Aluminum - Dark Red
    Si: 0xffc0c0,  // Silicon - Pink
    P: 0xff8000,   // Phosphorus - Orange
    S: 0xffff30,   // Sulfur - Yellow
    Cl: 0x1fff00,  // Chlorine - Bright Green
    K: 0x8f40d4,   // Potassium - Violet
    Ar: 0x80d1e6,  // Argon - Light Blue
    Ca: 0x3dff00,  // Calcium - Bright Green
    Sc: 0xe6e6e6,  // Scandium - Light Gray
    Ti: 0xbfc2c7,  // Titanium - Silver
    V: 0xa6a6ab,   // Vanadium - Gray
    Cr: 0x8a99c7,  // Chromium - Light Blue
    Mn: 0x9c7ac7,  // Manganese - Purple-Blue
    Fe: 0xe06633,  // Iron - Orange
    Ni: 0xffd123,  // Nickel - Yellow-Orange
    Co: 0xffd123,  // Cobalt - Yellow-Orange
    Cu: 0xc78033,  // Copper - Orange-Red
    Zn: 0x7d80b0,  // Zinc - Light Grayish Blue
    Ga: 0xc28f8f,  // Gallium - Salmon
    Ge: 0x668f8f,  // Germanium - Grayish Blue-Green
    As: 0xbd80e3,  // Arsenic - Lavender
    Se: 0xffa100,  // Selenium - Bright Orange-Yellow
    Br: 0xa62929,  // Bromine - Dark Reddish-Brown
    Kr: 0x5cb8d1,  // Krypton - Sky Blue
    Rb: 0x702eb0,  // Rubidium - Dark Purple
    Sr: 0x00ff00,  // Strontium - Bright Green
    Y: 0x94ffff,   // Yttrium - Light Cyan
    Zr: 0x94e0e0,  // Zirconium - Light Grayish Blue-Green
    Nb: 0x73c2c9,  // Niobium - Grayish Blue
    Mo: 0x54b5b5,  // Molybdenum - Dark Grayish Blue-Green
    Tc: 0x3b9e9e,  // Technetium - Dark Grayish Blue
    Ru: 0x248f8f,  // Ruthenium - Grayish Blue-Green
    Rh: 0x0a7d8c,  // Rhodium - Dark Grayish Blue-Green
    Pd: 0x006985,  // Palladium - Dark Blue-Green
    Ag: 0xc0c0c0,  // Silver - Silver
    Cd: 0xffd98f,  // Cadmium - Light Orange-Yellow
    In: 0xa67573,  // Indium - Reddish-Brown
    Sn: 0x668080,  // Tin - Grayish Blue-Green
    Sb: 0x9e63b5,  // Antimony - Purple-Blue
    Te: 0xd47a00,  // Tellurium - Dark Orange
    I: 0x940094,   // Iodine - Dark Magenta
    Xe: 0x429eb0,  // Xenon - Blue-Green
    Cs: 0x57178f,  // Cesium - Dark Purple
    Ba: 0x00c900,  // Barium - Bright Green
    La: 0x70d4ff,  // Lanthanum - Light Blue
    Ce: 0xffffc7,  // Cerium - Light Yellow
    Pr: 0xd9ff00,  // Praseodymium - Light Green-Yellow
    Nd: 0xc7ff00,  // Neodymium - Bright Green-Yellow
    Pm: 0xa3ff00,  // Promethium - Bright Green-Yellow
    Sm: 0x8cff00,  // Samarium - Bright Green-Yellow
    Eu: 0x61ff00,  // Europium - Bright Green-Yellow
    Gd: 0x45ff00,  // Gadolinium - Bright Green-Yellow
    Tb: 0x30ff00,  // Terbium - Bright Green-Yellow
    Dy: 0x1ff00c,  // Dysprosium - Green
    Ho: 0x00ff0a,  // Holmium - Bright Green
    Er: 0x00e675,  // Erbium - Green-Blue
    Tm: 0x00d452,  // Thulium - Blue-Green
    Yb: 0x00bf38,  // Ytterbium - Green-Blue
    Lu: 0x00ab24,  // Lutetium - Blue-Green
    Hf: 0x4dc2ff,  // Hafnium - Light Blue
    Ta: 0x4da6ff,  // Tantalum - Light Blue
    W: 0x2194d6,   // Tungsten - Blue
    Re: 0x267dab,  // Rhenium - Dark Blue
    Os: 0x266696,  // Osmium - Dark Blue
    Ir: 0x175487,  // Iridium - Dark Blue
    Pt: 0xd0d0e0,  // Platinum - Light Grayish Blue
    Au: 0xffd123,  // Gold - Yellow-Orange
    Hg: 0xb8b8d0,  // Mercury - Light Grayish Blue
    Tl: 0xa6544d,  // Thallium - Reddish-Brown
    Pb: 0x575961,  // Lead - Gray
    Bi: 0x9e4fb5,  // Bismuth - Purple
    Po: 0xab5c00,  // Polonium - Brown
    At: 0x754f45,  // Astatine - Brown
    Rn: 0x428296,  // Radon - Dark Blue-Green
    Fr: 0x420066,  // Francium - Dark Purple
    Ra: 0x007d00,  // Radium - Green
    Ac: 0x70abfa,  // Actinium - Light Blue
    Th: 0x00a1ff,  // Thorium - Blue
    Pa: 0x00a1ff,  // Protactinium - Blue
    U: 0x008fff,   // Uranium - Blue
    Np: 0x0080ff,  // Neptunium - Blue
    Pu: 0x006bff,  // Plutonium - Dark Blue
    Am: 0x545cf2,  // Americium - Blue-Purple
    Cm: 0x785ce3,  // Curium - Purple
    Bk: 0x8a4fe3,  // Berkelium - Purple
    Cf: 0xa136d4,  // Californium - Purple
    Es: 0xb31fd4,  // Einsteinium - Purple
    Fm: 0xb31fba,  // Fermium - Purple
    Md: 0xb31f80,  // Mendelevium - Purple
    No: 0xbd00ba,  // Nobelium - Purple
    Lr: 0xbe00aa,  // Lawrencium - Pink-Purple
    Rf: 0xd10088,  // Rutherfordium - Pink
    Db: 0xd9006e,  // Dubnium - Pink
    Sg: 0xe0004f,  // Seaborgium - Pink
    Bh: 0xe60038,  // Bohrium - Pink
    Hs: 0xeb0026,  // Hassium - Pink
    Mt: 0xf10012,  // Meitnerium - Pink
    Ds: 0xff00e2,  // Darmstadtium - Pink
    Rg: 0xff007c,  // Roentgenium - Pink
    Cn: 0xff005c,  // Copernicium - Pink
    Nh: 0xff0045,  // Nihonium - Pink
    Fl: 0xff002b,  // Flerovium - Pink
    Mc: 0xff001d,  // Moscovium - Pink
    Lv: 0xff0011,  // Livermorium - Pink
    Ts: 0xff0005,  // Tennessine - Pink
    Og: 0xff0000   // Oganesson - Red
};

const covalentRadii = {
    H: 0.31, He: 0.28, Li: 1.28, Be: 0.96, B: 0.84, C: 0.76, N: 0.71, O: 0.66, F: 0.57, Ne: 0.58,
    Na: 1.66, Mg: 1.41, Al: 1.21, Si: 1.11, P: 1.07, S: 1.05, Cl: 1.02, Ar: 1.06,
    K: 2.03, Ca: 1.76, Sc: 1.70, Ti: 1.60, V: 1.53, Cr: 1.39, Mn: 1.39, Fe: 1.32, Co: 1.26, Ni: 1.24,
    Cu: 1.32, Zn: 1.22, Ga: 1.22, Ge: 1.20, As: 1.19, Se: 1.20, Br: 1.20, Kr: 1.16,
    Rb: 2.20, Sr: 1.95, Y: 1.90, Zr: 1.75, Nb: 1.64, Mo: 1.54, Tc: 1.47, Ru: 1.46, Rh: 1.42, Pd: 1.39,
    Ag: 1.45, Cd: 1.44, In: 1.42, Sn: 1.39, Sb: 1.39, Te: 1.38, I: 1.39, Xe: 1.40,
    Cs: 2.44, Ba: 2.15, La: 2.07, Ce: 2.04, Pr: 2.03, Nd: 2.01, Pm: 1.99, Sm: 1.98, Eu: 1.98, Gd: 1.96,
    Tb: 1.94, Dy: 1.92, Ho: 1.92, Er: 1.89, Tm: 1.90, Yb: 1.87, Lu: 1.87, Hf: 1.75, Ta: 1.70, W: 1.62,
    Re: 1.51, Os: 1.44, Ir: 1.41, Pt: 1.36, Au: 1.36, Hg: 1.32, Tl: 1.45, Pb: 1.46, Bi: 1.48, Po: 1.40,
    At: 1.50, Rn: 1.50, Fr: 2.60, Ra: 2.21, Ac: 2.15, Th: 2.06, Pa: 2.00, U: 1.96, Np: 1.90, Pu: 1.87,
    Am: 1.80, Cm: 1.69,};

export { elementColors, covalentRadii };
