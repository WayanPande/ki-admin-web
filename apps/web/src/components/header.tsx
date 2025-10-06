import { Link } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export default function Header() {
  return (
    <section className="py-4 px-4 xl:px-10">
      <div className="container mx-auto">
        <nav className="grid grid-cols-3 justify-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tighter">
              Sistem Informasi Monitoring Sentra KI Bali
            </span>
          </Link>
          <NavigationMenu className="hidden lg:block mx-auto">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  to="/"
                  activeProps={{
                    className: "bg-accent text-accent-foreground",
                  }}
                  className={navigationMenuTriggerStyle()}
                >
                  Beranda
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  to="/sentra-ki-dashboard"
                  activeProps={{
                    className: "bg-accent text-accent-foreground",
                  }}
                  className={navigationMenuTriggerStyle()}
                >
                  Sentra KI
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="hidden items-end gap-4 lg:flex w-fit ml-auto mr-0">
            <Link to="/login">
              <Button variant="outline">Masuk</Button>
            </Link>
          </div>
          {/* <div className="flex items-center gap-2">
            <ModeToggle />
          </div> */}

          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="max-h-screen overflow-auto">
              <SheetHeader>
                <SheetTitle>
                  <Link to="/" className="flex items-center gap-2">
                    <span className="text-lg font-semibold tracking-tighter">
                      Sistem Informasi Monitoring Sentra KI Bali
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4">
                <div className="flex flex-col gap-6">
                  <Link to="/" className="font-medium">
                    Beranda
                  </Link>
                  <Link to="/" className="font-medium">
                    Sentra KI
                  </Link>
                </div>
                <div className="mt-6 flex flex-col gap-4">
                  <Link to="/login">
                    <Button variant="outline">Masuk</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </section>
  );
}
