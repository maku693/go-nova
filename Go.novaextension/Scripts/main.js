const gopls = require("gopls.js");

exports.activate = function () {
  console.log("activating");

  (async () => {
    await start();
    if (nova.config.get("go.enable-gopls")) {
      await gopls.start();
    }
    console.log("activation completed");
  })().catch((err) => {
    if (!nova.inDevMode()) return;
    console.error("error activating:", err);
  });
};

exports.deactivate = function () {
  console.log("deactivating");
  console.log("deactivation completed");
};

async function start() {
  // Check if the go command is available
  const isGoAvailable = await new Promise((resolve, reject) => {
    const which = new Process("/usr/bin/env", {
      args: ["which", "go"],
    });
    nova.subscriptions.add(
      which.onDidExit((status) => {
        if (status !== 0) {
          reject(false);
          return;
        }
        resolve(true);
      })
    );
    which.start();
  });
  if (!isGoAvailable) {
    throw new Error("cannot find go executable");
  }

  // Check if the go version is correct
  const goVersion = await new Promise((resolve, reject) => {
    const go = new Process("/usr/bin/env", {
      args: ["go", "version"],
    });
    nova.subscriptions.add(
      go.onDidExit((status) => {
        if (status !== 0) {
          reject(`go version exited with status code: ${status}`);
        }
      })
    );
    nova.subscriptions.add(
      go.onStdout((text) => {
        resolve(text.trim());
      })
    );
    go.start();
  });
  if (!versionRegexp.exec(goVersion)) {
    throw new Error(`${goVersion} is not compatible with this extension`);
  }
  console.log(goVersion);
}

const versionRegexp = /go version go1\.[\d]+(?:\.[\d])?(?:[\w\d]+)? darwin\/[\w\d]+/;
