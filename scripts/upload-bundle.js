#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const util = require('util');
const URLTemplate = require('url-template');
const semver = require('semver');
const url = require('url');

const TOKEN = process.env.CONVENTIONAL_GITHUB_RELEASER_TOKEN;

const stat = util.promisify(fs.stat);
const exists = util.promisify(fs.exists);

const getReleases = () => {
    return new Promise((resolve, reject) => {
        https.request({
                host: 'api.github.com',
                path: '/repos/w12-platform/W12-Product-Blockchain-User-Interfaces/releases',
                method: 'GET',
                headers: {
                    Authorization: `token ${TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'w12-platform/W12-Product-Blockchain-User-Interfaces'
                }
            },
            (res) => {
                if (res.statusCode !== 200) {
                    res.resume();
                    reject(res.statusCode);
                    return;
                }

                res.setEncoding('utf8');

                let data = '';

                res.on('data', (c) => { data += c });
                res.on('end', () => {
                    try {
                        data = JSON.parse(data);
                        data = data.reverse();
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                })
            })
            .on('error', (e) => reject(e))
            .end()
    });
};

const main = async () => {
    if (!await exists('./bundle.tar')) {
        throw new Error('you must generate bundle before upload');
    }

    const file = fs.createReadStream('./bundle.tar');
    const stats = await stat('./bundle.tar');
    const releases = await getReleases();

    if (releases.length === 0) {
        console.log('no releases')
        return;
    }

    const last = releases[releases.length - 1];
    const uploadURLTemplate = last.upload_url;
    const requestUrl = new url.URL(
        URLTemplate.parse(uploadURLTemplate)
            .expand({
                name: 'bundle.tar',
                label: 'WebClientBundleArchive'
            })
    );

    const request = new Promise((resolve, reject) => file.pipe(https.request(
        {
            hostname: requestUrl.hostname,
            path: `${requestUrl.pathname}${requestUrl.search}`,
            method: 'POST',
            headers: {
                Authorization: `token ${TOKEN}`,
                'Content-Type': 'application/x-tar',
                'Content-Length': stats.size
            }
        },
        (res) => res.statusCode === 200 ? resolve() : reject(res.statusCode)
    )));

    await request;
};

main()
    .then(() => console.log('release bundle has been uploaded!'))
    .catch(e => console.error(e));


