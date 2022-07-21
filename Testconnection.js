const mysql = require('mysql2');
const db = mysql.createConnection(
    {
        host: "127.0.0.1",
        user: "root",
        password: "root",
        database: "project_database"

    }
);


db.connect(function (err) {
    if (err) throw err;
    console.log("base de données connectée");
}
);

// db.query("SHOW TABLES;", async (err, res) => {
//     console.log(res);
// });

// db.query("Select * from user;", async (err, res) => {
//     console.log(res);
// });