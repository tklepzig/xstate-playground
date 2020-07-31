import { assign, DoneInvokeEvent, createMachine } from "xstate";
import fetch from "node-fetch";

async function invokeFetchSubreddit(context: RedditContext) {
  const { subreddit } = context;

  const response = await fetch(`https://www.reddit.com/r/${subreddit}.json`);
  const json = await response.json();
  return json.data.children.map((child: any) => child.data);
}

type RedditEvent = { type: "SELECT"; name: string };

interface RedditContext {
  subreddit: string | null;
  posts: string[] | null;
}

type RedditState = {
  value:
    | "idle"
    | { selected: "loading" }
    | { selected: "loaded" }
    | { selected: "failed" };
  context: RedditContext;
};

export const redditMachine = createMachine<
  RedditContext,
  RedditEvent,
  RedditState
>({
  id: "reddit",
  initial: "idle",
  context: {
    subreddit: null,
    posts: null,
  },
  states: {
    idle: {},
    selected: {
      initial: "loading",
      states: {
        loading: {
          invoke: {
            id: "fetch-subreddit",
            src: invokeFetchSubreddit,
            onDone: {
              target: "loaded",
              actions: assign<RedditContext, DoneInvokeEvent<string[]>>({
                posts: (_, event) => event.data,
              }),
            },
            onError: "failed",
          },
        },
        loaded: {},
        failed: {},
      },
    },
  },
  on: {
    SELECT: {
      target: ".selected",
      actions: assign({
        subreddit: (_, event) => event.name,
      }),
    },
  },
});

//interpret(redditMachine)
//.onTransition((state) => console.dir(state))
//.start()
//.send({ type: "SELECT", name: "reactjs" });
