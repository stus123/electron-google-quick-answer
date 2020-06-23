const fs = require("fs")

const config = require('C:/triviador/config.json')
const ocrSpaceApi = require('ocr-space-api');
const path = config.img_path //"C:/Users/stasb/OneDrive/Документы/ShareX/Screenshots/2020-06/"
const options = {
    apikey: config.ocrapi_key, //"65020a23c888957", 
    language: 'rus',
    imageFormat: 'image/png',
    isOverlayRequired: true
};



const GoogleSearch = require('google-search');
const googleSearch = new GoogleSearch({
    key: config.google.key, //"AIzaSyBPYWOYEeKgIN7E2Q76MG-l6XcQhA2y1aM", //'AIzaSyDZUbxgohhMRSxwOCsNKj3Rx4lppJYLqDo', //'AIzaSyC9nT01iON8q3pKhVkoCaY_gGQ1EDaXJDQ',                      //googleAPI, const searchEngineId = "010844983517532271491:xnuwvuapoz4";
    // const key = "AIzaSyBPYWOYEeKgIN7E2Q76MG-l6XcQhA2y1aM"; 
    cx: config.google.cx //'010844983517532271491:xnuwvuapoz4'  //'004325806324865504058:k1i4_nc6vjy'//'012215341274280442454:x3e41iv-_14'
})
testGoogle()

function testGoogle() {
    googleSearch.build({
        q: 1
    }, function(error, response) {

        if (typeof response.kind == 'undefined') {
            document.getElementById('result_answer').innerHTML = 'ключ гугла введен неверно'
            return;
        } else {
            return testOcr()
        }
    });
}

function testOcr() {
    ocrSpaceApi.parseImageFromUrl('http://i.imgur.com/fwxooMv.png', options).then(function(parsedResult) {
        if (typeof parsedResult.parsedText !== 'undefined') {
            return testPath();
        }
    }).catch(function(err) {
        if (err) {
            document.getElementById('result_answer').innerHTML = 'ключ ocr api введен неверно'
            return;
        }
    });
}

function testPath() {


    fs.stat(path, function(err, stat) {
        if (err == null) {
            let files = fs.readdirSync(path)
            if (files[1] !== undefined) {
                document.getElementById('result_answer').innerHTML = 'в директории должно быть не более одного скриншота'
                return;
            }
        } else if (err == 'ENOENT') {
            document.getElementById('result_answer').innerHTML = 'такой директории несуществует'
            return;
        }


    });

}

function wait() {

    fs.readdir(path, function(err, files) {
        if (files[0] == undefined) {
            wait()
        } else {
            getImg(files)
        }

    })

    return;
}




async function getImg(imageFilePath) {

    let result = await ocrSpaceApi.parseImageFromLocalFile(path + imageFilePath, options)

    fs.unlinkSync(path + imageFilePath)

    return answer(result.parsedText);

}




function answer(ans) {


    googleSearch.build({
        q: ans,
        start: 0,
        gl: "ru",
        lr: "lang_ru",
        num: 3

    }, function(error, response) {

        if (error) {
            document.getElementById('result_answer').innerHTML = 'произошел краш, перезапускаю скрипт'
            return wait();
        }
        if (response.searchInformation.totalResults == 0) {
            document.getElementById('result_answer').innerHTML = 'поиск не дал результатов, решай сам :^)'
            return wait();
        }
        let string = response.items[0].snippet + '<br />' + response.items[1].snippet + '<br />' + response.items[2].snippet //+ '\n\n\n\n\n\n\n' + '\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\'

        // console.log(string.replace(/(\d[0-9])/g, colors.yellow('$1')));
        document.getElementById('result_answer').innerHTML = string.replace(/(\d[0-9])/g, '<font color="green">$1</font>')
        return wait2(`${response.items[0].snippet} ${response.items[1].snippet} ${response.items[0].snippet}`);
    });
    // return wait2();//2(string);
}

function wait2(res) {


    //  console.log(res)
    fs.readdir(path, function(err, files) {
        if (files[0] == undefined) {
            wait2(res)
        } else {
            getImg2(files, res)
        }

    })

    return;
}
async function getImg2(imageFilePath, res) {


    let result = await ocrSpaceApi.parseImageFromLocalFile(path + imageFilePath, options)
    let arrayresult = result.parsedText.split('\r\n')
    arrayresult.pop()


    let answer = getMatchedArr(res, arrayresult)

    if (answer == null) {

        document.getElementById('result_google').innerHTML = res.replace(/(\d[0-9])/g, '<font color="green">$1</font>')


        document.getElementById('result_answer').innerHTML = console.log('Ответ не найден.');




    } else {

        document.getElementById('result_google').innerHTML = res.replace(/(\d[0-9])/g, '<font color="green">$1</font>')


        document.getElementById('result_answer').innerHTML = "<h1>Возможный ответ: " + answer.join(", ") + "<h1>"


    }

    // console.log(colors.green("Возможный ответ: ") + colors.yellow(getMatchedArr(res, arrayresult).join(", ")));

    fs.unlinkSync(path + imageFilePath)

    return wait(); // answer(result.parsedText)
}

function getMatchedArr(str, tryMatch = []) {
    let regex = new RegExp(tryMatch.join("|"), "gi");
    return str.match(regex);
}




//     <script type="module" src="./renderer.js"></script>