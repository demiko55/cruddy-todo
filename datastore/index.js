const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');

//var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) => {
      if (err) {
        throw 'error writing file';
      } else {
        callback(null, { id, text: text });
        //items.push({id: id, text: text});
      }
    });
  });
};

exports.readAll = (callback) => {
  // var re = [];
  // fs.readdirSync(exports.dataDir).forEach(file => {
  //   var idIndex = file.indexOf('.');
  //   var id = file.slice(0, idIndex);
  //   var text = fs.readFileSync(path.join(exports.dataDir, `${file}`));
  //   //console.log('text here', text);
  //   text = querystring.parse(text);// text is always {}???
  //   re.push({ id: id, text: id });
  // });
  // //console.log('re', re);
  // callback(null, re);

  var readdirAsync = Promise.promisify(fs.readdir);
  return readdirAsync(exports.dataDir)
    .then(
      (files) =>{
        const data = files.map((file) => {
          const id = path.basename(file, '.txt');
          return { id, text: id };
        });
        Promise.all(data).then(
          (data) =>{
            callback(null, data);
          }
        );
      }
    )
    .catch(
      (err) =>{
        console.log('readall err', err.messages);
      }
    );

  // fs.readdir(exports.dataDir, (err, files) => {
  //   if (err) {
  //     callback(err, null);
  //   } else {
  //     const data = files.map((file) => {
  //       const id = path.basename(file, '.txt');
  //       return { id, text: id};
  //     });
  //     callback(null, data);
  //   }
  // });
};

exports.readOne = (id, callback) => {

  // try {
  //   var data = fs.readFileSync(path.join(exports.dataDir, `${id}.txt`)).toString();
  //   console.log('readFilesync data', data);
  //   callback(null, { id: id, text: data });

  // } catch (e) {
  //   callback(new Error(`No item with id: ${id}`));
  // }

  fs.readFile(path.join(exports.dataDir, `${id}.txt`), 'utf8', (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, { id: id, text: data });
    }
  });
};

exports.update = (id, text, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) => {
        if (err) {
          throw 'err writing file';
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(path.join(exports.dataDir, `${id}.txt`), (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
