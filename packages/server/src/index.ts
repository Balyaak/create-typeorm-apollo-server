import "reflect-metadata";
import "dotenv/config";
import * as express from "express";
import { ApolloServer } from "apollo-server-express";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import * as cors from "cors";
import * as Redis from "ioredis";

import { Container } from "typedi";
import * as TypeORM from "typeorm";
import * as TypeGraphQL from "type-graphql";

import chalk from "chalk";
import * as Listr from "listr";

import { Observable } from "rxjs";

const RedisStore = connectRedis(session as any);

// register 3rd party IOC container
TypeGraphQL.useContainer(Container);
TypeORM.useContainer(Container);

const bootstrap = new Listr(
  [
    {
      title: "Database",
      task: () => {
        return new Observable(observer => {
          observer.next("Connecting ...");

          setTimeout(() => {
            TypeORM.createConnection();
            observer.next("Connected");
          }, 500);

          setTimeout(() => {
            observer.complete();
          }, 1000);
        });
      }
    },
    {
      title: "Creating express app instance",
      task: (ctx: any) => {
        return new Observable(observer => {
          observer.next("Creating ...");
          ctx.app = express();
          setTimeout(() => {
            observer.complete();
          }, 1300);
        });
      }
    },
    {
      title: "Creating redis client instance",
      task: (ctx: any) => {
        ctx.redis = new Redis();
      }
    },
    {
      title: "Creating apollo server instance",
      task: async (ctx: any) =>
        Promise.resolve(
          (ctx.server = new ApolloServer({
            schema: await TypeGraphQL.buildSchema({
              resolvers: [__dirname + "/modules/**/resolver.*"]
            }),
            context: ({ req }: any) => ({
              req,
              session: req.session,
              redis: ctx.redis
            })
          }))
        )
    },
    {
      title: "Using cors",
      task: (ctx: any) => {
        ctx.app.use(
          cors({
            credentials: true,
            origin: "http://localhost:4000"
          })
        );
        setTimeout(() => {}, 100);
      }
    },
    {
      title: "Using session",
      task: async (ctx: any) => {
        ctx.app.use(
          session({
            store: new RedisStore({
              client: ctx.redis as any
            }),
            name: "msh",
            secret: process.env.SESSION_SECRET as any,
            resave: false,
            saveUninitialized: false,
            cookie: {
              httpOnly: true,
              secure: process.env.NODE_ENV == "production",
              maxAge: 1000 * 60 * 60 * 24 * 7 //One week
            }
          })
        );
        await setTimeout(() => {}, 200);
      }
    },
    {
      title: "Applying middleware tp ApolloServer",
      task: async (ctx: any) => {
        ctx.server.applyMiddleware({ app: ctx.app });
        await setTimeout(() => {}, 50);
      }
    },
    {
      title: "Finishing Server",
      task: (ctx: any) => {
        return new Observable(observer => {
          observer.next("Starting ...");

          setTimeout(() => {
            ctx.app.listen({ port: process.env.PORT || 4000 }, () => {
              observer.complete();
            });
          }, 3000);
        });
      }
    }
  ],
  {
    concurrent: false,
    exitOnError: false
  }
);

console.log(chalk.yellow("[*] Starting up server ..."));
bootstrap
  .run()
  .catch((err: Error) => {
    console.log(
      chalk.yellow(
        `[${chalk.red.bold("!")}] ${chalk.red.bold("ERROR : ")} ${err}`
      )
    );
  })
  .then(() => {
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