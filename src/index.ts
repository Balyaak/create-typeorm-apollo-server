import "reflect-metadata";
// import { createConnection } from "typeorm";
// import { User } from "./entity/User";
import * as express from "express";
import { ApolloServer, gql } from "apollo-server-express";

const app = express();
const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello(name: String): String!
  }
`;

const resolvers = {
  Query: {
    hello: (_, { name }) => `${name || "world"}`
  }
};

// createConnection()
//   .then(async connection => {
//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log("Here you can setup and run express/koa/any other framework.");
//   })
//   .catch(error => console.log(error));

const server = new ApolloServer({
  typeDefs,
  resolvers
});
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () => {
  console.log("server online");
});
