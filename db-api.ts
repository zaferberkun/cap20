import MemberModel from './MemberDBModel.js'
import MemberSignupDataInterface  from './MemberData.js'


/**
 * @description
 * Creates and adds a new member with the given username, email, and password.
 * 
 * @returns
 * void
 */
export async function addMember(userinfo: MemberSignupDataInterface) {

  //Create a new Member document.
  const newMember = new MemberModel({
    info: userinfo.info,
    email: userinfo.email
  });

  // Add the new member to the DB.
  try {
    await newMember.save();
  }
  catch (e) {
    console.log("Failed to add ", userinfo.email)
    throw (e);
  }
} // addMember