import { Octokit } from "@octokit/rest";
import { arrayOfFiles } from "../../../utils";

export const command = "github";
export const desc = "Export project to github";

// Going to leave this in here as it was invaluable in putting together
// The final pieces
// http://www.levibotelho.com/development/commit-a-file-with-the-github-api/

export const builder = (yargs) => {
  yargs
    .option("types", {
      description: "The GraphQL type definitions",
      required: true,
    })
    .option("new-repo", {
      description: "Whether or not to write a new project",
      type: "boolean",
      default: true,
    })
    .option("repo-name", {
      description: "Name for the new repo",
      type: "string",
      default: "architect-graph-project",
    })
    .option("oauth-token", {
      description: "Oauth access token from client or manaully created",
      required: true,
      type: "string",
    })
    .option("database", {
      description: "The Neo4j database to use",
      type: "string",
    })
    .option("encrypted", {
      description: "Whether or not to encrypt the database",
      type: "boolean",
      default: false,
    })
    .option("log-level", {
      description: "What level to log out",
      type: "string",
    }).example(`$0 deploy github \\
    --types "type Person {name: string}"
    --oauth-token 213r56ert57yertu \\
    --repo-name new-graph-repo \\
    --database neo4j \\
    --log-level info \\
    --encrypted \\
    --new-repo`);
};

const newRepoTag = "newRepoAction";

export const handler = async ({
  types,
  logLevel,
  newRepo,
  repoName,
  oauthToken,
  database,
  encrypted,
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
  const { getRef, createBlob, createTree, createCommit, updateRef } = git;

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
        ref: "heads/master",
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
        ref: "heads/master",
        sha: commitSHA,
      });

      console.log(`Commit completed to master branch @: ${finalRef.url}`);
      console.timeEnd(newRepoTag);
    } catch (error) {
      console.log(error);
    }
  }
};

// const qBody =  {
//   query:   `query FindIssueID {
//     repository(owner:"octocat", name:"Hello-World") {
//       issue(number:349) {
//         id
//       }
//     }
//   }`,
//   variables: {}
// }

// const mBody = {
//   query: `mutation CreateNewRepo {
//     createRepository(input: { name: "obvs-a-test", visibility: PUBLIC } ) {
//       repository {
//         createdAt
//         name
//         nameWithOwner
//       }
//     }
//   }`
// }

// const _opts = { headers: { Authorization: `Bearer ${tokenUser}`, Accept: "application/vnd.github.v3+json", 'User-Agent': 'axios/0.19.2' } };

// try {
// const _res = await axios.post('https://api.github.com/graphql', qBody, _opts)
// console.log(_res.data.data)
// console.log("#################\n")
// const issueID =  _res.data.data.repository.issue.id
// const _mres = await axios.post('https://api.github.com/graphql', mBody , _opts)
// if(_mres.data.errors) {
//   console.log(_mres.data.errors)
// } else {
//   console.log(_mres.data.data)
// }
// } catch (error) {
//   console.log(error)
// }

// const _url = `https://api.github.com/users/octocat/orgs`;
// const _opts = { headers: { Authorization: `token ${data.token}`, "User-Agent": "App-Name" } };
// Accept: application/vnd.github.v3+json
// const _opts = { headers: { Authorization: `token ${data.token}` } };
// const _res = await axios.get(_url, _opts);

// curl \
//   -X POST \
//   -H "Accept: " \
//   -H "Authorization: token 7cb5a450d2eb378e61236f5b07655db62a60e0ea" \
//   https://api.github.com/user/repos \
//   -d '{"name":"obviously-a-test"}'
