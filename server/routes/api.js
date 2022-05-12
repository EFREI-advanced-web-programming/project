const express = require('express')
const router = express.Router()
const articles = require('../data/articles.js')
const mysql = require('mysql2');
const bcrypt = require('bcrypt');


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "project_database"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL !");
})

class Panier {
  constructor () {
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.articles = []
  }
}

/**
 * Dans ce fichier, vous trouverez des exemples de requêtes GET, POST, PUT et DELETE
 * Ces requêtes concernent l'ajout ou la suppression d'articles sur le site
 * Votre objectif est, en apprenant des exemples de ce fichier, de créer l'API pour le panier de l'utilisateur
 *
 * Notre site ne contient pas d'authentification, ce qui n'est pas DU TOUT recommandé.
 * De même, les informations sont réinitialisées à chaque redémarrage du serveur, car nous n'avons pas de système de base de données pour faire persister les données
 */

/**
 * Notre mécanisme de sauvegarde des paniers des utilisateurs sera de simplement leur attribuer un panier grâce à req.session, sans authentification particulière
 */

// Enregistrement d'un utilisateur.
router.post("/login", async (req, res) =>{

  const password = req.body.password;
  const email = req.body.email;

  if(typeof email !== 'string' || typeof password !== 'string' || email === '' || password === ''){
    res.status(400).json({message : 'Vérifier les informations que vous avez saisies.'});
    return
  }
  let promiseQuery = new Promise(async (resolve, reject ) =>{
    console.log(email);
    var emailConnexion = [[email]];
    db.query('SELECT * FROM users WHERE email = ? ', [emailConnexion], async (err, res) => {
      console.log(res);
      if (err) reject(err);
      else{
          if(res.length <= 0){
            reject()
          }else{
            let cryptPassword = res[0].password;
            let samePAssword = await bcrypt.compare(password, cryptPassword);
            if(samePAssword){
              
              resolve({
                id : res[0].id_user,
                email: res[0].email
              });
            }else{
              reject();
            }
          } 
      }
    })
  })

    try{
      let requete = await promiseQuery;
      req.session.userId = requete.id;
      let response = {}
      response.data = requete;
       res.json(response)
    }catch (err){
      console.log(err)
      res.status(401).json({
        message : err
      })
    }
  })

router.use((req, res, next) => {
  // l'utilisateur n'est pas reconnu, lui attribuer un panier dans req.session
  if (typeof req.session.panier === 'undefined') {
    req.session.panier = new Panier()
  }
  next()
})

/*
 * Cette route doit retourner le panier de l'utilisateur, grâce à req.session
 */
router.get('/panier', (req, res) => {
  res.json(req.session.panier);
})

/*
 * Cette route doit ajouter un article au panier, puis retourner le panier modifié à l'utilisateur
 * Le body doit contenir l'id de l'article, ainsi que la quantité voulue
 */
router.post('/panier', (req, res) => {
  const articleID = articles.find(a => a.id === parseInt(req.body.id) )
  console.log(articleID)
  if(!articleID){
    res.status(400).json({ message: 'article ' + req.body.id + ' does not exist' })
    return
  }
  if(parseInt(req.quantity) <= 0){
    res.status(400).json({ message: 'Quantité non valide' })
    return
  }
  const arcticteAlreadyInBasket = req.session.panier.articles.find(a => a.id === parseInt(req.body.id))
  if(arcticteAlreadyInBasket){
    res.status(400).json({ message: 'Article déjà dans le panier... '})
    return
  }
  req.session.panier.articles.push({
    id: parseInt(req.body.id),
    quantity: req.body.quantity
  })
  res.json(req.session.panier)
})

/*
 * Cette route doit permettre de confirmer un panier, en recevant le nom et prénom de l'utilisateur
 * Le panier est ensuite supprimé grâce à req.session.destroy()
 */
router.post('/panier/pay', (req, res) => {
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  req.session.destroy()
  res.status(200).json({message: 'Merci ' + firstName + ' ' + lastName + ' pour votre achat !'})
})

/*
 * Cette route doit permettre de changer la quantité d'un article dans le panier
 * Le body doit contenir la quantité voulue
 */
router.put('/panier/:articleId', (req, res) => {
  const article = req.session.panier.articles.find(a => a.id === parseInt(req.params.articleId))
  if(!article){
    res.status(400).json({ message: 'Article non dans le panier impossible de le modifier ... '})
    return
  }
  if(req.body.quantity <= 0){
    res.status(400).json({message : 'Quantité non valide ... '})
    return
  }
  article.quantity = parseInt(req.body.quantity)

  res.status(200).json(req.session.panier)
})

/*
 * Cette route doit supprimer un article dans le panier
 */
router.delete('/panier/:articleId', (req, res) => {
  const article = req.session.panier.articles.find(a => a.id === parseInt(req.params.articleId))
  if(!article){
    res.status(400).json({ message: 'Article non dans le panier impossible de le supprimer ... '})
    return
  }
  console.log(article)
  const index = req.session.panier.articles.indexOf(article)
  console.log(index)
  req.session.panier.articles.splice(index, 1)
  res.status(200).json(req.session.panier)
})


/**
 * Cette route envoie l'intégralité des articles du site
 */
router.get('/articles', (req, res) => {
  db.query("SELECT * FROM articles", function(err,result) {
    if (err) throw err;
    res.json(result)
  })
})

/**
 * Cette route crée un article.
 * WARNING: dans un vrai site, elle devrait être authentifiée et valider que l'utilisateur est bien autorisé
 * NOTE: lorsqu'on redémarre le serveur, l'article ajouté disparait
 *   Si on voulait persister l'information, on utiliserait une BDD (mysql, etc.)
 */
router.post('/article', (req, res) => {
  const name = req.body.name
  const description = req.body.description
  const image = req.body.image
  const price = parseInt(req.body.price)

  // vérification de la validité des données d'entrée
  if (typeof name !== 'string' || name === '' ||
      typeof description !== 'string' || description === '' ||
      typeof image !== 'string' || image === '' ||
      isNaN(price) || price <= 0) {
    res.status(400).json({ message: 'bad request' })
    return
  }

  const article = {
    id: articles.length + 1,
    name: name,
    description: description,
    price: price,
    image: image
  }

  var sql = "INSERT INTO articles (name, description, price, image) VALUES ?";
  var value = [[article.name, article.description, article.price, article.image]];

  db.query(sql, [value], function(err, result) {
    if (err) throw err;
    res.json(article)
  });
})

/**
 * Cette fonction fait en sorte de valider que l'article demandé par l'utilisateur
 * est valide. Elle est appliquée aux routes:
 * - GET /article/:articleId
 * - PUT /article/:articleId
 * - DELETE /article/:articleId
 * Comme ces trois routes ont un comportement similaire, on regroupe leurs fonctionnalités communes dans un middleware
 */
function parseArticle (req, res, next) {
  const articleId = parseInt(req.params.articleId)

  // si articleId n'est pas un nombre (NaN = Not A Number), alors on s'arrête
  if (isNaN(articleId)) {
    res.status(400).json({ message: 'articleId should be a number' })
    return
  }
  // on affecte req.articleId pour l'exploiter dans toutes les routes qui en ont besoin
  req.articleId = articleId

  const article = articles.find(a => a.id === req.articleId)
  if (!article) {
    res.status(404).json({ message: 'article ' + articleId + ' does not exist' })
    return
  }
  // on affecte req.article pour l'exploiter dans toutes les routes qui en ont besoin
  req.article = article
  next()
}

router.route('/article/:articleId')
  /**
   * Cette route envoie un article particulier
   */
  .get(parseArticle, (req, res) => {
    // req.article existe grâce au middleware parseArticle
    res.json(req.article)
  })

  /**
   * Cette route modifie un article.
   * WARNING: dans un vrai site, elle devrait être authentifiée et valider que l'utilisateur est bien autorisé
   * NOTE: lorsqu'on redémarre le serveur, la modification de l'article disparait
   *   Si on voulait persister l'information, on utiliserait une BDD (mysql, etc.)
   */
  .put(parseArticle, (req, res) => {
    const name = req.body.name
    const description = req.body.description
    const image = req.body.image
    const price = parseInt(req.body.price)

    req.article.name = name
    req.article.description = description
    req.article.image = image
    req.article.price = price
    res.send()
  })

  .delete(parseArticle, (req, res) => {
    const index = articles.findIndex(a => a.id === req.articleId)

    articles.splice(index, 1) // remove the article from the array
    res.send()
  })

module.exports = router
