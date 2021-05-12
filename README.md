# ShardEx

ShardEx is a free, secure and multi-functional FreeTon wallet implemented as a browser add-on.

## Documentation

## Technical stack

browser extension: https://github.com/Kocal/vue-web-extension
ui: https://github.com/vuetifyjs/vuetify
extension storage: https://github.com/championswimmer/vuex-persist + https://developer.chrome.com/docs/extensions/reference/storage/

## Features

- Multiaccounts
- Support for the main types of wallets (SafeMultisig, SetCodeMultisig, SetCodeMultisig2)
- Random seed phrase generation
- Restoring a wallet of 12 or 24 words
- Encrypted Local data storage
- Generating, backing up, and restoring public and private keys
- Backup and restore the initial phrase of the wallet
- Password protection
- Transaction History
- Changing your password
- Creating a Wallet with multiple keepers
- Offer and sign transactions (for multi-custodian wallets)
- Main net and test net support

## Security

All data private data is encrypted using tweetnacl's xsalsa20-poly1305 implementation. The encryption key is derived from the password using PBKDF2/SHA256. The iteration count for the PBKDF2 invocation is configurable and defaults to 10,000 rounds.
![](./security.jpg)

## Quick start

**ShardEx** application is built using **vue-web-extension** (https://github.com/Kocal/vue-web-extension)

**npm run build**
Build the extension into dist folder for production.

A zip file is also built and is located in artifacts directory.

**npm run serve**
Build the extension for development and watch over file changes.

It also automatically reload your extension into your browsers, thanks to **webpack-extension-reloader** plugin.

### Deploying as browser extension

1. Open the Extension Management page by navigating to [chrome://extensions](chrome://extensions "chrome://extensions")
   - Alternatively, open this page by clicking on the Extensions menu button and selecting **Manage Extensions** at the bottom of the menu.
   - Alternatively, open this page by clicking on the Chrome menu, hovering over **More Tools** then selecting **Extensions**
2. Enable Developer Mode by clicking the toggle switch next to **Developer mode**.
3. Click the **Load unpacked** button and select the extension directory.

#### Local network

For a local network, installation is required tondev (https://github.com/tonlabs/tondev)

##### Prerequisites

- [Node.js](https://github.com/nodejs "Node.js") >= 10.x installed
- (optional) [Docker](https://www.docker.com/ "Docker") >= 19.x installed
- Solidity compiler requires VC++ Runtime on Windows. You can install it from [the latest supported Visual C++ downloads](https://support.microsoft.com/en-us/topic/the-latest-supported-visual-c-downloads-2647da03-1eea-4433-9aff-95f26a218cc0 "the latest supported Visual C++ downloads").

##### Install

`npm i -g tondev`

If you see an EACCES error when you try to install a package globally on Mac or Linux, please see this instruction[please see this instruction](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally "please see this instruction")

## Compatibility and support

**TON-SDK v1.12**

**nodejs**

- Windows x86_64
- Linux x64
- macOS x64

**web**

- Opera
- Firefox 82
- Google Chrome 86

and more, check — https://caniuse.com/?search=wasm

## License

ShardEx is [Apache-2.0 licensed](http://www.apache.org/licenses/LICENSE-2.0 "Apache-2.0 licensed").
