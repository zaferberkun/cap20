import fs_promises from 'fs/promises';
import fs from 'fs';

import { MONGO_URI } from './secrets.js';
import { MongoClient } from 'mongodb'
import * as $db_constants from './DBconstants.js'
import EventEmitter from 'events'
import { ServerEvents } from './ServerEvents.js'

const HTMLChangeEvent = new EventEmitter();

const watched_file = "./render-templates/";

await updateHTML_DB();
await watchFile();

interface CodeChangeMessage {
  file: string,
  buffer: string
}
/**
 * @description
 * Update the DB with the new file contents.
 */
async function updateHTML_DB() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("Connected to DB");
    const db = client.db($db_constants.CAPITALISM20_DB);
    const HTML_collection = db.collection($db_constants.MAIN_PAGE_HTML_SOURCE);
    const CSS_collection = db.collection($db_constants.MAIN_PAGE_CSS_SOURCE);

    // Listen for HTML change event. Update DB with new HTML when
    // event occurs. Event data contains file and and html contents.
    HTMLChangeEvent.on(ServerEvents.HTML_CODE_CHANGED, async (event: CodeChangeMessage) => {
      console.log("event ", event)
      if (event.file && event.file[0]) {
        let result = await HTML_collection.updateOne({}, { $set: { [event.file[0]]: event.buffer } });

        console.log("Updated DB...");
        //Let the world know that we updated the DB (e.g. the spinner)
        HTMLChangeEvent.emit(ServerEvents.HTML_DB_UPDATED);
      }
    });
  }
  catch (e) {
    console.log("Some error");
  }
}

/**
 * Watch the file for changes. Emit event when change is detected.
 */
async function watchFile() {

  console.log("Waiting for file change...");
  const watcher = fs_promises.watch(watched_file, { recursive: true });

  // Since the "watcher" will emit several events on a single save due to goofy OS hooks
  // use a flag to insert a delay so only one is used.
  let ok_to_read = true;

  twirl();

  for await (const event of watcher) {
    if (ok_to_read) {
      try {
        let filename = "./render-templates/" + event.filename;
        console.log(filename);
        let fd = await fs_promises.open(filename, 'r');
        let buffer = await fd.readFile();

        //Some watcher events don't have any data, so make sure we only use the one that does. 
        if (buffer.length > 0) {
          console.log("\r" + "File changed...");
          //Remove the extension from the filename and emit an event with the file name and contents.
          //This will be recorded in the database with the filename as the key and the html as the value.
          let filename_noext = event.filename.match(/^(\w*)/g);
          console.log("filename ", filename);
          HTMLChangeEvent.emit(ServerEvents.HTML_CODE_CHANGED, { file: filename_noext, buffer: buffer.toString() });

          //Deal with the OS producing too many events on one write.
          ok_to_read = false;
          setTimeout(() => {
            ok_to_read = true;
          }, 100);
        }
        fd.close();
      }
      catch {
        console.log("Failed to open file...")
      }
    }
  }
}

/**
 * Give some feedback that we're actually waiting and not hung...
 */
function twirl() {
  //const P = ["⠉", "⠛", "⠿", "⣿"];
  const P = ["😐", "🥱", "🤨", "🤔", "😕", "🥱", "🙄"];
  var x = 0;
  let counter = 1;

  let timer: NodeJS.Timer;

  displayTwirl();

  function displayTwirl() {
    timer = setInterval(function () {
      process.stdout.write("\r" + P[x += counter]);
      counter = counter == 1 && x == P.length - 1 ? -1 : counter == -1 && x == 0 ? 1 : counter;
    }, 2000);
  }

  // Reset when a file change occurs.
  HTMLChangeEvent.on(ServerEvents.HTML_CODE_CHANGED, () => {
    clearTimeout(timer);
    x = 0;
    counter = 1;
  });

  // Restart when the DB write has finished.
  HTMLChangeEvent.on(ServerEvents.HTML_DB_UPDATED, () => {
    displayTwirl();
  });
}