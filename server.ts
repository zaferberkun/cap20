import express from 'express'
import exhbs from 'express-handlebars'
import hb, { registerPartial } from 'handlebars'
import { fileURLToPath } from 'url'
import path from 'path'
import nodemailer from 'nodemailer'

import * as $db_constants from './DBconstants.js'
import * as db_api from './db-api.js'
import * as db_init from './db-init.js';
import { MONGO_URI } from './secrets.js';
import { Document } from 'mongodb';


import member from './Member.js'
import { MemberWriter } from './MemberInjectorNode.js'
import HTML_IDS from './HTMLIDConstantsApp.js'
import { EventEmitter } from 'events';
import { ServerEvents } from './ServerEvents.js';

import { GMAIL_PASSWORD } from './secrets.js'

let db_html: Document | null = null;

(async function start_server() {

  const app = express();

  // Connect mongoose to our DB.
  db_init.connectDB(MONGO_URI);

  let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'zaferberkun@gmail.com',
      pass: GMAIL_PASSWORD
    }
  });

  //Do all the async stuff that must occur in sequence, but don't hold up the rest of the code...
  let initHTMLPromise = initHTMLWatch();
  console.log("Doing other init stuff...")

  // Init handlebars
  const hbs = initRenderEngine(app);

  // Let express know where out static files live.
  registerStaticPaths(app);

  // MW to make our HTML IDS and actual HTML data avail to handlebars
  app.use((req, res, next) => {

    // Give handlebars access to the element IDs
    res.locals.HTML_IDS = HTML_IDS;

    // Notice that we are referencing our global object which will be updated at power up and when the db is updated.
    res.locals.HTML = db_html;

    //Init the member writer so that the user DB will be updated
    //whenever the member Model is updated.
    member.injectWriter(new MemberWriter(req.user));

    next();
  });

  app.get('/', (req, res) => {

    //send yourself an email
    var mailOptions = {
      from: 'z@gmail.com',
      to: 'zaferberkun@yahoo.com',
      subject: 'Sending Email using Node.js',
      text: 'That was easy!'
    };

    transport.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    //Create the hb template.
    try {
      if (db_html) {
        let test2 = hb.compile(db_html["index"], { strict: true });
        //Run the template using the HTML ids.
        let html = test2(HTML_IDS);
        //Send the html to the client.
        return res.type('html').status(200).send(html);
      }
      else {
        console.log("Rendering using old method")
        return res.render('index');
      }
    }
    catch {
      return res.type('text').status(500).send("There is something wrong with your hb file.")
    }
  });

  //Signup routes
  app.post('/signup', express.json(), async (req, res) => {
    //Save the user and send back status.
    try {
      await db_api.addMember({
        info: req.body.info,
        email: req.body.email,
      });
    }
    catch {
      console.log("Problem saving member")
    }
  });

  // Start the server.
  const PORT = process.env.PORT ?? 8080;
  console.log("Listening on port ", PORT);

  initHTMLPromise.then(() => {
    app.listen(PORT);
  });

})()

async function initHTMLWatch() {
  console.log("Doing DB watch stuff...")
  // This will be used as a reference to the HTML data for handlebars to render.
  // Load it with what's currently in the html database.
  db_html = await db_init.getHTML_DB(MONGO_URI, $db_constants.CAPITALISM20_DB, $db_constants.MAIN_PAGE_HTML_SOURCE)
  //console.log("db_html ", db_html);
  registerPartials(db_html)

  // Init watching HTML database collection.
  const HTMLChangeEvent: EventEmitter = await db_init.watchHTML_DB(MONGO_URI, $db_constants.CAPITALISM20_DB, $db_constants.MAIN_PAGE_HTML_SOURCE)

  // Setup watch for DB changes, if there is a change copy it to "res.locals.HTML" so it is available to handlebars.
  // Need to compile the template at this point.
  HTMLChangeEvent.on(ServerEvents.HTML_CODE_CHANGED, (change) => {
    //console.log("Got DB HTML change ", change);
    // Save the change and register partials.
    if (db_html)
      for (let key in change)
        db_html[key] = change[key]

    registerPartials(db_html)
  })
  console.log("Done Doing DB watch stuff...")
}

/**
 * @description
 * Register handlebars as our render engine.
 * 
 * @param app - Our instance of the Express app that will use handlebars.
*/
function initRenderEngine(app) {

  // Create `ExpressHandlebars` instance with a default layout.
  const hbs = exhbs.create({
    defaultLayout: 'index',
    extname: '.hbs',// change default extension to 'hbs'
  });

  //Register "Handlebars" as our HTML rendering engine
  app.engine('.hbs', hbs.engine);
  app.set('views', './render-templates'); //Point express to where our html templates are.
  app.set('view engine', '.hbs');//Set express to render hbs files.

  return hbs;
}

/**
 * @description
 * Register the paths to serve static files.
 * 
 * @param app - Our instance of the Express app.
*/
function registerStaticPaths(app) {

  // Set a __dirname const to make life a little easier.
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  //Register all the static paths for loading modules, images, etc.
  app.use(express.static(path.join(__dirname, './css/')));
  app.use(express.static(path.join(__dirname, './images/')));
}

/**
 * @description
 * Register partials with handlebars from the contents of a given object.
 * Partials are the keys in the given object begin with the keyword "section"
 * 
 * @param db_html The obj that contains the partials in the form {section<section_name>:<handlebars template>, section<section_name>...}
 */
function registerPartials(db_html) {
  for (let key in db_html) {
    if (key.match(/^section/)) {
      console.log("Register partial ", key)
      hb.registerPartial(key, db_html[key]);
    }
  }
}