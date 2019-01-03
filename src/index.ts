import "reflect-metadata";
import * as express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";

const startServer = async () => {
  await createConnection();
  const app = express();

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [__dirname + "/modules/**/resolver.*"]
    })
  });
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () => {
    console.log("server online");
  });
};

startServer();
