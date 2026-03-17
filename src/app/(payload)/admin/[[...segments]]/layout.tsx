/* eslint-disable @typescript-eslint/no-explicit-any */
/* This file is generated and managed by Payload automatically. */

import config from "@payload-config";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import { importMap } from "../importMap";
import "@payloadcms/next/css";

type Args = {
  children: React.ReactNode;
};

const serverFunction: any = async function (args: any) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
);

export default Layout;
