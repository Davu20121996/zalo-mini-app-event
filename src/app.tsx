import { RouterProvider } from "react-router-dom";
import router from "./router";
import { ReactQueryProvider } from "./lib/react-query-provider";
import React from "react";
import { SnackbarProvider } from "zmp-ui";
import UserGate from "./components/common/user-gate";

export default function MiniApp() {
  return (
    <React.StrictMode>
      <SnackbarProvider>
        <ReactQueryProvider>
          <UserGate>
            <RouterProvider router={router} />
          </UserGate>
        </ReactQueryProvider>
      </SnackbarProvider>
    </React.StrictMode>
  );
}
