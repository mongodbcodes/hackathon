# hackaton
This test code written to simplify the way how "Full Text Search" changes can be tested.
I put server online with 32GB Ram 3.2Ghz CPU (4C/8T) SSD drives (no raid)

Each mongo instance (origin and fts) working with it's own SSD to minimize side effects on tests.
Identical configs and database. mongod code diferences only.
Access to mongo is public by user `test` pass `test` for readonly.
So you can do tests right on the server with explain if you wish.
Check .env file in this repo direct server connection.
Othervise use this repo code to perform tests.


# How to run tests

```
git clone https://github.com/mongodbcodes/hackaton.git
cd hackaton
npm install
npm run test
```

# Example output

![test perform](https://raw.githubusercontent.com/mongodbcodes/hackaton/master/example.png)


# Advanced tests

`node test.js "\"red car\" -truck" serial`
- first argument - search string
- second argument is optional "serial" - it means that tests are runing serial not in parallel (default mode) 

![test perform](https://raw.githubusercontent.com/mongodbcodes/hackaton/master/example-advanced.png)


# Tests results details
- fts column - are results from FTS optimized instance
- origin column - are results from original mongodb - 3.6.11 
- Test suite - details about request. 
  - Score sort - data requested in score high->low order. FTS provide data in high->low by default when score requested to display.
  - limit - self exmplainable. 
- fts, origin resuls - how many documents match request. 
- difference - simple calculation to make difference visible.

**you can notice that sometimes fts return less records**
The difference here in a way how phrase get matched. In original version `"red car"` request will match `"red cartoon"` as well. FTS version will match only for `"red car"`
