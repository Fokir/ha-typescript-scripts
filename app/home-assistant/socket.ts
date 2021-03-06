import type { Auth, HaWebSocket, } from "home-assistant-js-websocket";
import { WebSocket } from 'ws';
import { ConfigurationInterface } from '../configuration/interface/configuration.interface';
import { LogLevelEnum } from '../configuration/interface/logLevel.enum';

const MSG_TYPE_AUTH_REQUIRED = "auth_required";
const MSG_TYPE_AUTH_INVALID = "auth_invalid";
const MSG_TYPE_AUTH_OK = "auth_ok";
const ERR_CANNOT_CONNECT = 1;
const ERR_INVALID_AUTH = 2;

export function createSocket(auth: Auth, configuration: ConfigurationInterface): Promise<HaWebSocket> {
  const url = configuration.homeAssistantHost;

  if (configuration.logLevel >= LogLevelEnum.INFO) {
    console.info("[Auth phase] Initializing WebSocket connection to Home Assistant".cyan, url);
  }

  function connect(
    triesLeft: number,
    promResolve: (socket: any) => void,
    promReject: (err: number) => void
  ) {

    if (configuration.logLevel >= LogLevelEnum.INFO) {
      console.info(`[Auth Phase] Connecting to Home Assistant... Tries left: ${ triesLeft }`.red, url);
    }

    const socket: WebSocket = new WebSocket(url);

    let invalidAuth = false;

    const closeMessage = (ev: {
      wasClean: boolean;
      code: number;
      reason: string;
      target: WebSocket;
    }) => {
      let errorMessage;
      if (ev && ev.code && ev.code !== 1000) {
        errorMessage = `WebSocket connection to Home Assistant closed with code ${ ev.code } and reason ${ ev.reason }`;
      }
      closeOrError(errorMessage);
    };

    const errorMessage = (ev: {
      error: any;
      message: any;
      type: string;
      target: WebSocket;
    }) => {
      // If we are in error handler make sure close handler doesn't also fire.
      socket.removeEventListener("close", closeMessage);
      let errMessage =
        "Disconnected from Home Assistant with a WebSocket error";
      if (ev.message) {
        errMessage += ` with message: ${ ev.message }`;
      }
      closeOrError(errMessage);
    };

    const closeOrError = (errorText?: string) => {
      if (errorText && configuration.logLevel >= LogLevelEnum.ERROR) {
        console.error(
          `WebSocket Connection to Home Assistant closed with an error: ${ errorText }`.red
        );
      }
      if (invalidAuth) {
        promReject(ERR_INVALID_AUTH);
        return;
      }

      // Reject if we no longer have to retry
      if (triesLeft === 0) {
        // We never were connected and will not retry
        promReject(ERR_CANNOT_CONNECT);
        return;
      }

      const newTries = triesLeft === -1 ? -1 : triesLeft - 1;
      // Try again in a second
      setTimeout(() => connect(newTries, promResolve, promReject), 1000);
    };

    // Auth is mandatory, so we can send the auth message right away.
    const handleOpen = async (): Promise<void> => {
      try {
        if (auth.expired) {
          await auth.refreshAccessToken();
        }
        socket.send(
          JSON.stringify({
            type: "auth",
            access_token: auth.accessToken,
          })
        );
      } catch (err) {
        // Refresh token failed
        invalidAuth = err === ERR_INVALID_AUTH;
        socket.close();
      }
    };

    const handleMessage = (event: {
      data: any;
      type: string;
      target: WebSocket;
    }) => {
      const message = JSON.parse(event.data);

      if (configuration.logLevel >= LogLevelEnum.INFO) {
        console.info(
          `[Auth phase] Received a message of type ${ message.type }`.cyan,
          message
        );
      }

      switch (message.type) {
        case MSG_TYPE_AUTH_INVALID:
          invalidAuth = true;
          socket.close();
          break;

        case MSG_TYPE_AUTH_OK:
          socket.removeEventListener("open", handleOpen);
          socket.removeEventListener("message", handleMessage);
          socket.removeEventListener("close", closeMessage);
          socket.removeEventListener("error", errorMessage);
          promResolve(socket);
          break;

        default:
          // We already send this message when socket opens
          if (message.type !== MSG_TYPE_AUTH_REQUIRED && configuration.logLevel >= LogLevelEnum.WARNING) {
            console.warn("[Auth phase] Unhandled message".red, message);
          }
      }
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("message", handleMessage);
    socket.addEventListener("close", closeMessage);
    socket.addEventListener("error", errorMessage);
  }

  return new Promise((resolve, reject) => connect(3, resolve, reject));
}
