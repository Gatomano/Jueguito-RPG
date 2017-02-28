const WIDTH = 800;
const HEIGHT = 600;
const WEIGHTS = {
	default: 0,
	fuerza: Math.sqrt(50), //de anillos
	agilidad: Math.sqrt(50), //de anillos
	espiritu: Math.sqrt(50), //de anillos
	vitalidad: Math.sqrt(50), //por los stoles se deduce que la vitalidad, el espiritu y la fuerza valen lo mismo
	regen: 1294.2179105544783, //de kind star
	defensa: 11.26509834, //de cascos y escudos
	defensaMagica: 11.26509834, //por los golden y silver mirrors se deduce que la defensa y la defensaMagica valen lo mismo
	resistirLuz: 87.3490166, //de moonstone
	resistirOscuridad: 87.3490166, //por moonstone y onyx se deduce que resistirLuz y resistirOscuridad valen lo mismo
	resistirFuego: Math.sqrt(500) / 0.75, //de flamethrower
	resistirSangrado: 54.929470244148334, //de blood opal
	resistirConfusion: 88.19171036881968, //de amethyst
	resistirVeneno: 74.535599249993, //de viper's eye
	resistirDormir: 7.0710678118654755, //de cog necklace
	resistirCeguera: 7.0710678118654755, // por moonstone ring y onyx ring se deduce que resistirDormir y resistirCeguera valen lo mismo
	resistirTierra: 45.99921079878612, //por emerald bangle
	resistirParalisis: 6.256599884403574, //por belt of movement
	ataque: 0.3878420643, //de espadas
	critical: 219.1372719, //de espadas
	empowerTierra: 154.00078920121388, //de jade
	empowerFuego: 170.1857603000028, //de fire opal
	empowerLuz: 43.39074335, //de shield of light
	empowerOscuridad: 43.39074335 //por shield of light y shield of darkness se deduce que empowerLuz y empowerOscuridad valen lo mismo
};
const DEFAULT_VALUES = {
	default: 0
}
const EXPONENTE_PRECIO = 2;
const MEDIDAS_CAMPO_DE_BATALLA = {
	x: 0,
	y: 0,
	width: WIDTH,
	height: HEIGHT,
}
MEDIDAS_CAMPO_DE_BATALLA.ladoTile = (ladoDeseado => {
	let anchosEnTiles = new Set();
	for (let i = 1; i <= MEDIDAS_CAMPO_DE_BATALLA.width / ladoDeseado + 1; i++) anchosEnTiles.add(i);
	let ladoPosibleMasCercano = 1;
	let distancia = Math.abs(ladoDeseado - ladoPosibleMasCercano);
	for (let anchoEnTiles of anchosEnTiles) {
		let altoEnTiles = anchoEnTiles * MEDIDAS_CAMPO_DE_BATALLA.height / MEDIDAS_CAMPO_DE_BATALLA.width;
		if (altoEnTiles === parseInt(altoEnTiles)) {
			let ladoPosible = MEDIDAS_CAMPO_DE_BATALLA.width / anchoEnTiles
			if (ladoPosible === MEDIDAS_CAMPO_DE_BATALLA.height / altoEnTiles && Math.abs(ladoDeseado - ladoPosible) < distancia) {
				ladoPosibleMasCercano = ladoPosible
				distancia = Math.abs(ladoDeseado - ladoPosibleMasCercano);
			}
		}
	}
	return ladoPosibleMasCercano;
})(100);
MEDIDAS_CAMPO_DE_BATALLA.widthEnTiles = MEDIDAS_CAMPO_DE_BATALLA.width / MEDIDAS_CAMPO_DE_BATALLA.ladoTile;
MEDIDAS_CAMPO_DE_BATALLA.heightEnTiles = MEDIDAS_CAMPO_DE_BATALLA.height / MEDIDAS_CAMPO_DE_BATALLA.ladoTile;

class Punto {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Stats {
	constructor(nombre, clase, stats) {
		if (typeof nombre !== 'string') throw new Error('Los nombres deben ser strings, sin embargo el nombre pasado al constructor de la clase Stats es: ' + clase);
		if (typeof clase !== 'string') throw new Error('Los nombres de las clases deben ser strings, sin embargo el nombre de la clase pasado al constructor de la clase Stats es: ' + clase);
		this.agilidad = stats.agilidad || 0;
		this.ataque = stats.ataque || 0;
		this.clase = clase;
		this.critical = stats.critical || 0;
		this.defensa = stats.defensa || 0;
		this.defensaMagica = stats.defensaMagica || 0;
		this.drain = stats.drain || 0;
		this.elemento = stats.elemento || 'Physical';
		this.empowerLuz = stats.empowerLuz || 0;
		this.empowerOscuridad = stats.empowerOscuridad || 0;
		this.empowerFuego = stats.empowerFuego || 0;
		this.empowerTierra = stats.empowerTierra || 0;
		this.fuerza = stats.fuerza || 0;
		this.multiplicadorAgua = stats.multiplicadorAgua || 1;
		this.multiplicadorAire = stats.multiplicadorAire || 1;
		this.multiplicadorFuego = stats.multiplicadorFuego || 1;
		this.multiplicadorTierra = stats.multiplicadorTierra || 1;
		this.multiplicadorUndead = stats.multiplicadorUndead || 1;
		this.resistirTierra = stats.resistirTierra || 0;
		this.resistirAgua = stats.resistirAgua || 0;
		this.resistirFuego = stats.resistirFuego || 0;
		this.resistirAire = stats.resistirAire || 0;
		this.resistirFisico = stats.resistirFisico || 0;
		this.resistirLuz = stats.resistirLuz || 0;
		this.resistirOscuridad = stats.resistirOscuridad || 0;
		this.resistirEter = stats.resistirEter || 0;
		this.nombre = nombre;
		//this.precioDeseado = stats.precioDeseado || 0;
		this.regen = stats.regen || 0;
	}
}

class Objeto {
	constructor(stats, slots) {
		if (stats instanceof Stats) {
			for (let stat in stats) this[stat] = stats[stat];
			this.slots = new Set(slots);
			clasesDeObjetos.get(stats.clase).cantidad = clasesDeObjetos.get(stats.clase).cantidad + 1 || 1;
		} else throw new Error('No le pasé una instancia de la clase Stats al constructor de la clase Objeto, sino esto: ' + stats);
	}

	calcularPrecio() {
		let x = 0;
		for (let stat in this)
			x += (typeof this[stat] === 'number' ? (WEIGHTS[stat] || WEIGHTS.default) * this[stat] : 0) * (this.slots.has('torso') && stat === 'defensa' ? 2 / Math.sqrt((WEIGHTS[stat] || WEIGHTS.default) * this[stat]) : 1);
		switch (this.elemento) {
			case 'Physical':
				break;
			case 'Earth':
				x += 49.35827781616775; //de forest edge
				break;
			case 'Fire':
				x += 24.517120828063007; //de fire staff
				break;
			case 'Air':
				x += 26.84417321386301; //de air staff
				break;
			case 'Dark':
				x += 6.867713851; //de shadowblade
				break;
			case 'Light':
				x += 50.39794613823322; //de champion sword
				break;
			case 'Water':
				x += 52.94016591; //de trilobite staff
				break;
		}
		x *= Math.pow(500 / 1400, (this.slots.size - 1) / 2);
		//console.log(this.nombre, x, this.precioDeseado);
		return Math.round(Math.pow(x, 2));
	}

	calcularWeight() {
		let x = 0;
		for (let stat in this) x += (typeof this[stat] === 'number' ? (WEIGHTS[stat] || WEIGHTS.default) * this[stat] : 0);
		return (Math.pow(this.precioDeseado, 1 / EXPONENTE_PRECIO) - x) * Math.pow(1.1954887218045114, this.slots.size - 1);
	}
}

class Arma extends Objeto {
	constructor(stats, slots) {
		super(stats, slots);
	}
}

class Skill {
	constructor(nombre, opciones) {
		this.nombre = nombre || '';
		opciones = opciones || {};
		this.pasivo = opciones.pasivo || false;
		this.buff = opciones.buff || false;
		this.objetivos = opciones.objetivos || 'self';
		this.funcion = opciones.funcion || (() => undefined);
		this.requisitos = new Set(opciones.requisitos || []);
		this.costo = opciones.costo || 0;
		this.rango = opciones.rango || Infinity;
		this.onselect = opciones.onselect || (() => {
			let onmousemove = event => {
				origen = caster.posicion * MEDIDAS_CAMPO_DE_BATALLA.ladoTile + MEDIDAS_CAMPO_DE_BATALLA * x;
				if (origen.y === tileObjetivo.y) {
					let desde;
					let hasta;
					if (origen.x < tileObjetivo.x) {
						desde = origen.x + 1
						hasta = 7
						step = 1
					} else {
						desde = origen.x - 1
						hasta = 0
						step = -1
					}
					for (let x = desde; x <= hasta; x += step) {
						if (typeof campoDeBatalla[origen.y][x] === 'number') objetivos.push(personajes[campoDeBatalla[origen.y][x]]);
					}
				} else {
					let pendiente = (tileObjetivo.y - origen.y) / (tileObjetivo.x - origen.x);
					let desde;
					let hasta;
					if (origen.y < tileObjetivo.y) {
						desde = origen.y + 1
						hasta = 5
						step = 1
					} else {
						desde = origen.y - 1
						hasta = 0
						step = -1
					}
					for (let y = desde; y <= hasta; y += step) {
						x = Math.round(origen.x + pendiente * (y - origen.y));
						if (typeof campoDeBatalla[y][x] === 'number') objetivos.push(personajes[campoDeBatalla[y][x]]);
					}
				}
				if (opciones.objetivos === 'line') {
					pendiente = 1
				}
			};
			let onclick = event => {

			};
			canvasCampoDeBatalla.addEventListener('mousemove', onmousemove);
			canvasCampoDeBatalla.addEventListener()
		});
	}
}

class Personaje {
	constructor(opciones) {
		this.level = opciones.level || 1;
		this.skillsAprendidos = opciones.skillInicial ? [skillInicial] : [];
		this.skills = opciones.skills || this.skillsAprendidos;
		this.fuerzaBase = opciones.fuerzaBase || 1;
		this.agilidadBase = opciones.agilidadBase || 1;
		this.vitalidadBase = opciones.vitalidadBase || 1;
		this.espirituBase = opciones.espirituBase || 1;
		this.items = new Set([]);
		this.slotsOcupados = new Set([]);
		this.DOT = [];
	}

	recalcular(stat) {
		this[stat] = this[stat + 'Base'] || DEFAULT_VALUES[stat] || DEFAULT_VALUES.default;
		for (let item of this.items) this[stat] += item[stat];
	}
}

class Tile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

function calcularDaño(stats) {
	return (0.9 + Math.random() / 5) * (stats.multiplicador * stats.atk - stats.def) * stats.atributo * stats.level / 50
}

function ocultar(elemento) {
	elemento.style.display = 'none';
}

function mostrar(elemento) {
	elemento.style.display = '';
}

function onclickPestañaDeItems() {

}

function onload() {
	skills.set('concentration', new Skill('Concentration', {
		pasivo: true,
		funcion: (caster) => {
			caster.MPRegen *= 4 / 3
		}
	}));
	skills.set('heatBeam', new Skill('Heat beam', {
		costo: 6,
		funcion: (caster, tileObjetivo) => {
			let multiplicadorDeDaño = caster.espiritu * caster.level / 50;
			let objetivos = [];

			for (let objetivo of objetivos)
				objetivo.DOT.push({
					daño: Math.round(multiplicador * (30 - objetivo.defensaMagica)),
					elemento: 'Fire',
					duracion: 3
				});
		},
		objetivo: 'line',
		requisitos: [skills.get('concentration')]
	}));
	skills.set('burning Hands', new Skill('burningHands', {
		costo: 12,
		funcion: (caster, tileObjetivo) => {
			let multiplicadorDeDaño = caster.espiritu * caster.level / 50;
			let objetivos = [];
			origen = caster.posicion;
			if (origen.y === tileObjetivo.y) {
				let desde;
				let hasta;
				if (origen.x < tileObjetivo.x) {
					desde = origen.x + 1
					hasta = 7
					step = 1
				} else {
					desde = origen.x - 1
					hasta = 0
					step = -1
				}
				for (let x = desde; x <= hasta; x += step) {
					if (typeof campoDeBatalla[origen.y][x] === 'number') objetivos.push(personajes[campoDeBatalla[origen.y][x]]);
				}
			} else {
				let pendiente = (tileObjetivo.y - origen.y) / (tileObjetivo.x - origen.x);
				let desde;
				let hasta;
				if (origen.y < tileObjetivo.y) {
					desde = origen.y + 1
					hasta = 5
					step = 1
				} else {
					desde = origen.y - 1
					hasta = 0
					step = -1
				}
				for (let y = desde; y <= hasta; y += step) {
					x = Math.round(origen.x + pendiente * (y - origen.y));
					if (typeof campoDeBatalla[y][x] === 'number') objetivos.push(personajes[campoDeBatalla[y][x]]);
				}
			}
			for (let objetivo of objetivos)
				objetivo.DOT.push({
					daño: Math.round(multiplicador * (30 - objetivo.defensaMagica)),
					elemento: 'Fire',
					duracion: 3
				});
		},
		objetivo: 'triangle'
	}));
	let stats = [
		new Stats('Polemace', 'ArmaDeDosManos', {
			ataque: 60,
			critical: 0.05
		}),
		new Stats('Air staff', 'ArmaDeDosManos', {
			ataque: 72,
			critical: 0.01,
			elemento: 'Air',
			espiritu: 1
		}),
		new Stats('Fire staff', 'ArmaDeDosManos', {
			ataque: 78,
			critical: 0.01,
			elemento: 'Fire',
			espiritu: 1
		}),
		new Stats('Trilobite staff', 'ArmaDeDosManos', {
			ataque: 90,
			critical: 0.01,
			elemento: 'Water',
			fuerza: 1,
			agilidad: 1,
			vitalidad: 1,
			espiritu: 1
		}),
		new Stats('Mahogany staff', 'ArmaDeDosManos', {
			ataque: 84,
			critical: 0.05
		})
	];
	for (let statsInstance of stats) {
		let clase = clasesDeObjetos.get(statsInstance.clase);
		if (items.get(clase)) items.get(clase).push(new clase(statsInstance));
		else items.set(clase, []);
	}
	for (let pestaña of document.querySelectorAll('#pestañas>div')) {
		pestaña.addEventListener('click', onclickPestañaDeItems)
	}
	document.getElementById("items_equipados").width = 17 * WIDTH / 40;
	document.getElementById("items_equipados").height = 19 * HEIGHT / 40;
	document.getElementById("game_container").style.width = WIDTH + 'px';
	document.getElementById("game_container").style.height = HEIGHT + 'px';
	mostrar(document.getElementById("game_container"));
}

let clasesDeObjetos = new Map();
let items = new Map();
let skills = new Map();
let campoDeBatalla = [
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
];
clasesDeObjetos.set('ArmaDeUnaMano', class ArmaDeUnaMano extends Arma {
	constructor(stats) {
		super(stats, ['manoDerecha']);
	}
});
clasesDeObjetos.set('ArmaDeDosManos', class ArmaDeDosManos extends Arma {
	constructor(stats) {
		super(stats, ['manoDerecha', 'manoIzquierda']);
	}
});
clasesDeObjetos.set('Escudo', class Escudo extends Objeto {
	constructor(stats) {
		super(stats, ['manoIzquierda']);
	}
});
clasesDeObjetos.set('Casco', class Casco extends Objeto {
	constructor(stats) {
		super(stats, ['cabeza']);
	}
});
clasesDeObjetos.set('Armadura', class Armadura extends Objeto {
	constructor(stats) {
		super(stats, ['torso']);
	}
});
clasesDeObjetos.set('Amuleto', class Amuleto extends Objeto {
	constructor(stats) {
		super(stats, ['cuello']);
	}
});
window.addEventListener('load', onload);