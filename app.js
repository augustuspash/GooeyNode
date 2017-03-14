//Copyright (C) 2017 Augustus York Rushton Pash - All Rights Reserved
const http = require('http');
const HttpDispatcher = require('httpdispatcher');
const dispatcher = new HttpDispatcher();
const fs = require('fs');
var config = require('./settings.json');
var types = require('./inputTypes.js');
const exec = require('child_process').exec;
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

const net = require("net");

var serverport = 6000;
var servers = {};

dispatcher.beforeFilter(/\//, function (req, res, chain) {
    chain.next(req, res, chain);
});

dispatcher.afterFilter(/\//, function (req, res, chain) {
    chain.next(req, res, chain);
});

dispatcher.onError(function (req, res) {
    res.writeHead(404);
    res.end();
});

http.createServer(function (req, res) {
    dispatcher.dispatch(req, res);
}).listen(port, hostname);

config.interfaces = [];
var dirs = getDirectories(__dirname + "/apps");
for (var i = 0; i < dirs.length; i++) {
    (function(tmp) {
        config.interfaces[tmp] = JSON.parse(fs.readFileSync(__dirname + "/apps/" + dirs[tmp] + '/interface.json'));
        config.interfaces[tmp].app = dirs[tmp];
        config.interfaces[tmp]['requested'] = function () { return wrapHtml(config.interfaces[tmp]); };
        dispatcher.onGet("/" + config.interfaces[tmp].uri, function (req, res) {
            res.end(config.interfaces[tmp]['requested']());
        });

        dispatcher.onPost("/" + config.interfaces[tmp].uri, function (req, res) {
            console.log(req.body);  
            if (!servers[config.interfaces[tmp].app]) {
                var p = serverport + 1;
                serverport ++;
                var cmd = 'java -jar "' + __dirname + '/jar/' + config.interfaces[tmp].jar + '" "' + __dirname + '/apps/' + config.interfaces[tmp].app + '/config.json" ' + p;
                exec(cmd, function(error, stdout, stderr) {
                    console.log(error);
                });
                setTimeout(function() {
                    servers[config.interfaces[tmp].app] = p;
                    var socket = new net.Socket();
                    socket.connect(p, "localhost", function () {
                        socket.write(req.body);
                        socket.end();
                    });
                    res.end();
                }, 2000);
            } else {
                var socket = new net.Socket();
                socket.connect(servers[config.interfaces[tmp].app], "localhost", function () {
                    socket.write(req.body);
                    socket.end();
                });
                res.end();
            }
        
        });
    })(i);
}

dispatcher.onGet("/", function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(wrapHtml(null, true));
});

dispatcher.onGet("/css/bootstrap.css", function (req, res) {
    fs.readFile(__dirname + '\\resources\\css\\bootstrap.css', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
    });
});

dispatcher.onGet("/css/bootstrap.min.css", function (req, res) {
    fs.readFile(__dirname + '\\resources\\css\\bootstrap.min.css', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
    });
});

dispatcher.onGet("/css/simple-sidebar.css", function (req, res) {
    fs.readFile(__dirname + '\\resources\\css\\simple-sidebar.css', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
    });
});

dispatcher.onGet("/js/bootstrap.js", function (req, res) {
    fs.readFile(__dirname + '\\resources\\js\\bootstrap.js', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end(data);
    });
});

dispatcher.onGet("/js/bootstrap.min.js", function (req, res) {
    fs.readFile(__dirname + '\\resources\\js\\bootstrap.min.js', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end(data);
    });
});

dispatcher.onGet("/js/jquery.js", function (req, res) {
    fs.readFile(__dirname + '\\resources\\js\\jquery.js', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end(data);
    });
});

dispatcher.onGet("/js/web3.min.js", function (req, res) {
    fs.readFile(__dirname + '\\resources\\js\\web3.min.js', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end(data);
    });
});

dispatcher.onGet("/DataTables/datatables.min.js", function (req, res) {
    fs.readFile(__dirname + '\\resources\\DataTables\\datatables.min.js', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end(data);
    });
});

dispatcher.onGet("/DataTables/datatables.min.css", function (req, res) {
    fs.readFile(__dirname + '\\resources\\DataTables\\datatables.min.css', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
    });
});

dispatcher.onGet("/fonts/glyphicons-halflings-regular.woff2", function (req, res) {
    fs.readFile(__dirname + '\\resources\\fonts\\glyphicons-halflings-regular.woff2' , (err, data) => {
        res.end(data);
    });
});

dispatcher.onGet("/fonts/glyphicons-halflings-regular.woff", function (req, res) {
    fs.readFile(__dirname + '\\resources\\fonts\\glyphicons-halflings-regular.woff', (err, data) => {
        res.end(data);
    });
});

dispatcher.onGet("/fonts/glyphicons-halflings-regular.ttf", function (req, res) {
    fs.readFile(__dirname + '\\resources\\fonts\\glyphicons-halflings-regular.ttf', (err, data) => {
        res.end(data);
    });
});

dispatcher.onGet("/dashboard", function (req, res) {
    var data = fs.readFileSync(__dirname + '\\resources\\index.html', 'utf8');
    var dirs = getDirectories(__dirname + "/apps");
    var dirScript = "";
    for (var i = 0; i < dirs.length; i++)  {
        dirScript += "dataTable.row.add(['" + dirs[i] + "', '" + JSON.parse(fs.readFileSync(__dirname + "/apps/" + dirs[i] + '/interface.json'))["description"] + "']).draw( false );";
    }
    res.end(data.replace("[[0]]", createSidebar()).replace("[[1]]", '<div class="well" style="width:100%">' +
            '<center>' +
                '<h1>Dashboard</h1>' +
            '</center>' +
            '</div>' +
            '<div class="well" style="width:100%"> <h3>Plugins</h3>' +
            createAppTable() +
            '</div>').replace("[[2]]", " var dataTable = $('#plugins').DataTable();" + dirScript +
            '$(document).ready(function() {'+
            "    $('#plugins tbody').on( 'click', 'tr', function () {" +
            "    if ( $(this).hasClass('active') ) {" +
            "        $(this).removeClass('active');" +
            '        $("#identifier").text("");'+
            '        selected = "";'+
            '    }'+
            '    else {'+
            "        dataTable.$('tr.active').removeClass('active');" +
            "        $(this).addClass('active');" +
            "        $('#identifier').text(dataTable.row('.active').data());" +
            "        selected = dataTable.row('.active').data()[0];" +
            '    }'+
            '});});'));
});

function createAppTable() {
    var table = '<table id="plugins" class="table table-striped table-bordered" cellspacing="0" width="100%">' +
                '    <thead>' +
                '        <tr>' +
                '            <th>Name</th>' +
                '            <th>Description</th>' +
                '        </tr>' +
                '    </thead>' +
                '    <tfoot>' +
                '        <tr>' +
                '            <th>Name</th>' +
                '            <th>Description</th>' +
                '        </tr>' +
                '    </tfoot>' +
                '    <tbody>' +
                '    </tbody>' +
                '</table>';
    return table;
}

function getDirectories (srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory())
}

function createSidebar() {
    var tmp = "";
    for (var i = 0; i < config.interfaces.length; i++) {
        tmp += '<li><a href="/' + config.interfaces[i].uri + '">' + config.interfaces[i].name + '</a> </li >';
    }
    return tmp;
}

function createScript(pInfo) {
    var script = "";
    for (var i = 0; i < pInfo.gui.length; i++) {
        script += '$("#run' + i + '").click(function (e) {'+
                'var data = { "i": ' + i + '};';
        for (var j = 0; j < pInfo.gui[i].length; j++) {
            script += 'data["' + pInfo.gui[i][j].paramid + '"] = $("#' + pInfo.gui[i][j].paramid +'").val();';
        }
        script += '$.post("/' + pInfo.uri + '", JSON.stringify(data), function (d) {alert("Sent");});';
        script += '});';
    }
    script += pInfo.script;
    return script;
}

function createPage(pInfo) {
    var page = createPageSection("<h1>" + pInfo.name + "</h1>");
    for (var i = 0; i < pInfo.gui.length; i++) {
        var gui = "";
        for (var j = 0; j < pInfo.gui[i].length; j++) {
            gui += createInterface(pInfo.gui[i][j].type, pInfo.gui[i][j].paramid, pInfo.gui[i][j].name);
        }
        page += createPageSection(gui + createRun(i));
    }
    return page + (pInfo.html != "" ? createPageSection(pInfo.html) : "");
}

function wrapHtml(pInfo, dash) {
    var data = fs.readFileSync(__dirname + '\\resources\\index.html', 'utf8');
    if (dash) {
        var tmp = '<div class="well" style="width:100%">' +
            '<center>' +
                '<h1>Home - GooeyNode</h1>' +
            '</center>' +
            '<br/>' +
            'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.' +
        '</div>';
        data = data.replace("[[0]]", createSidebar()).replace("[[1]]", tmp).replace("[[2]]", "");
    } else {
        data = data.replace("[[0]]", createSidebar()).replace("[[1]]", createPage(pInfo)).replace("[[2]]", createScript(pInfo));
    }
    return data;
}

function createPageSection(inner) {
    return '<div class="well" style="width:100%;">' + inner + '</div>';       
}

function createInterface(type, paramid, name) {
    if (types[type]) {
        return types[type](type, paramid, name);
    } else {
        return '<div class="form-group"><label>'+name+'</label> <input class="form-control" id="' + paramid + '" type="' + type + '" /></div>';
    }
}

function createRun(i) {
    return '<button id="run' + i +'" type="button" class="btn btn-default">Run</button>'
}