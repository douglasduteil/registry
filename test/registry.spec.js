'use strict';

var format = require('util').format;
var expect = require('chai').expect;
var spawn = require('child_process').spawn;

var registry = require('../registry.json');

describe('Registry', function(){
  Object.keys(registry)
  .forEach(function(shortname){
    validateShortname(shortname, registry[shortname]);
  });
})

////
var header = process.env.GITHUB_TOKEN ?
  '-H "Authorization: token $GITHUB_TOKEN" ':
  '';

var ENDPOINT_COMMANDS = {
  github: {
    command: 'curl ' + header + 'https://api.github.com/repos/%s',
    isValidEndpointCallback: function(err, lastData){
      return !/"message": "Not Found"/.test(lastData.toString());
    }
  },
  npm: {
    command: 'npm info %s',
    isValidEndpointCallback: function(err){ return !err; }
  }
}

var SHORTCUT_REGEX = /^([^:]+):([\w\/-]+)/;

function validateShortname(shortname, canonicalEndpointName){
  var endpoint, name;

  describe(format(
    '"%s" shortname for "%s"',
    shortname, canonicalEndpointName
  ), function(){

    it('should link to an existing package', function(done){

      canonicalEndpointName.replace(SHORTCUT_REGEX, extractMathingData);

      ////
      expect(endpoint,
        format('Expect an endpoint in "%s"', canonicalEndpointName)
      ).to.be.ok();

      expect(name,
        format('Expect an name in "%s"', canonicalEndpointName)
      ).to.be.ok();
      ////

      verifyEndpoint(done);
    });
  });

  ////

  function verifyEndpoint(done){
    var endpointCase = ENDPOINT_COMMANDS[endpoint];

    ////
    expect(
      endpointCase,
      format('Expected "%s" endpoint to exist', endpoint)
    ).to.be.ok();
    ////

    var command = format(endpointCase.command, name);

    var lastData;
    var child = spawn('sh', ['-c', command]);

    child.stdout.on('data', function(data) { lastData = data; });
    child.on('exit', function(err){

        ////
        expect(
          endpointCase.isValidEndpointCallback(err, lastData),
          format('Expected "%s" command to run without error', command)
        ).to.be.true();
        ////

        done();
      })
    ;
  }


  function extractMathingData(match, _endpoint, _name){
    endpoint = _endpoint;
    name = _name;
  }
}
