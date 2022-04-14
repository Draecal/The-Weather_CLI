require('dotenv').config()
const { default: axios } = require("axios")
const { readInput, promptMenu, pause, listPlaces } = require("./helpers/inquirer")
const Searches = require("./models/searches")


const main = async () => {
    let opt
    const sch = new Searches()

    do {
        opt = await promptMenu()

        switch (opt) {
            case 1:
                //Show msg
                const place = await readInput('City: ')
                //Search places
                const places = await sch.city(place)
                //Choose place
                const placeId = await listPlaces(places)
                if (placeId === 0) continue
                
                const placeName = places.find(p => p.id === placeId)
                //Save place
                sch.save(placeName.name)
                //Weather data
                const weather = await sch.getWeather(placeName.lat, placeName.lng)
                //Show data
                console.log('\nCity and Weather information\n'.cyan)
                console.log('Actual weather'.cyan,`${weather.desc}`.green)
                console.log('City:'.cyan, placeName.name)
                console.log('Lat:'.cyan, placeName.lat, 'Lon:'.cyan, placeName.lng)
                console.log('Temp:'.cyan, weather.temp,`ºC`)
                console.log('Min:'.cyan, weather.min, `ºC`, 'Max:'.cyan, weather.max, `ºC`)
                console.log('Humitidy:'.cyan, weather.hum, `%`)

                break;
            case 2:
                sch.history.forEach((p, index) => {
                    let idx = `${index + 1}`.cyan
                    console.log(idx, '.', p.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase()))))
                })
                break;
        }

        if (opt !== 0) { await pause() }
        
    } while (opt !== 0)
    

}

main()