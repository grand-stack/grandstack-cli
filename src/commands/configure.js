import { writeConfig } from "../utils/";

export const command = "configure";
export const desc = "Setup configuration options for CLI";
export const builder = {};

export const handler = () => {
  const creds = {
    neo4j_uri: "bolt://localhost:7687",
    neo4j_user: "neo4j",
    neo4j_password: "letmein",
  };
  writeConfig(creds);
};
