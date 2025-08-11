abstract class Producto {
    abstract obtenerPrecio():number
    abstract detalles():string
}

type Estrellas = 1 | 2 | 3 | 4 | 5

class Vuelo extends Producto {
    protected fechaSalida: Date;
    protected destino: string;
    aereolinea: string;
    precio : number;
    protected fechaRegreso?: Date;
    constructor(
        destino:string,
        fechaSalida: Date,
        aereolinea: string,
        precio : number,
        fechaRegreso?: Date,
    ){
        super();
        this.destino = destino;
        this.fechaSalida = fechaSalida;
        this.aereolinea = aereolinea;
        this.precio = precio;
        this.fechaRegreso = fechaRegreso

    }
    obtenerPrecio(): number {
        return this.precio
    }
    detalles():string{
        return `Vuelo: Destino ${this.destino} - Fechas:(${this.fechaSalida} - ${this.fechaRegreso ?? "Sin especificar"}) - Aereolinea: ${this.aereolinea}`
    }
}

abstract class Alojamiento extends Producto{
    protected cantidadNoches:number;
    direccion:string;
    constructor(direccion:string, cantidadNoches:number){
        super()
        this.direccion = direccion;
        this.cantidadNoches = cantidadNoches;
    }
}

class Hotel extends Alojamiento {
    nombre: string;
    protected cantidadDeNoches: number;
    direccion: string;
    cantidadDeEstrellas : Estrellas;
    constructor(nombre:string, direccion:string, cantidadEstrellas:Estrellas, noches:number){
        super(direccion, noches);
        this.nombre = nombre;
        this.cantidadDeNoches = noches;
        this.cantidadDeEstrellas = cantidadEstrellas;
        this.direccion = direccion;
    }
    obtenerPrecio(): number {
        return 10000 * this.cantidadDeEstrellas * this.cantidadDeNoches
    }
    detalles():string{
        return `Hotel: ${this.nombre} (${this.cantidadDeEstrellas} estrellas) : ( ${this.direccion} ) - ${this.cantidadDeNoches} noches`
    }
}


class CasaDepartamento extends Alojamiento{
    direccion:string;
    protected cantidadDeNoches: number;
    cantidadAmbientes: number;
    complejo?: Complejo;

    constructor(direccion:string, cantidadDeNoches , cantidadAmbientes:number, complejo?: Complejo){
        super(direccion, cantidadDeNoches)
        this.direccion = direccion;
        this.cantidadDeNoches= cantidadDeNoches;
        this.cantidadAmbientes = cantidadAmbientes;
        this.complejo = complejo
    }
    obtenerPrecio(): number {
        if (this.cantidadAmbientes < 1) {
            throw new Error("La cantidad de ambientes debe ser al menos 1.");
        }
        else if (this.cantidadAmbientes === 1){
            return this.cantidadDeNoches * 15000
        }
        else if(this.cantidadAmbientes > 1 && this.cantidadAmbientes < 5){
            return this.cantidadDeNoches * 30000 
        }
        else return this.cantidadDeNoches * 50000
    }
    detalles():string{
        return `Casa o departamento : ${this.direccion} - ${this.cantidadAmbientes} ambientes - ${this.cantidadDeNoches} noches`
    }
    obtenerDireccion():string{
        return this.direccion;
    }
}

class Complejo extends CasaDepartamento {
    protected cantidadCasas:CasaDepartamento[];
    nombreComplejo:string
    constructor(nombre:string, direccion:string, protected cantidadDeNoches:number, cantidadCasas:CasaDepartamento[] ){
        super(direccion, cantidadDeNoches, cantidadDeNoches)
        this.nombreComplejo = nombre;
        this.cantidadCasas = cantidadCasas;
    }
    obtenerPrecio(unidadesAlquiladas:number = 1):number {
        if (unidadesAlquiladas < 1 || unidadesAlquiladas > this.cantidadCasas.length) {
            throw new Error("no se especifica un numero valido")
        }
     
        else{
            const descuentoPorUnidad = 0.1
            const descuentoTotal = Math.min(this.cantidadCasas.length*descuentoPorUnidad , 0.5)
            let precioTotal = 0;
            for (let i = 0; i < unidadesAlquiladas; i++) {
                precioTotal += this.cantidadCasas[i].obtenerPrecio()
            }
            return precioTotal * (1- descuentoTotal )
        }
    } 
    obtenerDireccion():string{
        return this.cantidadCasas.map(casa => casa.direccion).join('\n')
    }
    detalles():string{
        return `Complejo: ${this.direccion} - ${this.cantidadCasas.length} casas - direcciones:\n${this.obtenerDireccion()}`
    }
   
}

class Paquete extends Producto {
    constructor(protected productos:Producto[]){
        super()
    }
    agregarProducto(producto:Producto):void{
        this.productos.push(producto)
    }
    eliminarProductos(producto:Producto):void{
        this.productos = this.productos.filter(p => p !== producto)
    }
    obtenerPrecio(): number {
       return this.productos.reduce((acc, producto) => acc + producto.obtenerPrecio(), 0)
    }
    detalles():string{
        const detallesProductos = this.productos.map(p => {
            return `- ${p.detalles()}`
        }).join('\n')
        return `Paquete: ${detallesProductos}`
    }
}


class Usuario{
    nombre:string;
    presupuesto:number;
    historial:Producto[] = [];
    constructor(nombre:string, presupuesto:number){
        this.nombre = nombre;
        this.presupuesto = presupuesto;
    }
    contratar(producto:Producto, unidadesAlquiladas:number = 1){
        let precio:number
        if(producto instanceof Complejo){
            precio = producto.obtenerPrecio(unidadesAlquiladas)
        }
        else{
            precio = producto.obtenerPrecio();
        }
        if(this.presupuesto >= precio){
            this.historial.push(producto);
            this.presupuesto = this.presupuesto - precio
            console.log(`usuario ${this.nombre} contrató producto por $${precio}`);
        }
        else{
            `${this.nombre}, usted no tiene suficiente presupuesto para contratar ${producto.detalles()} x ${unidadesAlquiladas} unidad(es)`;
        }
    }
    mostrarHistorial(){
        if(this.historial.length === 0){
            return `El usuario no ha realizado contrataciones a servicios`
        }else{
           const detallesProductos = this.historial.map(p => {
                return `- ${p.detalles()}`
            }).join('\n')
            return `Paquete: ${detallesProductos}` 
        }
        
    } //toString para que sea legible para el usuario final, sino se muestra en forma objeto y lo será.
}

function ordenarUsuarios(usuarios:Usuario[]):Usuario[]{
    const listaOrdenada = usuarios.sort((p1, p2)=>{
        return p1.historial.length - p2.historial.length
    })
    return listaOrdenada;
}

//test
let hotel1 = new Hotel('Kimpton EPIC Hotel','270 Biscayne Boulevard Way, Miami, FL 33131',4,7);
let vuelo1 = new Vuelo('Miami',new Date(2025,5,3), 'Aereolinas Argentinas', 20000, new Date(2025,5,20));
const casa1 = new CasaDepartamento("Calle Pioneros 101, Misiones, Argentina", 5, 2);
const casa2 = new CasaDepartamento("Avenida Cataratas 202, Misiones, Argentina", 7, 3);
const casa3 = new CasaDepartamento("Ruta Provincial 12, km 8, Misiones, Argentina", 4, 4);
const casa4 = new CasaDepartamento("Barrio La Selva, Lote 45, Misiones, Argentina", 6, 1);
let departamento1 = new CasaDepartamento('1649 23rd St, Sarasota, FL 34234, EE. UU.',10,2);
let vuelo2 = new Vuelo('Chile', new Date(2025,7,4),'LATAM airlines', 10000);
let vuelo4 = new Vuelo('Colombia', new Date(2025, 6, 10), 'Avianca', 15000, new Date(2025, 6, 20));
let vuelo6 = new Vuelo('México', new Date(2025, 10, 5), 'Aeroméxico', 19000, new Date(2025, 10, 15));
let comboDespejar = new Paquete([vuelo1, hotel1,departamento1]);
let comboViajes = new Paquete([vuelo4, vuelo6]);

let complejo = new Complejo('Complejo Americano', 'Ruta 12 Km 5 C.P 3370 Puerto Iguazú, Misiones, Argentina', 5, [casa1, casa2, casa3, casa4]);

let user1 = new Usuario('Julian Rodriguez',300000,);
let user2 = new Usuario('Catalina Maria Olaechea',900000);
let user3 = new Usuario('Emanuela Fernandez', 760507);


user1.contratar(comboDespejar);
user2.contratar(vuelo2);
user3.contratar(comboViajes);
user1.contratar(vuelo4);

let direccionesComplejoAmericano = complejo.detalles();

console.log(direccionesComplejoAmericano);

let usuariosOrdenados= ordenarUsuarios([user1,user2,user3]);

console.log(comboDespejar.obtenerPrecio());
console.log(user1.mostrarHistorial());
