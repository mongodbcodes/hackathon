module.exports = [
  {
    title: 'limit 10',
    params: {
      limit: 10,
    }
  },
  {
    title: 'limit 10, score sort',
    params: {
      limit: 10,
      score: true,
      sort: {score: { $meta: "textScore" }}
    }
  },
  {
    title: 'limit 100',
    params: {
      limit: 100,
    }
  },
  {
    title: 'limit 100, score sort',
    params: {
      limit: 100,
      score: true,
      sort: {score: { $meta: "textScore" }}
    }
  }
  ,
  {
    title: 'limit 100',
    params: {
      limit: 100,
    }
  },
  {
    title: 'limit 100, score sort',
    params: {
      limit: 100,
      score: true,
      sort: {score: { $meta: "textScore" }}
    }
  },
  {
    title: 'limit 1000',
    params: {
      limit: 1000,
    }
  },
  {
    title: 'limit 1000, score sort',
    params: {
      limit: 1000,
      score: true,
      sort: {score: { $meta: "textScore" }}
    }
  }
  ,
  {
    title: 'all',
    params: {
    }
  },
  {
    title: 'all, score sort',
    params: {
      score: true,
      sort: {score: { $meta: "textScore" }}
    }
  },
  {
    title: 'all',
    params: {
    }
  },
  {
    title: 'all, score sort',
    params: {
      score: true,
      sort: {score: { $meta: "textScore" }}
    }
  },
]