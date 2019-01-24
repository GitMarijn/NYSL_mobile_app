var app = new Vue({
    el: '#app',
    data: {
        games: {},
        teams: {},
        locations: {},
        selectedGamesOfATeam: [],
        selectedTeam: "",
        currentView: localStorage["current_view"],
        chat: [],
        currentUser: "",
        isLogged: false,
        userPhoto: "",
    },

    created() {
        this.getData();
        if(!localStorage["current_view"])
            this.setPageView(0);
        if(localStorage["current_view"] == 3)
            this.isLoggedIn();
    },

    methods: {
        getData() {
            fetch("https://api.myjson.com/bins/uvnk8", {
                method: "GET",

            }).then(function (response) {
                return response.json()
            }).then(function (data) {
                app.games = data.games;
                app.teams = data.teams;
                app.locations = data.locations;
            }).catch(function (error) {
                console.log(error)
            })
        },

        filterTeams(selectedTeam) {
            app.selectedTeam = selectedTeam;
            var array = [];

            for (var i = 0; i < this.games.length; i++) {

                if (this.games[i].hometeam == selectedTeam.name || this.games[i].visitors == selectedTeam.name)
                    array.push(this.games[i])
            }
            this.selectedGamesOfATeam = array;
        },

        isLoggedIn() {
            firebase.auth().onAuthStateChanged(function (user) {
                if (user != null) {
                    app.currentUser = firebase.auth().currentUser.displayName;
                    app.userPhoto = firebase.auth().currentUser.photoURL;
                    app.isLogged = true;
                    app.getPosts();
                } else {
                    app.currentUser = null;
                    app.isLogged = false;
                }
            });
        },

        login() {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithRedirect(provider);
            console.log("login");
            localStorage["current_view"] = 3;
            this.isLogged = true;
            var loadMessages = this.getPosts();
        },

        writeNewPost(chat) {
            var text = document.getElementById("textInput").value;
            if (text == "") {
                return false;
            }
            var userName = firebase.auth().currentUser.displayName;
            var photo = firebase.auth().currentUser.photoURL;
            var date = new Date();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            if(date.getHours() < 10 && date.getMinutes() < 10) {
                hours = '0' + date.getHours();
                minutes = '0' + date.getMinutes();
            } else if(date.getMinutes() < 10) {
                minutes = '0' + date.getMinutes();
            } else if (date.getHours() < 10) {
                hours = '0' + date.getHours();
            }

            var post = {
                name: userName,
                body: text,
                picture: photo,
                hour: hours,
                minute: minutes,
            };
            var newPostKey = firebase.database().ref().child('main').push().key;

            var updates = {};
            updates[newPostKey] = post;

            return firebase.database().ref('main').update(updates);
        },

        getPosts() {
            firebase.database().ref('main').on('value', function (data) {
                var messages = data.val();
                var array = [];

                for (var key in messages) {
                    array.push(messages[key])
                }
                app.chat = array;

                setTimeout(function () {
                    $(".box").animate({
                        scrollTop: $(".box").prop("scrollHeight")
                    }, 500)
                }, 500);
                console.log("getting posts");
            })
        },

        emptyTextInput() {
            document.getElementById("textInput").value = "";
        },

        logOut() {
            firebase.auth().signOut();
            console.log("logged out");
        },

        openNav() {
            document.getElementById("mySidenav").style.width = "40%";
            document.getElementById("header").style.position = "static";
            if (window.matchMedia("(orientation: landscape)").matches) {
                document.getElementById("mySidenav").style.width = "30%"
            };
        },

        closeNav() {
            document.getElementById("mySidenav").style.width = "0";
            document.getElementById("header").style.position = "sticky";
            document.getElementById("header").style.position = "-webkit-sticky";
            document.getElementById("header").style.transitionDelay = "0.1s";
        },
        
        setPageView(number) {
            localStorage["current_view"] = number;
            this.currentView = localStorage["current_view"];
            if (number == 3){
                this.isLoggedIn() 
            };
        },
    },
});

