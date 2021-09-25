import EventEmitter from 'events'
import mongoose from 'mongoose';
import { Document } from 'mongodb';
import { MongoClient } from 'mongodb'
import { ServerEvents } from './ServerEvents.js'


/**
 * @description
 * Connect to the DB at the given path.
 */
export async function connectDB(db_path: string) {
  try {
    await mongoose.connect(db_path, { useUnifiedTopology: true, useNewUrlParser: true });
    console.log("Connected to DB ")

  }
  catch (e) {
    console.log("Failed to connect to DB ")
    console.log(e);
  }
}

/**
 * @description
 * Send an event indicating that the HTML source has changed.
 * 
 * @return 
 * An event emitter that will be triggered when the DB HTML data changes.
 * 
 * @emits
 * HTML_CODE_CHANGE when a DB replace or update operation occurs.
 */
export async function watchHTML_DB(db_path: string, DB, collection): Promise<EventEmitter> {

  const HTMLChangeEvent = new EventEmitter();

  const client = new MongoClient(db_path);

  try {
    await client.connect();
    const db = client.db(DB);
    const HTML_collection = db.collection(collection);

    // Watch for an HTML change and emit event with changed data when one occurs
    const HTML_changeStream = HTML_collection.watch();
    HTML_changeStream.on("change", (change) => {
      let htmlData = change.operationType === 'replace' ? change.fullDocument : change.updateDescription?.updatedFields;
      HTMLChangeEvent.emit(ServerEvents.HTML_CODE_CHANGED, htmlData);
    });
  }
  catch (e) {
    console.log("Something went wrong reading session db ", e);
  }
  return HTMLChangeEvent;
}

/**
 * @description
 * Read and return the HTML data from the DB.
 * 
 * @returns
 * The contents of the HTML database (the _id attrib is not included)
 */
export async function getHTML_DB(db_path: string, DB, collection): Promise<Document | null> {

  const client = new MongoClient(db_path);
  let html_data: Document | null;

  try {
    await client.connect();
    const db = client.db(DB);
    const HTML_collection = db.collection(collection);
    //Get all the HTML data, exclude the _id field. This uses the Mongo "project" feature to select
    //which properties are selected.
    html_data = await HTML_collection.aggregate([{ $project: { _id: 0 } }]).next();
    client.close();
    return html_data;
  }
  catch (e) {
    console.log("Something went wrong reading html DB ", e);
    return Promise.resolve(null);
  }
}

