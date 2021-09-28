/////////////////////////////////////////////////////////////////////////////
const fs = require('fs');
const path = `./API_Server/data/bookmarks.json`;

// Check if file exists
fs.access(path, (err) => {
    if (err){
        let Bookmarks = require('./models/initBookmarks');
        Bookmarks.initBookmarks();
        console.log("The file has been created.")
    }else{
        console.log("The file exists.")
    }
})
//////////////////////////////////////////////////////////////////////////////

function ShowRequestInfo(req) {
    // const URL = require('url').URL;
    // let url = new URL(req.url);
    // console.log(`User agent:${req.headers["user-agent"]}`);

    console.log(`Method:${req.method}`);
    console.log(`Path:${req.url}`);

    console.log(`Content-type:${req.headers["content-type"]}`);
}
function AccessControlConfig(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
}
function Prefligth(req, res) {
    if (req.method === 'OPTIONS') {
        console.log('preflight CORS verifications');
        res.end();
        // request handled
        return true;
    }
    // request not handled
    return false;
}
const server = require('http').createServer((req, res) => {
    // Middlewares pipeline
    ///////////////////////////////////////////////////
    //console.log(req.method);
    ShowRequestInfo(req);
    AccessControlConfig(res);
    if (!Prefligth(req, res)) {
        let router = require('./router');
        if (!router.dispatch_API_EndPoint(req, res)) {
            // do something else with request
        }
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`HTTP Server running on port ${PORT}...`));
/////////////////////////////////////////////////////////////////////////
