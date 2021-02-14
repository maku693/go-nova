let client = null;

const debugAddress = "localhost:6060";

// TODO: make this Disposable class
async function start() {
  stop();
  console.log("initializing gopls...");

  // Try to get gopls path from config
  let goplsPath = nova.config.get("go.gopls-path");

  // Try to get gopls path from PATH unless custom configuration provided
  if (!goplsPath) {
    goplsPath = await new Promise((resolve, reject) => {
      const which = new Process("/usr/bin/env", {
        args: ["which", "gopls"],
      });
      nova.subscriptions.add(
        which.onDidExit((status) => {
          if (status !== 0) reject(false);
        })
      );
      nova.subscriptions.add(
        which.onStdout((text) => {
          resolve(text.trim());
        })
      );
      which.start();
    });
  }

  // If we can't find gopls, use the default path
  if (!goplsPath) {
    let gobin = nova.environment.GOBIN;
    if (!gobin) {
      const gopath = await new Promise((resolve, reject) => {
        const go = new Process("/usr/bin/env", {
          args: ["go", "env", "GOPATH"],
        });
        nova.subscriptions.add(
          go.onDidExit((status) => {
            if (status !== 0) {
              reject(`go env GOPATH exited with status code: ${status}`);
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
      gobin = nova.path.join(gopath, "bin");
    }
    goplsPath = nova.path.join(gobin, "gopls");
  }

  console.log(`gopls path: ${goplsPath}`);

  // Create the client
  let serverOptions = {
    type: "stdio",
    path: goplsPath,
    args: [],
  };
  if (nova.inDevMode()) {
    console.log(`debug information will be available on ${debugAddress}`);

    const logDir = nova.path.join(nova.workspace.path, "logs");
    await new Promise((resolve, reject) => {
      const mkdir = new Process("/usr/bin/env", {
        args: ["mkdir", "-p", logDir],
      });
      nova.subscriptions.add(
        mkdir.onDidExit((status) => {
          if (status !== 0) {
            reject(status);
          }
          resolve(status);
        })
      );

      mkdir.start();
    });
    const logFile = nova.path.join(logDir, "gopls.log");
    console.log(`gopls log file: ${logFile}`);

    serverOptions.args.push("-debug", debugAddress);
    serverOptions.args.push("-logfile", logFile);
    serverOptions.args.push("-rpc.trace");
    serverOptions.args.push("-v");
    serverOptions.args.push("-vv");
  }

  client = new LanguageClient("gopls", "Go Language Server", serverOptions, {
    syntaxes: ["go", "gomod"],
  });
  nova.subscriptions.add(client);

  console.log("starting language client...");
  client.start();
}

function stop() {
  nova.subscriptions.dispose();

  if (client) {
    client.stop();
    client = null;
  }
}

exports.start = start;
exports.stop = stop;
