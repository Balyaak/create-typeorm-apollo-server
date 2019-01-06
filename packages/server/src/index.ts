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
import chalk from "chalk";

const RedisStore = connectRedis(session as any);

const startServer = async () => {
  console.log(chalk.yellow("[*] Starting up server ..."));

  process.stdout.write(
    chalk.yellow(`\t+ ${chalk.white("Creating database connection ...")}`)
  );
  await createConnection();
  console.log(chalk.green.bold("DONE"));

  process.stdout.write(
    chalk.yellow(`\t+ ${chalk.white("Creating express app ...")}`)
  );
  const app = express();
  console.log(chalk.green.bold("DONE"));

  process.stdout.write(
    chalk.yellow(`\t+ ${chalk.white("Creating redis client instance ...")}`)
  );
  const redis = new Redis();
  console.log(chalk.green.bold("DONE"));

  process.stdout.write(
    chalk.yellow(`\t+ ${chalk.white("Creating apollo server instance ...")}`)
  );
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
  console.log(chalk.green.bold("DONE"));

  process.stdout.write(chalk.yellow(`\t+ ${chalk.white("Using cors ...")}`));
  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:4000"
    })
  );
  console.log(chalk.green.bold("DONE"));

  process.stdout.write(chalk.yellow(`\t+ ${chalk.white("Using session ...")}`));
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
  console.log(chalk.green.bold("DONE"));

  process.stdout.write(
    chalk.yellow(
      `\t+ ${chalk.white("Applying middleware to ApolloServer ...")}`
    )
  );
  server.applyMiddleware({ app });
  console.log(chalk.green.bold("DONE"));

  process.stdout.write(chalk.yellow(`\t+ ${chalk.white("Finishing ...")}`));
  app.listen({ port: process.env.PORT || 4000 }, () => {
    console.log(chalk.green.bold("DONE"));
    console.log(
      chalk.yellow(
        `[${chalk.green.bold("!")}] ${chalk.green.bold(
          `Server started    \t[http://localhost:${process.env.PORT || 4000}]`
        )}`
      )
    );
    console.log(
      chalk.yellow(
        `[${chalk.magenta.bold("+")}] ${chalk.magenta.bold(
          `GraphQL Playground \t[http://localhost:${process.env.PORT ||
            4000}/graphql]`
        )}`
      )
    );
  });
};

startServer();
