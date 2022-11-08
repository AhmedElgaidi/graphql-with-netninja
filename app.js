const express = require("express");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql"); // it allows express understands graphql
const schema = require("./schema/schema");
const cors = require("cors");

const app = express();

// Allow from cross-origin-requests
app.use(cors());

// DB connection
mongoose
  .connect(
    "mongodb+srv://elbotanist:elbotanist@cluster0.tzqmhjn.mongodb.net/GraphQL_DB?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to DB successfully");
    app.listen(9000, () => {
      console.log(
        "our graphql-node server is listening on https://localhost:9000/graphql"
      );
    });
  })
  .catch((error) => {
    console.log(error.mesage);
  });

// Our middlewares

// This is our endpoint, where others can hit to git the data (frontend get those data and put them in a webpage.)
app.use("/graphql", graphqlHTTP({ schema, graphiql: true }));
