const databases = {
  development: {
    dialect: 'sqlite',
    storage: '../databases/database.db',
    logging: (msg) => console.log(`${msg}\n`),
    define: { charset: 'utf8', timestamps: true },
  },
  test: {
    dialect: 'sqlite',
    storage: '../databases/test.db',
    host: 'localhost',
    define: { charset: 'utf8', timestamps: true },
  },
};

module.exports = databases;
