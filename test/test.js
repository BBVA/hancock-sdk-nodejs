const hancock = require('../src/services/hancock');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const config = require('config')

var nock = require('nock');

describe('HancockClient', () => {

  const h;

  beforeEach(() => {

    var couchdb = nock(config.broker.host)
      .get('/users/1')
      .reply(200, {
        _id: '123ABC',
        _rev: '946B7D1C',
        username: 'pgte',
        email: 'pedro.teixeira@gmail.com'
      });

    h = new hancock.HancockClient();

  });

  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});

describe('Websocket', () => {

  it('should return -1 when the value is not present', () => {

    const ws = new WebSocket('wss://echo.websocket.org/', {
      origin: 'https://websocket.org'
    });

    sinon.stub()

    expect(1).to.be(1);
    expect(ws).not.be.undefined;

  });
  
});