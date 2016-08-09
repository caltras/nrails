const spawn = require('child_process').spawn;

module.exports = function(args, config) {
    console.log("Running application");
    var p = (process.env.PWD || process.cwd()).split("/node_modules");
    var exec = spawn("node", [p[0] + "/server.js"]);
    
    exec.stdout.on('data', (data) => {
        console.log(`${data}`);
    });

    exec.stderr.on('data', (data) => {
        console.log(`${data}`);
    });

    exec.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

};