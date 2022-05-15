<template>
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
    </div>
  </div>
</template>
<script>
module.exports = {
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
      return;
    }
  },
}
</script>
