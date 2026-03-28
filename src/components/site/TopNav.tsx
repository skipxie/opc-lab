import { Menu, X, User, LogOut } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import Container from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "首页" },
  { to: "/policy-map", label: "政策列表" },
  { to: "/community", label: "社区加入" },
];

interface UserData {
  id: number;
  email: string;
  username: string;
  nickname?: string;
  avatarUrl?: string;
  role: string;
}

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      setUserMenuOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

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
            <div className="text-sm font-semibold tracking-tight">光未在线 OPC</div>
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
          {loading ? (
            <div className="h-10 w-24" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <User className="h-4 w-4" />
                {user.nickname || user.username}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[color:var(--border)] bg-white py-2 shadow-lg">
                  <div className="px-4 py-2 text-sm text-slate-500 border-b border-[color:var(--border)]">
                    {user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link to="/login">登录</Link>
              </Button>
              <Button asChild variant="primary">
                <Link to="/register">注册</Link>
              </Button>
            </div>
          )}
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
                {loading ? (
                  <div className="h-10" />
                ) : user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-slate-500">
                      {user.nickname || user.username}
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="secondary"
                      className="w-full"
                    >
                      退出登录
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button asChild variant="secondary" className="w-full">
                      <Link to="/login" onClick={() => setOpen(false)}>
                        登录
                      </Link>
                    </Button>
                    <Button asChild variant="primary" className="w-full">
                      <Link to="/register" onClick={() => setOpen(false)}>
                        注册
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </div>
      ) : null}
    </div>
  );
}
