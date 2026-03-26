type MetaInput = {
  title: string;
  description?: string;
};

export function setPageMeta(input: MetaInput) {
  if (typeof document === "undefined") return;
  document.title = input.title;
  if (input.description != null) {
    let tag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "description";
      document.head.appendChild(tag);
    }
    tag.content = input.description;
  }
}

