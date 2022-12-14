# NextJS Starter Template

This repository contains a template for bootstrapping new NextJS projects, customised slightly to fit conventions
folowed at ThoughtClan.

## Setting Up

Create a new project using this template by using the `create-next-app` tool:

`npx create-next-app --example https://github.com/ThoughtClan/react-templates/tree/main/next-pwa <PROJECT_NAME>`

This will set up a new project in a directory created using the `<PROJECT_NAME>` value.

## Development

To run the local development server, simply run `yarn run dev` which will start up the development server and can be
viewed at [localhost:3000](https://localhost:3000).

## Configuration

### PWA

This template is configured with a PWA setup out of the box using the `next-pwa` package. This can be modified if required,
or removed altogether, by removing the appropriate section of [`next.config.js`](./next.config.js):

```diff
-const withPWA = nextPWA({
-  dest: "public",
-  runtimeCaching,
-  register: true,
-  skipWaiting: true,
-});

-module.exports = withPWA({
-  ...
-});
+module.exports = {
+  ...
+};
```


## Guidelines

### Folder Structure

For the most part, the structure follows the NextJS specified folder structure. Every page in the app will be placed under
`pages` where the NextJS framework will automatically detect the pages and create separate JS bundles and server rendering
paths for them.

More guidelines for working with NextJS can be found in their documentation and everything mentioned there applies here
as well.

The main different being the structure of the `api` folder. In the NextJS convention, this folder contains files that
directly map to a page under `pages`, causing that route to behave like an API endpoint rather than a HTML document.
However, this is not applicable in the case of apps that use external APIs rather the using the same server as an API.
In almost all projects at ThoughtClan, we use a different pure-backend application to host APIs and hence this is not
required for us. We instead use the `api` folder to store these API integration modules. Refer to the code and the inline
documentation for additional context on what these modules do.

The NextJS default `api` directory is still preserved in case it will be of use to specific projects.

If, however, the NextJS API setup is required, it can still be followed by creating files in the `api` directory that
directly map to a `page`.

### `IAuthProvider`

The [`IAuthProvider`](./interfaces/auth_provider.ts) interface describes objects that can be used as an authentication provider
for the `Api` module described in the next section.

This allows for flexibility in using different authentication backends as long as they offer
a method to provide the authorisation token needed for API integration.

Objects implementing this interface can be supplied to `Api`s to authenticate requests.

### API Integration

All API requests done are generally routed through the same API module so that it can take care of things like configuration
for API base URLs, appending authentication headers etc.

More details can be seen in inline documentation in the [`Api`](./api/api.ts) file.

The general guideline regarding this to create `XRequests.ts` files for each backend service that the app talks to and
group all requests from the same service into the same file.

An example of the usage both on client-side and server-side rendering can be seen in the [sample index page](./pages/index.tsx).

By default an instance of the `Api` class is provided at the root of the application as seen in [`_app.tsx`](./pages/_app.tsx). This
instance can be retrieved in any component in the application using the [`useApi`](./hooks/useApi.ts) hook:

```tsx
function SomeComponent() {
    const [countries, setCountries] = useState([]);
    const api = useApi();

    useEffect(() => {
        const fetchCountries = async () => {
            const response = await api.performRequest(CountriesRequests.getAllCountries());

            setCountries(response);
        };

        fetchCountries();
    }, []);

    ...
}
```

If, for any reason, a different API is required to be used (i.e. using a different auth provider or base URL) a new instance can be
created and hoisted in the component hierarchy using [`ApiProvider`](./providers/ApiProvider.tsx):

```tsx
function SomeOtherApiParent() {
    return (
        <ApiProvider baseUrl="http://some-other-api" authProvider={new SomeOtherAuthProvider()}>
            ...
        </ApiProvider>
    );
}
```

This is akin to dependency injection where the dependency is resolved from the nearest provider in the hierarchy.
In this situation, the `useApi` hook in child components will resolve the `Api` instance from the nearest
context in the hierarchy.

If required, this can also be wrapped with NextJS's [SWR](https://swr.vercel.app/) feature for caching
client-side requests.

### Bundle Splitting

NextJS automatically takes care of bundle splitting at a page level and image related optimsations using the `next/image` component
to load images.

However, in case there is some additional bundle splitting required in the case of heavy non-page modules etc., we can
demarcate an additional point of splitting by using Webpack's lazy imports:

```jsx
// Normal JS module

const module = await import("some-module");

module.doSomething();

// React components

const SomeComponent = React.lazy(() => import("SomeComponent"));

function SomeOtherComponent() {
    return (
        <React.Suspense loader={<Loader />}>
            <SomeComponent />
        </React.Suspense>
    );
}
```

Using the `import()` method provided by webpack will ensure that the target module is *not* bundled with the rest of the
current module, but is instead extracted into a separate JS chunk that is loaded at runtime when the importing code is
executed. The `import()` function returns a promise as it needs to asynchronously load the chunk containing the module
over network and only then can resolve the module.

### Console logging

The Webpack configuration includes a plugin to strip all console logs from production, so that we can be free to include
console logs in our code for development purposes. This can be very hepful in debugging the app if used correctly.

The general guideline regarding using console logs is to "tag" each log message with the name of the class, or in the case
of non-classes, the function or the module in which the log is being called. This makes it easy to identify which log message
is coming from where and can trace it appropriately.

For example, in the `Api` class, all log messages are formatted as `"[Api] some log message"`. Following a consistent
tagging format like this makes it easy to filter logs by a module when debugging. Using the log window's filter option,
we can add an `[Api]` filter to only view all logs coming from that particular class.

Similarly, logging all over the application **should** follow this format for consistency.

### Code Formatting

The project will be set up with ESLint and Prettier, which can be run on the command line using `yarn run lint` or viewed
in your editor if it supports ESLint.

For VSCode, the project-level configuration includes a setting to automatically format and fix auto-fixable problems on save.

### Localisation

The localisation setup is done using [`next-i18next`](https://github.com/i18next/next-i18next#readme) and instructions on how to work with this
package can be found in their README.

### Scraping prevention techniques

Refer to this writeup: https://github.com/JonasCz/How-To-Prevent-Scraping.

Scraping prevention techniques come with their own pitfalls affecting both SEO and app performance, and must be applied after considertion
of benefits and whether they are worth the cost.

For this project, Webpack has been configured to hash CSS classnames as the minimal, least obtrusive technique of scraping
prevention. This configuration can be seen in the `css-loader` config in the [NextJS config](./next.config.js).

## Production

For production deployment, a Docker configuration is included to build an image containing all the necessary steps to
release the app to production. This image can then be deployed to a server or in a cluster to serve the app to users.

Ensure that the correct values are set in the `.env` file in the root of the repository containing the configuration
for the production build.

Read more about [how NextJS interprets environment variables](https://nextjs.org/docs/basic-features/environment-variables) to understand how to work with this.

The app will run in the container on port 3000.

### Code Obfuscation

JS code obfuscation can be enabled by setting the environment variable `USE_JS_OBFUSCATION=1` when running the `build` script.

For production, this can be enabled by uncommenting the relevant `ENV` line in the [Dockerfile](./Dockerfile).
