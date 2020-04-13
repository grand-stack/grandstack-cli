# GRANDstack CLI

A command line interface for working with GRANDstack (GraphQL, React, Apollo, Neo4j Database) projects.

**NOTE: This project is very experimental. Use at your own risk.**

## Install

```
npm install -g grandstack-cli
```

## Usage

**NOTE: Consider this a planning document for how commands *could* work. Many of these are not yet implemented and the API is likely to change**

### Commands

#### `graphql`

**`grandstack graphql dev`**

Start local GraphQL server.

Options (should also be taken from environment variables):
  * `--types`
  * `--types-file`
  * `--neo4j-uri`
  * `--neo4j-user`
  * `--neo4j-password`
  * `--port`
  * `--debug` - log generated Cypher queries


**`grandstack graphql inferschema`**

Inspect existing Neo4j database and generate GraphQL type definitions.

Options:
  * `--file` - the file to write the generated type definitions to, if not specified log to standard out
  * `--neo4j-uri`
  * `--neo4j-user`
  * `--neo4j-password`
  * `--start-server` - start GraphQL server using generated type definitions instead of writing to file
  * `--debug` - log generated Cypher queries

#### `neo4j`

**`grandstack neo4j constraints`**

Generate CREATE CONSTRAINT Cypher statements for a given GraphQL schema

**`grandstack neo4j migrate`**

Generate refactor Cypher statements given a GraphQL schema diff.

#### `deploy`

**`grandstack deploy [api web neo4j]`**

*Need some way to specify service (Zeit, Netlify, GCP,etc)*

*Deploy API to CodeSandbox*

```
grandstack deploy api codesandbox
```

#### `configure`

*Create profiles with Neo4j credentials, etc*
*Credentials and profiles can be stored in `~/.grandstack`*

**`grandstack configure`**

*Then prompt for Neo4j credentials, etc*

**`grandstack configure --profile newprofile`**

*The prompt for Neo4j credentials, etc, but save in named profile*


