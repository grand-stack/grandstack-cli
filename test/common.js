import assert from 'assert';
import { getNeo4jDatabaseString, getEncryptionKeyString, arrayOfFiles } from '../src/commands/deploy/api/common';

describe('Common api deploy functions', function () {
  describe('getNeo4jDatabaseString()', function () {
    it('should return empty string if no database', function () {
      assert.equal(getNeo4jDatabaseString(), "");
    });

    it('should return db key value as string if database present', function () {
      assert.equal(getNeo4jDatabaseString("neo4j"), `neo4jDatabase: "neo4j"`);
    });
  });

  describe('getEncryptionKeyString()', function () {
    it('should return empty string if encryption is false', function () {
      assert.equal(getEncryptionKeyString(false), "");
    });

    it('should return encryption string if encryption is true', function () {
      assert.equal(getEncryptionKeyString(true), ", {encrypted: 'ENCRYPTION_ON'}");
    });
  });

  describe('arrayOfFiles()', function () {
    it('should return an array of 4 files', function () {
      const testDataForFiles = {
        owner: "username", 
        repo: "great-repo", 
        types: "type Person {name: string}", 
        database: "neo4j", 
        encrypted: false
      }
      assert.equal(arrayOfFiles(testDataForFiles).length, 4);
    });
  });
});