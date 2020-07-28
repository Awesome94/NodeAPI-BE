const router = require('express').Router();
const verify = require('./verifyToken');
const path = require('path');
const multer = require('multer');
const File = require('../model/Files');
const { reset } = require('nodemon');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const {TranslationServiceClient} = require('@google-cloud/translate');


const uploadFile = multer({
    limits:{
        fileSize:10000000,
    },
})

const translationClient = new TranslationServiceClient();

router.post('/parse', verify, async (req, res)=>{
    const resp = await fetch(req.body.url); 
    const html = await resp.text()
    const $ = cheerio.load(html);

    const getMetatag = (name)=>{
        $(`meta[name=${name}]`).attr('content')||
        $(`meta[property="og:${name}"]`).attr('content')||
        $(`meta[property="twitter:${name}"]`).attr('content');
    }
    const urlData = {
        title: $('title').first().text(),
        favicon: $('link[rel="shortcut icon"]').attr('href') || "",
        largeImage: getMetatag('image') || "",
        snippet: getMetatag('description') || "",
        url:req.body.url,
    }
    res.status(200).send(urlData)
})

router.post('/translate', verify, async (req, res)=>{

    const url = req.body.url
    const target = req.body.target || 'id'
    const resp = await fetch(req.body.url); 
    const html = await resp.text()
    const $ = cheerio.load(html);
    // console.log("This is body", $('body').first().text())
    let srcLang = 'en', targetLang = target;
    const projectId = "translation-284519"
    const location = 'global'
    const request = {
        parent: `projects/${projectId}/locations/${location}`,
        contents: [$('body').first().text()],
        mimeType: 'text/html',
        sourceLanguageCode: 'en',
        targetLanguageCode: target,
      };
    
      try {
        // Run request
        const [response] = await translationClient.translateText(request);
        // console.log("mama we made it this far", response)
    
        for (const translation of response.translations) {
            $('body').first().text([translation.translatedText])
        }
      } catch (error) {
        console.error("This is is", error);
      }
   
    fs.outputFile('Index.html',   $.html())
    fs.readFile('./Index.html', null, function(error, data){
        if(error){
            res.status(404).send('File not found')
        }else{
            res.write(data);
        }
        res.end()
    });
});


router.post('/upload', verify, uploadFile.single('upload'),async (req,res) =>{
    const fileName = req.file.originalname
    const newFile = new File({
        filename: req.file.originalname,
        file: req.file.buffer,
        user_id: req.user,
        format: req.file.mimetype,
    });
    await newFile.save()
    res.status(200).send({"Successfully with indentifier as":newFile.id})
},(err,req,res,next) => res.status(404).send({error:err}))


router.get('/download/:indentifier', verify, async (req, res)=>{
    const indentifier = req.params.indentifier
    try{
        const fileObj = await File.findById(indentifier)
        if(!fileObj || !fileObj.file)
        throw new Error()
        res.set('Content-Type', fileObj.format)
        res.status(200).send(fileObj.file)
    }catch(e){
        res.status(404).send()
    }
});


module.exports = router;
