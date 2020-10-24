const express = require('express');
const app = express();

const bodyParser = require('body-parser');


const path = require('path');
const secretKey = 'My super secret key';
const PORT = 3000;
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
})
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');

const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256'],
    isRevoked: isRevokedCallback

})

let users = [
    {
        id: 1,
        username: 'surabhi',
        password: '123'
    },
    {
        id: 2, 
        username: 'gurav',
        password: '456'
    }
];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
})

var isRevokedCallback = function(req, payload, done){
    var issuer = payload.iss;
    var tokenId = payload.jti;
  
    data.getRevokedToken(issuer, tokenId, function(err, token){
      if (err) { return done(err); }
      return done(null, !!token);
    });
  };

app.post('/api/login',(req,res)=>{
    const {username,password} = req.body; 

    for(let user of users)
    {
        if(username == user.username && password == user.password)
        {
            let token = jwt.sign({id:user.id,username:user.username},secretKey,{expiresIn: 180});
            res.json({
                success: true,
                err:null,
                token
            });
            break;
        }   
    }

    res.status(401).json({
        success:false,
        token:null,
        err: 'Username or Password is incorrect'
    });
}); 

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see!!!',
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is the settings page',
    });
});

app.get('/api/prices', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is the price #3.99'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next){
    if(err.name === 'UnauthorizedError'){
        res.status(401).json({
            success: false,
            officialError:err,
            err: 'Username or password is incorrect 2'
        });
    }    
    else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});