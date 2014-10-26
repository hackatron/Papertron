
// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var parseExpressCookieSession = require('parse-express-cookie-session');
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body

//Cookie session management
app.use(express.cookieParser('EbrG0zmgfHyONiJMSE7fekSvyw3a04fqD6HHmj179bb/RviN'));
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));

//HTTPS only
app.use(parseExpressHttpsRedirect());

// Homepage render
app.get('/', function(req, res){
	var currentUser = Parse.User.current();
	if (currentUser != null) {
        // Prelevo i dati contenuti nel db di parse, partendo da currentUser
		currentUser.fetch().then(function(fetchedUser){
		    var name = fetchedUser.getUsername();
		    res.render('homepage', { currentUser: 1, username: name, errorCode: 0});
		}, function(error){
		    //Handle the error ('$ parse log -f')
		    alert("Error: " + error.code + " " + error.message);
		});
	}
	else
	{
		res.render('homepage', { currentUser: 0 , errorCode: 0});
	}
});

// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

/* /////////////////////////

Register User
GET 	/register 	template 	register.ejs 
POST 	/register 	form 		registration form (user, passwd, email)

///////////////////////// */
app.get('/register', function(req, res){
	res.render('register');
});

app.post('/register', function(req, res){
	var user = new Parse.User();

	user.set("username", req.body.username);
	user.set("password", req.body.password);
	user.set("email", req.body.email);
	
	user.signUp(null, {
	  success: function(user) {
	  	alert("New user: " + req.body.username);
	    // Hooray! Let them use the app now.

	    //navigate to home
	    res.redirect('/');
	  },
	  error: function(user, error) {
	    // Show the error message somewhere and let the user try again.
	    alert("Error: " + error.code + " " + error.message);
	  }
	});
});

/* Login function */
app.post('/login', function(req, res){

	Parse.User.logIn(req.body.username, req.body.password, {
  		success: function(user) {
    	// Do stuff after successful login.
    	alert("Login successful");
    	res.redirect('/');
  		},
  		error: function(user, error) {
    	// The login failed. Check error to see why.

        alert("Login failed. " + error.code + " " + error.message);
        res.render('homepage', { currentUser: 0, errorCode: error.code, errorMessage: error.message});
  		}
	});
});

/* Logout GET Function */
app.get('/logout', function(req, res) {
    Parse.User.logOut();
    res.redirect('/');
  });

// // Example reading from the request query string of an HTTP get request.
// app.get('/test', function(req, res) {
//   // GET http://example.parseapp.com/test?message=hello
//   res.send(req.query.message);
// });

// // Example reading from the request body of an HTTP post request.
// app.post('/test', function(req, res) {
//   // POST http://example.parseapp.com/test (with request body "message=hello")
//   res.send(req.body.message);
// });

// Attach the Express app to Cloud Code.
app.listen();
