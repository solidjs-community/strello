import {
  useSubmission,
  type RouteSectionProps,
  RouteDefinition,
} from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { loginOrRegister, redirectIfLoggedIn } from "~/lib";
import { Title } from "@solidjs/meta";

export const route = {
  // todo: review this pattern.
  // question: why does this function not call unless wrapped with cache?
  load: () => redirectIfLoggedIn(),
} satisfies RouteDefinition;

export default function Login(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginOrRegister);
  const [register, setRegister] = createSignal(false);

  return (
    <main class="w-96 mx-auto p-4 space-y-2">
      <Title>Login/Register | Strello </Title>
      <h2 class="font-bold text-3xl mb-4 text-center">Login</h2>
      <form action={loginOrRegister} method="post">
        <input
          type="hidden"
          name="redirectTo"
          value={props.params.redirectTo ?? "/"}
        />
        <fieldset class="my-2 text-center">
          <label class="pr-2">
            <input
              class="mr-2"
              type="radio"
              name="loginType"
              value="login"
              checked={true}
              onChange={(e) => setRegister(!e.target.checked)}
            />
            Login
          </label>
          <label>
            <input
              class="mr-2"
              type="radio"
              name="loginType"
              value="register"
              onChange={(e) => setRegister(e.target.checked)}
            />
            Register
          </label>
        </fieldset>
        <div>
          <label class="pr-2 w-24 inline-block" for="email-input">
            Email
          </label>
          <input
            id="email-input"
            class="text-white shadow appearance-none border rounded mt-4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            name="email"
            placeholder="solidstart@start.com"
            autofocus
          />
        </div>
        <div>
          <label class="pr-2 w-24 inline-block" for="password-input">
            Password&nbsp;
          </label>
          <input
            id="password-input"
            class="text-white shadow appearance-none border rounded mt-4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            name="password"
            type="password"
            placeholder="start123"
          />
        </div>
        <label class="pr-2 w-24 inline-block" for="password-input">

        </label>
        <button
          class="w-24 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
        >
          {register() ? "Register" : "Login"}
        </button>
        <Show when={loggingIn.result}>
          <p class="mt-2 text-red-500" role="alert" id="error-message">
            {loggingIn.result!.message}
          </p>
        </Show>
      </form>
    </main>
  );
}
