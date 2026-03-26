import { Menu, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import Container from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "首页" },
  { to: "/policy-map", label: "政策列表" },
  { to: "/community", label: "社区加入" },
];

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const active = useMemo(() => {
    return navItems.find((i) => (i.to === "/" ? location.pathname === "/" : location.pathname.startsWith(i.to)))?.to;
  }, [location.pathname]);

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--border)] bg-white/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--bg)] text-white">
            G
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">光未在线OPC</div>
            <div className="text-[11px] text-slate-500">AI + 政策列表 + 社区</div>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={() =>
                cn(
                  "rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100",
                  active === item.to && "bg-slate-100 text-slate-900"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:block">
          <Button asChild variant="primary">
            <Link to="/community">加入社区</Link>
          </Button>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border)] bg-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {open ? (
        <div className="border-t border-[color:var(--border)] bg-white md:hidden">
          <Container className="py-3">
            <div className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100",
                    active === item.to && "bg-slate-100 text-slate-900"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2">
                <Button asChild variant="primary" className="w-full">
                  <Link to="/community" onClick={() => setOpen(false)}>
                    加入社区
                  </Link>
                </Button>
              </div>
            </div>
          </Container>
        </div>
      ) : null}
    </div>
  );
}

