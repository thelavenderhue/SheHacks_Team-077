const express = require("express"),
  mongoose = require("mongoose"),
  methodOverride = require("method-override"),
  bodyParser = require("body-parser"),
  store = require("./middleware/multer"),
  UploadModel = require("./model/schema"),
  fs = require("fs"),
  { allowedNodeEnvironmentFlags } = require("process"),
  flash = require("connect-flash"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  { session } = require("passport"),
  User = require("./model/user");

const userRoutes = require("./routes/users");
const app = express();
require("dotenv").config();

//app.use(session(sessionConfig));

//PASSPORT CONFIGURATION
app.use(
  require("express-session")({
    secret: "Nothing is Greater than LOVE!!!",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//currentUseradded through each route to show login, logout and signup
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

mongoose.set("useUnifiedTopology", true);
const url = process.env.MONGODB_URI || 3000;

mongoose.connect(
  url,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => {
    console.log("Connected to database.");
  }
);

require("./server/database/database")();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use("/public/images/", express.static("./public/images"));

app.use("/", userRoutes);

// app.get("/", (req, res) => {
//   res.render("home");
// });

var petSchema = new mongoose.Schema({
  ownerName: String,
  image: String,
  breed: String,
  location: String,
  phoneNum: Number,
});

var Pet = mongoose.model("Pet", petSchema);

// Pet.create(
//     {
//         ownernName: "ABC",
//         image: "https://www.thesprucepets.com/thmb/F_16ouls0et8Cs8jGVbG9cJo8M4=/1000x1000/smart/filters:no_upscale()/breed_profile_germansheperd_1118000_hero_2536-6dc4ce05871945b8a894bd80c0ecc7f1.jpg",
//         breed: "German Shepherd",
//         location: "newLocation1",
//         phoneNum: 9807706820,

//     }, function(err, pet) {
//         if(err) {
//             console.log(err);
//         }
//         else {
//             console.log("newly created host");
//             console.log(pet);
//         }
//     }
// )

app.get("/adopt", (req, res) => {
  Pet.find({}, function(err, allPets) {
        if(err) {
            console.log(err);
        } else {
            res.render("adopt", {pets:allPets});
        }
    })
});

app.get("/findHost", (req, res) => {
  res.render("adoptForm.ejs");
});

app.post("/findHost", (req, res) => {
  var name = req.body.name;
  var image = req.body.image;
  var breed = req.body.breed;
  var location = req.body.location;
  var phonenum = req.body.phonenum;
   var newPet = { ownerName: name, breed: breed, image: image, location: location, phoneNum: phonenum};
   //create new campground and save to DB
   Pet.create(newPet, function (err, newlyCreated) {
       if (err) {
           console.log(err);
       } else {
           //redirect back to campgrounds page
          //  console.log(newlyCreated);
           res.redirect("/adopt");
       }
   
   });
});

app.get("/help", async (req, res) => {
  const all_images = await UploadModel.find();
  res.render("help", { images: all_images });
});

app.post("/uploadmultiple", store.array("images", 12), (req, res, next) => {
  const files = req.files;

  if (!files) {
    const error = new Error("Please choose files");
    error.httpStatusCode = 400;
    return next(error);
  }

  //convert images into base64 encoding
  let imgArray = files.map((file) => {
    let img = fs.readFileSync(file.path);
    return (encode_image = img.toString("base64"));
  });

  let result = imgArray.map((src, index) => {
    //create object to store data in the collection
    let finalImg = {
      filename: files[index].originalname,
      contentType: files[index].mimetype,
      imageBase64: src,
    };
    // console.log(finalImg.filename);
    let newUpload = new UploadModel(finalImg);
    // console.log(newUpload);
    return newUpload
      .save()
      .then(() => {
        return {
          msg: `${files[index].originalname} image uploaded successfully...!`,
        };
      })
      .catch((error) => {
        if (error) {
          if (error.name === "MongoError" && error.code === 11000) {
            return Promise.reject({
              error: `Duplicate ${files[index].originalname}.File Already exists!`,
            });
          }
          return Promise.reject({
            error:
              error.message ||
              `Cannot Upload ${files[index].originalname} Something Missing!`,
          });
        }
      });
  });

  // res.json(imgArray);
  Promise.all(result)
    .then((msg) => {
      console.log("hey there!");
      // res.json(msg);
      res.redirect("/help");
    })
    .catch((err) => {
      res.json(err);
    });
});

app.get("/donate", (req, res) => {
  res.render("donate");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signUp");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

let port = process.env.PORT || 3000;
app.listen(port, process.env.IP, () => {
  console.log("showing on port 3000.");
});
