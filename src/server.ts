require('dotenv').config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import graphqlHTTP from 'express-graphql';
import gql from 'graphql-tag';
import { buildASTSchema } from 'graphql';

const POSTS = [
  { author: 'John Doe', body: 'Hello world' },
  { author: 'Jane Doe', body: 'Hi, planet!' },
];

const schema = buildASTSchema(gql`
  type Query {
    posts: [Post]
    post(id: ID!): Post
  }

  type Post {
    id: ID
    author: String
    body: String
  }

  type Mutation {
    submitPost(input: PostInput!): Post
  }

  input PostInput {
    id: ID
    author: String!
    body: String!
  }
`);

const mapPost = (post: {}, id: number) => post && ({ id, ...post });

const root = {
  post: ({ id }: any) => mapPost(POSTS[id], id),
  posts: () => POSTS.map(mapPost),
  submitPost: ({ input: { id, author, body } }: { input: {id: number, author: string, body: string }}) => {
    const post = { author, body };
    let index = POSTS.length;

    if (id != null && id >= 0 && id < POSTS.length) {
      POSTS.splice(id, 1, post);
      index = id;
    } else {
      POSTS.push(post);
    }

    return mapPost(post, index);
  },
};

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use('/graphql', graphqlHTTP({
  graphiql: true,
  rootValue: root,
  schema,
}));

const port: string | undefined = process.env.NODE_ENV === 'development' ? process.env.DEV_PORT : process.env.PROD_PORT;

app.listen(port);

/* tslint:disable */
console.log(`Running a GraphQL API server at localhost:${port}/graphql`);