// TODO: had to comment out because of https://github.com/deepsweet/istanbul-instrumenter-loader/issues/15
// let Injector = require("inject-loader!../../../src/core/decorators/track");

// let trackEvent = sinon.spy();
// let track = Injector({
//   "../events/track_event": trackEvent
// });

// let expect = require("expect.js");

// describe("track decorator", () => {
//   it("should be a decorator", () => {
//     expect(track).to.be.ok();
//   });

//   it("should track an event", () => {
//     class Foo {
//       @track("my.message")
//       myMessage() {
//         return {
//           foo: "bar"
//         };
//       }
//     }

//     let foo = new Foo();

//     foo.myMessage();
//     expect(trackEvent.calledOnce).to.be.ok();
//     expect(trackEvent.getCall(0).args[0].name).to.be("my.message");
//     expect(trackEvent.getCall(0).args[0].data.foo).to.be("bar");
//     trackEvent.reset();
//   });

//   it("should track an event with a filter", () => {
//     class Foo {
//       @track(function(data) {
//         return {
//           name: `home.my.message`,
//           data: {
//             bar: `${data.foo}1`
//           }
//         }
//       })
//       myMessage() {
//         return {
//           foo: "bar"
//         };
//       }
//     }

//     let foo = new Foo();

//     foo.myMessage();
//     expect(trackEvent.calledOnce).to.be.ok();
//     expect(trackEvent.getCall(0).args[0].name).to.be("home.my.message");
//     expect(trackEvent.getCall(0).args[0].data.bar).to.be("bar1");
//   });
// });
