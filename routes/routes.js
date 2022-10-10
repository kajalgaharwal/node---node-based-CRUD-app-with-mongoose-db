const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');

//adding image using multer
let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function(req, file, cb) {
    cb(null, file.filename + '_' + Date.now() + '_' + file.originalname);
  }
});

//upload is a middleware
let upload = multer({
  storage: storage
}).single('image');

//add UPLOAD as a middleware
//datasave in database
router.post('/add', upload, (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    category: req.body.category,
    image: req.file.filename
  });
  user.save(err => {
    if (err) {
      res.render({ message: err.message, type: 'danger' });
    } else {
      req.session.message = {
        type: 'success',
        message: 'user added successfully'
      };
      res.redirect('/index');
    }
  });
});

//display data on screen
router.get('/index', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error });
  }
  //   res.render('index', { title: 'home' });
  // User.find().exec((err, users) => {

  //   if (err) {
  //     res.json({ message: err.message });
  //   } else {
  //     res.render('index', {
  //       title: 'Home Page',
  //       users: users
  //     });
  //   }
  // });
});

//display title on add user page
router.get('/add', (req, res) => {
  res.render('add_users', { title: 'Add User' });
});

//fetch all the details of user on which customer click(edit button) to update data and open edit_user page
router.get('/edit/:id', (req, res) => {
  let id = req.params.id;
  User.findById(id, (err, user) => {
    if (err) {
      res.redirect('/index');
    } else {
      if (user == null) {
        res.redirect('/index');
      } else {
        res.render('edit_users', {
          title: 'Edit User',
          user: user
        });
      }
    }
  });
});

//update data
router.post('/update/:id', upload, (req, res) => {
  let id = req.params.id;
  let new_image = '';
  //change old image to new image from edit form

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync('./uploads/' + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }
  //update all other things
  User.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      category: req.body.category,
      image: new_image
    },
    (err, result) => {
      if (err) {
        res.json({ message: err.message, type: 'danger' });
      } else {
        req.session.message = {
          type: 'success',
          message: 'User Updated Successfully'
        };
        res.redirect('/index');
      }
    }
  );
});

//Delete data
router.get('/delete/:id', (req, res) => {
  let id = req.params.id;
  User.findByIdAndRemove(id, (err, result) => {
    if (result.image != '') {
      try {
        fs.unlinkSync('./uploads/' + result.image);
      } catch (err) {
        console.log(err);
      }
    }
    if (err) {
      res.json({ message: err.message });
    } else {
      req.session.message = {
        type: 'success',
        message: 'User Deleted Successfully'
      };
      res.redirect('/index');
    }
  });
});
module.exports = router;
