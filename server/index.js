import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { useServer } from "graphql-ws/lib/use/ws";
import { WebSocketServer } from "ws";
import express from "express";
import http from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import { PubSub } from "graphql-subscriptions";
import { messageMethods, userMethods } from "./db.js";

const pubsub = new PubSub();
const MESSAGE_CREATED = "MESSAGE_CREATED";

const typeDefs = `#graphql
  type Query {
    messages: [Message]
    protectedDataMessages: [Message]
  }

  type Message {
    message: String,
    senderID: ID,
    senderEmail: String,
    recieverID: ID,
    recieverEmail: String,
  }

  type User {
    userID: ID,
    email: String,
    password: String,
    token: String,
  }

  type Mutation {
    login(email: String, password: String): User
    sendMessage(message: String, recieverID: ID, recieverEmail: String): Message
  }

  type Subscription {
    msgs: Message
  }
`;

const resolvers = {
  Query: {
    messages: () => messageMethods.getAllMessages(),
    protectedDataMessages: (_, __, context) => {
      if (!context.user) {
        throw new Error("Access denied: Unauthorized");
      }
      return messageMethods.getAllMessages();
    },
  },

  Mutation: {
    login: (_, { email, password }) => {
      const result = userMethods.login(email, password);
      if (!result) {
        throw new Error("Invalid email or password");
      }

      const token = jwt.sign(
        { userID: result.userID, email: result.email },
        "MY_SECRET_KEY",
        { expiresIn: "1h" }
      );

      return { ...result, token };
    },

    sendMessage: (_, { message, recieverID, recieverEmail }, context) => {
      if (!context.user) {
        throw new Error("Access denied: Unauthorized");
      }

      if (!recieverID && !recieverEmail) {
        throw new Error("You must provide either recieverID or recieverEmail.");
      }

      const newMessage = {
        message,
        senderID: context.user.userID,
        senderEmail: context.user.email,
        recieverID: recieverID || null,
        recieverEmail: recieverEmail || null,
      };

      messageMethods.saveMessage(newMessage);
      pubsub.publish(MESSAGE_CREATED, { msgs: newMessage });

      return newMessage;
    },
  },

  Subscription: {
    msgs: {
      subscribe: () => pubsub.asyncIterator(MESSAGE_CREATED),
    },
  },
};

// Create the schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create an Express app
const app = express();
const httpServer = http.createServer(app);

// Create a WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

// Use the WebSocket server for subscriptions
const serverCleanup = useServer({ schema }, wsServer);

// Create the Apollo Server
const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    const token = req.headers.authorization?.split(" ")[1] || "";
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

await server.start();
app.use("/graphql", cors(), express.json(), expressMiddleware(server));

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is now running on http://localhost:${PORT}/graphql`);
});
