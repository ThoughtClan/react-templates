import { ReactNode, useRef } from "react";

import Api from "../api/api";
import ApiContext from "../contexts/ApiContext";
import IAuthProvider from "../interfaces/auth_provider";

type AuthProviderProps = {
  children: ReactNode;
  baseUrl?: string;
  IAuthProvider?: IAuthProvider;
};

/**
 * A higher order component for hoisting a common @see Api instance to all child components. This instance can be easily retrieved
 * with the @see useApi hook.
 */
export default function ApiProvider({
  children,
  baseUrl,
  IAuthProvider,
}: AuthProviderProps) {
  const apiRef = useRef<Api>(
    new Api(
      baseUrl ?? process.env.NEXTJS_PUBLIC_API_BASE_URL ?? "",
      IAuthProvider
    )
  );

  return (
    <ApiContext.Provider value={apiRef.current}>{children}</ApiContext.Provider>
  );
}
