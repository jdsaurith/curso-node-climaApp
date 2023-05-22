require('dotenv').config();
require('colors');
const { leerInput, inquirerMenu, pausa, listarLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/busqueda');


const main = async() =>{
    const busquedas = new Busquedas();
    let opt;

    do{
        opt = await inquirerMenu();

        switch(opt){
            case 1:
                // Mostrar mensaje
                    const termino = await leerInput('Ciudad: ');
                    
                // Buscar los Lugares
                    const lugares = await busquedas.ciudad( termino );
                    

                // Seleccionar el Lugar
                    const id = await listarLugares(lugares);
                    if(id === '0') continue;
                    
                    const lugarSele = lugares.find(l => l.id === id);

                    //Guardar en DB
                    busquedas.agregarHistorial(lugarSele.nombre)

                //Clima
                    const clima = await busquedas.climaLugar(lugarSele?.lat,  lugarSele?.lng);
                    // console.log(clima);
                //Mostrar resultado
                console.clear();
                console.log('\n Información de la ciudad \n'.green);
                console.log('Ciudad:', lugarSele?.nombre.green );
                console.log('Lat:', lugarSele?.lat );
                console.log('Lng:', lugarSele?.lng );
                console.log('Descripción:', clima?.desc.green);
                console.log('Temperatura: ', clima?.temp);
                console.log('Mínima: ', clima?.min);
                console.log('Máxima: ', clima?.max);
            break;
            case 2:
                busquedas.historialCapitalizado.forEach((lugar, i) =>{
                    const idx = `${ i + 1 }.`.green
                    console.log(`${idx} ${lugar}`);
                })
                
            break;

            default:
                break;
        }

        if (opt !== 0) await pausa();

    }while(opt !== 0)
}

main();