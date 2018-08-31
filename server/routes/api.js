var express = require('express');
var router = express.Router();
const db = require('../db');

const STATUS_OK = 0;
const STATUS_ERROR = 1;

function createResponse(status, data) {
  if (status === STATUS_OK) {
    return data;
  } else if (status === STATUS_ERROR) {
    return {
      error: data
    };
  }
}

function success(data) {
  return createResponse(STATUS_OK, data);
}

function error(data) {
  return createResponse(STATUS_ERROR, data);
}

function checkAuthToken(RQ) {
  const header = RQ.get('Authorization');

  if (!header) { return false; }

  const valid = /^Bearer .+$/.test(header);

  return valid;
}

function genAuthError(RS) {
  return RS.status(401).json(error({code: 401, message: 'auth error'})).end();
}

function genInternalError(RS, error) {
  return RS.status(504).json(error({code: 504, message: 'internal error', stack: error.stack })).end();
}

router.all((rq, rs, next) => {
  db.db.reload();
  next();
});

// Api methods

module.exports = router;
