[![npm version](https://badge.fury.io/js/grandstack.svg)](https://badge.fury.io/js/grandstack)

> ⚠️ NOTE: This project is currently a work-in-progress. APIs are still changing and some things are not yet implemented. If you have any feedback please open an issue.

# GRANDstack CLI

A command line interface for working with GRANDstack (GraphQL, React, Apollo, Neo4j Database) projects.


## Install

```
npm install -g grandstack
```

## Usage

> ⚠️ NOTE: Consider this a planning document for how commands *could* work. Many of these are not yet implemented and the API is likely to change. See the table below for current status of commands.

|Command |Emoji | Subcommand |Status |
|--------|------|------------|-------|
| `graphql`  |      |             |       |
|            | 🚧 | `dev`         | WIP - initial functionality  |
|            | 🚧 | `inferschema` | WIP - initial functionality  |
| `neo4j`    |     |              |                              |
|            | ☠️ | `constraints` | Not yet implemented          |
|            | ☠️ | `migrate`     | Not yet implemented          |
| `deploy`   |     |              |                              |
|            | 🚧 | `codesandbox` | WIP - initial functionality  |
|            | 🚧 | `file`        | WIP - initial functionality
| `configure`| ☠️ |               | Not yet implemented          |



### Commands

#### `graphql`

**`grandstack graphql dev`**

Start local GraphQL server.

Options (should also be taken from environment variables):
  * `--types`
  * `--types-file` *Not yet implemented*
  * `--neo4j-uri`
  * `--neo4j-user`
  * `--neo4j-password`
  * `--graphql-port`
  * `--encrypted` (boolean)
  * `--database`
  * `--debug` - log generated Cypher queries *Not yet implemented*


**`grandstack graphql inferschema`**

Inspect existing Neo4j database and generate GraphQL type definitions.

Options:
  * `--schema-file` - the file to write the generated type definitions to, if not specified log to standard out
  * `--neo4j-uri`
  * `--neo4j-user`
  * `--neo4j-password`
  * `--start-server` - start GraphQL server using generated type definitions instead of writing to file
  * `--debug` - log generated Cypher queries when using `--run-server` *Not yet implemented*
  * `--run-server` (boolean)
  * `--encrypted` (boolean)
  * `--database`
  * `--graphql-port`

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

**`grandstack deploy file --types "type Person {name: String}" --path ./foobar`**

Write projects to filesystem, passing type definitions as an argument

#### `configure`

*Create profiles with Neo4j credentials, etc*
*Credentials and profiles can be stored in `~/.grandstack`*

**`grandstack configure`**

*Then prompt for Neo4j credentials, etc*

**`grandstack configure --profile newprofile`**

*The prompt for Neo4j credentials, etc, but save in named profile*


