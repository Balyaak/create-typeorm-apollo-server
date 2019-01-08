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
import { customAuthChecker } from "./utils/authChecker";

const RedisStore = connectRedis(session as any);

// register 3rd party IOC container
TypeGraphQL.useContainer(Container);
TypeORM.useContainer(Container);

const bootstrap = new Listr(
  [
    {
      title: "Database",
      task: () =>
        TypeORM.createConnection()
          .catch(e => {
            return Promise.reject(e);
          })
          .then(() => Promise.resolve())
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
              resolvers: [__dirname + "/modules/**/resolver.*"],
              authChecker: customAuthChecker,
              authMode: "null",
            }),
            context: ({ req }: any) => ({
              req,
              session: req.session,
              redis: ctx.redis
            }),
            playground: {
              settings: {
                // put in entire setting object because of bug with Typscript and apollo-server (issue #1713)
                "general.betaUpdates": false,
                "editor.cursorShape": "line",
                "editor.fontSize": 14,
                "editor.fontFamily":
                  "'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace",
                "editor.theme": "dark",
                "editor.reuseHeaders": true,
                "prettier.printWidth": 80,
                "request.credentials": "same-origin",
                "tracing.hideTracingResponse": true
              }
            }
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
      }
    },
    {
      title: "Using session",
      task: async (ctx: any) => {
        ctx.app.use(
          session({
            store: new RedisStore({
              client: ctx.redis as any,
            }),
            name: "msh",
            secret: process.env.SECRET || 'Standart Secret Password',
            resave: false,
            saveUninitialized: false,
            cookie: {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              maxAge: 1000 * 60 * 60 * 24 * 7, // One week
              path: "/graphql" // Done for testing resolvers in playground
            }
          })
        );
      }
    },
    {
      title: "Applying middleware tp ApolloServer",
      task: (ctx: any) => {
        ctx.server.applyMiddleware({ app: ctx.app });
      }
    },
    {
      title: "Finishing Server",
      task: (ctx: any) => {
        return new Observable(observer => {
          observer.next("Starting ...");
          ctx.app_server = ctx.app
            .listen({ port: process.env.PORT || 4000 })
            .setTimeout(5000, () => {
              observer.error("Server timed out");
            });
            observer.complete();
        });
      }
    }
  ],
  {
    concurrent: false,
    exitOnError: true
  }
);

console.log(chalk.yellow("[*] Starting up server ..."));
bootstrap
  .run()
  .catch(err => {
    console.log(
      chalk.yellow(
        `[${chalk.red.bold("!")}] ${chalk.red.bold("ERROR : ")} ${err}`
      )
    );
    process.exit(1);
  })
  .then(ctx => {
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

    process.on("SIGINT", function() {
      console.log(chalk.yellow("\n[*] Caught Interruption signal"));
      ctx.app_server.close(()=>{
        console.log(chalk.yellow("[*] Stopped Server..."));
        process.exit(0);
      });
    });
  });
