exports.checkLogin = (req, res, next) => {

    if(req.session.isLoggedIn)
        next();
    else {
       if(!req.cookies.connect){
            res.cookie("error","please sign in");
            res.redirect('/')
       }
        else{
            text = {msg: "server is down, try again later"};
            res.status(401).json(text)
        }
    }
}

exports.checkLogout = (req,res, next) => {

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