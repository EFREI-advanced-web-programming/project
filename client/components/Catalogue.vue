<template>
    <div>
        <div class="w-75 mx-auto shadow">
            <div class="row p-2">
                <div class="col-7">
                    <div class="h2 text-center">Catalogue</div>
                </div>
                <div class="col-5">
                    <div class="input-group">
                        <div class="form-outline">
                            <input type="search" placeholder="Search" v-model="searchString" class="form-control" />
                        </div>
                        <button type="button" class="btn btn-primary">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <table class="table table-striped">
                    <tbody>
                        <tr v-for="book in books" v-bind:key="book.book_id">
                            <td class="row align-items-center p-1" v-if="book.name.includes(searchString)">
                                <div class="col-1"></div>
                                <div class="col-2">
                                    <div class="w-75 h-75 mx-auto my-auto">
                                        <img v-if="book.url !== ''" class="img-fluid" :src="book.url">
                                        <img v-else class="img-fluid"
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png" />
                                    </div>
                                </div>
                                <div class="col-8 h-auto">
                                    <div class="row">
                                        <div class="col-8 Name_stock d-inline">
                                            <span v-text="book.name"></span>
                                            <span> (Available : {{ book.stock }})</span>
                                            <div v-if="book.book_id === addingBook.book_id">
                                                <div class="row">
                                                    <div class="col-6">
                                                        <input type="number" class="form-control"
                                                            v-model="addingBook.qte">
                                                    </div>
                                                    <div class="col-6">
                                                        <button @click="addToBasket()" class="btn btn-primary">Add to
                                                            basket</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="userid !== -1" class="col-4 edit_delete_buttons">
                                            <button v-if="book.stock === 0" @click="showFormToAddBookToBasket(book)"
                                                disabled class="btn btn-secondary btn-block">Loan</button>
                                            <button v-else-if="isInBasket(book.book_id)"
                                                class="btn btn-danger btn-block"
                                                @click="removeBookFromBasket(book)">Remove from basket</button>
                                            <button v-else @click="showFormToAddBookToBasket(book)"
                                                class="btn btn-secondary btn-block">Loan</button>
                                            <button v-if="isadmin" @click="deleteBook(book)"
                                                class="btn btn-danger btn-block">Delete item</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-1"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <br>
        <div v-if="isadmin" class="container w-75 mx-auto shadow">
            <div class="row">
                <div class="col-12 text-center h3">Add a book to the database</div>
            </div>
            <div class="row">
                <div class="col-4">
                    Name: <input type="text" v-model="newBook.name">
                </div>
                <div class="col-4">
                    Stock: <input type="number" v-model="newBook.stock">
                </div>
                <div class="col-4">
                    url: <input type="text" v-model="newBook.url">
                </div>
            </div>
            <div class="row p-1">
                <div class="col-12 text-center">
                    <button @click="addBook()" class="btn btn-success">Create book</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
module.exports = {
    props: {
        books: { type: Array, default: [] },
        basket: { type: Array },
        isadmin: { type: Boolean, default: false },
        userid: { type: Number }
    },
    data() {
        return {
            addingBook: {
                book_id: -1,
                qte: -1
            },
            newBook: {
                stock: 0,
                url: "",
                name: ""
            },
            searchString: ""

        };
    },
    async mounted() {
    },
    methods: {
        isInBasket(bookId) {
            return this.basket.find(el => el.book_id === bookId) !== undefined;
        },
        getBook(basketLine) {
            let book = this.books.find(b => b.book_id === basketLine.book_id);
            return book;
        },
        cleanAddingBook() {
            this.addingBook.book_id = -1;
            this.addingBook.qte = -1;
        },
        addToBasket() {
            if (this.addingBook.qte <= 0 || this.addingBook.qte > this.getBook(this.addingBook).stock) {
                alert("The quantity must be between 1 and the available stock");
            } else if (this.isInBasket(this.addingBook.book_id)) {
                alert("Book already in the basket");
            } else {
                this.$emit('add-item-to-basket', this.addingBook);
                this.cleanAddingBook();
            }
        },
        showFormToAddBookToBasket(book) {
            this.addingBook.book_id = book.book_id;
            this.addingBook.qte = 0;
        },
        removeBookFromBasket(book) {
            if (confirm("Are you sure you want to remove this item?"))
                this.$emit('remove-book-from-basket', book);
        },
        deleteBook(book) {
            if (confirm("Do you want to delete this book from the library?"))
                this.$emit('delete-book', book);
        },
        addBook() {
            if (isNaN(this.newBook.stock)) {
                alert("Stock must be a positive integer");
            } else {
                this.newBook.stock = Number.parseInt(this.newBook.stock);
                if (this.newBook.stock <= 0) {
                    alert("Stock must be a positive integer");
                } else {
                    this.$emit('add-book', this.newBook);
                    this.clearNewBook();
                }
            }
        },
        clearNewBook() {
            this.newBook.name = "",
                this.newBook.stock = 0;
            this.newBook.url = "";
        }
    }
}
</script>