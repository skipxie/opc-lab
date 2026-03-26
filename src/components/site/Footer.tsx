import Container from "@/components/Container";

export default function Footer() {
  return (
    <div className="mt-10 bg-[color:var(--bg)] text-white">
      <Container className="py-10">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="text-sm font-semibold">光未在线OPC</div>
            <div className="mt-2 text-sm text-white/75">AI + 政策列表 + 社区：把目标变成行动，把行动变成系统。</div>
          </div>
          <div className="md:col-span-4">
            <div className="text-xs font-semibold text-white/80">信息来源与声明</div>
            <div className="mt-2 text-sm text-white/70">
              政策信息具有时效性与地区差异，最终以官方原文为准。本网站不构成法律、财税或投资建议。
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="text-xs font-semibold text-white/80">联系</div>
            <div className="mt-2 text-sm text-white/70">邮箱：hello@example.com</div>
            <div className="mt-1 text-sm text-white/70">工作时间：工作日 10:00–18:00</div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} 光未在线OPC</div>
          <div className="flex gap-4">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:text-white/80 transition-colors">
              粤ICP备2026031424号
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}

