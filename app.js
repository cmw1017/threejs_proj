const express = require('express');
const app = express();
//웹소켓 만들때 이렇게 하는거임 express 가이드를 보고 하는것
const server = app.listen(8888, () => {
    console.log("서버 실행 8888 포트...");
});
// app.get('/', (req, res) => {
//     res.send('hello cms!!!!');
// });
app.set('views',__dirname+"/views");//디렉토리 설정
app.use('/external', express.static(__dirname+"/external"))
app.use('/js', express.static(__dirname+"/js"))
app.use('/node_modules', express.static(__dirname+"/node_modules"))
app.use('/stls', express.static(__dirname+"/stls"))
app.use('/glbs', express.static(__dirname+"/glbs"))
app.set('view engine', 'ejs');//엔진 설정 ejs는 자바스크립트랑 html을 같이 쓸수있게 해주는것 jsp랑 비슷한거
app.engine('html', require('ejs').renderFile);//ejs를 설치해줘야됨 npm install ejs --save
app.get('/test1', (req, res) => {
    res.render('test_01.html');//renger라는게 있음
});
app.get('/test2', (req, res) => {
    res.render('test_02.html');//renger라는게 있음
});
app.get('/test3', (req, res) => {
    res.render('test_03.html');//renger라는게 있음
});
app.get('/test4', (req, res) => {
    res.render('test_04.html');//renger라는게 있음
});
app.get('/test5', (req, res) => {
    res.render('test_05.html');//renger라는게 있음
});
app.get('/test6', (req, res) => {
    res.render('test_06.html');//renger라는게 있음
});
app.get('/test7', (req, res) => {
    res.render('test_07.html');//renger라는게 있음
});
app.get('/test8', (req, res) => {
    res.render('test_08.html');//renger라는게 있음
});
app.get('/test9', (req, res) => {
    res.render('test_09.html');//renger라는게 있음
});
app.get('/test10', (req, res) => {
    res.render('test_10.html');//renger라는게 있음
});