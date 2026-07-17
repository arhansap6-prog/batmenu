import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  RootErrorComponent,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { IntroGate } from "@/components/intro-gate";

import "@fontsource/instrument-serif/400.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

// Error Component - Renders on route errors
function ErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter();

  useEffect(() => {
    if (error) {
      reportLovableError(error, { boundary: "root_error_boundary" });
    }
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-lg text-gray-300 mb-2">Something went wrong</p>
          <p className="text-sm text-gray-500 mb-6">
            {error?.message || "An unexpected error occurred"}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              router.invalidate();
              window.location.href = "/";
            }}
            className="w-full px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Go Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 border border-gray-700 text-white rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}

// Not Found Component - Renders on 404
function NotFoundComponent() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-8xl font-bold text-yellow-400 mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          This page does not exist or the restaurant is not active.
        </p>

        <a
          href="/"
          className="inline-block px-8 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

// Loading Fallback - Renders while route is loading
function LoadingFallback() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black to-gray-950">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-400 animate-spin"></div>
          </div>
        </div>
        <p className="text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

// HTML Shell Component
function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <link rel="stylesheet" href={appCss} />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <HeadContent />
      </head>
      <body className="h-full m-0 p-0">
        <div id="app" className="h-full">
          {children}
        </div>
        <Scripts />
      </body>
    </html>
  );
}

// Root Route Definition
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { name: "theme-color", content: "#000000" },
      {
        title: "BAT MENU — Smart Digital Menus For Every Food Business",
      },
      {
        name: "description",
        content:
          "BAT MENU is a premium digital menu platform. Manage your restaurant menu with a permanent QR — no technical setup required.",
      },
      { name: "author", content: "BAT MENU" },
      {
        property: "og:title",
        content: "BAT MENU — Smart Digital Menus For Every Food Business",
      },
      {
        property: "og:description",
        content:
          "BAT MENU is a premium digital menu platform. Manage your restaurant menu with a permanent QR — no technical setup required.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "BAT MENU — Smart Digital Menus For Every Food Business",
      },
      {
        name: "twitter:description",
        content:
          "BAT MENU is a premium digital menu platform. Manage your restaurant menu with a permanent QR — no technical setup required.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/0a34e8b0-1fb5-4773-884a-3f5414d3ef8f",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/0a34e8b0-1fb5-4773-884a-3f5414d3ef8f",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com" },
    ],
  }),
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
  pendingComponent: LoadingFallback,
  shellComponent: RootShell,
  component: RootLayout,
});

// Root Layout Component - Main App Wrapper
function RootLayout() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  // Handle authentication state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Invalidate queries and router on auth state change
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        queryClient.invalidateQueries();
        router.invalidate();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen w-full bg-black text-white">
        <IntroGate>
          <Outlet />
        </IntroGate>
        <Toaster
          theme="dark"
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "bg-gray-900 border border-gray-800 text-white",
              error: "bg-red-900/50 border border-red-800",
              success: "bg-green-900/50 border border-green-800",
            },
          }}
        />
      </div>
    </QueryClientProvider>
  );
}
