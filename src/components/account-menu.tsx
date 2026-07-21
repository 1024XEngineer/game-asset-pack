"use client";

import { ChevronDown, CreditCard, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const account = {
  name: "Demo User",
  email: "demo@pixelforge.app",
  plan: "Starter",
  credits: 1280,
};

export function AccountMenu() {
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const isSettingsActive = pathname === "/settings" || pathname.startsWith("/settings/");

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openFromHover() {
    clearCloseTimer();
    setIsOpen(true);
  }

  function closeFromHover() {
    if (isPinned) {
      return;
    }

    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  }

  function togglePinned() {
    clearCloseTimer();
    setIsPinned((current) => {
      const nextPinned = !current;
      setIsOpen(nextPinned || !isOpen);
      return nextPinned;
    });
  }

  function releaseMenu() {
    setIsPinned(false);
    setIsOpen(false);
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(nextOpen) => {
        setIsOpen(nextOpen);
        if (!nextOpen) {
          setIsPinned(false);
        }
      }}
    >
      <DropdownMenuTrigger
        onMouseEnter={openFromHover}
        onMouseLeave={closeFromHover}
        onClick={togglePinned}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:px-3 sm:text-sm",
          (isOpen || isSettingsActive) &&
            "bg-foreground text-background hover:bg-foreground hover:text-background",
        )}
      >
        Account
        <ChevronDown
          className={cn("size-3.5 transition-transform", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 p-2"
        onMouseEnter={openFromHover}
        onMouseLeave={closeFromHover}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-2">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <UserRound className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-popover-foreground">
                  {account.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{account.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <div className="grid grid-cols-2 gap-2 px-2 py-2">
          <div className="rounded-lg border bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">Credits</p>
            <p className="mt-1 text-lg font-semibold">{account.credits.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">Plan</p>
            <Badge variant="secondary" className="mt-1">
              {account.plan}
            </Badge>
          </div>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/settings" onClick={releaseMenu} />}>
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing & credits
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={releaseMenu}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
