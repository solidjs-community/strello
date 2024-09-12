<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Strello&background=tiles&project=%20" alt="Strello">
</p>

# Strello

You can check this out hosted at [strello.netlify.app/](https://strello.netlify.app/)

A clone of the <a href="https://trellix.fly.dev/">Remix Run Trellix</a> example project to demonstrate SolidStart's capabilities.

To get started run:

```
pnpm i
pnpm migrate
pnpm dev
```

## SolidStart

Everything you need to build a Solid project, powered by [`solid-start`](https://start.solidjs.com);

### Creating a project

```bash
# create a new project in the current directory
npm init solid@latest

# create a new project in my-app
npm init solid@latest my-app
```

### Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Building

Solid apps are built with _presets_, which optimise your project for deployment to different environments.

By default, `npm run build` will generate a Node app that you can run with `npm start`. To use a different preset, add it to the `devDependencies` in `package.json` and specify in your `app.config.js`.

### This project was created with the [Solid CLI](https://solid-cli.netlify.app)

# Don't forget to change .env.sample to .env
