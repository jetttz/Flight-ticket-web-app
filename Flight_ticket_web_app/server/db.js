const Pool =require('pg').Pool;

var fs=require('fs');



var getstuff = fs.readFileSync('password.txt','utf8');

var getname = getstuff.split('\n');

const pool = new Pool({
  host: 'code.cs.uh.edu',
  user: getname[0],
  password: getname[1],
  port: 5432,
  database: 'COSC3380'
});

module.exports = pool;

