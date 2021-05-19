var express = require('express');
var router = express.Router();

const buildCalendar = require("../lib/buildCalendar");
const dataTier = require("../lib/dataTier");
var CryptoJS = require("crypto-js");

// GET calendar search
router.get('/search', function(req, res, next) {
  // If an extension is noted, call it by id
  var searchTerm = req.param('searchterm') || ''
  dataTier.searchCalendarsByName(searchTerm, function(calendarData) {
    res.render('search',
    {
      calendars: calendarData
    });
  })
});

// GET calendar
router.get('/:id', function(req, res, next) {
  // If an extension is noted, call it by id
  var key = "example"
  if(process.env.CHART_ENCODER_KEY) {
    key = process.env.CHART_ENCODER_KEY
  } else {
    try {
      configVars = require('./config')
      key = configVars['encoding_key'];
    }
    catch (e) {
      console.log("WARNING: No config file or database found. Loaded calendar will not be the same as on web app");
    }
  }
  var bytes  = CryptoJS.AES.decrypt(req.params.id, key);
  var plaintext = bytes.toString(CryptoJS.enc.Utf8);
  dataTier.loadCalendar(plaintext, function(calendarData) {
    res.render('chart',
      { name: "Class Layout by Week",
        barArray: JSON.stringify(calendarData),
        chartX: 5,
        chartY: 27,
        isAlreadySaved: true
      });
  })
});

// POST search params
router.post('/', function(req, res, next) {
  console.log("Creating chart")
  var inputClasses = req.body.classes || []
  if (typeof inputClasses !== "array" && typeof inputClasses !== "object") {
    inputClasses = [inputClasses]
  }
  // Return error if no classes passed in
  if(inputClasses.length == 0) {
    req.flash('error', 'Search must contain classes!');
    res.redirect('/');
    return;
  }
  // Remove duplicates
  inputClasses = inputClasses.sort().filter(function(item, pos, ary) {
      return !pos || item.toLowerCase() != ary[pos - 1].toLowerCase();
  });
  
  classProcessingArray = inputClasses.map(name => dataTier.getClassData(name.trim()))
  Promise.all(classProcessingArray)
    .then((values) => {
      
      var classesDictionary = {}
      values.forEach(function(classTimesDict) {
        Object.assign(classesDictionary, classTimesDict)
      })

      // Numbers 1-27 represent 8:00am-9:30pm on Monday by half-hour. 28-54 represent 8:00am-9:30pm on Tuesday.
      var createdCalendar = buildCalendar(classesDictionary); // Created calendar format: { CPSC1100: [0, 1, 2, 8, 9, 12, 13, 41, 42], CPSC1110: [22, 76], ... }
      console.log(createdCalendar)
      res.render('chart',
        { name: "Class Layout by Week",
          barArray: JSON.stringify(createdCalendar),
          chartX: 5,
          chartY: 27,
          isAlreadySaved: false
        });
    });
});

module.exports = router;
