const Basket = window.httpVueLoader('./components/Basket.vue')
const Catalogue = window.httpVueLoader('./components/Catalogue.vue')
const Login = window.httpVueLoader('./components/Login.vue')

const routes = [
  { path: '/basket', component: Basket, name: 'basket' },
  { path: '/login', component: Login, name: 'login' },
  { path: '/catalogue', component: Catalogue, name: 'catalogue' }
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
    isAdmin: false
  },
  async mounted() {
    const res = await axios.get('/api/books')
    this.books = res.data;
  },
  methods: {
    async login(credentials) {
      try {
        const res = await axios.post('/api/login', credentials);
        this.userId = res.data.data.user_id;
        if (res.data.data.profil === "administrator") {
          this.isAdmin = true;
        }
        await this.getBasket();
        this.$router.push("/catalogue");
      } catch (err) {
        alert(err.response.data.message);
      }
      await this.getBasket();
    },
    async register(user) {
      try {
        const res = await axios.post('/api/register', user);
        this.userId = res.data.user_id;
        await this.getBasket();
        this.$router.push("/catalogue");
      } catch (err) {
        alert(err.response.data.message);
      }

    },
    async logout() {
      if (this.userId !== -1) {
        const res = await axios.post('/api/logout');
        this.basket = [];
        this.userId = -1;
        this.isAdmin = false;
        this.basketId = -1
      }
      this.$router.push("/login");
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
      console.log("deleteBook");
      if (this.isAdmin) {
        const res = await axios.delete(`/api/books/${book.book_id}`);
        const findIndexFunc = (element) => element.book_id === book.book_id;
        let index = this.books.findIndex(findIndexFunc);
        this.books.splice(index, 1);

        index = this.basket.findIndex(findIndexFunc);
        if (index !== undefined)
          this.basket.splice(index, 1);
      }
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
