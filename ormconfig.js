
const baseOptions = {
    cli: {
      migrationsDir: `src/modules/db/migrations`,
    },
    entities: ['build/models/*.js'],
   //  migrations: ['src/modules/db/migrations/*.ts'],
    host: process.env.DB_HOST || "localhost",
    password: process.env.DB_PASSWORD || "password",
    port: process.env.DB_PORT || 5432,
    type: "postgres",
    username: process.env.DB_USER || "postgres",
    autoLoadEntities: true,
    logging:true,
    //"synchronize": true,
  };

  module.exports = [
    Object.assign({}, baseOptions, { name: "default", database: process.env.DB_NAME }),
  ];
  