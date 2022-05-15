<template>

<<<<<<< Updated upstream
<header>
  <h1>EFREI LIBRARY</h1>
  <h2>Welcome to your library</h2>
  </header>

  <div class="card">
    <h1 class="card__title" v-if="mode == 'login'">Connexion</h1>
    <h1 class="card__title" v-else>Inscription</h1>
    <p class="card__subtitle" v-if="mode == 'login'">Tu n'as pas encore de compte ? <span class="card__action" @click="switchToCreateAccount()">Créer un compte</span></p>
    <p class="card__subtitle" v-else>Tu as déjà un compte ? <span class="card__action" @click="switchToLogin()">Se connecter</span></p>
    <div class="form-row">
      <input v-model="email" class="form-row__input" type="text" placeholder="Adresse mail"/>
    </div>
    <div class="form-row" v-if="mode == 'create'">
      <input v-model="prenom" class="form-row__input" type="text" placeholder="Prénom"/>
      <input v-model="nom" class="form-row__input" type="text" placeholder="Nom"/>
    </div>
    <div class="form-row">
      <input v-model="password" class="form-row__input" type="password" placeholder="Mot de passe"/>
    </div>
    <div class="form-row" v-if="mode == 'login' && status == 'error_login'">
      Adresse mail et/ou mot de passe invalide
    </div>
    <div class="form-row" v-if="mode == 'create' && status == 'error_create'">
      Adresse mail déjà utilisée
    </div>
    <div class="form-row">
      <button @click="login()" class="button" :class="{'button--disabled' : !validatedFields}" v-if="mode == 'login'">
        <span v-if="status == 'loading'">Connexion en cours...</span>
        <span v-else>Connexion</span>
      </button>
      <button @click="createAccount()" class="button" :class="{'button--disabled' : !validatedFields}" v-else>
        <span v-if="status == 'loading'">Création en cours...</span>
        <span v-else>Créer mon compte</span>
      </button>
=======

  <div class="container shadow">
    <div class="row p-2" v-if="showLogin">
      <div class="col-12 text-center h3">LOGIN</div>
      <div class="col-4">
        <input type="text" v-model="loginData.login" placeholder="login" class="form-control">
      </div>
      <div class="col-4">
        <input type="password" v-model="loginData.password" placeholder="password" class="form-control">
      </div>
      <div class="col-4">
        <button @click="login()" class="btn btn-primary btn-block">LOGIN</button>
      </div>
    </div>

    <div class="row p-2" v-else>
      <div class="col-12 text-center h3">REGISTER</div>
      <div class="col-6 p-1">
        <input type="text" v-model="registerData.name" placeholder="name" class="form-control">
      </div>
      <div class="col-6 p-1">
        <input type="text" v-model="registerData.lastname" placeholder="lastname" class="form-control">
      </div>
      <div class="col-6 p-1">
        <input type="password" v-model="registerData.password" placeholder="password" class="form-control">
      </div>
      <div class="col-6 p-1">
        <input type="password" v-model="registerData.password2" placeholder="rewrite your password"
          class="form-control">
      </div>
      <div class="col-6 p-1">
        <input type="text" v-model="registerData.login" placeholder="login" class="form-control">
      </div>
      <div class="col-6 p-1">
        <button @click="register()" class="btn btn-primary btn-block">REGISTER</button>
      </div>
    </div>

    <div class="row p-2">
      <div class="col-12">
        <button v-if="showLogin" @click="toogleForm()" class="btn btn-outline-primary btn-block">Create an
          account</button>
        <button v-else @click="toogleForm()" class="btn btn-outline-primary btn-block">Already an account?
          Login</button>
      </div>
>>>>>>> Stashed changes
    </div>
  </div>
</template>

<script>
<<<<<<< Updated upstream

import { mapState } from 'vuex'

export default {
  name: 'Login',
  data: function () {
    return {
      mode: 'login',
      email: '',
      prenom: '',
      nom: '',
      password: '',
    }
  },
  mounted: function () {
    if (this.$store.state.user.userId != -1) {
      this.$router.push('/profile');
      return ;
=======
module.exports = {
  props: {
  },
  data() {
    return {
      showLogin: true,
      loginData: {
        login: "",
        password: ""
      },
      registerData: {
        login: "",
        password: "",
        password2: "",
        name: "",
        lastName: ""
      }
    }
  },
  methods: {
    login() {
      if (this.loginData.password.length <= 2) {
        alert("Passwords must be at least of 3 characters");
      } else if (this.loginData.login === "") {
        alert("login cannot be empty");
      } else {
        this.$emit('login', this.loginData);
      }
    },
    register() {
      if (this.registerData.password !== this.registerData.password2) {
        alert("The passwords does not match");
      } else if (this.registerData.password.length <= 2) {
        alert("Passwords must be at least of 3 characters");
      } else if (this.registerData.name === "" || this.registerData.lastname === "") {
        alert("Name and lastname cannot be empty");
      } else {
        this.$emit('register', this.registerData);
      }
    },
    toogleForm() {
      this.showLogin = !this.showLogin;
>>>>>>> Stashed changes
    }
  },
  computed: {
    validatedFields: function () {
      if (this.mode == 'create') {
        if (this.email != "" && this.prenom != "" && this.nom != "" && this.password != "") {
          return true;
        } else {
          return false;
        }
      } else {
        if (this.email != "" && this.password != "") {
          return true;
        } else {
          return false;
        }
      }
    },
    ...mapState(['status'])
  },
  methods: {
    switchToCreateAccount: function () {
      this.mode = 'create';
    },
    switchToLogin: function () {
      this.mode = 'login';
    },
    login: function () {
      const self = this;
      this.$store.dispatch('login', {
        email: this.email,
        password: this.password,
      }).then(function () {
        self.$router.push('/profile');
      }, function (error) {
        console.log(error);
      })
    },
    createAccount: function () {
      const self = this;
      this.$store.dispatch('createAccount', {
        email: this.email,
        nom: this.nom,
        prenom: this.prenom,
        password: this.password,
      }).then(function () {
        self.login();
      }, function (error) {
        console.log(error);
      })
    },
  }
}
<<<<<<< Updated upstream
</script>

<style scoped>
  .form-row {
    display: flex;
    margin: 16px 0px;
    gap:16px;
    flex-wrap: wrap;
  }

  .form-row__input {
    padding:8px;
    border: none;
    border-radius: 8px;
    background:#f2f2f2;
    font-weight: 500;
    font-size: 16px;
    flex:1;
    min-width: 100px;
    color: black;
  }

  .form-row__input::placeholder {
    color:#aaaaaa;
  }


</style>>
=======
</script>
>>>>>>> Stashed changes
