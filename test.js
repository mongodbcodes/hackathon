const MongoClient = require('mongodb').MongoClient;
const Table = require('cli-table3');
const colors = require('colors');
const fs = require('fs');
const testSuite = require('./testSuites.js');

require('dotenv').config();

var debug = {
  origin: require('debug')('origin'),
  fts: require('debug')('fts')
};

let search = process.argv[2];

let isSerial = false;

if(process.argv[3] == "serial") {
  isSerial = true;
}


if (search) {
  
  for(let i in testSuite) {
    testSuite[i].search = search;
  }
} else {
  const searches = fs.readFileSync('search.txt').toString().split("\n");
  for(let i in testSuite) {
    testSuite[i].search = searches[i].trim();
  }
}
let performResults = {}

let testServersCount = 2;

let printTable = function(testserver){
  testServersCount--;
  if (0 == testServersCount) {
    let table = new Table({
        head: ['search', 'Test suite', 'fts', 'fts results', 'origin', 'origin results', 'Difference']
      //, colWidths: [100, 50, 50, 50]
    });
    for (let i in testSuite) {
      let row = [];
      row.push(testSuite[i].search);
      row.push(testSuite[i].title);
      let diff = [];
      let timeElapsed = [];
      let nReturned = [];
      for (let res of performResults['fts']) {
        if (res.number == i) {
          timeElapsed.push(res.timeElapsed);
          nReturned.push(res.nReturned);
          diff.push(res.timeElapsed)
        }
      }
      for (let res of performResults['origin']) {
        if (res.number == i) {
          timeElapsed.push(res.timeElapsed);
          nReturned.push(res.nReturned);
          diff.push(res.timeElapsed)
        }
      }
      if(timeElapsed[0] > timeElapsed[1]) {
        row.push(colors.red(timeElapsed[0]));
      } else {
        row.push(colors.green(timeElapsed[0]));
      }
      row.push(nReturned[0]);

      if(timeElapsed[0] < timeElapsed[1]) {
        row.push(colors.red(timeElapsed[1]));
      } else {
        row.push(colors.green(timeElapsed[1]));
      }
      row.push(nReturned[1]);
      let diffNum = (diff[0] - diff[1]);
      let diffStr = '';
      if (diffNum > 0) {
        diffStr = colors.red(diffNum) 
      } else {
        diffStr = colors.green(diffNum) 
      }

      diffStr += " ms / " + Math.round(diff[1]/ diff[0]) + " times";

      row.push(diffStr);
      table.push(row);
    }
    console.log(table.toString())
  }
}

let performTest = function(testserver, client, collectionName, testNum, testParam, next) {
  const db = client.db(process.env.DB_NAME);
  const collection = db.collection(collectionName);
  let query = {
    $text: {
      $search: testParam.search
    }}

  const cursor = collection.find(query);
  //debug[testserver]('query', query);
  if (testParam.params.score) {
    cursor.project({ score: { $meta: "textScore" } });
    //debug[testserver]('project', { score: { $meta: "textScore" } });
  }

  if (testParam.params.sort && testserver != 'fts') {
    cursor.sort(testParam.params.sort);
    //debug[testserver]('sort', testParam.params.sort);
  }

  if (testParam.params.limit) {
    cursor.limit(testParam.params.limit);
    //debug[testserver]('limit', testParam.params.limit);
  }

  //debug[testserver]('query', testParam);

  cursor.explain(function(err, answer) {
    //debug[testserver]('err', err);
    //debug[testserver]('answer', answer);

    if (!performResults[testserver]) {
      performResults[testserver] = [];
    }
    if (err) {
      debug[testserver]("Find err: %O", err);
      performResults[testserver].push({
        err: err,
      })
      return
    }
    // debug[testserver]("answer %O", answer);
    let timeElapsed = answer.executionStats.executionTimeMillis;
    let nReturned = answer.executionStats.nReturned;
    debug[testserver]('%s %s Time elapsed: %s for %s records',
    testParam.search, testParam.title, timeElapsed, nReturned);
    performResults[testserver].push({
      number: testNum,
      nReturned: nReturned,
      timeElapsed: timeElapsed,
    })
    if (performResults[testserver].length == testSuite.length) {
      client.close()
      printTable(testserver);
    }
    if(next) {
      next();
    }
  })
}

if(isSerial) {
  MongoClient.connect(process.env.FTS_MONGO, {useNewUrlParser: true }, function(err, client) {
    if (err) {
      debug.fts("Failed to connect to server %O", err);
      return
    }
    debug.fts("Connected successfully to server");

    let i = 0;
    let next = function(){
      i++;
      if(testSuite[i]) {
        performTest('fts', client, 'ol', i, testSuite[i], next);
      }
    }
    performTest('fts', client, 'ol', i, testSuite[i], next);

  });

  MongoClient.connect(process.env.ORIGIN_MONGO, {useNewUrlParser: true }, function(err, client) {
    if (err) {
      debug.origin("Failed to connect to server %O", err);
      return
    }
    debug.origin("Connected successfully to server");

    let i = 0;
    let next = function(){
      i++;
      if(testSuite[i]) {
        performTest('origin', client, 'ol', i, testSuite[i], next);
      }
    }
    performTest('origin', client, 'ol', i, testSuite[i], next);

  });
} else {

  MongoClient.connect(process.env.FTS_MONGO, {useNewUrlParser: true }, function(err, client) {
    if (err) {
      debug.fts("Failed to connect to server %O", err);
      return
    }
    debug.fts("Connected successfully to server");



    for (let i in testSuite) {
      performTest('fts', client, 'ol', i, testSuite[i]);
    }

  });

  MongoClient.connect(process.env.ORIGIN_MONGO, {useNewUrlParser: true }, function(err, client) {
    if (err) {
      debug.origin("Failed to connect to server %O", err);
      return
    }
    debug.origin("Connected successfully to server");

    for (let i in testSuite) {
      performTest('origin', client, 'ol', i, testSuite[i]);
    }

  });
}
