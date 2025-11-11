const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 6969;
const users = {
    '2351001': { password: '2351001', id: "2351001", name: "Nguyen Van A", role: 'student' },
    '2352068': { password: '2352068', id: "2352068", name: "Người dung 1", role: 'student' },
    '2351002': { password: '2351002', id: "2351002", name: "Tran Thi B", role: 'student' },
    '2351003': { password: '2351003', id: "2351003", name: "Le Van C", role: 'student' },
    'gv001': { password: 'gv001', id: "gv001", name: "Nguyen Van X", role: 'teacher' },
    'gv002': { password: 'gv002', id: "gv002", name: "Tran Thi Y", role: 'teacher' }
};

const clients = {
    'client_id': {
        secret: 'client_secret',
        redirectUris: ['http://localhost:3001/auth/callback']
    }
};

const authorizationCodes = {};
const accessTokens = {};
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/static', express.static(path.join(__dirname, 'public')));



app.get('/oauth/authorize', (req, res) => {
    const { client_id, redirect_uri, response_type, scope } = req.query;




    if (!clients[client_id] || !clients[client_id].redirectUris.includes(redirect_uri)) {
        return res.status(400).send('Client ID hoặc Redirect URI không hợp lệ.');
    }

    res.render('login', {
        client_id,
        redirect_uri,
        response_type,
        scope,
        error: null
    });
});



app.post('/login', (req, res) => {
    const { username, password, client_id, redirect_uri, response_type, scope } = req.body;
    const user = users[username];


    if (!user || user.password !== password) {
        return res.render('login', {
            client_id,
            redirect_uri,
            response_type,
            scope,
            error: 'Tên đăng nhập hoặc mật khẩu không đúng.'
        });
    }


    const authCode = `authcode_${Date.now()}_${Math.random()}`;
    authorizationCodes[authCode] = {
        clientId: client_id,
        userId: user.id,
        redirectUri: redirect_uri,
        expires: Date.now() + 10 * 60 * 1000
    };

    console.log("Current authorization codes:", authorizationCodes);


    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.append('code', authCode);
    res.redirect(redirectUrl.toString());
});

app.post('/oauth/token', (req, res) => {
    const { grant_type, code, redirect_uri, client_id, client_secret } = req.body;

    console.log("Token request:", req.body);
    console.log("Stored authorization codes:", authorizationCodes);



    if (grant_type === 'authorization_code') {
        const authCodeEntry = authorizationCodes[code];

        console.log("Auth code entry:", authCodeEntry);

        console.log({ grant_type, code, redirect_uri, client_id, client_secret });

        if (!authCodeEntry || authCodeEntry.clientId !== client_id || authCodeEntry.redirectUri !== redirect_uri || authCodeEntry.expires < Date.now()) {
            return res.status(400).json({ error: 'invalid_grant', error_description: 'Authorization code không hợp lệ hoặc đã hết hạn.' });
        }


        if (!clients[client_id] || clients[client_id].secret !== client_secret) {
            return res.status(401).json({ error: 'invalid_client', error_description: 'Client ID hoặc Client Secret không đúng.' });
        }


        delete authorizationCodes[code];


        const accessToken = `accesstoken_${Date.now()}_${Math.random()}`;
        accessTokens[accessToken] = {
            userId: authCodeEntry.userId,
            clientId: client_id,
            expires: Date.now() + 60 * 60 * 1000
        };


        res.json({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600
        });
    }
    else if (grant_type === 'client_credentials') {
        if (!clients[client_id] || clients[client_id].secret !== client_secret) {
            return res.status(401).json({ error: 'invalid_client', error_description: 'Client ID hoặc Client Secret không đúng.' });
        }

        const accessToken = `accesstoken_client_${Date.now()}`;
        accessTokens[accessToken] = {
            clientId: client_id,
            expires: Date.now() + 60 * 60 * 1000
        };

        res.json({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600
        });
    }
    else {
        res.status(400).json({ error: 'unsupported_grant_type' });
    }
});



const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401);
    }

    const tokenData = accessTokens[token];
    if (!tokenData || tokenData.expires < Date.now()) {
        return res.sendStatus(403);
    }

    req.user = Object.values(users).find(u => u.id === tokenData.userId);
    next();
};

app.get('/api/profile', authenticateToken, (req, res) => {
    if (!req.user) {
        return res.status(404).json({ error: 'Không tìm thấy thông tin người dùng cho token này.' });
    }
    res.json({
        id: req.user.id,
        name: req.user.name,
        message: 'Chào mừng đến với API được bảo vệ!'
    });
});



app.listen(PORT, () => {
    console.log(`Authorization server is running on http://localhost:${PORT}`);
    console.log(`Authorize URL: http://localhost:${PORT}/oauth/authorize?response_type=code&client_id=my-client-id&redirect_uri=http://localhost:3000/callback&scope=read`);
    console.log(`Token URL: http://localhost:${PORT}/oauth/token`);


});