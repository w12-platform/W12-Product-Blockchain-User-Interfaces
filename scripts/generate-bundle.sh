#!/usr/bin/env bash

tar -cf bundle.tar build/ stand/ *.html translations.js package.json package-lock.json serve.js
