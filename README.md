# BlockChain Healthcare Convector Base

## Install

Follow the installation steps given at https://docs.covalentx.com/article/120-install-on-ubuntu

This awesome project was created automatically with <a href="https://github.com/worldsibu/convector-cli" tar
## Start

```
# Install dependencies - From the root of your project
npm i
# Create a new development blockchain network  - From the root of your project
npm run env:restart
# Install your smart contract
npm run cc:start -- file
# Make a testing call to create a record in the ledger
# Beware that the first call may fail with a timeout! Just happens the first time
npm run server:start

# Upgrade your existing chaincode - From the root of your project
npm run cc:upgrade -- file VERSION
```

## About Hurley

You may as well install **Hurley** globally for easier and more flexible management. 

`npm i -g @worldsibu/hurley`

Since with Hurley globally you have control over everything, some things that you can do, for example, is installing a Convector Smart Contract with a different name than the one you used for your project.

```
# Use the same package
# Install a new chaincode with the same source code but the name 'anothernameforyourcc'
hurl install anothernameforyourcc node
```

Other complex tasks you may need is installing to a different channel.

```
# Use the same package
# Be sure you started your environment with more than one channel running 'hurl new --channels 2'. Otherwise this will throw an error.
hurl install anothernameforyourcc node --channel ch2
```

---

If you don't want to, don't worries! This project works right away.

## Start - if you have Hurley globally

### Bring your project to life 

```
# Install dependencies - From the root of your project
npm i
# Create a new development blockchain network  - From the root of your project
hurl new
```

###  Install and upgrade chaincodes

```
# Package your smart contract's code  - From the root of your project
npm run cc:package -- file org1
# Install to your blockchain - From the root of your project
hurl install file node -P ./chaincode-file
# Install in debug mode, this will run the chaincode server locally so you can debug
hurl install file node -P ./chaincode-file --debug

# Upgrade your existing chaincode - From the root of your project
hurl upgrade file node 1.2 -P ./chaincode-file
```

## Start - if you don't have Hurley globally

### Bring your project to life 

```
# Install dependencies - From the root of your project
npm i
# Create a new development blockchain network  - From the root of your project
npm run env:restart
```

###  Install and upgrade chaincodes

```
# Install to your blockchain - From the root of your project
npm run cc:start -- file

# Upgrade your existing chaincode - From the root of your project
npm run cc:upgrade -- file 1.2
```

## Tests

```
npm run test
```

> Check all the information to work with Convector <a href="https://docs.covalentx.com/convector" target="_blank">in the DOCS site</a>.

## Collaborate to the Convector Suite projects

* <a href="https://community.covalentx.com" target="_blank">Discord chat with the community</a>
* <a href="https://github.com/worldsibu" target="_blank">Convector projects</a>
