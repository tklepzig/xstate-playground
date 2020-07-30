import { Machine, assign, DoneInvokeEvent, interpret } from "xstate";
import fetch from "node-fetch";

async function invokeFetchSubreddit(context: RedditContext) {
  const { subreddit } = context;

  const response = await fetch(`https://www.reddit.com/r/${subreddit}.json`);
  const json = await response.json();
  return json.data.children.map((child: any) => child.data);
}

interface RedditSchema {
  states: {
    idle: {};
    selected: {
      states: {
        loading: {};
        loaded: {};
        failed: {};
      };
    };
  };
}

type RedditEvent = { type: "SELECT"; name: string };

interface RedditContext {
  subreddit: string | null;
  posts: string[] | null;
}
export const redditMachine = Machine<RedditContext, RedditSchema, RedditEvent>({
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
