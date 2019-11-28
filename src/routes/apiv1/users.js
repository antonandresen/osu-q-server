const express = require('express');
const router = require('express-promise-router')();
const passport = require('passport');

const passportConfig = require('../../passport');
const { validateBody, schemas } = require('../../helpers/routeHelpers');
const UsersController = require('../../controllers/users');
const passportSignIn = passport.authenticate('local', { session: false });
const passportJWT = passport.authenticate('jwt', { session: false });
const passportGoogle = passport.authenticate('googleToken', { session: false });
const passportFacebook = passport.authenticate('facebookToken', {
  session: false,
});

router
  .route('/signup')
  .post(validateBody(schemas.authSchema), UsersController.signUp);

router
  .route('/signin')
  .post(
    validateBody(schemas.authSchema),
    passportSignIn,
    UsersController.signIn,
  );

router.route('/oauth/google').post(passportGoogle, UsersController.googleOAuth);

router
  .route('/oauth/facebook')
  .post(passportFacebook, UsersController.facebookOAuth);

router.route('/secret').get(passportJWT, UsersController.secret);

module.exports = router;
