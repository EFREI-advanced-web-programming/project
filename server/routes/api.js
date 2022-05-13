const express = require('express')
const router = express.Router()
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "project_database"
});
db.connect(function (err) {
  if (err) throw err;
  console.log("Connected to MySQL database !");
})
/* template for allowing only validated users 
if (req.session.userId === null) {
      res.status(403).json({ message: "You don't have permission" });
      return
    }
    db.query(`Select user_id, profil FROM user WHERE user_id =${req.session.userId}`, async (err, dbRes) => {
      if (err) {
        res.status(400).json({ message: err });
        return
      }
      if (dbRes[0].profil !== "administrator") {
        res.status(403).json({ message: "You don't have permission" });
        return
      }
    
        // Your code here
      
    })
*/

router.use((req, res, next) => {
  // If the req.session.userId is not defined, set it to null
  if (typeof req.session.userId === 'undefined') {
    req.session.userId = null
  }
  next()
})

//to login, email and password must be sent in the body
router.post("/login", async (req, res) => {
  // if (req.session.userId !== null) {
  //   res.status(400).json({ message: "There is already a user logged. Please logout first" });
  //   return
  // }

  const password = req.body.password;
  const login = req.body.login;

  if (typeof login !== 'string' || typeof password !== 'string' || login === '' || password === '') {
    res.status(400).json({ message: 'The data is not valid, please try again.' });
    return
  }
  let promiseQuery = new Promise(async (resolve, reject) => {
    db.query(`SELECT * FROM user WHERE login = "${login}" `, async (err, res) => {
      if (err) {
        reject(err);
      }
      else {
        if (res.length <= 0) {
          reject("Invalid credentials")
        } else {
          let cryptPassword = res[0].password;
          let samePAssword = await bcrypt.compare(password, cryptPassword);
          if (samePAssword) {
            resolve({
              user_id: res[0].user_id,
              login: res[0].login
            });
          } else {
            reject("Invalid credentials");
          }
        }
      }
    })
  })

  try {
    let requete = await promiseQuery;
    req.session.userId = requete.user_id;
    let response = {}
    response.data = requete;
    res.status(200).json(response)
  } catch (err) {
    res.status(401).json({
      message: err
    })
  }
});
router.post("/register", async (req, res) => {
  // if (req.session.userId !== null) {
  //   res.status(400).json({ message: "There is already a user logged. Please logout first" });
  //   return
  // }
  let name = req.body.name;
  let lastname = req.body.lastname;
  let login = req.body.login;
  let password = req.body.password;
  let profil = "student";


  if (typeof name !== "string" || typeof login !== 'string' || typeof password !== 'string' || name === '' || login === '' || password === '') {
    res.status(400).json({ message: 'Vérifier les informations que vous avez saisies.' });
    return
  }
  db.query(`SELECT * FROM user WHERE login = "${login}" `, async (err, dbRes) => {
    if (err) {

    }
    if (dbRes.length > 0) {
      res.status(400).json({ message: "the login is already in use" });
      return
    }
    let cryptPassword;
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) {
        res.status(400).json(err);
        return
      }
      cryptPassword = hash;

      db.query(`Insert into user(name,lastname,login,password,profil) values ("${name}",
    "${lastname}","${login}","${cryptPassword}","student")`, async (err, dbRes2) => {
        if (err) {
          res.status(400).json(err);
          return
        }
        let user = {
          "user_id": dbRes2["insertId"],
          "name": name,
          "lastname": lastname,
          "login": login,
          "profil": profil
        };
        req.session.userId = dbRes2["insertId"];
        res.status(201).json(user);
      })
    });
  })
})
router.post("/logout", async (req, res) => {
  // if (req.session.userId === null) {
  //   res.status(400).json({ message: "nobody was logged in" });
  //   return
  // } else {
  req.session.userId = null;
  res.status(200).json({ message:"logged out"});
  // }
});


router.route("/books")
  // get All the books in the database
  .get((req, res) => {
    db.query("Select * from book", async (err, dbRes) => {
      if (err) {
        res.status(400).json({ message: err })
        return
      }
      res.status(200).json(dbRes);
    })
  })
  /* Add a new book to the database.
   * The body must contain name and stock, and optionally an url
   * An administrator must be logged in order to perform this operation 
   */
  .post((req, res) => {
    if (req.session.userId === null) {
      res.status(403).json({ message: "You don't have permission" });
      return
    }
    db.query(`Select user_id, profil FROM user WHERE user_id =${req.session.userId}`, async (err, dbRes) => {
      if (err) {
        res.status(400).json({ message: err });
        return
      }
      if (dbRes[0].profil !== "administrator") {
        res.status(403).json({ message: "You don't have permission" });
        return
      }
      let name = req.body.name;
      let stock = req.body.stock;
      let url = req.body.url;
      if (typeof url === "undefined") url = "";
      if (typeof name === "undefined" || name === "") {
        res.status(400).json({ message: "body parameter 'name' is not correct" })
        return
      }
      if (typeof stock === "undefined" || isNaN(stock) || Number.parseInt(stock) <= 0) {
        res.status(400).json({ message: "'stock' must be a positive integer" })
        return
      }
      db.query(`INSERT INTO book(name,stock,url) VALUES ("${name}",${stock},"${url}")`, async (err, dbRes) => {
        if (err) {
          res.status(400).json({ message: err })
          return
        }
        let book = {
          "book_id": dbRes.insertId,
          "name": name,
          "stock": Number.parseInt(stock),
          "url": url
        }
        res.status(201).json(book);
      })

    })



  });

router.route("/books/:book_id")
  /* Update a given book.
   * The body must contain a new name and a new stock. 
   * If an url is not given, il will be set to "" 
   * An administrator must be logged in order to perform this operation 
   */
  .put((req, res) => {
    if (req.session.userId === null) {
      res.status(403).json({ message: "You don't have permission" });
      return
    }
    db.query(`Select user_id, profil FROM user WHERE user_id =${req.session.userId}`, async (err, dbRes) => {
      if (err) {
        res.status(400).json({ message: err });
        return
      }
      if (dbRes[0].profil !== "administrator") {
        res.status(403).json({ message: "You don't have permission" });
        return
      }
      let name = req.body.name;
      let stock = req.body.stock;
      let url = req.body.url;
      let bookId = req.params.book_id;
      if (isNaN(bookId)) {
        res.status(400).json({ message: "the book id must be an integer number" })
      }
      if (typeof url === "undefined") url = "";
      if (typeof name === "undefined" || name === "") {
        res.status(400).json({ message: "New name can not be empty" })
        return
      }
      if (typeof stock === "undefined" || isNaN(stock) || Number.parseInt(stock) <= 0) {
        res.status(400).json({ message: "New stock must be a positive integer" })
        return
      }
      db.query(`Update book set name = "${name}", stock = ${stock}, url = "${url}" WHERE book_id = ${bookId};`, async (err, dbRes) => {
        if (err) {
          res.status(400).json({ message: err })
          return
        }
        if (dbRes.affectedRows === 1) {
          res.status(200).json({ message: "Resource updated successfully" });
        }
        else if (dbRes.affectedRows === 0) {
          res.status(400).json({ message: "Resource not found" });
        }
      })
    })
  })
  /* Remove a book from the database.
   * An administrator must be logged in order to perform this operation 
   */
  .delete((req, res) => {
    if (req.session.userId === null) {
      res.status(403).json({ message: "You don't have permission" });
      return
    }
    db.query(`Select user_id, profil FROM user WHERE user_id =${req.session.userId}`, async (err, dbRes) => {
      if (err) {
        res.status(400).json({ message: err });
        return
      }
      if (dbRes[0].profil !== "administrator") {
        res.status(403).json({ message: "You don't have permission" });
        return
      }
      let bookId = req.params.book_id;
      if (isNaN(bookId)) {
        res.status(400).json({ message: "the book id must be an integer number" })
        return
      }
      db.query(`DELETE FROM book WHERE book_id = ${bookId}`, async (err, dbRes) => {
        if (err) {
          res.status(400).json({ message: err });
          return
        }
        if (dbRes.affectedRows === 1) {
          res.status(204).json({ message: "Resource deleted successfully" });
          return
        }
        else {
          res.status(400).json({ message: "The resource was not found" });
          return
        }
      })
    })
  });


router.route("/basket")
  /*
   * This method returns the current basket of the logged user, a json containing all the basket_line he has in his basket
   * You must be logged to perform this operation
   */
  .get((req, res) => {
    if (req.session.userId === null) {
      res.status(401).json({ message: "You are not logged in" });
      return
    } //fetch the basket of the user
    db.query(`Select * from basket where user_id= ${req.session.userId}`, async (err, dbRes) => {
      if (err) {
        res.status(400).json({ message: err })
        return
      }
      if (dbRes <= 0) { //the user has not a basket yet
        db.query(`INSERT INTO basket(user_id,creation_date) VALUES (${req.session.userId},NOW())`, async (err, dbRes2) => {
          if (err) {
            res.status(400).json({ message: err })
            return
          }
          res.status(200).json({});
        });
      } else { //the user already has a basket, we return the books he has
        db.query(`select basket_line.* from basket natural join basket_line where user_id=${req.session.userId};`, async (err, dbRes2) => {
          if (err) {
            res.status(400).json({ message: err })
            return
          }
          res.status(200).json(dbRes2);
        });
      }
    })
  })
  /* Add a new product to the basket
   * the body must contain a book_id and a qte
   * A given basket can only contain a book_id ONCE (UNIQUE (book_id,basket_id))
   * You must be logged to perform this operation
   */
  .post((req, res) => {
    if (req.session.userId === null) {
      res.status(401).json({ message: "You are not logged in" });
      return
    }
    // make sure the parameters given are correct
    let bookId = req.body.book_id;
    let qte = req.body.qte;
    if (typeof qte === "undefined" || isNaN(qte) || Number.parseInt(qte) <= 0) {
      res.status(400).json({ message: "qte must be an positive integer" });
      return
    }
    if (typeof bookId === "undefined" || isNaN(bookId) || Number.parseInt(bookId) <= 0) {
      res.status(400).json({ message: "book_id must be an positive integer" });
      return
    }
    //fetch the basket of the user
    db.query(`Select * from basket where user_id= ${req.session.userId}`, async (err, dbRes) => {
      if (err) {
        res.status(400).json({ message: err })
        return
      }
      if (dbRes.length === 0) { //the user has not a basket yet
        db.query(`INSERT INTO basket(user_id,creation_date) VALUES (${req.session.userId},NOW())`, async (err, dbRes2) => {
          if (err) {
            res.status(400).json({ message: err })
            return
          }
          let basketId = dbRes2.insertId;
          db.query(`INSERT INTO basket_line(basket_id, book_id, qte) VALUES (${basketId},${bookId},${qte})`, async (err, dbRes2) => {
            if (err) {
              res.status(400).json({ message: err })
              return
            }
            let basketLine = {
              "basket_line_id": dbRes2.insertId,
              "book_id": bookId,
              "qte": qte,
              "basket_id": basketId
            }
            res.status(201).json(basketLine);
          })
        })
      }
      else { //get the basketId and add a basket_line
        let basketId = dbRes[0].basket_id;
        db.query(`INSERT INTO basket_line(basket_id, book_id, qte) VALUES (${basketId},${bookId},${qte})`, async (err, dbRes2) => {
          if (err) {
            res.status(400).json({ message: err })
            return
          }
          let basketLine = {
            "basket_line_id": dbRes2.insertId,
            "book_id": bookId,
            "qte": qte,
            "basket_id": basketId
          }
          res.status(201).json(basketLine);
        })
      }
    });
  })
  /* Destroy the current basket of the user 
   * You must be logged in to perform this operation
   */
  .delete((req, res) => {
    if (req.session.userId === null) {
      res.status(401).json({ message: "You are not logged in" });
      return
    }

    db.query(`DELETE FROM basket WHERE user_id = ${req.session.userId}`, async (err, dbRes) => {
      if (err) {
        res.status(400).json({ message: err })
        return
      }
      if (dbRes.affectedRows === 1) {
        res.status(204).json({ message: "Resource deleted successfully" });
      } else {
        res.status(400).json({ message: "Resource not found" });
      }

    })
  })

router.route("/basket/:book_id")
  .delete((req, res) => {
    if (req.session.userId === null) {
      res.status(403).json({ message: "You don't have permission" });
      return
    }
    let bookId = req.params.book_id;
    if (isNaN(bookId)) {
      res.status(400).json({ message: "the book id must be an integer number" })
      return
    }
    db.query(`SELECT basket_id FROM basket WHERE user_id=${req.session.userId}`, async (err, dbRes) => {
      if (err) {
        res.status(400).json({ message: err });
        return
      }
      let basketId = dbRes[0].basket_id;
      db.query(`DELETE FROM basket_line WHERE basket_id=${basketId} AND book_id =${bookId}`, async (err, dbRes2) => {
        if (err) {
          res.status(400).json({ message: err });
          return
        }
        if (dbRes2.affectedRows === 1) {
          res.status(204).json({ message: "Resource deleted successfully" });
        } else {
          res.status(400).json({ message: "Resource not found" });
        }
      })
    })


    // db.query(`DELETE FROM book WHERE book_id = ${bookId}`, async (err, dbRes) => {
    //   if (err) {
    //     res.status(400).json({ message: err });
    //     return
    //   }
    //   if (dbRes.affectedRows === 1) {
    //     res.status(204).json({ message: "Resource deleted successfully" });
    //     return
    //   }
    //   else {
    //     res.status(400).json({ message: "The resource was not found" });
    //     return
    //   }
    // })
  })
  .put((req, res) => {
    if (req.session.userId === null) {
      res.status(403).json({ message: "You don't have permission" });
      return
    }
    let qte = req.body.qte;
    if (typeof qte === "undefined" || isNaN(qte) || Number.parseInt(qte) <= 0) {
      res.status(400).json({ message: "qte must be an positive integer" });
      return
    }
    let bookId = req.params.book_id;
    if (isNaN(bookId)) {
      res.status(400).json({ message: "the book id must be an integer number" })
      return
    }
    db.query(`SELECT basket_id from basket WHERE user_id = ${req.session.userId}`, async (err, dbRes) => {
      if (err) {
        res.status(400).json({ message: err });
        return
      }
      let basketId = dbRes[0].basket_id;
      db.query(`UPDATE basket_line SET qte = ${qte} WHERE basket_id = ${basketId} AND book_id = ${bookId}`, async (err, dbRes2) => {
        if (err) {
          res.status(400).json({ message: err });
          return
        }
        if (dbRes2.affectedRows === 1) {
          res.status(200).json({ message: "Resource updated successfully" });
        }
        else if (dbRes2.affectedRows === 0) {
          res.status(400).json({ message: "Resource not found" });
        }
      })
    })
  })
router.post("/basket/validate", (req, res) => {
  if (req.session.userId === null) {
    res.status(401).json({ message: "You are not logged in" });
    return
  } //fetch the basket of the user
  db.query(`Select * from basket where user_id= ${req.session.userId}`, async (err, dbRes) => {
    if (err) {
      res.status(400).json({ message: err })
      return
    }
    if (dbRes <= 0) { //the user has not a basket yet 
      res.status(400).json({ message: "You have not a basket to validate" });

    } else { //the user already has a basket, we return the books he has
      console.log("before await")
      let basketLines = await db.promise().query(`select basket_line.* from basket natural join basket_line where user_id=${req.session.userId};`);
      console.log("after await")


      for (let basketLine of basketLines[0]) {
        /* for each basketLine: 
         * - get the stock of the book
         * - substract the qte and if it is not valid return an error
         * - otherwise remove the basketline
         */
        let queryResponse = await db.promise().query(`SELECT stock from book WHERE book_id = ${basketLine.book_id}`);
        let stock = queryResponse[0][0].stock;
        stock -= basketLine.qte;
        if (stock < 0) { // If the stock is negative, raise an error
          res.status(400).json({ message: `The library has not enough stock for one or more books` });
          return
        } // the new stock is valid
        let response = await db.promise().query(`UPDATE BOOK set stock = ${stock} WHERE book_id = ${basketLine.book_id};`);
        await db.promise().query(`DELETE FROM basket_line WHERE basket_id = ${basketLine.basket_id} AND book_id  = ${basketLine.book_id}`)
      }

      //after deleting all the basketLines, delete the basket itself
      let deleteBasketResponse = await db.promise().query(`DELETE FROM basket WHERE user_id = ${req.session.userId}`);
      if (deleteBasketResponse[0].affectedRows === 1) {
        res.status(204).json({ message: "Your basket has been correctly processed" });
      } else {
        res.status(400).json({ message: "Your basket could not be deleted, please try again" });
      }
    }
  })
})
module.exports = router