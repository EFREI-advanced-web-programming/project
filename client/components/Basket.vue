<template>
    <div>

        <div class="w-75 mx-auto  shadow">
            <div class="row p-2">
                <div class="col-7">
                    <div class="h2 text-center">My basket</div>
                </div>
                <div class="col-5" v-if="basket.length > 0">
                    <button @click="validateBasket()" class="btn btn-success">Command</button>
                    <button @click="deleteBasket()" class="btn btn-danger">Clear my basket</button>
                </div>
            </div>


            <div v-if="basket.length === 0" class="text-center h4 p-2">You have no items in your basket</div>

            <div v-else>
                <table class="table table-striped">
                    <tbody>
                        <tr v-for="basketLine in basket" v-bind:key="basketLine.book_id">
                            <td class="row align-items-center p-1">
                                <div class="col-1"></div>
                                <div class="col-2">
                                    <div class="w-75 h-75 mx-auto my-auto">
                                        <img v-if="getBook(basketLine).url !== ''" class="img-fluid"
                                            :src="getBook(basketLine).url">
                                        <img v-else class="img-fluid"
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png" />
                                    </div>
                                </div>
                                <div class="col-8 h-auto" v-if="editingBasketLine.book_id !== basketLine.book_id">
                                    <div class="row">
                                        <div class="col-8 Name_stock_qte d-inline">
                                            <span v-text="getBook(basketLine).name"></span>
                                            <span> (Available : {{ getBook(basketLine).stock }})</span>
                                            <div>Amount commanded : {{ basketLine.qte }}</div>
                                        </div>
                                        <div class="col-4 edit_delete_buttons">
                                            <button class="btn btn-secondary btn-block"
                                                @click="editBasketLine(basketLine)">Edit
                                                quantity</button>
                                            <button class="btn btn-danger btn-block"
                                                @click="deleteItemFromBasket(basketLine)">Delete item</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-8 h-auto" v-else>
                                    <div class="row">
                                        <div class="col-4">
                                            New quantity: <input class="form-control" type="number"
                                                v-model="editingBasketLine.qte">
                                        </div>
                                        <div class="col-4">
                                            <button @click="updateItem(editingBasketLine)"
                                                class="btn btn-block btn-secondary">Confirm changes</button>
                                        </div>
                                        <div class="col-4">
                                            <button @click="exitEditBasketLine" class="btn btn-block btn-danger">Exit
                                                changes</button>
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
    </div>
</template>
<script>
module.exports = {
    // name : "basket",
    props: {
        books: { type: Array, default: [] },
        basket: { type: Array },
    },
    data() {
        return {
            editingBasketLine: {
                basket_line_id: -1,
                basket_id: -1,
                book_id: -1,
                qte: -1,
            },
        };
    },
    async mounted() {
    },
    methods: {
        getBook(basketLine) {
            let book = this.books.find(b => b.book_id === basketLine.book_id);
            // console.log(book);
            return book;
        },
        editBasketLine(basketLine) {
            this.editingBasketLine.basket_id = basketLine.basket_id;
            this.editingBasketLine.basket_line_id = basketLine.basket_line_id;
            this.editingBasketLine.book_id = basketLine.book_id;
            this.editingBasketLine.qte = basketLine.qte;
        },
        deleteItemFromBasket(basketLine) {
            if (confirm("Are you sure you want to delete this item?"))
                this.$emit('delete-item-from-basket', basketLine);
        },
        updateItem(basketLine) {
            console.log(basketLine);

            if (isNaN(basketLine.qte)) {
                alert("New quantity is not a number");
            } else if (basketLine.qte <= 0 || basketLine.qte > this.getBook(basketLine).stock) {
                alert("Please select a quantity between 1 and the available stock");
            } else {
                // console.log("Available stock: ");
                // console.log();
                basketLine.qte = Number.parseInt(basketLine.qte);
                let basketLineEmit = {
                    "basket_line_id": basketLine.basket_line_id,
                    "basket_id": basketLine.basket_id,
                    "book_id": basketLine.book_id,
                    "qte": basketLine.qte
                }
                this.$emit('update-item-at-basket', basketLineEmit);
                this.exitEditBasketLine();
            }
            // console.log(basketLine);

            //     basketLine.qte = Number.parseInt(basketLine.qte);
            //     this.$emit('update-item-at-basket',basketLine);
            //     this.exitEditBasketLine();
            // }
        },
        exitEditBasketLine() {
            this.editingBasketLine.basket_id = -1;
            this.editingBasketLine.basket_line_id = -1;
            this.editingBasketLine.book_id = -1;
            this.editingBasketLine.qte = -1;
        },
        validateBasket() {
            if (this.editingBasketLine.book_id !== -1) {
                alert("You have unsaved changes. Please save or discard them before validating your basket");
            } else {
                if(confirm("Are you sure you want to validate your basket? This action cannot be undone")){
                    this.$emit('validate-basket');
                }
                
            }

        },
        deleteBasket() {
            if (confirm("This will delete all items in your basket, do you want to continue?")) {
                this.$emit('clear-basket');
            }

        }

    }
};
</script>
<style>
</style>
