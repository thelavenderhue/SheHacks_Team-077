const { Router } = require("express");
var express=require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../model/user");

router.get("/", (req, res) => {
    res.render("home");
});

router.get('/signup',(req,res)=>{
    res.render('signup');
});

router.post('/signup',async(req,res,next)=>{
    try{
    const {email, username, password} = req.body;
    const user = new User ({email,username});
    const registeredUser = await User.register(user, password);
    req.login(registeredUser,err =>{
        if(err) return next(err);
        req.flash('success','Welcome to 4Paw...');
        res.redirect('/');
    });
    }catch(e){
        req.flash('error',e.message);
        res.redirect('signup');
    }
});

router.get('/login',(req,res)=>{
    res.render('login');
});

router.post('/login',passport.authenticate("local",
{
    failureFlash : true,
    failureRedirect: "/login"
    }),(req,res)=>{
        req.flash('success','Welcome Back!');
        const redirectUrl = req.session.returnTo || '/'
        delete req.session.returnTo;
        res.redirect(redirectUrl);
});

router.get("/logout",function(req,res){
	req.logout();
	req.flash("success","You Logged out :(")
	res.redirect("/");
});

module.exports = router;