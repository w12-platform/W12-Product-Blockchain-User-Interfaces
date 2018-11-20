# W12 product UI

[![CircleCI](https://circleci.com/gh/w12-platform/W12-Product-Blockchain-User-Interfaces.svg?style=svg)](https://circleci.com/gh/w12-platform/W12-Product-Blockchain-User-Interfaces)

# Development

```bash
$ npm install
$ npm run serve
```

# Development tips

* After release new contract version and before create new component or class or whatever for that version of contract check out `src/components/utils.js` for `resolveComponentVersion` and `src/lib/Blockchain/ContractsLedger.js` for `loadContracts`.
* Resolving component version. Component version may be resolved manually in `resolveComponentVersion`(see `src/components/utils.js`).
* Resolving contracts ledger version. See `loadContracts` in `src/lib/Blockchain/ContractsLedger.js`.

## Configuration

```
// Blockchain network id to use in client
BLOCKCHAIN_NETWORK_ID=(4|1)
// Connection provider for network with id 1
BLOCKCHAIN_NETWORK_1_PROVIDER=
// Connection provider for network with id 2
BLOCKCHAIN_NETWORK_4_PROVIDER=
// URL of translations file
TRANSLATIONS_JSON_URL=
```
