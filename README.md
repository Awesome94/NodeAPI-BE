# NodeAPI-BE
 Live api can be found here: 

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
POST | `/v1/translate` | Takes a URL and desired translation then Opens translated page and returns html response.
POST | `/v1/upload` | Uploads a file to database.
GET | `/v1/download/:indetifier` | Streams file matching indentifier provided.


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