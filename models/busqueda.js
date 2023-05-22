const fs = require('fs');
const axios = require('axios');

class Busquedas {
    historial = [];
    bdPath = './db/database.json';

    constructor(){
        // TODO: leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado(){
        //Capitalizar cada Palabra
        
        return this.historial.map(lugar =>{
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ');
        });
    }

    get paramsMapbox(){
        return{
            'language':'es',
            'access_token':process.env.MAPBOX_KEY,
            'limit': 5
        }
    }

    async ciudad( lugar = '' ){
        try {
            //petición http
            const intance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params:this.paramsMapbox
            })
            const resp = await intance.get();
            return resp.data.features.map(lugar =>({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async climaLugar(lat, lon){
        try {
            //hacer la peticion con fecth
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_KEY}&units=metric&lang=es`);
            
            const data = await response.json();

            return{
                desc: data.weather[0].description,
                min: data.main.temp_min,
                max: data.main.temp_max,
                temp: data.main.temp
            }

        } catch (error) {
            // console.log(error);
            return {
                desc: 'No hay datos',
                min: 'No hay datos',
                max: 'No hay datos',
                temp: 'No hay datos'
            }
        }
    }

    agregarHistorial( lugar = ''){
        //prevenir duplicados
        if (this.historial.includes( lugar.toLocaleLowerCase() )){
            return;
        }

        this.historial.unshift(lugar.toLocaleLowerCase());

        //Grabar en DB
        this.guardarDB();
    }

    guardarDB(){
        const payload = {
            historial: this.historial
        }
        fs.writeFileSync( this.bdPath, JSON.stringify(payload) )
    }

    leerDB(){
        if(!fs.existsSync(this.bdPath)) return null;

        const info = fs.readFileSync(this.bdPath, { encoding:'utf-8' } );
        const data = JSON.parse(info);
        // console.log(data);
        this.historial = data.historial;
    }
}

module.exports = Busquedas;