const cookies = require("./cookies");
exports.checkLogin = (req, res, next) => {
    console.log("111111111")

    if(req.session.isLoggedIn)
        next();
    else {
       if(req.cookies.connect){
         //   res.cookie("error","please sign in");
           res.render('login', {
               title: 'Login',
               error: "please sign in",
               newRegistered:  ""});
       }
        else{
            text = {msg: "server is down, try again later"};
            res.status(401).json(text)

        }
    }
}

exports.checkLogout = (req,res, next) => {
    console.log("22222222")
    if (req.session.isLoggedIn)
        res.render("home", {
            title: 'api',
            name:req.session.userName,
            email:req.session.email
        })
    else next();
}

exports.nocache = (req, res, next) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,max-age=0,s-maxage=0');
    next();
}