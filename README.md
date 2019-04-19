# hackaton
Wrapper shell nodejs client to test queries on sandboxes

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