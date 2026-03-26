import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const anyL = L as unknown as {
  Icon: {
    Default: {
      prototype: { _getIconUrl?: unknown };
      mergeOptions: (opts: Record<string, unknown>) => void;
    };
  };
};

if (anyL.Icon?.Default?.prototype) {
  delete anyL.Icon.Default.prototype._getIconUrl;
  anyL.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });
}

