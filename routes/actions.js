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

const uploadFile = multer({
    limits:{
        fileSize:10000000,
    },
})

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
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    let srcLang = 'en', targetLang = target;

    await page.goto(`https://translate.google.com/#view=home&op=translate&sl=${srcLang}&tl=${targetLang}`).catch(function () {
        console.log("Promise Rejected");
   });;
    
    await page.waitForSelector('#source');
    await page.waitFor(1000);

    let sourceString = url
    await page.type('#source', sourceString);

    await page.waitForSelector('.result-shield-container');
    await page.waitFor(3000);

    const translatedUrl = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]'),
        a => a.getAttribute('href')
   ));
  const redirectUrl =  translatedUrl[12]
  const newBrowser = await puppeteer.launch({headless: false,  args: ['--start-maximized']});
  const NewPage = await newBrowser.newPage();
  
  await NewPage.goto(redirectUrl);

  await NewPage.on('response',  async ()=>{
      const resp = await fetch(redirectUrl); 
      const html = await resp.text()
      fs.outputFile('Index.html',   html)
    })
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile('./Index.html', null, function(error, data){
        if(error){
            res.writeHead(404);
            res.write('File not found')
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
