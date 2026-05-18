import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Rakta-Seva Connect — Life-Saving Blood Donor Network" },
      { name: "description", content: "Emergency blood donor network. Real-time alerts, proximity matching, privacy-first. Be someone's Golden Hour." },
      { name: "author", content: "Rakta-Seva" },
      { property: "og:title", content: "Rakta-Seva Connect — Life-Saving Blood Donor Network" },
      { property: "og:description", content: "Emergency blood donor network. Real-time alerts, proximity matching, privacy-first. Be someone's Golden Hour." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Rakta-Seva Connect — Life-Saving Blood Donor Network" },
      { name: "twitter:description", content: "Emergency blood donor network. Real-time alerts, proximity matching, privacy-first. Be someone's Golden Hour." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c111e051-6f8b-4212-b319-df3cbdd7af0f/id-preview-6d6c7447--2cbd3ab9-f57a-49d4-a9e7-5118a48a960e.lovable.app-1778342773841.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c111e051-6f8b-4212-b319-df3cbdd7af0f/id-preview-6d6c7447--2cbd3ab9-f57a-49d4-a9e7-5118a48a960e.lovable.app-1778342773841.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { useAutoGeolocation } from "@/lib/use-geolocation";
import { Toaster } from "sonner";

function GeoBootstrap() {
  useAutoGeolocation();
  return null;
}

function RootComponent() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GeoBootstrap />
        <Outlet />
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  );
}
