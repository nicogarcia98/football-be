//import Express
const express = require('express');
const app = express();
const cors = require("cors");
//Puerto
const port = 3002;
//funcionalidad
const csv = require('csv-parser')
const fs = require('fs');
const _ = require('underscore');

app.use(cors())

var csvData = [];

const dataHeaders = ['nombre', 'edad', 'equipo', 'estadoCivil', 'estudios']

fs.createReadStream('socios.csv')
    .pipe(csv({ headers: dataHeaders, separator: ';' }))
    .on('data', function (csvRow) {
        csvData.push(csvRow);
    })
    .on('end', function () {
        console.log('proceso completado');
    })


app.get('/getAll', function (req, res) {
    res.json({
        result: csvData,
        estado: 'ok'
    })
})
app.get('/getTotalPersonas', function (req, res) {

    var total = csvData.length
    res.json({
        result: total,
        estado: 'ok'
    })
})

app.get('/getPromedioEdadRacing', function (req, res) {
    var racingTable = csvData.filter((row) => { return row.equipo === 'Racing' })
    let promedio = 0.00;
    let suma = 0;
    racingTable.forEach((item) => {
        suma = suma + +item.edad
    })
    promedio = suma / racingTable.length
    res.json({
        result: promedio,
        estado: 'Ok'
    })
})

app.get('/getCasadosUniversitarios', function (req, res) {
    var newArray = csvData.filter((row) => { return (row.estadoCivil === 'Casado' && row.estudios === 'Universitario') })
    var casadosTable = newArray.slice(0, 100).map(item => {
        return {
            nombre: item.nombre,
            edad: item.edad,
            equipo: item.equipo
        }
    })

    res.json({
        result: casadosTable,
        estado: 'Ok'
    })

})

app.get('/getNombresRiver', function (req, res) {
    var riverArray = csvData.filter((row) => row.equipo === 'River')
    var listOfNames = []
    var listNamesAndLength = []
    riverArray.forEach((row, index) => {
        listOfNames.push(
            row.nombre
        )
    })

    var filteredArray = _.uniq(listOfNames)

    filteredArray.forEach((row) => {
        var nameLength = riverArray.filter((item) => item.nombre === row).length
        listNamesAndLength.push({
            nombre: row,
            length: nameLength
        })
    })

    listNamesAndLength.sort((a, b) => b.length - a.length)

    let finalArray = listNamesAndLength.slice(0, 5).map(item => { return item.nombre })

    res.json({
        result: finalArray,
        estado: 'ok'
    })
})


app.get('/getSociosEdadPorEquipo', function (req, res) {

    var arrayDeEquipos = csvData.map(item => { return item.equipo })

    var arrayDeEquiposUnicos = _.uniq(arrayDeEquipos)

    var arrayEquipoYSocios = []

    arrayDeEquiposUnicos.forEach(equipo => {
        var sociosPorEquipo = csvData.filter((item) => item.equipo === equipo)
        let promedio = 0.00;
        let suma = 0;
        sociosPorEquipo.forEach((item) => {
            suma = suma + +item.edad
        })
        promedio = suma / sociosPorEquipo.length
        var min = Math.min.apply(Math, sociosPorEquipo.map((item) => {return item.edad}))
        var max = Math.max.apply(Math, sociosPorEquipo.map((item) => {return item.edad}))
        arrayEquipoYSocios.push({
            equipo: equipo,
            socios: sociosPorEquipo.length,
            promedioEdad: promedio,
            edadMinima: min,
            edadMaxima: max,
        })
    })

    arrayEquipoYSocios.sort((a, b) => b.socios - a.socios)

    res.json({
        result: arrayEquipoYSocios,
        estado: 'ok'
    })
})

app.listen(port, function () {
    console.log('escuchando en puerto', port)
})