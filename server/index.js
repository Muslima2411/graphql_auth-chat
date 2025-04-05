import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { messageMethods, userMethods } from "./db.js";
import jwt from "jsonwebtoken";

const typeDefs = `#graphql
  type Query {
    messages: [Message]
    protectedData: [Message]
  }

  type Message {
    message: String,
    senderID: ID,
    recieverID: ID,
  }

  type User {
    userID: ID,
    email: String,
    password: String,
  }

  type Mutation {
    login(email: String, password: String): User
  }
`;

const resolvers = {
  Query: {
    messages: () => messageMethods.getAllMessages(), // Fixed name from 'books' to 'messages'
    protectedData: (_, __, context) => {
      if (!context.user) {
        throw new Error("Access denied: Unauthorized");
      }
      return messageMethods.getAllMessages();
    },
  },

  Mutation: {
    login: (_, { email, password }) => { // Changed 'username' to 'email'
      const result = userMethods.login(email, password);
      if (!result) {
        throw new Error("Invalid email or password");
      }
      return result;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: ({ req, res }) => {
    const token = req.headers.authorization || "";

    let user = null;
    if (token) {
      try {
        user = jwt.verify(token, "MY_SECRET_KEY"); 
      } catch (err) {
        console.error("Invalid token:", err.message);
      }
    }

    return { user };
  },
});

console.log(`🚀  Server ready at: ${url}`);