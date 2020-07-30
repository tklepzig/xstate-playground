import { interpret } from "xstate";
import { redditMachine } from ".";
import * as nodeFetch from "node-fetch";

describe("reddit machine (live)", () => {
  it("should load posts of a selected subreddit", (done) => {
    global.fetch = (nodeFetch.default as unknown) as (
      input: RequestInfo,
      init?: RequestInit
    ) => Promise<Response>;

    const redditService = interpret(redditMachine)
      .onTransition((state) => {
        if (state.matches({ selected: "loaded" })) {
          expect(state.context.posts).not.toBe(null);

          done();
        }
      })
      .start();

    redditService.send({ type: "SELECT", name: "reactjs" });
  });
});
