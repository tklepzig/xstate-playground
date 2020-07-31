import { interpret } from "xstate";
import { createModel } from "@xstate/test";
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
        //TODO: There is an type issue, therefore the "Boolean" wrapper, see https://github.com/davidkpiano/xstate/issues/1301
        if (Boolean(state.matches({ selected: "loaded" }))) {
          expect(state.context.posts).not.toBe(null);

          done();
        }
      })
      .start();

    redditService.send({ type: "SELECT", name: "reactjs" });
  });
});
describe("redditMachine", () => {
  //TODO: Use implementation machine and enrich it or create new pure testing machine? --> See also https://github.com/davidkpiano/xstate/issues/666
  redditMachine.states.idle.meta = {
    test: () => {
      expect(0).toBe(0);
    },
  };
  redditMachine.states.selected.meta = {
    test: () => {
      expect(0).toBe(0);
    },
  };
  redditMachine.states.selected.states.loading.meta = {
    test: () => {
      expect(0).toBe(0);
    },
  };
  redditMachine.states.selected.states.loaded.meta = {
    test: () => {
      expect(0).toBe(0);
    },
  };
  redditMachine.states.selected.states.failed.meta = {
    test: () => {
      expect(0).toBe(0);
    },
  };
  const redditModel = createModel(redditMachine).withEvents({
    SELECT: { exec: () => {} },
  });
  const testPlans = redditModel.getShortestPathPlans();
  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      plan.paths.forEach((path) => {
        it(path.description, async () => {
          await path.test({});
        });
      });
    });
  });
  it("should have full coverage", () => {
    return redditModel.testCoverage();
  });
});
