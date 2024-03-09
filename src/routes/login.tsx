import { useSubmission, type RouteSectionProps } from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { loginOrRegister } from "~/lib";
import { Title } from "@solidjs/meta";

export default function Login(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginOrRegister);
  const [register, setRegister] = createSignal(false);

  return (
    <main class="w-full text-center mx-auto p-4 space-y-2">
      <Title>Login/Register | Strello </Title>
      <h2 class="font-bold text-3xl mb-4">Login</h2>
      <form action={loginOrRegister} method="post">
        <input
          type="hidden"
          name="redirectTo"
          value={props.params.redirectTo ?? "/"}
        />
        <fieldset class="my-2">
          <label class="pr-2">
            <input
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
              type="radio"
              name="loginType"
              value="register"
              onChange={(e) => setRegister(e.target.checked)}
            />
            Register
          </label>
        </fieldset>
        <div>
          <label class="pr-2" for="email-input">
            Email
          </label>
          <input
            id="email-input"
            class="shadow appearance-none border rounded mt-4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            name="email"
            placeholder="solid"
          />
        </div>
        <div>
          <label class="pr-2" for="password-input">
            Password&nbsp;
          </label>
          <input
            id="password-input"
            class="shadow appearance-none border rounded mt-4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            name="password"
            type="password"
            placeholder="start"
          />
        </div>
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
