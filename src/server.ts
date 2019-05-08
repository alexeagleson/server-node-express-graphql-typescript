import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import graphqlHTTP from 'express-graphql';
import gql from 'graphql-tag';
import path from 'path';
import { buildASTSchema } from 'graphql';

const POSTS = [
  { car: 'Echo', manufacturer: 'Toyota' },
  { car: 'Optra', manufacturer: 'Chevrolet' },
  { car: 'Rio', manufacturer: 'Kia' },
];

const schema = buildASTSchema(gql`
  type Query {
    posts: [Post]
    post(id: ID!): Post
  }

  type Post {
    id: ID
    car: String
    manufacturer: String
  }

  type Mutation {
    submitPost(input: PostInput!): Post
  }

  input PostInput {
    id: ID
    car: String!
    manufacturer: String!
  }
`);

const mapPost = (post: {}, id: number) => post && ({ id, ...post });

const root = {
  post: ({ id }: any) => mapPost(POSTS[id], id),
  posts: () => POSTS.map(mapPost),
  submitPost: ({ input: { id, car, manufacturer } }: { input: {id: number, car: string, manufacturer: string }}) => {
    const post = { car, manufacturer };
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

// Serve the front end automotive application
const distPath: string = path.join(__dirname, '../../client-automotive', 'build');
app.use(express.static(distPath));

const port: number = 4000;
app.listen(port);

/* tslint:disable */
console.log(`Running a GraphQL API server at localhost:${port}/graphql`);
