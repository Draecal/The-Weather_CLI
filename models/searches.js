const fs = require('fs')
const axios = require('axios')
require('colors')

class Searches{
    history = []
    db = './db/db.json'
    
    constructor() {
        //read DB if exist
        this.fromDb()
    }

    get paramsMapbox(){
        return {
            'limit': 5,
            'types': ['place', 'postcode', 'address'],
            'language': 'en',
            'access_token': process.env.MAPBOX_KEY
        }
    }

    async city(place) {
        try {
            //HTTP request
            const inst = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`,
                params: this.paramsMapbox
            })

            const res = await inst.get();
            return res.data.features.map(city => ({
                name: city.place_name,
                id: city.id,
                location: city.center.join("  "),
                lng: city.center[0],
                lat: city.center[1]
            }))
    
        } catch (err) {
            console.log('HTTP Request Err: '.red, err)
            return [];
        }   
    }

    get paramsOpenweather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            lang: `en`,
            units: `metric`
        }
    }
    async getWeather(lat, lon) {
        try {
            //HTTP request
            const inst = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsOpenweather, lat, lon}
            })
            const res = await inst.get()
            const {weather, main} = res.data
            return {
                desc: weather[0].description,
                temp: main.temp,
                min: main.temp_min,
                max: main.temp_max,
                hum: main.humidity
            }
        } catch (err) {
            console.log(err)
        }
    }

    save(place) {
        if (this.history.includes(place.toLowerCase())) {
           return
       }
        //Prevent duplicates
        this.history = this.history.splice(0,5)
        this.history.unshift(place.toLowerCase())
        //Save to DB/File
        this.toDb()
    }

    toDb() {
        const payload = {
            cities: this.history
        }
        fs.writeFileSync(this.db, JSON.stringify(payload))
    }

    fromDb() {
        if (!fs.existsSync(this.db)) return;

        const data = JSON.parse(fs.readFileSync(this.db, 'utf-8'))
        
        data.cities.forEach(c => {
            this.history.unshift(c)
        })
    }
}

module.exports = Searches