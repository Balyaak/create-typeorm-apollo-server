import "reflect-metadata";
import "dotenv/config";
import * as express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import * as cors from "cors";
import * as Redis from "ioredis";

const RedisStore = connectRedis(session as any);

const startServer = async () => {
  await createConnection();

  const app = express();

  const redis = new Redis();

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [__dirname + "/modules/**/resolver.*"]
    }),
    context: ({ req }: any) => ({
      req,
      session: req.session,
      redis
    })
  });

  server.applyMiddleware({ app });

  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000"
    })
  );

  app.use(
    session({
      store: new RedisStore({
        client: redis as any
      }),
      name: "msh",
      secret: process.env.SESSION_SECRET as any,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 //One week
      }
    })
  );

  app.listen({ port: 4000 }, () => {
    console.log("server online");
  });
};

startServer();
