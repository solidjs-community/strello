import {
  useSubmission,
  type RouteSectionProps,
  RouteDefinition,
} from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { loginOrRegister, redirectIfLoggedIn } from "~/lib";
import { Title } from "@solidjs/meta";

export const route = {
  preload: () => redirectIfLoggedIn(),
} satisfies RouteDefinition;

export default function Login(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginOrRegister);
  const [register, setRegister] = createSignal(false);

  return (
    <main class="mx-10 sm:mx-30 md:mx-50 lg:mx-80 xl:mx-80 space-y-2 my-10">
      <Title>Login/Register | Strello </Title>
      <h2 class="font-bold text-3xl mb-4 text-center">Sign in to Strello</h2>
      <form
        action={loginOrRegister}
        method="post"
        class="border border-slate-300 rounded bg-slate-100"
      >
        <input
          type="hidden"
          name="redirectTo"
          value={props.params.redirectTo ?? "/"}
        />
        <fieldset class="text-center flex gap-1 m-1">
          <label
            class="px-4 py-2 grow cursor-pointer hover:bg-blue-700 hover:text-white font-bold rounded"
            classList={{
              "bg-blue-500 text-white": !register(),
            }}
          >
            <input
              class="mr-2 appearance-none"
              type="radio"
              name="loginType"
              value="login"
              checked={true}
              onChange={(e) => setRegister(!e.target.checked)}
            />
            Login
          </label>
          <label
            class="px-4 py-2 grow cursor-pointer hover:bg-blue-700 hover:text-white font-bold rounded"
            classList={{
              "bg-blue-500 text-white": !!register(),
            }}
          >
            <input
              class="mr-2 appearance-none"
              type="radio"
              name="loginType"
              value="register"
              onChange={(e) => setRegister(e.target.checked)}
            />
            Register
          </label>
        </fieldset>
        <div class="py-4 flex flex-col items-center gap-4">
          <div>
            <label class="w-20 inline-block" for="email-input">
              Email
            </label>
            <input
              id="email-input"
              class="dark:text-white shadow appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              name="email"
              placeholder="start@solidjs.com"
              autofocus
              autocomplete="email"
            />
          </div>
          <div>
            <label class="w-20 inline-block" for="password-input">
              Password
            </label>
            <input
              id="password-input"
              class="dark:text-white shadow appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              name="password"
              type="password"
              placeholder="password"
              autocomplete="current-password"
            />
          </div>
          <button
            class="w-28 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            {loggingIn.pending ? (
              <span class="loader"></span>
            ) : register() ? (
              "Register"
            ) : (
              "Login"
            )}
          </button>
          <Show when={loggingIn.result}>
            {(result) => (
              <p
                class="text-red-500 text-center"
                role="alert"
                id="error-message"
              >
                {result().message}
              </p>
            )}
          </Show>
        </div>
      </form>
    </main>
  );
}
