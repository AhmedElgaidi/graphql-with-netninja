// Let's define our schema
// This schema should describes our object types, the relation between them and how to ineract with them

const graphql = require("graphql");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull, // this is for making a certain field required (as mongoose required, but even before validation from mongoose)
} = graphql;
const Book = require("./../models/Book.model");
const Author = require("./../models/Author.model");
//--------------------------------------------------

// Let's define our object types
const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    name: {
      type: GraphQLString,
    },
    genre: {
      type: GraphQLString,
    },
    description: {
      type: GraphQLString,
    },
    author: {
      type: AuthorType,
      resolve(parent, args) {
        const { authorId } = parent;

        return Author.findById(authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    name: {
      type: GraphQLString,
    },
    age: {
      type: GraphQLInt,
    },
    // array of books
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        // Get author ID
        const { id } = parent;

        return Book.find({ authorId: id });
      },
    },
  }),
});

// [Note] when you see "resolve" function, it actually means => go and get some data from the data source!!!
// "resolve" function needs to return the value, the response contain the object created!

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    book: {
      type: BookType,
      // the args that the client to pass along when making the query
      args: {
        id: {
          type: GraphQLID,
        },
      },
      resolve(parent, args) {
        // Code to get data from our DB (Data source)
        const { id } = args;

        return Book.findById(id);
      },
    },
    books: {
      type: new GraphQLList(BookType),
      //   args: { limit: { type: GraphQLInt } },
      resolve(parent, args) {
        // const { limit = Infinity } = args;
        return Book.find({});
      },
    },
    // Author get queries
    author: {
      type: AuthorType,
      args: {
        id: {
          type: GraphQLID,
        },
      },
      resolve(parent, args) {
        const { id } = args;
        return Author.findById(id);
      },
    },
    authors: {
      type: new GraphQLList(AuthorType),
      args: { limit: { type: GraphQLInt } },
      resolve(parent, args) {
        const { limit = Infinity } = args;
        return Author.find({}).limit(limit);
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // Author methods
    addAuthor: {
      type: AuthorType,
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
        age: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve(parent, args) {
        const { name, age } = args;

        const author = new Author({
          name,
          age,
        });
        return author.save();
      },
    },

    // Book other queries
    addBook: {
      type: BookType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        const { name, genre, authorId } = args;
        const book = new Book({
          name,
          genre,
          authorId,
        });
        return book.save();
      },
    },
    updateBook: {
      type: BookType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        const { id, name, genre, authorId } = args;

        return Book.findByIdAndUpdate(id, {
          name,
          genre,
          authorId,
        });
      },
    },
    deleteBook: {
      type: BookType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve(parent, args) {
        return Book.findOneAndDelete(args.id);
      },
    },
  },
});

// Let's export our GraphQLSchema
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
