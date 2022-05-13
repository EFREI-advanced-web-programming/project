// const Home = window.httpVueLoader('./components/Home.vue')
// const Panier = window.httpVueLoader('./components/Panier.vue')
// const AddArticle= window.httpVueLoader('./components/addArticle.vue')
// const Login = window.httpVueLoader('./components/Login.vue')

const routes = [
  // { path: '/', component: Home, name: 'home' },
  // { path: '/panier', component: Panier, name: 'panier' },
  // {path: '/login', component: Login, name: 'login'}
]

const router = new VueRouter({
  routes
})

var app = new Vue({
  router,
  el: '#app',
  data: {
    books: [],
    basket: [],
    basketId: -1,
    userId: -1,
  },
  async mounted() {
    // let credentials = {
    //   "login": "admin1",
    //   "password": "1234"
    // }
    // let logout = await this.logout();
    // let login = await this.login(credentials);
 
    const res = await axios.get('/api/books')
    this.books = res.data;
 
    // let book = {
    //   "book_id": 2,
    //   "name": "update boowdawdawdsdawds",
    //   "url": "",
    //   "stock": 12
    // };
    // await this.addBook(book);
    // await this.updateBook(book);
    // await this.deleteBook(book);


  },
  methods: {
    async login(credentials) {
      if (this.userId === -1) {
        const res = await axios.post('/api/login', credentials);
        this.userId = credentials.user_id;
      }
      await this.getBasket();
    },
    async register(user) {
      if (this.userId === -1) {
        const res = await axios.post('/api/register', user);
        this.userId = res.data.user_id;
      }
      await this.getBasket();
    },
    async logout() {
      if (this.userId !== -1) {
        const res = await axios.post('/api/logout');
        this.basket = [];
        this.userId = -1;
        this.basketId = -1
      }
    },
    async getBooks() {
      const res = await axios.get('/api/books');
      this.books = res.data;
    },
    async addBook(book) {
      const res = await axios.post('/api/books', book);
      this.books.push(res.data);
    },
    async updateBook(book) {
      const res = await axios.put(`/api/books/${book.book_id}`, book);
      const findIndexFunc = (element) => element.book_id === book.book_id;
      let index = this.books.findIndex(findIndexFunc);
      Vue.set(this.books, index, book);
    },
    async deleteBook(book) {
      const res = await axios.delete(`/api/books/${book.book_id}`);
      const findIndexFunc = (element) => element.book_id === book.book_id;
      let index = this.books.findIndex(findIndexFunc);
      this.books.splice(index, 1);
    },
    async getBasket() {
      const res = await axios.get('/api/basket');
      this.basket = res.data;
    },
    async addItemToBasket(basketLine) {
      const res = await axios.post('/api/basket', basketLine);
      this.basket.push(res.data);
    },
    async deleteBasket() {
      const res = await axios.delete('/api/basket');
      this.basket = [];
    },
    async deleteItemFromBasket(basketLine) {
      const res = await axios.delete(`/api/basket/${basketLine.book_id}`, basketLine);
      const findIndexFunc = (element) => element.book_id === basketLine.book_id;
      let index = this.basket.findIndex(findIndexFunc);
      this.basket.splice(index, 1);
    },
    async updateItemAtBasket(basketLine) {
      const res = await axios.put(`/api/basket/${basketLine.book_id}`, basketLine);
      const findIndexFunc = (element) => element.book_id === basketLine.book_id;
      let index = this.basket.findIndex(findIndexFunc);
      basketLine.basket_line_id = this.basket[index].basket_line_id;
      basketLine.basket_id = this.basket[index].basket_id;
      Vue.set(this.basket, index, basketLine);
    },
    async validateBasket() {
      const res = await axios.post('/api/basket/validate');
      this.basket = [];
      await this.getBooks();
    }
  }
})
