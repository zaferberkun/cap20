import BIPOCElement from './BIPOCElement.js'
import MemberDataInterface from './MemberData.js';
import { LocalEventConstants } from './EventConstants.js'
import CustomEventSource from './CustomEventSource.js';

/** BIPOC Member Model */
export class Member extends BIPOCElement<MemberDataInterface> {

  protected data: MemberDataInterface;
  protected eventEmitter: (CustomEventSource | null);

  constructor() {
    super();
    this.data = {
      email: "email@email.com",
      info: 'unknown'
    };
    this.reader = null;
    this.eventEmitter = null;
  }

  /** 
   * @description
   * Copies the given data into the member model data. Executes the injected
   * writer function to perform whatever other writing/syncing is necessary
   * with the rest of the system. Optionally emits an event indicating
   * that the data has changed.
   */
  async storeMember(memberData: MemberDataInterface, dispatchEvent: boolean = false) {

    this.data = Object.assign(this.data, memberData);
    if (this.writer) {
      //Call the injected write function to store the member data.
      await this.writer.write(this.data);
    }
  }

  /**
   * Returns the current member data.
   */
  getData(this: Member) { return this.data };

  /**
   * Sets the member data.
   */
  setData(this: Member, memberData: MemberDataInterface) {
    //Perform a shallow copy since with know the types match.
    Object.assign(this.data, memberData);
  };

}

const member = new Member();

export default member;