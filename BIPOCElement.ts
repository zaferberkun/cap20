import CommonDataInterface from "./MemberData";
import CustomEventSource from './CustomEventSource.js'

/**
 * @class Reader
 * 
 * @description
 * Defines the interface for reading types that derived from the base CommonDataInterface type.
 * Used to inject a reader into classes derived from BIPOCElement 
 */
export abstract class Reader<T extends CommonDataInterface> {

  /**
   * @description
   * Abstract read function to be defined by subclasses.
   * 
   * @returns {Promise<T>} - Promise that resolves to any type that extends CommonDataInterface
   */
  abstract read(): Promise<T>;
}

/**
 * @class Writer
 * @template <T extends CommonDataInterface>
 *
 * @description
 * Defines the interface for writing types that derived from the base CommonDataInterface type
 * Used to inject a writer into classes derived from BIPOCElement
 */
export abstract class Writer<T extends CommonDataInterface> {

  /**
    * @description
    * 
    * Abstract read function to be defined by subclasses.
    */
  abstract write(data: T): Promise<boolean>;
}

/** 
 * @class BIPOCElement
 * 
 * @description
 * Base class for all things BIPOC. Defines
 * methods for injecting readers and writers and defines the abstract interface
 * reading and writing.
 */
export default abstract class BIPOCElement<T extends CommonDataInterface> {

  protected writer: (Writer<T> | null);
  protected reader: (Reader<T> | null);
  protected eventSource: CustomEventSource | null;

  constructor() {
    this.reader = null;
    this.writer = null;
    this.eventSource = null;
  }

  /**
   * @description
   * Inject a reader that reads things of type T.
   *
   * @param writer - An object of class Reader that writes any type that
   * extends the CommonDataInterface.
   */
  injectReader(reader: Reader<T>) {
    this.reader = reader;
  }

  /**
   * @description
   * Inject a writer that writes things of type T.
   * 
   * @param writer - An object of class Writer that writes any type that
   * extends the CommonDataInterface.
   */
  injectWriter(writer: Writer<T>) {
    this.writer = writer;
  }

  /**
   * @description
   * Inject an object of subclass EventSource that will
   * be used for dispatching events.
   */
  injectEventSource(eventSource: CustomEventSource) {
    this.eventSource = eventSource;
  }

  get event_source() { return this.eventSource }

  /**
   * @description
   * Generic abstract getters and setters that subclasses will
   * need to implement based on the data they wish to get and set.
   */
  abstract getData(): T;
  abstract setData(memberData: T): void;

}
