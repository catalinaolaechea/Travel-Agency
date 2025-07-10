abstract class Producto {
  abstract calcularPrecio(): number;
}

class Vuelo extends Producto {
  constructor(
    public aerolinea: string,
    public fechaSalida: Date,
    private precio: number,
    public fechaRegreso?: Date
  ) {
    super();
  }

  calcularPrecio(): number {
    return this.precio;
  }
}

abstract class Alojamiento extends Producto {
  constructor(
    public direccion: string,
    protected noches: number
  ) {
    super();
  }
}

class Hotel extends Alojamiento {
  constructor(
    direccion: string,
    noches: number,
    public nombre: string,
    public estrellas: number
  ) {
    super(direccion, noches);
  }

  calcularPrecio(): number {
    return this.noches * this.estrellas * 10000;
  }
}

class CasaDepartamento extends Alojamiento {
  constructor(
    direccion: string,
    noches: number,
    private ambientes: number
  ) {
    super(direccion, noches);
  }

  calcularPrecio(): number {
    let precioPorNoche = 0;
    if (this.ambientes === 1) precioPorNoche = 15000;
    else if (this.ambientes >= 2 && this.ambientes <= 4) precioPorNoche = 30000;
    else precioPorNoche = 50000;

    return this.noches * precioPorNoche;
  }
}

class Complejo extends Alojamiento {
  private casas: CasaDepartamento[];

  constructor(
    direccion: string,
    noches: number,
    casas: CasaDepartamento[]
  ) {
    super(direccion, noches);
    this.casas = casas;
  }

  calcularPrecio(unidadesAlquiladas: number = 1): number {
    if (unidadesAlquiladas < 1 || unidadesAlquiladas > this.casas.length) {
      throw new Error("no es inválida la cantidad de unidades");
    }

    if (unidadesAlquiladas === 1) {
      return this.casas[0].calcularPrecio();
    }

    let precioTotal = 0;
    for (let i = 0; i < unidadesAlquiladas; i++) {
      precioTotal += this.casas[i].calcularPrecio();
    }

    if (unidadesAlquiladas === this.casas.length) {
      const descuentoPorUnidad = 0.1;
      const descuentoTotal = Math.min(unidadesAlquiladas * descuentoPorUnidad, 0.5);
      precioTotal *= (1 - descuentoTotal);
    }

    return precioTotal;
  }
}

class Paquete extends Producto {
  private productos: Producto[] = [];

  agregarProducto(producto: Producto) {
    this.productos.push(producto);
  }

  calcularPrecio(): number {
    return this.productos.reduce((sum, p) => sum + p.calcularPrecio(), 0);
  }
}

class Usuario {
  private historial: Producto[] = [];

  constructor(
    public nombre: string,
    private presupuesto: number
  ) {}

  contratar(producto: Producto, unidadesAlquiladas: number = 1) {
    let precio: number;

    if (producto instanceof Complejo) {
      precio = producto.calcularPrecio(unidadesAlquiladas);
    } else {
      precio = producto.calcularPrecio();
    }

    if (this.presupuesto >= precio) {
      this.presupuesto -= precio;
      this.historial.push(producto);
      console.log(`usuario ${this.nombre} contrató producto por $${precio}`);
    } else {
      console.log(`${this.nombre} no tiene suficiente presupuesto. Precio alojamiento: $${precio}, disponible: $${this.presupuesto}`);
    }
  }

  productosQuePodríaComprar(productos: Producto[]): Producto[] {
    return productos.filter(p => {
      try {
        let precio: number;

        if (p instanceof Complejo) {
          precio = p.calcularPrecio(1); 
        } else {
          precio = p.calcularPrecio();
        }

        return precio <= this.presupuesto;
      } catch {
        return false;
      }
    });
  }

  getHistorial(): Producto[] {
    return this.historial;
  }

  getPresupuesto(): number {
    return this.presupuesto;
  }

  cantidadProductos(): number {
    return this.historial.length;
  }
}

function ordenarUsuariosPorCantidadDeProductos(usuarios: Usuario[]): Usuario[] {
  return usuarios.slice().sort((a, b) => b.cantidadProductos() - a.cantidadProductos());
}

//-------test asociados--------
function runTests(){
  const vuelo = new Vuelo("Aerolíneas Argentinas", new Date(), 50000, new Date());
  const hotel = new Hotel("Calle Hotel", 2, "Hotel Bueno", 4); // 80.000
  const casa = new CasaDepartamento("Calle Casa", 3, 3); // 90.000
  const monoambiente = new CasaDepartamento("Mono", 1, 1); // 15.000
  const complejo = new Complejo("Complejo Sur", 2, [monoambiente, casa, casa]);

  const usuario = new Usuario("Ana", 300000);
  const usuario2 = new Usuario("Juan", 10000);

  usuario.contratar(vuelo);
  usuario.contratar(hotel);
  usuario.contratar(complejo, 3);

  console.assert(usuario.getHistorial().length === 3, "Ana debería tener 3 productos");
  console.assert(usuario2.getHistorial().length === 0, "Juan no debería haber comprado");

  const ordenados = ordenarUsuariosPorCantidadDeProductos([usuario2, usuario]);
  console.assert(ordenados[0] === usuario, "Ana debería estar primera en el ranking");
}

runTests();
