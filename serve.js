#!/usr/bin/env node

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const ROOT = __dirname;
const VERSION = `v${require('./package.json').version}_${Date.now()}`;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('views', ROOT);
app.set('view engine', 'ejs');

app.engine('html', require('ejs').renderFile);

app.get(['/', '/index', '/index.html'], (req, res) => res.render('index.html', { VERSION }));
app.get(['/test-dashboard', '/test-dashboard.html'], (req, res) => res.render('config.html', { VERSION }));
app.get(['/crowdsale', '/crowdsale.html'], (req, res) => res.render('crowdsale.html', { VERSION }));
app.get(['/factory', '/factory.html'], (req, res) => res.render('factory.html', { VERSION }));
app.get(['/investor-exchange', '/investor-exchange.html'], (req, res) => res.render('investor-exchange.html', { VERSION }));
app.get(['/investor-refund', '/investor-refund.html'], (req, res) => res.render('investor-refund.html', { VERSION }));
app.get(['/listing', '/listing.html'], (req, res) => res.render('listing.html', { VERSION }));
app.get(['/project', '/project.html'], (req, res) => res.render('project.html', { VERSION }));
app.get(['/receiving', '/receiving.html'], (req, res) => res.render('receiving.html', { VERSION }));
app.get(['/tranche', '/tranche.html'], (req, res) => res.render('tranche.html', { VERSION }));

app.use(express.static(ROOT, {
    index: false
}));

app.listen(process.env.PORT || 8090, () => {
    console.log(`listening on port ${process.env.PORT || 8090}`);
});
