const argv = require('minimist')(process.argv.slice(2));
const checker = require('license-checker');
const makeDir = require("make-dir");
const path = require('path')
const Table = require('cli-table2');
const { createObjectCsvWriter } = require('csv-writer');

function init() {
  checker.init({
    ...argv,
    start: argv["path"] || "./",
    customFormat: {
      name: "",
      version: "",
      description: false,
      repository: "",
      publisher: false,
      email: false,
      url: "",
      licenses: "",
      licenseFile: false,
      licenseText: false,
      licenseModified: false,
      path: false,
      copyright: false
    }
  }, function (err, packages) {
    if (err) {
      console.log(err);
    } else {
      exec(packages);
    }
  });
}

function exec(packages) {
  const dataFormat = {
    head: ['Module', 'Version', 'License', 'Home Page'],
    colWidths: [25, 10, 20, 60],
    colAligns: ["center", "center", "center", "left"],
    style: { head: ['white'] },
  };
  const table = new Table(dataFormat);
  const csvRecords = []

  for (let id in packages) {
    const obj = packages[id];
    const name = obj["name"];
    const version = obj["version"];
    const url = obj["url"] || obj["repository"] || "UNKNOWN";
    const license = obj["licenses"];
    table.push([name, version, license, url]);
    csvRecords.push({
      Module: name,
      Version: version,
      License: license,
      "Home Page": url
    })
  }

  if (argv["print"] !== false) {
    console.log(table.toString());
  }

  if (argv.csv) {
    generateCSV(dataFormat, csvRecords)
  }
}

async function generateCSV(dataFormat, csvRecords) {
  const out = argv.out;
  if (out) {
    await makeDir(path.dirname(out));
  }

  const csvWriter = createObjectCsvWriter({
    path: argv.out || "out.csv",
    header: dataFormat.head,
    encoding: 'utf8',
    append: false,
    header: Object.keys(csvRecords[0]).map(v => ({ id: v, title: v })) // Header==Keys
  });
  await csvWriter.writeRecords(csvRecords);
  console.log(`${argv.out} generated.`);
}

module.exports = init
