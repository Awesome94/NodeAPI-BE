# NodeAPI-BE
 Live api can be found here: https://translation-284519.uc.r.appspot.com/api/v1

## Overview
A Node REST API that performs some few but interesting tasks such as:
- Register user and login.
- Parse html content returning a response that can be used to create a link preview for a given site/url
- Upload and stream files ranging in various formats.
- Show translated content of a given website/url.


HTTP |End Point  | Result
--- | --- | ----------
POST | `/v1/register` | Creates a profile/account for new user.
POST | `/v1/login/:username/:password` | Provides user with token to authorize navigation to other endpoints.
POST | `/v1/translate` | Takes a URL and desired translation then and returns translated html response.
POST | `/v1/upload` | Uploads a file to database and returns .
POST | `/v1/parse/:url` | Scraps site for unfurling data.
GET | `/v1/download/:identifier` | Streams file matching identifier provided.


## Running Locally.

```sh
git clone https://github.com/Awesome94/NodeAPI-BE.git 
```
```sh
cd into the project
```

```sh
npm install
```

```sh
npm start
```