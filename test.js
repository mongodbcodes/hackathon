const MongoClient = require('mongodb').MongoClient;
const Table = require('cli-table3');

require('dotenv').config();

var debug = {
  origin: require('debug')('origin'),
  fts: require('debug')('fts')
};

let search = process.argv[2];

if (!search) {
  search = "little dog";
}

let testSuite = [
  {
    title: 'Search first 10, no score sort',
    params: {
      limit: 10,
    }
  },
  {
    title: 'Search first 10, score sort',
    params: {
      limit: 10,
      score: true,
      sort: {score: { $meta: "textScore" }}
    }
  },
]
let performResults = {}

let testServersCount = 2;

let printTable = function(testserver){
  testServersCount--;
  if (0 == testServersCount) {
    console.log('PrintTime');
    let table = new Table({
        head: ['Test suite', 'fts', 'origin', 'Difference']
      //, colWidths: [100, 50, 50, 50]
    });
    for (let i in testSuite) {
      let row = [];
      row.push(testSuite[i].title);
      let diff = 0;
      for (let res of performResults['fts']) {
        if (res.number == i) {
          row.push(res.timeElapsed);
          diff = diff - res.timeElapsed
        }
      }
      for (let res of performResults['origin']) {
        if (res.number == i) {
          row.push(res.timeElapsed);
          diff = diff + res.timeElapsed
        }
      }
      row.push(diff);
      table.push(row);
    }
    console.log(table.toString())
  }
}

let performTest = function(testserver, client, collectionName, testNum, testParam) {
  const db = client.db(process.env.DB_NAME);
  const collection = db.collection(collectionName);
  let query = {
    $text: {
      $search: search
    }}

  const cursor = collection.find(query);
  if (testParam.params.score) {
    cursor.project({ score: { $meta: "textScore" } });
  }

  if (testParam.params.sort && testserver !== 'fts') {
    cursor.sort(testParam.params.sort);
  }

  if (testParam.params.limit) {
    cursor.limit(testParam.params.limit);
  }

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
    let timeElapsed = answer.executionStats.executionTimeMillis;
    let nReturned = answer.executionStats.nReturned;
    debug[testserver]('%s Time elapsed: %s for %s records',
      testParam.title, timeElapsed, nReturned);
    performResults[testserver].push({
      number: testNum,
      nReturned: nReturned,
      timeElapsed: timeElapsed,
    })
    if (performResults[testserver].length == testSuite.length) {
      client.close()
      printTable(testserver);
    }
  })
}
MongoClient.connect(process.env.FTS_MONGO, function(err, client) {
  if (err) {
    debug.fts("Failed to connect to server %O", err);
    return
  }
  debug.fts("Connected successfully to server");



  for (let i in testSuite) {
    performTest('fts', client, 'ol', i, testSuite[i]);
  }

});

MongoClient.connect(process.env.ORIGIN_MONGO, function(err, client) {
  if (err) {
    debug.origin("Failed to connect to server %O", err);
    return
  }
  debug.origin("Connected successfully to server");

  const db = client.db(process.env.DB_NAME);
  const collection = db.collection('ol');

  for (let i in testSuite) {
    performTest('origin', client, 'ol', i, testSuite[i]);
  }

});

