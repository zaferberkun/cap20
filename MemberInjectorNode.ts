import { Writer, Reader } from './BIPOCElement.js'
import MemberDataInterface from './MemberData.js';

export class MemberWriter extends Writer<MemberDataInterface> {
  private user: any;
  // constructor
  constructor(user: any) {
    super()
    this.user = user;
  }

  /**
   * Updating an existing Member with new data. The local user
   * has been assigned to the Mongoose User Document in the
   * constructor, so all we have to do is update each
   * of the fields and then call the Mongoose Model
   * save() function.
   * 
   * @param data The data to update this Member Doc with.
   * @returns Resolved promise on success, Rejected promise on failure.
   */
  async write(data: MemberDataInterface): Promise<boolean> {
    try {
      //Update the Mongo Document
      for (let key in data) {
        this.user[key] = data[key];
      }
      //Write the doc out to the database
      await this.user.save();
      return Promise.resolve(true);
    }
    catch (e) {
      console.log("Error thrown when saving member ", e)
      return Promise.reject(e);
    }

  }// async read()

}// class MemberReader