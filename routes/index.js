var express = require('express');
var router = express.Router();

const dataTier = require("../lib/dataTier");

/**
 * Email system for sending email authentication emails
 */
 const nodemailer = require('nodemailer');

 let transporter = null
 if(process.env.NODEMAILER_EMAIL){
     transporter = nodemailer.createTransport({
     service: "gmail",
     auth: {
         type: 'OAuth2',
         user: process.env.NODEMAILER_EMAIL,
         clientId: process.env.CLIENT_ID,
         clientSecret: process.env.CLIENT_SECRET,
         refreshToken: process.env.REFRESH_TOKEN,
         accessToken: process.env.ACCESS_TOKEN,
         expires: Number.parseInt(process.env.TOKEN_EXPIRE, 10),
     },
     });
 }

/* GET home page. */
router.get('/', function(req, res, next) {
  dataTier.getClassNames(function(classesArray) {
    res.render('configSearch', { classes: classesArray });
  })
});

/* GET home page. */
router.get('/feedback', function(req, res, next) {
  res.render('feedback');
});

/* POST home page. */
router.post('/feedback', function(req, res, next) {
  // then send email to admin
  if(process.env.NODEMAILER_EMAIL){
    let message = {
        from: process.env.NODEMAILER_EMAIL,
        to: process.env.NODEMAILER_ADMIN,
        subject: "Moc-Meetup: Feedback",
        html: `
                <p>
                    Admin,
                    <br><br>
                    New feedback has been submitted by ${req.body.email}
                    <br><br>
                    <b>${req.body.feedback}</b>
                </p>
            `
    };
    // Attempt to send email to admin
    if (transporter != null) {
        transporter
            .sendMail(message)
            .catch((error) => {
                console.error(error)
            });
    }
  }
  res.render('feedback-thankyou');
});

module.exports = router;
