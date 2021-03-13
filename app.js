const express = require("express"),
  mongoose = require("mongoose"),
  methodOverride = require("method-override"),
  bodyParser = require("body-parser"),
  store = require("./middleware/multer"),
  UploadModel = require("./model/schema"),
  fs = require("fs");
const { allowedNodeEnvironmentFlags } = require("process");

const app = express();
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));

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

require('./server/database/database')();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use("/public/images/", express.static("./public/images"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/joinUs", (req, res) => {
  res.render("joinUs");
});

app.get("/help", async(req, res) => {

  const all_images = await UploadModel.find();
  res.render("help", { images: all_images});
  
});

app.post("/uploadmultiple", store.array("images", 12), (req, res, next) => {
  const files = req.files;

  if(!files) {
    const error = new Error("Please choose files");
    error.httpStatusCode = 400;
    return next(error);
  }

  //convert images into base64 encoding
  let imgArray = files.map((file) => {
    let img = fs.readFileSync(file.path);
    return encode_image = img.toString('base64');
  })

  let result = imgArray.map((src, index) => {
    //create object to store data in the collection
    let finalImg = {
      filename: files[index].originalname,
      contentType: files[index].mimetype,
      imageBase64: src
    }
    // console.log(finalImg.filename);
    let newUpload = new UploadModel(finalImg);
    // console.log(newUpload);
    return newUpload
          .save()
          .then(() => {
            return { msg: `${files[index].originalname} image uploaded successfully...!` }
          })
          .catch(error => {
            if(error) {
              if(error.name === 'MongoError' && error.code === 11000) {
                return Promise.reject({ error: `Duplicate ${files[index].originalname}.File Already exists!`})
              }
              return Promise.reject({error:error.message || `Cannot Upload ${files[index].originalname} Something Missing!`});
            }
          })
  });

  // res.json(imgArray);
  Promise.all(result)
    .then( msg => {
      console.log("hey there!");
      // res.json(msg);
      res.redirect("/help");
    })
    .catch(err => {
      res.json(err);
    })
})

app.get("/adopt", (req, res) => {
  res.render("adopt");
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

app.get("/contacts", (req, res) => {
  res.render("contacts");
});

let port = process.env.PORT || 3000;
app.listen(port, process.env.IP, () => {
  console.log("showing on port 3000.");
});