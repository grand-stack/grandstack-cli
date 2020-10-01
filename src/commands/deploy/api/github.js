import { Octokit } from "@octokit/rest";

import { arrayOfFiles, checkGHRef } from "../../../utils";

export const command = "github";
export const desc = "Export project to github";

// Going to leave this in here as it was invaluable in putting together
// The final pieces
// http://www.levibotelho.com/development/commit-a-file-with-the-github-api/

export const builder = (yargs) => {
  yargs
    .option("types", {
      alias: "t",
      description: "The GraphQL type definitions",
      required: true,
    })
    .option("new-repo", {
      alias: "n",
      description: "Whether or not to create a new repo",
      type: "boolean",
      default: false,
    })
    .option("repo-name", {
      description: "Name for the new repo",
      type: "string",
      default: "architect-graph-project",
    })
    .option("repo-owner", {
      description: "Github handle for the repo owner",
      type: "string",
    })
    .option("oauth-token", {
      description: "Oauth access token from client or manaully created",
      required: true,
      type: "string",
    })
    .option("database", {
      alias: "d",
      description: "The Neo4j database to use",
      type: "string",
    })
    .option("log-level", {
      description: "What log level to use",
      type: "string",
    })
    .option("encrypted", {
      alias: "e",
      description: "Whether or not to encrypt the database",
      type: "boolean",
      default: false,
    }).example(`$0 deploy github \\
    --types "type Person {name: string}"
    --oauth-token 213r56ert57yertu \\
    --repo-name new-graph-repo \\
    --repo-owner joeSmith123 \\
    --database neo4j \\
    --encrypted \\
    --new-repo \\
`);
};

const newRepoTag = "newRepoAction";
const updateRepoTag = "updateRepoAction";

// deploy github --types "type Person {name: string}" --oauth-token ffqsdgfg312gsg --new-repo --repo-name architect-graph-project --database neo4j --encrypted
// deploy github --types "type Person {name: string}" --oauth-token ffqsdgfg312gsg --repo-name architect-graph-project --repo-owner ed42311

export const handler = async ({
  types,
  newRepo,
  repoOwner,
  repoName,
  oauthToken,
  database,
  encrypted,
  logLevel,
}) => {
  const octoOpts = {
    auth: oauthToken,
  };
  if (logLevel === "info") {
    octoOpts.log = console;
  }
  const octokit = new Octokit(octoOpts);
  const { repos, git } = octokit;
  const { createForAuthenticatedUser } = repos;
  const {
    getRef,
    createBlob,
    createTree,
    createCommit,
    updateRef,
    getTree,
  } = git;
  const masterRef = "heads/master";

  if (newRepo) {
    console.time(newRepoTag);
    console.log(`Creating New Repository and Pushing Commit...`);

    try {
      // Creating new repo
      // Returned data is used for commit action
      const { data: createdRepo } = await createForAuthenticatedUser({
        name: repoName,
        auto_init: true,
      });
      const { name: repo, owner: createdRepoOwner } = createdRepo;
      const { login: owner } = createdRepoOwner;
      console.log(`New Repository Created: ${repoName}`);

      // Get reference SHA to master branch for new commit tree
      const { data: createdRepoReference } = await getRef({
        owner,
        repo,
        ref: masterRef,
      });
      const { object: referenceObject } = createdRepoReference;
      const baseTreeSHA = referenceObject.sha;

      // Build array of files to convert to blobs for the tree
      const blobFileArray = arrayOfFiles({
        owner,
        repo,
        types,
        database,
        encrypted,
      });
      const blobs = await Promise.all(
        blobFileArray.map(async ({ owner, repo, content, filename }) => {
          const _res = await createBlob({ owner, repo, content });
          const { data: blob } = _res;
          const { sha } = blob;

          return {
            path: filename,
            mode: "100644",
            type: "blob",
            sha,
          };
        })
      );
      console.log(`Blobs built with new types...`);

      // Setup new tree with the blobs and grab the SHA
      const { data: tree } = await createTree({
        owner,
        repo,
        base_tree: baseTreeSHA,
        tree: blobs,
      });
      const { sha: newTreeSHA } = tree;

      // Create a commit with the new tree
      const { data: commit } = await createCommit({
        owner,
        repo,
        message: "First commit from grandstack CLI",
        tree: newTreeSHA,
        parents: [baseTreeSHA],
      });
      const { sha: commitSHA } = commit;
      console.log(`Tree built and attached to commit...`);

      // Set the reference to the head of the master branch
      const { data: finalRef } = await updateRef({
        owner,
        repo,
        ref: masterRef,
        sha: commitSHA,
      });
      const refData = {
        repoOwner: owner,
        repoName: repo,
        repoUrl: finalRef.url,
      };
      console.log(`Commit completed to master branch @: ${finalRef.url}`);
      console.log(`<refData>${JSON.stringify(refData)}</refData>`);
      console.timeEnd(newRepoTag);
    } catch (error) {
      console.error(`GITHUBERR :: ${error}`);
      process.exit(1);
    }
  } else {
    checkGHRef(repoName, repoOwner);
    console.time(updateRepoTag);
    console.log(`Getting Repository reference...`);

    try {
      const { data: foundationRepo } = await getRef({
        owner: repoOwner,
        repo: repoName,
        ref: masterRef,
      });
      const { object } = foundationRepo;
      const { sha: foundationRepoSha } = object;

      console.log(`Getting Full Repository tree and filtering...`);
      const treeRes = await getTree({
        owner: repoOwner,
        repo: repoName,
        tree_sha: foundationRepoSha,
        recursive: true,
      });
      const { data: treeData } = treeRes;
      const { tree: recursiveTree } = treeData;
      // ts path is string
      const treeAllButSchema = recursiveTree.filter(
        ({ path }) => !path.includes(".graphql")
      );

      const blobRes = await createBlob({
        owner: repoOwner,
        repo: repoName,
        content: types,
      });

      const { data: blob } = blobRes;
      const { sha: newSchemaSha } = blob;

      const schemaFile = {
        path: "schema.graphql",
        mode: "100644",
        type: "blob",
        sha: newSchemaSha,
      };

      // Setup new tree with the blobs and grab the SHA
      const { data: tree } = await createTree({
        owner: repoOwner,
        repo: repoName,
        tree: [...treeAllButSchema, schemaFile],
      });
      const { sha: newTreeSHA } = tree;

      // Create a commit with the new tree
      console.log(`Creating commit with updated tree...`);
      const { data: commit } = await createCommit({
        owner: repoOwner,
        repo: repoName,
        message: "Updated schema file from CLI",
        tree: newTreeSHA,
        parents: [foundationRepoSha],
      });
      const { sha: commitSHA } = commit;

      // Set the reference to the head of the master branch
      const { data: finalRef } = await updateRef({
        owner: repoOwner,
        repo: repoName,
        ref: masterRef,
        sha: commitSHA,
      });

      console.log(`Reference updated: ${finalRef.object.url}`);
      console.timeEnd(updateRepoTag);
    } catch (error) {
      console.error(`GITHUBERR :: ${error}`);
      process.exit(1);
    }
  }
};
