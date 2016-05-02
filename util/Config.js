'use strict';
const fs = require('fs');
const path = require('path');

let Config = function () {
  this.currentConfigs = ['box', 'auth0'];
  this.boxFilename = "box.config.json";
  this.boxReadFile = path.join(__dirname, '../', this.boxFilename);
  this.boxConfig;
  
  this.auth0Filename = "auth0.config.json";
  this.auth0ReadFile = path.join(__dirname, '../', this.auth0Filename);
  this.auth0Config
  
  this.alternateFilename;

  Config.prototype.getConfig = function (configType, alternateFilename) {
    switch (configType) {
      case 'box':
        if (alternateFilename) {
          this.alternateFilename = alternateFilename;
          this.boxReadFile = path.join(__dirname, '../', this.alternateFilename);
        }

        if (this.boxConfig && !this.alternateFilename) {
          return this.boxConfig;
        }

        let boxConfig;
        try {
          boxConfig = fs.readFileSync(this.boxReadFile, 'utf-8');
        } catch (e) {
          console.error("There was an error reading config file.");
          console.error(e);
        }

        if (!boxConfig) {
          throw new Error("No configuration file found.");
        }

        try {
          boxConfig = JSON.parse(boxConfig);
        } catch (e) {
          throw new Error("Configuration file unreadable.");
        }

        this.boxConfig = boxConfig;
        return this.boxConfig;
      
      case 'auth0':
        if (alternateFilename) {
          this.alternateFilename = alternateFilename;
          this.auth0ReadFile = path.join(__dirname, '../', this.alternateFilename);
        }

        if (this.auth0Config && !this.alternateFilename) {
          return this.auth0Config;
        }

        let auth0Config;
        try {
          auth0Config = fs.readFileSync(this.auth0ReadFile, 'utf-8');
        } catch (e) {
          console.error("There was an error reading config file.");
          console.error(e);
        }

        if (!auth0Config) {
          throw new Error("No configuration file found.");
        }

        try {
          auth0Config = JSON.parse(auth0Config);
        } catch (e) {
          throw new Error("Configuration file unreadable.");
        }
        
        this.auth0Config = auth0Config;
        return this.auth0Config;
      default:
        throw new Error(`Config not supported. Currently only supporting ${this.currentConfigs.join(', ')}`);
    }
  };
};

module.exports = new Config();