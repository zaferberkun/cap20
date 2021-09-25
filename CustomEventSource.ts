import { LocalEventConstants } from './EventConstants.js'

/**
 * @class
 * LocalEventSource
 * 
 * @description
 * An abstract class that defines the interface for dispatching events.
 * Note that "EventSource" is a system class user for Server Sent Events,
 * so we're using "CustomEventSource" instead.
 * 
 * Also provides an addEventTarget method for registering which
 * targets will be used to dispatch events. This is necessary since 
 */
export default abstract class CustomEventSource {

  //Maps events to EventTargets.
  protected eventMap = new Map();

  /**
   * @description
   * Uses the eventMap to record which targets are associated which events.
   * Each event maps to an array of targets, i.e. event=>EvenTarget[].
   * This gives us the ability to dispatch events against multiple targets.
   * 
   * @param event - The event that will be dispatched for the event target.
   * @param target - The event target.
   */
  addCustomEventTarget(event: LocalEventConstants, target: EventTarget): void {
    // If the event has already been registered...
    if (this.eventMap.has(event)) {
      // ...then add this target to list of targets will be notified when this event is triggered.
      this.eventMap.get(event).push(target);
    }
    else {
      // ...Otherwise, this is the first target for this event, 
      // so init the target list array for this event with the given target.
      this.eventMap.set(event, new Array(target))
    }
  }

  /**
   * @description
   * The interface for dispatching events. The implementation
   * will be determined by subclasses based on the event System that is available
   * (e.g. Client DOM vs Nodejs)
   */
  abstract dispatchCustomEvent(event: LocalEventConstants, data: any): void;
}