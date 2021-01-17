[![Open Source Love](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://github.com/ellerbrock/open-source-badge/)

# Toolkit

This is a mono repository containing all toolkit packages utilized by the cmdo framework.

## Packages

Package  | Description
---------|------------------------------------------------------------------------------------
Access   | _Access control service handling permissions for back and front end._
Commands | _Event sourced command service, handling incoming commands and event storage._
Http     | _Simple 0 dependency http server._
Inverse  | _Inversion of control service handling those pesky dependency injections._
Router   | _An agnostic routing solution for your SPA needs._
Socket   | _A simple socket server._

## Development

To develop a package and actively test the changes in your project we need to perform a few steps.

### Step 1 - Create Link

First we need to create a package link so that the package is made available to pull the local version of the package instead of the released remote version. First go into the directory for the package you wish to work on and run the command:

```sh
$ yarn link
```

This will create a link of the package.

Next make sure to build the package:

```sh
$ yarn && yarn build
```

### Step 2 - Use Link

Open up your project and run the command:

```sh
$ yarn link package
```

This should symlink the package from step 1 into your project and it should now be available in your project.

### Step 3 - Developing

When developing the package along your project and you make update you will need to rebuild the service for it to take effect:

```sh
$ yarn build
```

## Release

Once a new version is ready for release there are a few steps we need to take to ensure a clean release.

To ensure that we are releasing a clean package we need to run cleanup from the toolkit root:

```sh
$ yarn clean
```

Once this is done move into the package you wish to push a release for and simply run the publish command:

```sh
$ npm publish
```
