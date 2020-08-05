import { Octokit } from "@octokit/rest";

export const command = "github";
export const desc = "Export project to github";

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
    .example(`$0 deploy github \\
    --types "type Person {name: string}"`);
};



export const handler = async ({
  types,
  newRepo,
}) => {
  if (newRepo) {

    // https://api.github.com/graphql
    // Accept: application/vnd.github.v3+json
    // http://www.levibotelho.com/development/commit-a-file-with-the-github-api/

    const octokit = new Octokit({
      // log: console,
      auth: tokenUser,
    });
    

    try {
      const { data: createData } = await octokit.repos.createForAuthenticatedUser({ name : "obvs-a-test", auto_init: true })
      const { name: repo, owner } = createData
      const { login } = owner

      // ref
      const { data: ref } = await octokit.git.getRef({
        owner: 'ed42311',
        repo: 'obvs-a-test',
        ref: 'heads/master',
      });
     
      const parentSHA = ref.object.sha


      // const { data: repoData } = await octokit.repos.get({
      //   owner: 'ed42311',
      //   repo: 'obvs-a-test',
      // });

      const arrOfThings = [{
        owner: 'ed42311',
        repo: 'obvs-a-test',
        content: '// Hello test',
        filename: 'hello1.js'
      },{
        owner: 'ed42311',
        repo: 'obvs-a-test',
        content: '// Hello test 2',
        filename: 'hello2.js'
      },{
        owner: 'ed42311',
        repo: 'obvs-a-test',
        content: '// Hello test 3',
        filename: 'hello3.js'
      }]
      const blobs = await Promise.all(arrOfThings.map(async ({owner, repo, content, filename}) => {
        const _res = await octokit.git.createBlob({owner, repo, content})
        const { data } = _res
        return {
          "path": filename,
          "mode": "100644",
          "type": "blob",
          "sha": data.sha
        }
      }));
      console.log(blobs)

      const { data: tree } = await octokit.git.createTree({
          owner: 'ed42311',
          repo: 'obvs-a-test',
          base_tree: parentSHA,
          tree: blobs
        });
      const treeSHA = tree.sha

      const { data: commit } = await octokit.git.createCommit({
        owner: 'ed42311',
        repo: 'obvs-a-test',
        message: 'graphRepo new files',
        tree: treeSHA,
        parents: [parentSHA],
      });
      const commitSHA = commit.sha

      const { data: finalRef } = await octokit.git.updateRef({
        owner: 'ed42311',
        repo: 'obvs-a-test',
        ref: 'heads/master',
        sha: commitSHA,
      });
      console.log(finalRef)


      // await octokit.repos.delete({
      //   owner: login,
      //   repo,
      // });
    } catch (error) {
      console.log(error)
    }

  }
} 

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