var express = require('express');
var router = express.Router();
var models = require('../models'); 
var Location = models.Location;
var GeoJSON = require('geojson'); 

const { Client } = require('pg')
 
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'YES Map' });
});

router.get('/locations.geojson', function(req, res, next) {
  const client = new Client() 
  client.connect() 

  client.query('SELECT latitude,longitude FROM locations', (err, results) => {
    if (err) {
      console.log(err.stack)
    } else {
      console.log(results.rows)
      var geojson = GeoJSON.parse(results.rows, {Point: ['longitude', 'latitude']})

      res.send(geojson)
    }
  })
})

router.post('/location', function(req, res, next) {
  console.log(req.body)
  
  const client = new Client()
  client.connect()
  
  var text = 'INSERT INTO locations(latitude, longitude) values ($1, $2)'
  var values = [req.body.latitude, req.body.longitude]
  
  client.query(text, values, (err, results) => {
    if (err) {
      console.error(err.stack)
    } else { 
      res.send(200)
    }
  })
})

module.exports = router;
