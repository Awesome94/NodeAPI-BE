const router = require('express').Router();
const verify = require('../helpers/verifyToken');
const path = require('path');
const multer = require('multer');
const File = require('../model/Files');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs-extra');
const { TranslationServiceClient } = require('@google-cloud/translate');

const uploadFile = multer()

const translationClient = new TranslationServiceClient();


router.post(`/parse/:url*`, verify, async(req, res) => {
    const url = req.params.url + req.params[0]
    try {
        const resp = await fetch(url)
        const html = await resp.text()

        const $ = cheerio.load(html);

        urlData = {
            title: $('title').first().text().trim(),
            favicon: $('link[rel="shortcut icon"]').attr('href') || "",
            'large-image': $('meta[name=image]').attr('content') || $('meta[property="og:image"]').attr('content'),
            snippet: $('meta[name=description]').attr('content') || $('meta[property="og:title"]').attr('content')
        }
        return res.status(200).send(urlData)
    } catch (error) {
        return res.status(500).send({ error: "Parsing Failed, Make sure url is valid and try again" })
    }
});


router.post(`/translate/:url*`, verify, async(req, res) => {

    const content = []

    const { targetLanguageCode } = req.body || 'id'
    const url = req.params.url + req.params[0]

    const request = {
        parent: `projects/${process.env.PROJECTID}/locations/${process.env.LOCATION}`,
        contents: content,
        mimeType: 'text/html',
        targetLanguageCode,
    };
    const [{ languages }] = await translationClient.getSupportedLanguages(request);
    const languageCodes = languages.map((language) => language.languageCode);

    if (!targetLanguageCode) {
        return res.status(400).send({
            error: "Missing 'targetLanguageCode' in request body. e.g {'targetLanguageCode': 'fr'}"
        })
    }

    if (!(languageCodes.includes(targetLanguageCode))) {
        return res.status(400).send({
            error: "invalid 'targetLanguageCode' value in request body. 'targetLanguageCode' must match one of " +
                languageCodes.join(', '),
        })
    }


    try {
        const page = await fetch(url)
        const html = await page.text()

        content.push(html)

        const [response] = await translationClient.translateText(request);

        for (const translation of response.translations) {
            res.set('Content-Type', 'text/html');
            return res.status(200).send(translation.translatedText);
        }
    } catch (error) {
        res.status(503).send(error.details || { error: "Failed, make sure url is absolute and valid, Try again" });
    }
});


router.post('/upload', verify, uploadFile.single('file'), async(req, res) => {
    const fileName = req.file.originalname
    const newFile = new File({
        filename: req.file.originalname,
        file: req.file.buffer,
        user_id: req.user,
        format: req.file.mimetype,
    });
    await newFile.save()
    res.status(200).send({ "Successfully with identifier as": newFile.id })
}, (err, req, res, next) => res.status(404).send({ error: err }))


router.get('/download/:identifier', async(req, res) => {
    const identifier = req.params.identifier
    try {
        const fileObj = await File.findById(identifier)
        if (!fileObj || !fileObj.file)
            throw new Error()
        res.set('Content-Type', fileObj.format)
        res.status(200).send(fileObj.file)
    } catch (e) {
        res.status(404).send()
    }
});


module.exports = router;
module.exports = router;