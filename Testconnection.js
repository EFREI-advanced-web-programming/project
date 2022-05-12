const mysql= require('mysql');
const db=mysql.createConnection(
    {
        host : "127.0.0.1",
        user : "root",
        password: "root",
        database : "bd_tp5"

    }
);

db.connect(function(err){
    if(err) throw err;
    console.log("base de données connectée");
}
);